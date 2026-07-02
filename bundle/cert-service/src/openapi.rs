use utoipa::OpenApi;

use crate::handlers;
use crate::models;

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::health::check_health,
        handlers::certificates::create::create_certificate,
        handlers::certificates::get::get_certificate,
    ),
    components(schemas(
        models::CreateCertificateRequest,
        models::CertificateResponse,
        models::ErrorResponse,
        models::HealthResponse,
    )),
    tags(
        (name = "health", description = "Service health checks"),
        (name = "certificates", description = "Certificate metadata CRUD"),
    )
)]
pub struct ApiDoc;
