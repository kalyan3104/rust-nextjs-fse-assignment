#[path = "../src/error.rs"]
mod error;
#[path = "../src/cert_parser.rs"]
mod cert_parser;

use cert_parser::parse_pem_certificate;

const TEST_PEM: &str = include_str!("fixtures/test_cert.pem");

#[test]
fn extracts_expected_san_entries() {
    let parsed = parse_pem_certificate(TEST_PEM).expect("parse should succeed");
    assert!(parsed.san_entries.contains(&"test.example.com".to_string()));
    assert!(parsed
        .san_entries
        .contains(&"www.test.example.com".to_string()));
}

#[test]
fn not_after_is_in_the_future_relative_to_not_before() {
    let parsed = parse_pem_certificate(TEST_PEM).expect("parse should succeed");
    assert!(parsed.not_after > parsed.not_before);
}

#[test]
fn subject_contains_common_name() {
    let parsed = parse_pem_certificate(TEST_PEM).expect("parse should succeed");
    assert!(parsed.subject.contains("test.example.com"));
}
