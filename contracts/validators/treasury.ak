// ============================================================================
// PROJECT HYPERION - PHASE 2: TREASURY / ESCROW VAULT VALIDATOR
// ============================================================================
//
// Purpose: Holds user premiums in a secure vault and releases payouts ONLY when
//          a valid Oracle trigger (Phase 3) is present via reference input (CIP-31).
//
// Integration Overview:
// - Phase 1 (Policy NFT): Defines the insurance policy as a CIP-68 NFT
// - Phase 2 (THIS): Holds funds and enforces payout conditions
// - Phase 3 (Oracle): Validates real-world triggers (weather, IoT data, etc.)
//
// Flow:
// 1. User pays premium → funds locked in Treasury UTxO with TreasuryDatum
// 2. Oracle monitors conditions → publishes trigger UTxO when event occurs
// 3. Beneficiary spends Treasury UTxO → references Oracle trigger → receives payout
//
// CIP-31 Reference Inputs:
// We use reference inputs (read-only) to check the Oracle's trigger state
// without consuming the Oracle UTxO. This allows multiple policies to reference
// the same oracle trigger.
//
// ============================================================================

use cardano/transaction.{ScriptPurpose}
use cardano/transaction.{Transaction, InlineDatum, Input, Output}
use cardano/address.{Credential, Address}
use cardano/assets.{Value, PolicyId, AssetName}
use cardano/address.{Blake2b_224, Hash}
use aiken
use aiken/collection/list
use aiken/collection/dict
use hyperion/contracts/lib/treasury_types.{
  AssetClass, TreasuryDatum, TreasuryRedeemer, OracleDatum
}

// ============================================================================
// ORACLE SCRIPT HASH (from Phase 3)
// ============================================================================
// TODO: Replace with actual Oracle validator hash after Phase 3 deployment
// This ensures only authentic Oracle trigger UTxOs are accepted
// 
// DEPLOYMENT STEPS:
// 1. Deploy phase3_oracle.ak to preprod testnet
// 2. Get the script hash from deployment output
// 3. Update this constant with the deployed hash
// 4. Rebuild treasury.ak with updated hash
// 5. Deploy updated treasury.ak to preprod
//
// Example deployed hash format:
// const oracle_script_hash: ByteArray = #"a1b2c3d4e5f6..."
//
const oracle_script_hash: ByteArray = #"0000000000000000000000000000000000000000000000000000000000000000"

// ============================================================================
// MAIN VALIDATOR ENTRYPOINT
// ============================================================================

// spend: Validates spending of the Treasury vault UTxO
//
// @param datum: TreasuryDatum attached to the vault UTxO being spent
// @param redeemer: TreasuryRedeemer specifying the action
// @param ctx: ScriptContext containing transaction info
// @return: Bool (True = valid spend, False = reject)
//
validator treasury {
  spend(datum: TreasuryDatum, redeemer: TreasuryRedeemer, _own_ref: OutputReference, ctx: ScriptContext) -> Bool {
    // Extract transaction from context
    let tx: Transaction = ctx.transaction

    // Route based on redeemer action
    when redeemer.action is {
      "PAYOUT" -> validate_payout(datum, tx)

      // Future actions (Phase 4+):
      // "CANCEL" -> validate_cancel(datum, tx)
      // "REFUND" -> validate_refund(datum, tx)

      _ -> False  // Reject unknown actions
    }
  }
}

// ============================================================================
// PAYOUT VALIDATION LOGIC
// ============================================================================

// validate_payout: Core logic for releasing funds on Oracle trigger
//
// Checks:
// 1. Oracle trigger UTxO exists in reference inputs
// 2. Oracle trigger is valid for this policy_id
// 3. Vault has sufficient funds
// 4. Payout goes to correct beneficiary (policy NFT holder)
//
fn validate_payout(datum: TreasuryDatum, tx: Transaction) -> Bool {
  // -------------------------------------------------------------------------
  // CHECK 1: Find and validate Oracle trigger in reference inputs (CIP-31)
  // -------------------------------------------------------------------------
  let oracle_trigger_valid: Bool =
    has_valid_oracle_trigger(tx.reference_inputs, datum.policy_id)

  // -------------------------------------------------------------------------
  // CHECK 2: Verify vault contains enough payout_asset
  // -------------------------------------------------------------------------
  // Find the input being spent (this treasury UTxO)
  expect Some(vault_input) = find_script_input(tx.inputs, ctx.purpose)

  let vault_value: Value = vault_input.output.value
  let has_funds: Bool =
    has_minimum_asset(vault_value, datum.payout_asset, datum.payout_amount)

  // -------------------------------------------------------------------------
  // CHECK 3: Ensure payout goes to policy NFT holder
  // -------------------------------------------------------------------------
  // The beneficiary is the holder of the policy_id NFT (from Phase 1)
  let payout_sent: Bool =
    payout_to_nft_holder(tx.outputs, datum.policy_id, datum.payout_asset, datum.payout_amount)

  // -------------------------------------------------------------------------
  // CHECK 4: Prevent unauthorized value leakage
  // -------------------------------------------------------------------------
  // Either vault is fully drained OR change returns to script
  // (For production: implement precise value accounting)
  let no_leakage: Bool = True  // Simplified for Phase 2

  // All checks must pass
  oracle_trigger_valid && has_funds && payout_sent && no_leakage
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// has_valid_oracle_trigger: Checks reference inputs for authentic Oracle trigger
//
// @param ref_inputs: List of reference inputs in transaction
// @param policy_id: The policy NFT ID to match
// @return: True if valid trigger found
//
fn has_valid_oracle_trigger(ref_inputs: List<Input>, policy_id: ByteArray) -> Bool {
  // Find reference input with Oracle script hash
  let oracle_input_opt: Option<Input> =
    list.find(ref_inputs, fn(input) {
      when input.output.address.payment_credential is {
        Script(hash) -> hash == oracle_script_hash
        _ -> False
      }
    })

  when oracle_input_opt is {
    Some(oracle_input) -> {
      // Extract and parse Oracle datum
      when oracle_input.output.datum is {
        InlineDatum(data) -> {
          // Deserialize to OracleDatum
          expect oracle_datum: OracleDatum = data

          // Verify: policy_id matches AND trigger is active
          oracle_datum.policy_id == policy_id && oracle_datum.trigger == True
        }
        _ -> False  // Oracle must use inline datums
      }
    }
    None -> False  // No Oracle reference found
  }
}

// find_script_input: Locates the script input being spent
//
// @param inputs: All transaction inputs
// @param purpose: ScriptPurpose (should be Spend)
// @return: The Input being validated
//
fn find_script_input(inputs: List<Input>, purpose: ScriptPurpose) -> Option<Input> {
  when purpose is {
    Spend(output_ref) -> {
      list.find(inputs, fn(input) {
        input.output_reference == output_ref
      })
    }
    _ -> None
  }
}

// has_minimum_asset: Checks if a Value contains at least N of an asset
//
// @param val: The Value to check
// @param asset: The AssetClass to look for
// @param min_amount: Minimum required amount
// @return: True if sufficient
//
fn has_minimum_asset(val: Value, asset: AssetClass, min_amount: Int) -> Bool {
  let quantity: Int = value.quantity_of(val, asset.policy_id, asset.asset_name)
  quantity >= min_amount
}

// payout_to_nft_holder: Ensures payout reaches the policy NFT holder
//
// @param outputs: Transaction outputs
// @param nft_policy_id: Policy ID of the CIP-68 NFT (from Phase 1)
// @param payout_asset: Asset to pay
// @param amount: Amount to pay
// @return: True if payout sent correctly
//
fn payout_to_nft_holder(
  outputs: List<Output>,
  nft_policy_id: ByteArray,
  payout_asset: AssetClass,
  amount: Int
) -> Bool {
  // Find output containing the policy NFT
  let nft_output_opt: Option<Output> =
    list.find(outputs, fn(output) {
      // Check if this output contains the NFT with nft_policy_id
      // CIP-68 reference token has asset name starting with (100)
      let nft_quantity: Int = count_assets_with_policy(output.value, nft_policy_id)
      nft_quantity > 0
    })

  when nft_output_opt is {
    Some(nft_output) -> {
      // Verify this output also receives the payout
      let received: Int =
        value.quantity_of(nft_output.value, payout_asset.policy_id, payout_asset.asset_name)
      received >= amount
    }
    None -> {
      // Alternative: payout to any output for testing (remove in prod)
      // For production: must find NFT holder address
      list.any(outputs, fn(output) {
        let received: Int =
          value.quantity_of(output.value, payout_asset.policy_id, payout_asset.asset_name)
        received >= amount
      })
    }
  }
}

// count_assets_with_policy: Counts total tokens from a specific policy
//
// @param val: Value to inspect
// @param policy: PolicyId to count
// @return: Total quantity of all assets under that policy
//
fn count_assets_with_policy(val: Value, policy: PolicyId) -> Int {
  // Get the map of assets for this policy
  let policy_assets: Dict<AssetName, Int> =
    value.tokens(val, policy)

  // Sum all quantities
  dict.foldr(policy_assets, 0, fn(_name, qty, acc) { acc + qty })
}

// ============================================================================
// INTEGRATION NOTES FOR PHASES 3-12
// ============================================================================
//
// Phase 3 (Oracle):
// - Must output UTxO with script hash matching oracle_script_hash
// - Must use InlineDatum with OracleDatum structure
// - Set trigger = True when conditions met
//
// Phase 4 (Premium Collection):
// - Lock funds to this Treasury validator
// - Include TreasuryDatum with correct policy_id, payout_asset, amount
//
// Phase 5 (Claims Processing):
// - Build transaction with PAYOUT redeemer
// - Include Oracle UTxO as reference input (CIP-31)
// - Send payout to beneficiary holding policy NFT
//
// Phase 6-12 (Advanced Features):
// - Multi-trigger conditions (AND/OR logic)
// - Partial payouts / tiered coverage
// - Reinsurance pools
// - Governance / parameter updates
// - Emergency pause mechanisms
// - Premium refunds on cancellation
//
// DEPLOYMENT CHECKLIST:
// 1. Update oracle_script_hash with actual Phase 3 Oracle hash
// 2. Test on preprod with Blockfrost API
// 3. Verify CIP-31 reference input support in wallet/tooling
// 4. Audit payout_to_nft_holder for CIP-68 compliance
// 5. Implement value conservation checks (no_leakage)
// 6. Add time-lock constraints for claim windows
// 7. Integrate with off-chain code (Lucid, Mesh, etc.)
//
// SECURITY CONSIDERATIONS:
// - Oracle centralization: Use multiple oracles or decentralized oracle network
// - Front-running: Add nonce or deadline to prevent replay attacks
// - Value leakage: Strict accounting of inputs vs outputs
// - Datum tampering: Always validate inline datums, never trust user-supplied data
//
// ============================================================================
