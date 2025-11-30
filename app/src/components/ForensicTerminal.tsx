/**
 * PROJECT HYPERION - PHASE 7: FORENSIC TERMINAL COMPONENT
 * ========================================================
 *
 * Terminal-style UI for streaming AI-generated forensic reports
 * Displays real-time explanations of insurance claim triggers
 *
 * Integration:
 * - Phase 6: Accepts oracle payload from Arbiter
 * - Phase 1: Optionally displays policy NFT metadata
 * - Existing wallet: Can import useWallet() or Lucid context (optional)
 *
 * Usage:
 *   <ForensicTerminal
 *     oraclePayload={arbiterData}
 *     policyMetadata={nftMetadata}
 *   />
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import type {
  OraclePayload,
  PolicyMetadata,
} from "@/lib/types/oracle";
import {
  streamForensicReport,
  validateOraclePayload,
  formatTimestamp,
  msToMph,
} from "@/lib/forensicsClient";

/**
 * Component props
 */
interface ForensicTerminalProps {
  /** Oracle data from Phase 6 Arbiter */
  oraclePayload: OraclePayload;

  /** Optional: CIP-68 metadata from Phase 1 Policy NFT */
  policyMetadata?: PolicyMetadata;

  /** Optional: Policy ID (can be extracted from oraclePayload) */
  policyId?: string;

  /** Optional: Wallet address for display (from existing useWallet hook) */
  walletAddress?: string;

  /** Optional: Custom class name for styling */
  className?: string;
}

/**
 * ForensicTerminal Component
 * Streams AI-generated forensic reports in a terminal-style interface
 */
export default function ForensicTerminal({
  oraclePayload,
  policyMetadata,
  policyId,
  walletAddress,
  className = "",
}: ForensicTerminalProps) {
  // State management
  const [reportText, setReportText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [streamComplete, setStreamComplete] = useState<boolean>(false);

  // Ref for auto-scrolling terminal
  const terminalRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when new text arrives
   */
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [reportText]);

  /**
   * Handle report generation
   */
  const handleGenerateReport = async () => {
    // Reset state
    setReportText("");
    setError(null);
    setIsStreaming(true);
    setStreamComplete(false);

    try {
      // Validate payload before sending
      validateOraclePayload(oraclePayload);

      // Add initial message
      setReportText(
        ">>> Forensic Report Generator v1.0\n>>> Connecting to Gemini AI Oracle...\n>>> Analyzing claim data...\n\n"
      );

      // Stream report chunks
      for await (const chunk of streamForensicReport(
        oraclePayload,
        policyMetadata
      )) {
        setReportText((prev) => prev + chunk);
      }

      // Add completion message
      setReportText(
        (prev) =>
          prev +
          "\n\n>>> Report generation complete.\n>>> Blockchain transaction hash: [pending on-chain verification]\n"
      );

      setStreamComplete(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setReportText((prev) => prev + `\n\n[ERROR] ${errorMessage}\n`);
    } finally {
      setIsStreaming(false);
    }
  };

  /**
   * Clear terminal
   */
  const handleClear = () => {
    setReportText("");
    setError(null);
    setStreamComplete(false);
  };

  /**
   * Copy report to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      alert("Report copied to clipboard!");
    } catch (err) {
      alert("Failed to copy report");
    }
  };

  /**
   * Export report as text file
   */
  const handleExport = () => {
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `forensic-report-${oraclePayload.policy_id}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Extract policy ID (prefer prop, fallback to payload)
  const displayPolicyId = policyId || oraclePayload.policy_id;

  return (
    <div className={`forensic-terminal ${className}`}>
      {/* Header Section */}
      <div className="terminal-header">
        <div className="header-info">
          <h2 className="terminal-title">🔍 Forensic Analysis Terminal</h2>
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="metadata-label">Policy ID:</span>
              <span className="metadata-value font-mono text-sm">
                {displayPolicyId.substring(0, 16)}...
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Location:</span>
              <span className="metadata-value">
                {oraclePayload.location_id}
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Wind Speed:</span>
              <span className="metadata-value">
                {oraclePayload.wind_speed.toFixed(1)} m/s (
                {msToMph(oraclePayload.wind_speed).toFixed(1)} mph)
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Timestamp:</span>
              <span className="metadata-value">
                {formatTimestamp(oraclePayload.measurement_time)}
              </span>
            </div>
            {walletAddress && (
              <div className="metadata-item">
                <span className="metadata-label">Operator:</span>
                <span className="metadata-value font-mono text-sm">
                  {walletAddress.substring(0, 12)}...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="terminal-actions">
          <button
            onClick={handleGenerateReport}
            disabled={isStreaming}
            className="btn btn-primary"
            aria-label="Generate forensic report"
          >
            {isStreaming ? (
              <>
                <span className="spinner" />
                Generating...
              </>
            ) : (
              <>📝 Generate Report</>
            )}
          </button>

          <button
            onClick={handleClear}
            disabled={isStreaming}
            className="btn btn-secondary"
            aria-label="Clear terminal"
          >
            🗑️ Clear
          </button>

          {streamComplete && (
            <>
              <button
                onClick={handleCopy}
                className="btn btn-secondary"
                aria-label="Copy report to clipboard"
              >
                📋 Copy
              </button>
              <button
                onClick={handleExport}
                className="btn btn-secondary"
                aria-label="Export report as text file"
              >
                💾 Export
              </button>
            </>
          )}
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="terminal-output"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {reportText ? (
          <pre className="terminal-text">{reportText}</pre>
        ) : (
          <div className="terminal-placeholder">
            <p>No report generated yet.</p>
            <p className="text-sm text-gray-500">
              Click &quot;Generate Report&quot; to analyze this claim using
              Gemini AI.
            </p>
          </div>
        )}

        {/* Streaming cursor */}
        {isStreaming && <span className="terminal-cursor">▊</span>}
      </div>

      {/* Status Bar */}
      <div className="terminal-status">
        <div className="status-left">
          {isStreaming && (
            <span className="status-indicator status-streaming">
              ● Streaming
            </span>
          )}
          {streamComplete && (
            <span className="status-indicator status-complete">
              ✓ Complete
            </span>
          )}
          {error && (
            <span className="status-indicator status-error">✗ Error</span>
          )}
        </div>
        <div className="status-right">
          <span className="status-text">
            Phase 7: Gemini Forensic Reporting
          </span>
        </div>
      </div>

      {/* Scoped Styles */}
      <style jsx>{`
        .forensic-terminal {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 600px;
          background: #1a1a1a;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .terminal-header {
          background: #2a2a2a;
          padding: 1.5rem;
          border-bottom: 1px solid #3a3a3a;
        }

        .terminal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #00ff88;
          margin: 0 0 1rem 0;
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .metadata-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metadata-label {
          font-size: 0.75rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metadata-value {
          font-size: 0.875rem;
          color: #fff;
        }

        .terminal-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #00ff88;
          color: #1a1a1a;
        }

        .btn-primary:hover:not(:disabled) {
          background: #00cc6a;
        }

        .btn-secondary {
          background: #3a3a3a;
          color: #fff;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #4a4a4a;
        }

        .spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid #1a1a1a;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .terminal-output {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          background: #0d0d0d;
          font-family: "Courier New", monospace;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .terminal-text {
          color: #00ff88;
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .terminal-placeholder {
          color: #666;
          text-align: center;
          padding: 3rem 1rem;
        }

        .terminal-placeholder p {
          margin: 0.5rem 0;
        }

        .terminal-cursor {
          display: inline-block;
          background: #00ff88;
          color: #0d0d0d;
          animation: blink 1s step-end infinite;
          margin-left: 2px;
        }

        @keyframes blink {
          50% {
            opacity: 0;
          }
        }

        .terminal-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: #2a2a2a;
          border-top: 1px solid #3a3a3a;
          font-size: 0.75rem;
        }

        .status-left,
        .status-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-weight: 500;
        }

        .status-streaming {
          background: rgba(0, 123, 255, 0.2);
          color: #4da6ff;
        }

        .status-complete {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .status-error {
          background: rgba(255, 82, 82, 0.2);
          color: #ff5252;
        }

        .status-text {
          color: #888;
        }

        /* Scrollbar styling */
        .terminal-output::-webkit-scrollbar {
          width: 8px;
        }

        .terminal-output::-webkit-scrollbar-track {
          background: #1a1a1a;
        }

        .terminal-output::-webkit-scrollbar-thumb {
          background: #3a3a3a;
          border-radius: 4px;
        }

        .terminal-output::-webkit-scrollbar-thumb:hover {
          background: #4a4a4a;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .metadata-grid {
            grid-template-columns: 1fr;
          }

          .terminal-actions {
            width: 100%;
          }

          .btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
