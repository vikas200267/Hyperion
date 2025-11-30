/**
 * PROJECT HYPERION - PHASE 7: ORACLE & FORENSIC TYPES
 * ====================================================
 *
 * TypeScript type definitions shared across frontend components
 * Ensures type safety between backend API and React components
 *
 * Integration:
 * - Phase 6: Matches Arbiter oracle payload structure
 * - Phase 7: Used by ForensicTerminal component
 * - Backend: Mirrors Pydantic models in main.py
 */

/**
 * Oracle payload from Phase 6 Arbiter
 * Represents signed data from weather/IoT sensors
 */
export interface OraclePayload {
  /** CIP-68 Policy NFT identifier */
  policy_id: string;

  /** Geographic location (e.g., "miami_beach_buoy_12") */
  location_id: string;

  /** Measured wind speed in m/s */
  wind_speed: number;

  /** Unix timestamp of measurement (seconds since epoch) */
  measurement_time: number;

  /** Trigger threshold in m/s (default: 40.0) */
  threshold?: number;

  /** Replay protection nonce */
  nonce?: number;

  /** Ed25519 signature (hex-encoded) - optional for frontend display */
  signature?: string;
}

/**
 * CIP-68 Policy NFT metadata from Phase 1
 * Optional context for forensic reports
 */
export interface PolicyMetadata {
  /** Type of coverage (e.g., "Hurricane Wind Damage") */
  coverage_type?: string;

  /** Beneficiary wallet address or pubkey hash */
  beneficiary: string;

  /** Payout amount in smallest unit (e.g., micro-USDM) */
  coverage_amount: number;

  /** Optional: Policy start date */
  coverage_start?: number;

  /** Optional: Policy expiration date */
  coverage_end?: number;
}

/**
 * Request body for forensic report generation
 * Sent to POST /forensics/stream or /forensics/generate
 */
export interface ForensicReportRequest {
  oracle_payload: OraclePayload;
  policy_metadata?: PolicyMetadata;
}

/**
 * Response from static report generation (POST /forensics/generate)
 */
export interface ForensicReportResponse {
  success: boolean;
  policy_id: string;
  report: string;
  timestamp: number;
}

/**
 * Streaming event types from SSE endpoint
 */
export type ForensicStreamEvent =
  | { type: "chunk"; data: string }
  | { type: "done" }
  | { type: "error"; message: string };

/**
 * Example oracle payload for testing/demos
 */
export const EXAMPLE_ORACLE_PAYLOAD: OraclePayload = {
  policy_id: "d5e6e2e1a6e1e9e8e7e6e5e4e3e2e1e0",
  location_id: "miami_beach_buoy_12",
  wind_speed: 45.5,
  measurement_time: 1699564800,
  threshold: 40.0,
  nonce: 42,
  signature: "a1b2c3d4e5f6...",
};

/**
 * Example policy metadata for testing
 */
export const EXAMPLE_POLICY_METADATA: PolicyMetadata = {
  coverage_type: "Hurricane Wind Damage",
  beneficiary: "addr_test1qz...",
  coverage_amount: 100_000_000, // 100 USDM (assuming 6 decimals)
  coverage_start: 1698960000,
  coverage_end: 1730582400,
};
