-- =============================================================================
-- Hyperion Smart Contracts - Shared Types Library
-- Common types used across validators
-- =============================================================================

-- Oracle data structure for parametric triggers
pub type OracleData {
  source_id: ByteArray,
  timestamp: Int,
  data_type: DataType,
  value: Int,
  signature: ByteArray,
}

-- Types of parametric data supported
pub type DataType {
  Weather
  Temperature
  Rainfall
  WindSpeed
  Earthquake
  FlightDelay
  Custom { identifier: ByteArray }
}

-- Insurance policy status
pub type PolicyStatus {
  Active
  Triggered
  Expired
  Cancelled
  PaidOut
}

-- Protocol configuration
pub type ProtocolConfig {
  admin_pkh: ByteArray,
  oracle_pkh: ByteArray,
  fee_address: ByteArray,
  fee_bps: Int,
  min_premium: Int,
  max_coverage: Int,
}
