use axum::{extract::{Query, State}, Json};
use serde::Deserialize;

use crate::error::AppError;
use crate::models::{CertificateListResponse};
use crate::services::certificate_service::{CertificateListParams, CertificateService};
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct ListCertificatesQuery {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub subject: Option<String>,
    pub issuer: Option<String>,
    pub expiring_within_days: Option<i64>,
    pub sort_by: Option<String>,
    pub sort_dir: Option<String>,
}

#[utoipa::path(
    get,
    path = "/certificates",
    responses(
        (status = 200, description = "Certificate list", body = CertificateListResponse),
    ),
    tag = "certificates"
)]
pub async fn list_certificates(
    State(state): State<AppState>,
    Query(query): Query<ListCertificatesQuery>,
) -> Result<Json<CertificateListResponse>, AppError> {
    let service = CertificateService::new(&state.pool);

    let params = CertificateListParams {
        page: query.page,
        page_size: query.page_size,
        subject: query.subject,
        issuer: query.issuer,
        expiring_within_days: query.expiring_within_days,
        sort_by: query.sort_by,
        sort_dir: query.sort_dir,
    };

    let response = service.list(params).await?;
    Ok(Json(response))
}
