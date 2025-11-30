/**
 * PROJECT HYPERION - DASHBOARD PAGE
 * ===================================
 *
 * Example integration of ForensicTerminal component
 * This demonstrates how to use Phase 7 in your existing dashboard
 *
 * NOTE: This is a REFERENCE implementation. Merge with your existing dashboard.
 */

import ForensicTerminal from "@/components/ForensicTerminal";
import type { OraclePayload, PolicyMetadata } from "@/lib/types/oracle";

/**
 * Example: Fetch oracle data from Phase 6 Arbiter
 * Replace with your actual data fetching logic
 */
async function getOracleData(policyId: string): Promise<OraclePayload> {
  // In production, fetch from your Arbiter API
  // const response = await fetch(`${process.env.BACKEND_URL}/oracle/${policyId}`);
  // return response.json();

  // Demo data for testing
  return {
    policy_id: policyId,
    location_id: "miami_beach_buoy_12",
    wind_speed: 45.5,
    measurement_time: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    threshold: 40.0,
    nonce: 42,
    signature: "a1b2c3d4e5f6...",
  };
}

/**
 * Example: Fetch policy metadata from Phase 1 CIP-68 NFT
 * Replace with your actual blockchain query
 */
async function getPolicyMetadata(policyId: string): Promise<PolicyMetadata> {
  // In production, query Blockfrost/Koios for CIP-68 metadata
  // const nftData = await blockfrost.assetsById(policyId);
  // return parseMetadata(nftData);

  // Demo data for testing
  return {
    coverage_type: "Hurricane Wind Damage",
    beneficiary: "addr_test1qz...",
    coverage_amount: 100_000_000, // 100 USDM
    coverage_start: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
    coverage_end: Math.floor(Date.now() / 1000) + 86400 * 335, // ~11 months from now
  };
}

/**
 * Dashboard Page Component
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { policy_id?: string };
}) {
  // Get policy ID from URL query params or use default
  const policyId =
    searchParams.policy_id || "d5e6e2e1a6e1e9e8e7e6e5e4e3e2e1e0";

  // Fetch data (Server Component - runs on server)
  const oraclePayload = await getOracleData(policyId);
  const policyMetadata = await getPolicyMetadata(policyId);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-green-400 mb-2">
            🏛️ Project Hyperion
          </h1>
          <p className="text-gray-400">
            AI-Powered Parametric Insurance on Cardano
          </p>
        </header>

        {/* Main Content */}
        <main>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">
              Claims Analysis Dashboard
            </h2>
            <p className="text-gray-400">
              Review oracle triggers and generate forensic reports using Gemini
              AI
            </p>
          </div>

          {/* Phase 7: Forensic Terminal Component */}
          <div className="mb-8">
            <ForensicTerminal
              oraclePayload={oraclePayload}
              policyMetadata={policyMetadata}
              policyId={policyId}
              // walletAddress={walletContext?.address} // Uncomment if using wallet
            />
          </div>

          {/* Additional Dashboard Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Policy Status Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-green-400">
                📋 Policy Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-semibold">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Coverage:</span>
                  <span className="text-white">
                    {(policyMetadata.coverage_amount / 1_000_000).toFixed(2)}{" "}
                    USDM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">
                    {policyMetadata.coverage_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Oracle Data Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">
                🌡️ Latest Oracle Data
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Wind Speed:</span>
                  <span
                    className={
                      oraclePayload.wind_speed > (oraclePayload.threshold || 40)
                        ? "text-red-400 font-semibold"
                        : "text-white"
                    }
                  >
                    {oraclePayload.wind_speed.toFixed(1)} m/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Threshold:</span>
                  <span className="text-white">
                    {(oraclePayload.threshold || 40).toFixed(1)} m/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Triggered:</span>
                  <span
                    className={
                      oraclePayload.wind_speed > (oraclePayload.threshold || 40)
                        ? "text-red-400 font-semibold"
                        : "text-green-400"
                    }
                  >
                    {oraclePayload.wind_speed > (oraclePayload.threshold || 40)
                      ? "YES"
                      : "NO"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Notes */}
          <div className="mt-8 p-6 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">
              ℹ️ Integration Notes
            </h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>
                • <strong>Phase 1:</strong> Policy metadata loaded from CIP-68
                NFT
              </li>
              <li>
                • <strong>Phase 6:</strong> Oracle data from Arbiter service
              </li>
              <li>
                • <strong>Phase 7:</strong> Forensic reports via Gemini AI
              </li>
              <li>
                • <strong>Wallet:</strong> Connect your existing wallet context
                (optional)
              </li>
            </ul>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Project Hyperion v1.0.0 | Powered by Cardano, Aiken, Gemini AI
          </p>
        </footer>
      </div>
    </div>
  );
}
