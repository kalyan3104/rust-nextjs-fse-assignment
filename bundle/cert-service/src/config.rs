use anyhow::{Context, Result};

/// Application configuration, loaded once at startup from environment
/// variables. Centralizing this avoids scattering `env::var` calls across
/// the codebase and gives a single place to add validation/defaults.
#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database_url: String,
    pub bind_addr: String,
    pub log_format: LogFormat,
    pub db_max_connections: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LogFormat {
    Pretty,
    Json,
}

impl AppConfig {
    pub fn from_env() -> Result<Self> {
        let database_url = std::env::var("DATABASE_URL")
            .context("DATABASE_URL must be set, e.g. postgres://user:pass@localhost:5432/certdb")?;

        let bind_addr = std::env::var("BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".to_string());

        let log_format = match std::env::var("LOG_FORMAT").as_deref() {
            Ok("json") => LogFormat::Json,
            _ => LogFormat::Pretty,
        };

        let db_max_connections = std::env::var("DB_MAX_CONNECTIONS")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(10);

        Ok(Self {
            database_url,
            bind_addr,
            log_format,
            db_max_connections,
        })
    }
}
