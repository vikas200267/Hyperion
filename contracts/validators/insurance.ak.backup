-- =============================================================================
-- Hyperion Smart Contracts - Parametric Insurance Validator
-- Integrated with Phase 3 Oracle Validator
-- =============================================================================

use aiken/transaction.{ScriptContext, OutputReference}
use aiken/list

-- Import Phase 3 Oracle integration functions
use hyperion/contracts/validators/phase3_oracle.{
  phase3_oracle_triggered,
  phase3_get_wind_speed,
  phase3_verify_policy,
  Phase3OracleRedeemer
}

-- Policy state representing an insurance policy
type PolicyState {
  owner: ByteArray,
  premium_paid: Int,
  coverage_amount: Int,
  trigger_threshold: Int,        // Wind speed threshold in m/s × 100
  expiry_slot: Int,
  is_active: Bool,
  oracle_ref: OutputReference,   // Reference to Phase 3 Oracle UTxO
  policy_id: ByteArray,          // 28-byte policy identifier
}

-- Redeemer actions for the policy validator
type PolicyAction {
  CreatePolicy
  TriggerPayout { oracle_redeemer: Phase3OracleRedeemer }  // Oracle data from Phase 3
  CancelPolicy
  ExpirePolicy
}

-- Main validator function
validator parametric_insurance {
  spend(
    datum_opt: Option<PolicyState>,
    redeemer: PolicyAction,
    ctx: ScriptContext,
  ) {
    expect Some(policy) = datum_opt : "Insurance: Missing policy datum"
    
    when redeemer is {
      CreatePolicy -> {
        // Verify premium payment and policy parameters
        // TODO: Add premium verification logic
        policy.premium_paid > 0 && 
        policy.coverage_amount > 0 &&
        policy.is_active
      }
      
      TriggerPayout { oracle_redeemer } -> {
        // ✅ PHASE 3 ORACLE INTEGRATION
        // Verify oracle was triggered in this transaction
        expect phase3_oracle_triggered(policy.oracle_ref, ctx) : 
          "Insurance: Oracle not triggered in transaction"
        
        // Verify policy ID matches oracle trigger
        expect phase3_verify_policy(oracle_redeemer, policy.policy_id) :
          "Insurance: Policy ID mismatch with oracle"
        
        // Extract wind speed from oracle
        let wind_speed = phase3_get_wind_speed(oracle_redeemer)
        
        // Verify parametric condition met
        expect wind_speed >= policy.trigger_threshold :
          "Insurance: Parametric trigger condition not met"
        
        // Verify policy is active
        expect policy.is_active :
          "Insurance: Policy is not active"
        
        // All checks passed - payout authorized
        True
      }
      
      CancelPolicy -> {
        // Verify owner signature (to be implemented with proper signature check)
        // Return remaining funds to owner
        !policy.is_active || verify_owner_signature(ctx, policy.owner)
      }
      
      ExpirePolicy -> {
        // Verify expiry slot has passed
        verify_expiry(ctx, policy.expiry_slot)
      }
    }
  }
}

-- Helper functions

/// Verify owner signature (placeholder - to be implemented with proper pubkey check)
fn verify_owner_signature(_ctx: ScriptContext, _owner: ByteArray) -> Bool {
  // TODO: Implement proper signature verification
  // Should check transaction is signed by owner's pubkey
  True
}

/// Verify expiry slot has passed
fn verify_expiry(ctx: ScriptContext, expiry_slot: Int) -> Bool {
  // Check current slot against expiry
  // TODO: Extract slot from ctx.transaction.validity_range
  let current_slot = 0  // Placeholder
  current_slot >= expiry_slot
}

/// Calculate payout amount based on wind speed severity
/// More severe conditions = higher payout (up to coverage_amount)
fn calculate_payout(coverage: Int, wind_speed: Int, threshold: Int) -> Int {
  // Linear scaling: threshold = 100%, threshold*2 = 200% (capped at coverage)
  let excess = wind_speed - threshold
  let base_payout = coverage
  let severity_multiplier = 100 + (excess * 100 / threshold)
  let payout = (base_payout * severity_multiplier) / 100
  
  // Cap at coverage amount
  if payout > coverage {
    coverage
  } else {
    payout
  }
}
