// ═══════════════════════════════════════════════════════════════════════════
// PROJECT HYPERION - PHASE 2: TREASURY TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════
// Shared types for Treasury Vault integration
// Import with: use hyperion/contracts/lib/treasury_types.{TreasuryDatum, TreasuryRedeemer, AssetClass}
// ═══════════════════════════════════════════════════════════════════════════

/// AssetClass - Identifies a specific Cardano native asset
/// policy_id: Minting policy hash (28 bytes for native assets, empty for ADA)
/// asset_name: Token name (can be empty for policy-only tokens)
pub type AssetClass {
  policy_id: ByteArray,
  asset_name: ByteArray,
}

/// TreasuryDatum - State stored at Treasury UTxO
/// Locks funds for a specific insurance policy until oracle triggers payout
pub type TreasuryDatum {
  policy_id: ByteArray,           // Insurance policy NFT ID (links to Phase 1)
  payout_asset: AssetClass,       // Asset to pay out (e.g., ADA or stablecoin)
  payout_amount: Int,             // Amount in lovelaces or token units
  treasury_owner: ByteArray,      // Protocol admin (for emergency recovery)
}

/// TreasuryRedeemer - Actions for Treasury operations
pub type TreasuryRedeemer {
  action: ByteArray,              // "PAYOUT" - trigger insurance payout
                                  // "REFUND" - return premium on policy cancellation (future)
                                  // "UPDATE" - change treasury parameters (future)
}

/// OracleDatum - Oracle state (Phase 3 integration)
/// This must match the datum structure from phase3_oracle.ak
pub type OracleDatum {
  policy_id: ByteArray,           // Must match TreasuryDatum.policy_id
  trigger: Bool,                  // True when payout conditions met
  timestamp: Int,                 // POSIX time of oracle update (ms)
}
