use axum::{extract::State, Json};

use crate::error::AppError;
use crate::models::HealthResponse;
use crate::AppState;


#[utoipa::path(
    get,
    path = "/health",
    responses(
        (status = 200, description = "System is healthy", body = HealthResponse),
    ),
    tag = "health"
)]
pub async fn check_health(State(state): State<AppState>) -> Result<Json<HealthResponse>, AppError> {
    sqlx::query("SELECT 1").execute(&state.pool).await?;
    Ok(Json(HealthResponse {
        ok: true,
        version: env!("CARGO_PKG_VERSION").to_string(),
    }))
}
