use base64::{engine::general_purpose::STANDARD, Engine};
use chrono::{DateTime, Utc};
use x509_parser::prelude::*;

use crate::error::AppError;


#[derive(Debug)]
pub struct ParsedCertificate {
    pub subject: String,
    pub issuer: String,
    pub not_before: DateTime<Utc>,
    pub not_after: DateTime<Utc>,
    pub serial: String,
    pub san_entries: Vec<String>,
}


pub fn parse_pem_certificate(pem_str: &str) -> Result<ParsedCertificate, AppError> {
    let der = pem_to_der(pem_str)?;

    let (_, cert) = X509Certificate::from_der(&der)
        .map_err(|e| AppError::ParseError(format!("failed to parse DER certificate: {e}")))?;

    let subject = cert.subject().to_string();
    let issuer = cert.issuer().to_string();
    let serial = cert.raw_serial_as_string();

    let not_before = asn1_time_to_chrono(cert.validity().not_before)?;
    let not_after = asn1_time_to_chrono(cert.validity().not_after)?;

    let san_entries = extract_san_entries(&cert);

    Ok(ParsedCertificate {
        subject,
        issuer,
        not_before,
        not_after,
        serial,
        san_entries,
    })
}

fn pem_to_der(pem_str: &str) -> Result<Vec<u8>, AppError> {
    let cleaned: String = pem_str
        .lines()
        .filter(|line| !line.starts_with("-----"))
        .collect::<Vec<_>>()
        .join("");

    STANDARD
        .decode(cleaned.trim())
        .map_err(|e| AppError::ParseError(format!("invalid base64 in PEM: {e}")))
}

fn asn1_time_to_chrono(t: ASN1Time) -> Result<DateTime<Utc>, AppError> {
    DateTime::from_timestamp(t.timestamp(), 0)
        .ok_or_else(|| AppError::ParseError("invalid certificate timestamp".to_string()))
}

fn extract_san_entries(cert: &X509Certificate) -> Vec<String> {
    let mut entries = Vec::new();

    if let Ok(Some(san)) = cert.subject_alternative_name() {
        for name in &san.value.general_names {
            match name {
                GeneralName::DNSName(dns) => entries.push(dns.to_string()),
                GeneralName::IPAddress(ip) => entries.push(format!("{ip:?}")),
                GeneralName::RFC822Name(email) => entries.push(email.to_string()),
                other => entries.push(format!("{other:?}")),
            }
        }
    }

    entries
}

#[cfg(test)]
mod tests {
    use super::*;

    const TEST_PEM: &str = include_str!("../tests/fixtures/test_cert.pem");

    #[test]
    fn parses_valid_pem_certificate() {
        let result = parse_pem_certificate(TEST_PEM);
        assert!(result.is_ok(), "expected successful parse: {result:?}");
        let parsed = result.unwrap();
        assert!(parsed.subject.contains("test.example.com"));
        assert!(!parsed.serial.is_empty());
    }

    #[test]
    fn rejects_garbage_input() {
        let result =
            parse_pem_certificate("-----BEGIN CERTIFICATE-----\nnotbase64!!!\n-----END CERTIFICATE-----");
        assert!(result.is_err());
    }
}
