use axum::{extract::State, Json};

use crate::error::AppError;
use crate::models::CertificateStats;
use crate::services::certificate_service::{CertificateService};
use crate::AppState;

#[utoipa::path(
    get,
    path = "/certificates/stats",
    responses(
        (status = 200, description = "Certificate stats", body = CertificateStats),
    ),
    tag = "certificates"
)]
pub async fn get_certificate_stats(
    State(state): State<AppState>,
) -> Result<Json<CertificateStats>, AppError> {
    let service = CertificateService::new(&state.pool);
    let response = service.stats().await?;
    Ok(Json(response))
}
