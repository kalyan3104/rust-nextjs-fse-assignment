use sqlx::{QueryBuilder, PgPool, Postgres};
use uuid::Uuid;

use crate::cert_parser::parse_pem_certificate;
use crate::db::CertificateRepository;
use crate::error::AppError;
use crate::models::{CertificateListResponse, CertificateResponse, CertificateStats, CreateCertificateRequest};

#[derive(Debug)]
pub struct CertificateListParams {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub subject: Option<String>,
    pub issuer: Option<String>,
    pub expiring_within_days: Option<i64>,
    pub sort_by: Option<String>,
    pub sort_dir: Option<String>,
}

pub struct CertificateService<'a> {
    pool: &'a PgPool,
}

impl<'a> CertificateService<'a> {
    pub fn new(pool: &'a PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        request: CreateCertificateRequest,
    ) -> Result<CertificateResponse, AppError> {
        let parsed = match &request.pem {
            Some(pem) => Some(parse_pem_certificate(pem)?),
            None => None,
        };

        let subject = request
            .subject
            .or_else(|| parsed.as_ref().map(|p| p.subject.clone()))
            .ok_or_else(|| AppError::BadRequest("subject is required (or supply pem)".into()))?;

        let issuer = request
            .issuer
            .or_else(|| parsed.as_ref().map(|p| p.issuer.clone()))
            .ok_or_else(|| AppError::BadRequest("issuer is required (or supply pem)".into()))?;

        let expiration = request
            .expiration
            .or_else(|| parsed.as_ref().map(|p| p.not_after))
            .ok_or_else(|| AppError::BadRequest("expiration is required (or supply pem)".into()))?;

        let not_before = request
            .not_before
            .or_else(|| parsed.as_ref().map(|p| p.not_before));

        let serial = request
            .serial
            .or_else(|| parsed.as_ref().map(|p| p.serial.clone()));

        let san_entries = if !request.san_entries.is_empty() {
            request.san_entries
        } else {
            parsed.map(|p| p.san_entries).unwrap_or_default()
        };

        self.validate(&subject, &issuer, &san_entries)?;

        let repo = CertificateRepository::new(self.pool);
        let (row, sans) = repo
            .insert(
                &subject,
                &issuer,
                expiration,
                not_before,
                serial.as_deref(),
                &san_entries,
            )
            .await?;

        Ok(CertificateResponse::from_row(row, sans))
    }

    pub async fn get_by_id(&self, id: Uuid) -> Result<CertificateResponse, AppError> {
        let repo = CertificateRepository::new(self.pool);
        let (row, sans) = repo.find_by_id(id).await?.ok_or(AppError::NotFound)?;
        Ok(CertificateResponse::from_row(row, sans))
    }

    pub async fn list(&self, params: CertificateListParams) -> Result<CertificateListResponse, AppError> {
        let page = params.page.unwrap_or(1).max(1);
        let page_size = params.page_size.unwrap_or(20).clamp(1, 100);
        let sort_by = match params.sort_by.as_deref() {
            Some("created_at") => "created_at",
            Some("subject") => "subject",
            Some("issuer") => "issuer",
            _ => "expiration",
        };
        let sort_dir = if params.sort_dir.as_deref() == Some("desc") {
            "DESC"
        } else {
            "ASC"
        };

        let mut list_builder = QueryBuilder::new(
            "SELECT c.id, c.subject, c.issuer, c.expiration, c.not_before, c.serial, c.created_at, \
             COALESCE(array_agg(se.value ORDER BY se.id) FILTER (WHERE se.value IS NOT NULL), ARRAY[]::text[]) AS san_entries \
             FROM certificates c \
             LEFT JOIN san_entries se ON se.certificate_id = c.id",
        );
        let mut count_builder = QueryBuilder::new("SELECT count(*) FROM certificates c");
        let mut list_has_where = false;
        let mut count_has_where = false;

        let add_string_filter = |builder: &mut QueryBuilder<Postgres>, has_where: &mut bool, clause: &str, value: String| {
            if *has_where {
                builder.push(" AND ");
            } else {
                builder.push(" WHERE ");
                *has_where = true;
            }
            builder.push(clause).push_bind(value);
        };

        let add_expiring_filter = |builder: &mut QueryBuilder<Postgres>, has_where: &mut bool, days: i64| {
            if *has_where {
                builder.push(" AND ");
            } else {
                builder.push(" WHERE ");
                *has_where = true;
            }
            builder
                .push("c.expiration >= now() AND c.expiration <= now() + ")
                .push_bind(days)
                .push(" * interval '1 day'");
        };

        if let Some(subject) = params.subject.filter(|s| !s.trim().is_empty()) {
            let pattern = format!("%{}%", subject);
            add_string_filter(&mut list_builder, &mut list_has_where, "c.subject ILIKE ", pattern.clone());
            add_string_filter(&mut count_builder, &mut count_has_where, "c.subject ILIKE ", pattern);
        }

        if let Some(issuer) = params.issuer.filter(|s| !s.trim().is_empty()) {
            let pattern = format!("%{}%", issuer);
            add_string_filter(&mut list_builder, &mut list_has_where, "c.issuer ILIKE ", pattern.clone());
            add_string_filter(&mut count_builder, &mut count_has_where, "c.issuer ILIKE ", pattern);
        }

        if let Some(days) = params.expiring_within_days {
            add_expiring_filter(&mut list_builder, &mut list_has_where, days);
            add_expiring_filter(&mut count_builder, &mut count_has_where, days);
        }

        let items: Vec<CertificateResponse> = list_builder
            .push(" GROUP BY c.id ORDER BY ")
            .push(sort_by)
            .push(" ")
            .push(sort_dir)
            .push(" LIMIT ")
            .push_bind(page_size)
            .push(" OFFSET ")
            .push_bind((page - 1) * page_size)
            .build_query_as()
            .fetch_all(self.pool)
            .await?;

        let total: i64 = count_builder.build_query_scalar().fetch_one(self.pool).await?;
        let total_pages = ((total + page_size - 1) / page_size).max(1);

        Ok(CertificateListResponse {
            items,
            total,
            page,
            page_size,
            total_pages,
        })
    }

    pub async fn stats(&self) -> Result<CertificateStats, AppError> {
        let total: i64 = sqlx::query_scalar!("SELECT count(*) FROM certificates")
            .fetch_one(self.pool)
            .await?
            .unwrap_or(0);

        let expired: i64 = sqlx::query_scalar!(
            "SELECT count(*) FROM certificates WHERE expiration < now()"
        )
        .fetch_one(self.pool)
        .await?
        .unwrap_or(0);

        let expiring_soon_window_days = 30f64;
        let expiring_soon: i64 = sqlx::query_scalar!(
            "SELECT count(*) FROM certificates WHERE expiration >= now() AND expiration <= now() + $1 * interval '1 day'",
            expiring_soon_window_days
        )
        .fetch_one(self.pool)
        .await?
        .unwrap_or(0);

        Ok(CertificateStats {
            total,
            expiring_soon,
            expiring_soon_window_days: expiring_soon_window_days as i64,
            expired,
        })
    }

    fn validate(&self, subject: &str, issuer: &str, san_entries: &[String]) -> Result<(), AppError> {
        if subject.trim().is_empty() {
            return Err(AppError::BadRequest("subject must not be empty".into()));
        }
        if issuer.trim().is_empty() {
            return Err(AppError::BadRequest("issuer must not be empty".into()));
        }
        if san_entries.iter().any(|s| s.trim().is_empty()) {
            return Err(AppError::BadRequest("san_entries must not contain empty values".into()));
        }
        Ok(())
    }
}
