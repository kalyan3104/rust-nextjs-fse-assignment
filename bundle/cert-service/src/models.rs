use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateCertificateRequest {
    pub subject: Option<String>,
    pub issuer: Option<String>,
    pub expiration: Option<DateTime<Utc>>,
    pub not_before: Option<DateTime<Utc>>,
    pub serial: Option<String>,
    #[serde(default)]
    pub san_entries: Vec<String>,
  
    pub pem: Option<String>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct CertificateRow {
    pub id: Uuid,
    pub subject: String,
    pub issuer: String,
    pub expiration: DateTime<Utc>,
    pub not_before: Option<DateTime<Utc>>,
    pub serial: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, ToSchema, sqlx::FromRow)]
pub struct CertificateResponse {
    pub id: Uuid,
    pub subject: String,
    pub issuer: String,
    pub expiration: DateTime<Utc>,
    pub not_before: Option<DateTime<Utc>>,
    pub serial: Option<String>,
    pub created_at: DateTime<Utc>,
    pub san_entries: Vec<String>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct CertificateListResponse {
    pub items: Vec<CertificateResponse>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
    pub total_pages: i64,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct CertificateStats {
    pub total: i64,
    pub expiring_soon: i64,
    pub expiring_soon_window_days: i64,
    pub expired: i64,
}

impl CertificateResponse {
    pub fn from_row(row: CertificateRow, san_entries: Vec<String>) -> Self {
        Self {
            id: row.id,
            subject: row.subject,
            issuer: row.issuer,
            expiration: row.expiration,
            not_before: row.not_before,
            serial: row.serial,
            created_at: row.created_at,
            san_entries,
        }
    }
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ErrorResponse {
    pub error: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct HealthResponse {
    pub ok: bool,
    pub version: String,
}
