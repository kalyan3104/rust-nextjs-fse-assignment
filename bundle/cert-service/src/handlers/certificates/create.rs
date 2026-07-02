use axum::{extract::State, Json};

use crate::error::AppError;
use crate::models::{CertificateResponse, CreateCertificateRequest};
use crate::services::certificate_service::CertificateService;
use crate::AppState;


#[utoipa::path(
    post,
    path = "/certificates",
    request_body = CreateCertificateRequest,
    responses(
        (status = 200, description = "Certificate created", body = CertificateResponse),
        (status = 400, description = "Invalid input", body = crate::models::ErrorResponse),
        (status = 422, description = "Certificate could not be parsed", body = crate::models::ErrorResponse),
    ),
    tag = "certificates"
)]
pub async fn create_certificate(
    State(state): State<AppState>,
    Json(payload): Json<CreateCertificateRequest>,
) -> Result<Json<CertificateResponse>, AppError> {
    let service = CertificateService::new(&state.pool);
    let response = service.create(payload).await?;
    Ok(Json(response))
}
