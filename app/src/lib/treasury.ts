/**
 * Phase 2 Treasury Integration
 * Handles premium deposits and payout requests through the Treasury vault
 */

import { Lucid, Blockfrost, TxHash, UTxO, Datum, Data, fromText, toUnit } from 'lucid-cardano';
import { config } from './config';

// ============================================================================
// TYPE DEFINITIONS (Must match contracts/lib/treasury_types.ak)
// ============================================================================

export interface AssetClass {
  policyId: string;
  assetName: string;
}

export interface TreasuryDatum {
  policyId: string;           // Insurance policy NFT ID (28 bytes hex)
  payoutAsset: AssetClass;    // Asset to pay out (ADA or token)
  payoutAmount: bigint;       // Amount in lovelaces or token units
  treasuryOwner: string;      // Protocol admin pubkey hash
}

export interface TreasuryRedeemer {
  action: string;             // "PAYOUT" | "REFUND" | "UPDATE"
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TREASURY_SCRIPT_ADDRESS = config.treasuryAddress || 
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS || 
  "addr_test1..."; // Placeholder - update after deployment

export const ADA_ASSET: AssetClass = {
  policyId: "",
  assetName: ""
};

// Minimum ADA required for UTxO (Cardano protocol parameter)
export const MIN_UTXO_ADA = 2_000_000n; // 2 ADA

// ============================================================================
// TREASURY DATUM SERIALIZATION
// ============================================================================

/**
 * Serialize TreasuryDatum to Plutus Data
 * Must match the on-chain datum structure exactly
 */
export function serializeTreasuryDatum(datum: TreasuryDatum): string {
  const datumSchema = Data.Object({
    policyId: Data.Bytes(),
    payoutAsset: Data.Object({
      policyId: Data.Bytes(),
      assetName: Data.Bytes()
    }),
    payoutAmount: Data.Integer(),
    treasuryOwner: Data.Bytes()
  });

  type TreasuryDatumType = Data.Static<typeof datumSchema>;
  const TreasuryDatumSchema = datumSchema as unknown as TreasuryDatumType;

  const plutusData = Data.to<TreasuryDatumType>({
    policyId: datum.policyId,
    payoutAsset: {
      policyId: datum.payoutAsset.policyId,
      assetName: datum.payoutAsset.assetName
    },
    payoutAmount: datum.payoutAmount,
    treasuryOwner: datum.treasuryOwner
  }, TreasuryDatumSchema);

  return plutusData;
}

/**
 * Serialize TreasuryRedeemer to Plutus Data
 */
export function serializeTreasuryRedeemer(redeemer: TreasuryRedeemer): string {
  const redeemerSchema = Data.Object({
    action: Data.Bytes()
  });

  type TreasuryRedeemerType = Data.Static<typeof redeemerSchema>;
  const TreasuryRedeemerSchema = redeemerSchema as unknown as TreasuryRedeemerType;

  const plutusData = Data.to<TreasuryRedeemerType>({
    action: fromText(redeemer.action)
  }, TreasuryRedeemerSchema);

  return plutusData;
}

// ============================================================================
// PREMIUM DEPOSIT (CreatePolicy Integration)
// ============================================================================

/**
 * Build transaction to create insurance policy with treasury deposit
 * 
 * Flow:
 * 1. User pays premium + coverage amount
 * 2. Premium locked in Treasury UTxO with TreasuryDatum
 * 3. Policy NFT minted and sent to user
 * 
 * @param lucid - Initialized Lucid instance
 * @param policyId - Insurance policy NFT ID
 * @param premiumAmount - Premium in lovelaces
 * @param coverageAmount - Coverage amount for payout
 * @param treasuryOwner - Protocol admin pubkey hash
 * @returns Built transaction ready to sign
 */
export async function buildPremiumDepositTx(
  lucid: Lucid,
  policyId: string,
  premiumAmount: bigint,
  coverageAmount: bigint,
  treasuryOwner: string
): Promise<any> {
  
  // Prepare Treasury Datum
  const treasuryDatum: TreasuryDatum = {
    policyId: policyId,
    payoutAsset: ADA_ASSET,
    payoutAmount: coverageAmount,
    treasuryOwner: treasuryOwner
  };

  const datum = serializeTreasuryDatum(treasuryDatum);

  // Build transaction
  const tx = lucid
    .newTx()
    .payToContract(
      TREASURY_SCRIPT_ADDRESS,
      { inline: datum },
      { lovelace: premiumAmount + MIN_UTXO_ADA }
    );

  return tx;
}

/**
 * Complete premium deposit transaction
 * @param lucid - Lucid instance
 * @param policyId - Policy ID
 * @param premiumAmount - Premium in lovelaces
 * @param coverageAmount - Coverage amount
 * @param treasuryOwner - Admin pubkey hash
 * @returns Transaction hash
 */
export async function depositPremium(
  lucid: Lucid,
  policyId: string,
  premiumAmount: bigint,
  coverageAmount: bigint,
  treasuryOwner: string
): Promise<TxHash> {
  
  const tx = await buildPremiumDepositTx(
    lucid,
    policyId,
    premiumAmount,
    coverageAmount,
    treasuryOwner
  );

  const completedTx = await tx.complete();
  const signedTx = await completedTx.sign().complete();
  const txHash = await signedTx.submit();

  console.log('✅ Premium deposited to treasury:', txHash);
  return txHash;
}

// ============================================================================
// PAYOUT REQUEST (TriggerPayout Integration)
// ============================================================================

/**
 * Find treasury UTxO for a specific policy
 * @param lucid - Lucid instance
 * @param policyId - Policy ID to search for
 * @returns Treasury UTxO or null
 */
export async function findTreasuryUTxO(
  lucid: Lucid,
  policyId: string
): Promise<UTxO | null> {
  
  const utxos = await lucid.utxosAt(TREASURY_SCRIPT_ADDRESS);

  for (const utxo of utxos) {
    if (utxo.datum) {
      try {
        // Parse datum to check policy_id
        const datumSchema = Data.Object({
          policyId: Data.Bytes(),
          payoutAsset: Data.Object({
            policyId: Data.Bytes(),
            assetName: Data.Bytes()
          }),
          payoutAmount: Data.Integer(),
          treasuryOwner: Data.Bytes()
        });

        type TreasuryDatumType = Data.Static<typeof datumSchema>;
        const parsedDatum = Data.from<TreasuryDatumType>(utxo.datum, datumSchema as unknown as TreasuryDatumType);

        if (parsedDatum.policyId === policyId) {
          return utxo;
        }
      } catch (error) {
        console.warn('Failed to parse treasury datum:', error);
        continue;
      }
    }
  }

  return null;
}

/**
 * Build payout transaction with treasury spending
 * 
 * Flow:
 * 1. Oracle validates trigger condition
 * 2. Insurance validator calls treasury payout
 * 3. Treasury validates oracle trigger via reference input
 * 4. Payout sent to policy NFT holder
 * 
 * @param lucid - Lucid instance
 * @param policyId - Policy ID
 * @param oracleUtxoRef - Oracle UTxO reference for trigger validation
 * @param beneficiaryAddress - Address to receive payout
 * @returns Built transaction
 */
export async function buildPayoutTx(
  lucid: Lucid,
  policyId: string,
  oracleUtxoRef: string,
  beneficiaryAddress: string
): Promise<any> {
  
  // Find treasury UTxO
  const treasuryUtxo = await findTreasuryUTxO(lucid, policyId);
  if (!treasuryUtxo) {
    throw new Error(`Treasury UTxO not found for policy ${policyId}`);
  }

  // Parse treasury datum to get payout amount
  const datumSchema = Data.Object({
    policyId: Data.Bytes(),
    payoutAsset: Data.Object({
      policyId: Data.Bytes(),
      assetName: Data.Bytes()
    }),
    payoutAmount: Data.Integer(),
    treasuryOwner: Data.Bytes()
  });

  type TreasuryDatumType = Data.Static<typeof datumSchema>;
  const treasuryDatum = Data.from<TreasuryDatumType>(treasuryUtxo.datum!, datumSchema as unknown as TreasuryDatumType);

  // Prepare redeemer
  const redeemer: TreasuryRedeemer = {
    action: "PAYOUT"
  };
  const redeemerData = serializeTreasuryRedeemer(redeemer);

  // Get oracle UTxO for reference input
  const [txHash, outputIndex] = oracleUtxoRef.split('#');
  const oracleUtxos = await lucid.utxosByOutRef([{
    txHash: txHash,
    outputIndex: parseInt(outputIndex)
  }]);

  if (oracleUtxos.length === 0) {
    throw new Error(`Oracle UTxO not found: ${oracleUtxoRef}`);
  }

  // Build transaction
  const tx = lucid
    .newTx()
    .collectFrom([treasuryUtxo], redeemerData)
    .readFrom(oracleUtxos)  // CIP-31 reference input for oracle
    .payToAddress(beneficiaryAddress, {
      lovelace: treasuryDatum.payoutAmount
    });

  return tx;
}

/**
 * Request payout from treasury
 * @param lucid - Lucid instance
 * @param policyId - Policy ID
 * @param oracleUtxoRef - Oracle UTxO reference
 * @param beneficiaryAddress - Payout recipient
 * @returns Transaction hash
 */
export async function requestPayout(
  lucid: Lucid,
  policyId: string,
  oracleUtxoRef: string,
  beneficiaryAddress: string
): Promise<TxHash> {
  
  const tx = await buildPayoutTx(
    lucid,
    policyId,
    oracleUtxoRef,
    beneficiaryAddress
  );

  const completedTx = await tx.complete();
  const signedTx = await completedTx.sign().complete();
  const txHash = await signedTx.submit();

  console.log('✅ Payout requested from treasury:', txHash);
  return txHash;
}

// ============================================================================
// TREASURY MONITORING
// ============================================================================

/**
 * Get total value locked in treasury
 * @param lucid - Lucid instance
 * @returns Total ADA locked
 */
export async function getTreasuryTVL(lucid: Lucid): Promise<bigint> {
  const utxos = await lucid.utxosAt(TREASURY_SCRIPT_ADDRESS);
  const totalLovelace = utxos.reduce((sum, utxo) => {
    return sum + (utxo.assets.lovelace || 0n);
  }, 0n);
  
  return totalLovelace;
}

/**
 * Get all active treasury deposits
 * @param lucid - Lucid instance
 * @returns Array of treasury deposits with policy IDs
 */
export async function getActiveTreasuryDeposits(lucid: Lucid): Promise<Array<{
  policyId: string;
  payoutAmount: bigint;
  utxo: UTxO;
}>> {
  const utxos = await lucid.utxosAt(TREASURY_SCRIPT_ADDRESS);
  const deposits: Array<{ policyId: string; payoutAmount: bigint; utxo: UTxO }> = [];

  const datumSchema = Data.Object({
    policyId: Data.Bytes(),
    payoutAsset: Data.Object({
      policyId: Data.Bytes(),
      assetName: Data.Bytes()
    }),
    payoutAmount: Data.Integer(),
    treasuryOwner: Data.Bytes()
  });

  for (const utxo of utxos) {
    if (utxo.datum) {
      try {
        type TreasuryDatumType = Data.Static<typeof datumSchema>;
        const datum = Data.from<TreasuryDatumType>(utxo.datum, datumSchema as unknown as TreasuryDatumType);
        
        deposits.push({
          policyId: datum.policyId,
          payoutAmount: datum.payoutAmount,
          utxo: utxo
        });
      } catch (error) {
        console.warn('Failed to parse treasury datum:', error);
      }
    }
  }

  return deposits;
}
