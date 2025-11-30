/**
 * PROJECT HYPERION - PHASE 7: FORENSICS API CLIENT
 * =================================================
 *
 * Client library for interacting with Gemini Forensic Reporting backend
 * Handles streaming (SSE) and static report generation
 *
 * Usage:
 *   import { streamForensicReport } from '@/lib/forensicsClient';
 *   const stream = streamForensicReport(oraclePayload);
 *   for await (const chunk of stream) {
 *     console.log(chunk);
 *   }
 */

import type {
  OraclePayload,
  PolicyMetadata,
  ForensicReportRequest,
  ForensicReportResponse,
  ForensicStreamEvent,
} from "./types/oracle";

/**
 * Get backend API URL from environment variables
 * Falls back to localhost:8000 for development
 */
const getBackendURL = (): string => {
  if (typeof window === "undefined") {
    // Server-side: use internal URL
    return process.env.BACKEND_URL || "http://localhost:8000";
  } else {
    // Client-side: use public URL
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  }
};

/**
 * Stream a forensic report from the backend
 * Uses Server-Sent Events (SSE) for real-time text streaming
 *
 * @param oraclePayload - Oracle data from Phase 6 Arbiter
 * @param policyMetadata - Optional CIP-68 metadata from Phase 1
 * @returns AsyncGenerator yielding text chunks as they arrive
 *
 * @example
 * ```typescript
 * const payload = { policy_id: "abc123", wind_speed: 45.5, ... };
 * for await (const chunk of streamForensicReport(payload)) {
 *   console.log(chunk); // "The hurricane triggered..."
 * }
 * ```
 */
export async function* streamForensicReport(
  oraclePayload: OraclePayload,
  policyMetadata?: PolicyMetadata
): AsyncGenerator<string, void, unknown> {
  const backendURL = getBackendURL();
  const endpoint = `${backendURL}/forensics/stream`;

  const requestBody: ForensicReportRequest = {
    oracle_payload: oraclePayload,
    policy_metadata: policyMetadata,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Backend error (${response.status}): ${errorText || response.statusText}`
      );
    }

    if (!response.body) {
      throw new Error("Response body is null (streaming not supported)");
    }

    // Read streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages (separated by \n\n)
      const messages = buffer.split("\n\n");
      buffer = messages.pop() || ""; // Keep incomplete message in buffer

      for (const message of messages) {
        if (!message.trim()) continue;

        // Parse SSE format: "data: <content>"
        const lines = message.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6); // Remove "data: " prefix

            // Check for special signals
            if (data === "[DONE]") {
              return; // Stream complete
            }

            if (data.startsWith("[ERROR]")) {
              throw new Error(data.substring(8)); // Remove "[ERROR] " prefix
            }

            // Yield text chunk
            yield data;
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Streaming failed: ${error.message}`);
    }
    throw new Error("Unknown streaming error");
  }
}

/**
 * Generate a complete (non-streaming) forensic report
 * Useful for PDF export or when you need the full text at once
 *
 * @param oraclePayload - Oracle data from Phase 6 Arbiter
 * @param policyMetadata - Optional CIP-68 metadata from Phase 1
 * @returns Promise resolving to full report response
 *
 * @example
 * ```typescript
 * const payload = { policy_id: "abc123", wind_speed: 45.5, ... };
 * const response = await generateStaticReport(payload);
 * console.log(response.report); // Full report text
 * ```
 */
export async function generateStaticReport(
  oraclePayload: OraclePayload,
  policyMetadata?: PolicyMetadata
): Promise<ForensicReportResponse> {
  const backendURL = getBackendURL();
  const endpoint = `${backendURL}/forensics/generate`;

  const requestBody: ForensicReportRequest = {
    oracle_payload: oraclePayload,
    policy_metadata: policyMetadata,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data: ForensicReportResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
    throw new Error("Unknown error during report generation");
  }
}

/**
 * Check if backend is reachable and Gemini is configured
 * Useful for health checks before attempting report generation
 *
 * @returns Promise resolving to health status
 */
export async function checkBackendHealth(): Promise<{
  status: string;
  services: {
    api: string;
    gemini: string;
  };
}> {
  const backendURL = getBackendURL();
  const endpoint = `${backendURL}/health`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      status: "error",
      services: {
        api: "offline",
        gemini: "unknown",
      },
    };
  }
}

/**
 * Format Unix timestamp to human-readable date
 * Helper for displaying oracle measurement times
 *
 * @param timestamp - Unix timestamp (seconds)
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * Convert wind speed from m/s to mph
 * Helper for displaying wind speeds in familiar units
 *
 * @param windSpeedMS - Wind speed in meters per second
 * @returns Wind speed in miles per hour
 */
export function msToMph(windSpeedMS: number): number {
  return windSpeedMS * 2.237;
}

/**
 * Validate oracle payload before sending to backend
 * Throws error if required fields are missing or invalid
 *
 * @param payload - Oracle payload to validate
 */
export function validateOraclePayload(payload: OraclePayload): void {
  const required = ["policy_id", "location_id", "wind_speed", "measurement_time"];

  for (const field of required) {
    if (!(field in payload)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (typeof payload.wind_speed !== "number" || payload.wind_speed < 0) {
    throw new Error("wind_speed must be a positive number");
  }

  if (
    typeof payload.measurement_time !== "number" ||
    payload.measurement_time <= 0
  ) {
    throw new Error("measurement_time must be a valid Unix timestamp");
  }
}
