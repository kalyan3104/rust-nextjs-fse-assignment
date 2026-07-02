use axum::{
    extract::{Path, State},
    Json,
};
use uuid::Uuid;

use crate::error::AppError;
use crate::models::CertificateResponse;
use crate::services::certificate_service::CertificateService;
use crate::AppState;

#[utoipa::path(
    get,
    path = "/certificates/{id}",
    params(("id" = Uuid, Path, description = "Certificate UUID")),
    responses(
        (status = 200, description = "Certificate found", body = CertificateResponse),
        (status = 404, description = "Certificate not found", body = crate::models::ErrorResponse),
    ),
    tag = "certificates"
)]
pub async fn get_certificate(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<CertificateResponse>, AppError> {
    let service = CertificateService::new(&state.pool);
    let response = service.get_by_id(id).await?;
    Ok(Json(response))
}
