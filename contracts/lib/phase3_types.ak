// ═══════════════════════════════════════════════════════════════════════════
// PROJECT HYPERION - PHASE 3: SHARED TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════
// Modular type exports for Phase 3 Oracle Validator
// Import with: use hyperion/contracts/lib/phase3_types.{Phase3OracleDatum, Phase3OracleRedeemer}
// ═══════════════════════════════════════════════════════════════════════════

/// Phase 3 Datum - Oracle configuration and state
pub type Phase3OracleDatum {
  oracle_vk: ByteArray,              // Ed25519 public key (32 bytes)
  threshold_wind_speed: Int,          // Threshold in m/s × 100 (e.g., 2500 = 25.0 m/s)
  max_age_ms: Int,                    // Maximum data age (milliseconds)
  last_nonce: Int,                    // Replay protection counter
  location_id: ByteArray,             // Geographic binding
}

/// Phase 3 Redeemer - Oracle data submission
pub type Phase3OracleRedeemer {
  wind_speed: Int,                    // Measured wind speed (m/s × 100)
  measurement_time: Int,              // POSIX timestamp (milliseconds)
  nonce: Int,                         // Unique nonce (must exceed last_nonce)
  policy_id: ByteArray,               // Insurance policy identifier (28 bytes)
  location_id: ByteArray,             // Must match datum location_id
  signature: ByteArray,               // Ed25519 signature (64 bytes)
}
