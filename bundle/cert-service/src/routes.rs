use axum::routing::get;
use axum::Router;
use tower_http::cors::CorsLayer;
use tower_http::request_id::{PropagateRequestIdLayer, SetRequestIdLayer};
use tower_http::trace::TraceLayer;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::handlers;
use crate::middleware::request_id::UuidRequestId;
use crate::openapi::ApiDoc;
use crate::AppState;

const REQUEST_ID_HEADER: &str = "x-request-id";


pub fn create_routes(state: AppState) -> Router {
    let api_routes = Router::new()
        .route("/health", get(handlers::health::check_health))
        .route(
            "/certificates",
            get(handlers::certificates::list_certificates)
                .post(handlers::certificates::create_certificate),
        )
        .route(
            "/certificates/stats",
            get(handlers::certificates::get_certificate_stats),
        )
        .route(
            "/certificates/:id",
            get(handlers::certificates::get_certificate),
        );

    Router::new()
        .merge(api_routes)
        .merge(SwaggerUi::new("/docs").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(SetRequestIdLayer::new(
            REQUEST_ID_HEADER.parse().unwrap(),
            UuidRequestId,
        ))
        .layer(PropagateRequestIdLayer::new(
            REQUEST_ID_HEADER.parse().unwrap(),
        ))
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive())
        .with_state(state)
}
