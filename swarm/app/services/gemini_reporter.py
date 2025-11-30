"""
PROJECT HYPERION - PHASE 7: GEMINI FORENSIC REPORTER SERVICE
=============================================================

Purpose: Generate human-readable insurance claim explanations using Google Gemini AI
         Streams forensic reports that explain why a policy was triggered based on
         oracle data (wind speed, location, timestamp, etc.)

Integration:
- Phase 6: Consumes Arbiter oracle payloads (wind_speed, measurement_time, etc.)
- Phase 2: References treasury payout logic
- Phase 1: Connects policy NFT metadata to real-world events

Security:
- Rate limiting implemented to prevent API abuse
- Input validation for oracle payloads
- API key stored securely in environment variables
- No sensitive data logged in production mode
"""

import os
import json
import asyncio
from typing import AsyncIterator, Dict, Any, Optional
from datetime import datetime
import logging

# Google Gemini SDK
try:
    import google.generativeai as genai
except ImportError:
    raise ImportError(
        "google-generativeai not installed. Run: pip install google-generativeai"
    )

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GeminiForensicReporter:
    """
    Handles streaming forensic report generation using Google Gemini API
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini client with API key

        Args:
            api_key: Google Gemini API key (defaults to GEMINI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")

        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY not found. Set environment variable or pass to constructor."
            )

        # Configure Gemini
        genai.configure(api_key=self.api_key)

        # Use Gemini 1.5 Flash for fast streaming (or gemini-1.5-pro for higher quality)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

        # Rate limiting (configurable via env)
        self.max_requests_per_minute = int(os.getenv("GEMINI_RATE_LIMIT", "60"))
        self._request_timestamps = []

        logger.info("GeminiForensicReporter initialized with model: gemini-1.5-flash")

    async def stream_forensic_report(
        self,
        oracle_payload: Dict[str, Any],
        policy_metadata: Optional[Dict[str, Any]] = None
    ) -> AsyncIterator[str]:
        """
        Generate a streaming forensic report from oracle data

        Args:
            oracle_payload: Raw oracle data from Phase 6 Arbiter
                Expected fields:
                - policy_id: str
                - location_id: str
                - wind_speed: float (m/s)
                - measurement_time: int (Unix timestamp)
                - threshold: float (trigger threshold)
                - nonce: int
                - signature: str (optional)

            policy_metadata: Optional CIP-68 metadata from Phase 1
                - coverage_type: str
                - beneficiary: str
                - coverage_amount: int

        Yields:
            str: Text chunks from Gemini's streaming response

        Raises:
            ValueError: If oracle_payload is invalid
            Exception: If Gemini API fails
        """
        # Validate input
        self._validate_oracle_payload(oracle_payload)

        # Rate limiting check
        await self._enforce_rate_limit()

        # Build forensic prompt
        prompt = self._build_forensic_prompt(oracle_payload, policy_metadata)

        logger.info(f"Generating forensic report for policy: {oracle_payload.get('policy_id', 'unknown')}")

        try:
            # Stream response from Gemini
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt,
                stream=True
            )

            # Yield chunks as they arrive
            for chunk in response:
                if chunk.text:
                    yield chunk.text
                    # Small delay to prevent overwhelming frontend
                    await asyncio.sleep(0.01)

            logger.info("Forensic report generation completed successfully")

        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            # Yield error message to frontend
            yield f"\n\n[ERROR] Failed to generate report: {str(e)}\n"
            yield "Please check your GEMINI_API_KEY and try again.\n"

    def _validate_oracle_payload(self, payload: Dict[str, Any]) -> None:
        """
        Validate oracle payload structure

        Args:
            payload: Oracle data to validate

        Raises:
            ValueError: If required fields are missing
        """
        required_fields = ["policy_id", "location_id", "wind_speed", "measurement_time"]
        missing_fields = [f for f in required_fields if f not in payload]

        if missing_fields:
            raise ValueError(f"Missing required oracle fields: {', '.join(missing_fields)}")

        # Type validation
        if not isinstance(payload.get("wind_speed"), (int, float)):
            raise ValueError("wind_speed must be a number")

        if not isinstance(payload.get("measurement_time"), int):
            raise ValueError("measurement_time must be a Unix timestamp (int)")

    async def _enforce_rate_limit(self) -> None:
        """
        Simple rate limiting to prevent API abuse
        Tracks requests per minute
        """
        now = asyncio.get_event_loop().time()

        # Remove timestamps older than 60 seconds
        self._request_timestamps = [
            ts for ts in self._request_timestamps if now - ts < 60
        ]

        # Check if limit exceeded
        if len(self._request_timestamps) >= self.max_requests_per_minute:
            wait_time = 60 - (now - self._request_timestamps[0])
            logger.warning(f"Rate limit reached. Waiting {wait_time:.1f}s")
            await asyncio.sleep(wait_time)

        # Record this request
        self._request_timestamps.append(now)

    def _build_forensic_prompt(
        self,
        oracle_payload: Dict[str, Any],
        policy_metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Construct the Gemini prompt for forensic report generation

        Args:
            oracle_payload: Raw oracle data
            policy_metadata: Optional policy NFT metadata

        Returns:
            str: Formatted prompt for Gemini
        """
        # Format timestamp
        measurement_time = oracle_payload.get("measurement_time", 0)
        timestamp_str = datetime.fromtimestamp(measurement_time).strftime("%Y-%m-%d %H:%M:%S UTC")

        # Extract key metrics
        wind_speed = oracle_payload.get("wind_speed", 0)
        location_id = oracle_payload.get("location_id", "unknown")
        policy_id = oracle_payload.get("policy_id", "unknown")
        threshold = oracle_payload.get("threshold", wind_speed)  # Default to measured value

        # Convert wind speed from m/s to mph for readability
        wind_speed_mph = wind_speed * 2.237
        threshold_mph = threshold * 2.237

        # Build base prompt
        prompt = f"""You are an AI insurance adjuster for Project Hyperion, a parametric hurricane insurance protocol on the Cardano blockchain.

Your task is to generate a clear, professional forensic report explaining why an insurance claim was automatically triggered by smart contract logic.

**CLAIM DETAILS:**
- Policy ID: {policy_id}
- Location: {location_id}
- Measurement Time: {timestamp_str}
- Recorded Wind Speed: {wind_speed:.2f} m/s ({wind_speed_mph:.1f} mph)
- Trigger Threshold: {threshold:.2f} m/s ({threshold_mph:.1f} mph)
- Oracle Nonce: {oracle_payload.get('nonce', 'N/A')}

**RAW ORACLE PAYLOAD:**
```json
{json.dumps(oracle_payload, indent=2)}
```
"""

        # Add policy metadata if available
        if policy_metadata:
            coverage_amount = policy_metadata.get("coverage_amount", "N/A")
            beneficiary = policy_metadata.get("beneficiary", "N/A")
            prompt += f"""
**POLICY METADATA (CIP-68 NFT):**
- Coverage Type: {policy_metadata.get('coverage_type', 'Hurricane Wind Damage')}
- Beneficiary: {beneficiary}
- Coverage Amount: {coverage_amount} USDM
"""

        # Add instructions
        prompt += """
**INSTRUCTIONS:**
Write a forensic report (200-400 words) that:

1. **Explains the Trigger Event**: Describe what happened in plain English (e.g., "Hurricane winds exceeded the agreed threshold at Location X").

2. **Validates the Data**: Confirm the oracle reading is legitimate (mention timestamp, location, wind speed measurement).

3. **Smart Contract Logic**: Explain how the Cardano smart contract automatically validated this data and authorized the payout WITHOUT human intervention.

4. **Blockchain Transparency**: Highlight that this entire process is recorded on-chain and auditable by anyone.

5. **Next Steps**: Briefly mention that the payout will be sent to the policy NFT holder's wallet address via the Treasury vault (Phase 2).

**TONE:** Professional but accessible. Avoid jargon. Target audience is a policyholder who may not understand blockchain technology.

**FORMAT:** Use clear paragraphs. Include a "Summary" section at the end with bullet points.

Generate the forensic report now:
"""

        return prompt

    async def generate_static_report(
        self,
        oracle_payload: Dict[str, Any],
        policy_metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate a complete (non-streaming) forensic report
        Useful for PDF export or email notifications

        Args:
            oracle_payload: Raw oracle data
            policy_metadata: Optional policy metadata

        Returns:
            str: Complete forensic report text
        """
        chunks = []
        async for chunk in self.stream_forensic_report(oracle_payload, policy_metadata):
            chunks.append(chunk)

        return "".join(chunks)


# Singleton instance for reuse across requests
_reporter_instance: Optional[GeminiForensicReporter] = None


def get_gemini_reporter() -> GeminiForensicReporter:
    """
    Get or create singleton GeminiForensicReporter instance
    Reuses API client to avoid reinitializing on every request

    Returns:
        GeminiForensicReporter: Configured reporter instance
    """
    global _reporter_instance

    if _reporter_instance is None:
        _reporter_instance = GeminiForensicReporter()

    return _reporter_instance


# Convenience function for direct use
async def stream_forensic_report(data: Dict[str, Any]) -> AsyncIterator[str]:
    """
    Convenience function for streaming forensic reports

    Args:
        data: Dict containing 'oracle_payload' and optional 'policy_metadata'

    Yields:
        str: Report text chunks

    Example:
        >>> data = {
        ...     "oracle_payload": {
        ...         "policy_id": "abc123",
        ...         "location_id": "miami_beach",
        ...         "wind_speed": 45.5,
        ...         "measurement_time": 1699564800,
        ...         "threshold": 40.0,
        ...         "nonce": 42
        ...     }
        ... }
        >>> async for chunk in stream_forensic_report(data):
        ...     print(chunk, end="", flush=True)
    """
    reporter = get_gemini_reporter()

    oracle_payload = data.get("oracle_payload")
    if not oracle_payload:
        raise ValueError("Missing 'oracle_payload' in request data")

    policy_metadata = data.get("policy_metadata")

    async for chunk in reporter.stream_forensic_report(oracle_payload, policy_metadata):
        yield chunk
