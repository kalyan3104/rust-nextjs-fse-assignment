use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::CertificateRow;

/// Repository layer: thin wrappers around SQL. Business rules (e.g. "where
/// do subject/issuer come from if a PEM was supplied") live in
/// `services::certificate_service`, not here.
pub struct CertificateRepository<'a> {
    pool: &'a PgPool,
}

impl<'a> CertificateRepository<'a> {
    pub fn new(pool: &'a PgPool) -> Self {
        Self { pool }
    }

    pub async fn insert(
        &self,
        subject: &str,
        issuer: &str,
        expiration: DateTime<Utc>,
        not_before: Option<DateTime<Utc>>,
        serial: Option<&str>,
        san_entries: &[String],
    ) -> Result<(CertificateRow, Vec<String>), AppError> {
        let mut tx = self.pool.begin().await?;

        let row: CertificateRow = sqlx::query_as(
            r#"
            INSERT INTO certificates (subject, issuer, expiration, not_before, serial)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, subject, issuer, expiration, not_before, serial, created_at
            "#,
        )
        .bind(subject)
        .bind(issuer)
        .bind(expiration)
        .bind(not_before)
        .bind(serial)
        .fetch_one(&mut *tx)
        .await?;

        for san in san_entries {
            sqlx::query("INSERT INTO san_entries (certificate_id, value) VALUES ($1, $2)")
                .bind(row.id)
                .bind(san)
                .execute(&mut *tx)
                .await?;
        }

        tx.commit().await?;

        Ok((row, san_entries.to_vec()))
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<Option<(CertificateRow, Vec<String>)>, AppError> {
        let row: Option<CertificateRow> = sqlx::query_as(
            r#"
            SELECT id, subject, issuer, expiration, not_before, serial, created_at
            FROM certificates
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(self.pool)
        .await?;

        let Some(row) = row else {
            return Ok(None);
        };

        let sans: Vec<(String,)> =
            sqlx::query_as("SELECT value FROM san_entries WHERE certificate_id = $1 ORDER BY id")
                .bind(id)
                .fetch_all(self.pool)
                .await?;

        let san_entries = sans.into_iter().map(|(v,)| v).collect();

        Ok(Some((row, san_entries)))
    }
}
