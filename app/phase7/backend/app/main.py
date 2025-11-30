"""
PROJECT HYPERION - BACKEND API (FastAPI)
=========================================

Main FastAPI application with endpoints for all phases:
- Phase 6: Oracle/Arbiter data validation
- Phase 7: Gemini forensic reporting (THIS FILE UPDATED)
- Future phases: Claims processing, governance, etc.

This file shows ONLY the additions for Phase 7.
Merge with your existing main.py by adding the forensics router.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import logging

# Phase 7: Gemini reporter service
from app.services.gemini_reporter import stream_forensic_report, get_gemini_reporter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ============================================================================
# FASTAPI APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="Project Hyperion API",
    description="AI-Powered Parametric Insurance Protocol on Cardano",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware (configure origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",
        "https://hyperion-insurance.vercel.app",  # Production frontend (example)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# PYDANTIC MODELS (Request/Response schemas)
# ============================================================================

class OraclePayload(BaseModel):
    """
    Oracle data structure from Phase 6 Arbiter
    Matches the signed payload from weather/IoT oracles
    """
    policy_id: str = Field(..., description="CIP-68 Policy NFT ID")
    location_id: str = Field(..., description="Geographic location identifier")
    wind_speed: float = Field(..., description="Wind speed in m/s")
    measurement_time: int = Field(..., description="Unix timestamp of measurement")
    threshold: float = Field(default=40.0, description="Trigger threshold in m/s")
    nonce: int = Field(default=0, description="Replay protection nonce")
    signature: Optional[str] = Field(default=None, description="Ed25519 signature (hex)")

    class Config:
        json_schema_extra = {
            "example": {
                "policy_id": "d5e6e2e1a6e1e9e8e7e6e5e4e3e2e1e0",
                "location_id": "miami_beach_buoy_12",
                "wind_speed": 45.5,
                "measurement_time": 1699564800,
                "threshold": 40.0,
                "nonce": 42,
                "signature": "a1b2c3d4..."
            }
        }


class PolicyMetadata(BaseModel):
    """
    Optional CIP-68 metadata from Phase 1 Policy NFT
    """
    coverage_type: str = Field(default="Hurricane Wind Damage")
    beneficiary: str = Field(..., description="Wallet address or pubkey hash")
    coverage_amount: int = Field(..., description="Payout amount in smallest unit (micro-USDM)")


class ForensicReportRequest(BaseModel):
    """
    Request body for forensic report generation
    """
    oracle_payload: OraclePayload
    policy_metadata: Optional[PolicyMetadata] = None


# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "status": "online",
        "service": "Project Hyperion API",
        "version": "1.0.0",
        "phases": [
            "Phase 1: Policy NFT Minting",
            "Phase 2: Treasury Vault",
            "Phase 3: Oracle Validation",
            "Phase 6: Arbiter Oracle",
            "Phase 7: Gemini Forensic Reporting (ACTIVE)"
        ]
    }


@app.get("/health")
async def health_check():
    """Detailed health check with service status"""
    try:
        # Test Gemini connection
        reporter = get_gemini_reporter()
        gemini_status = "connected"
    except Exception as e:
        gemini_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "services": {
            "api": "online",
            "gemini": gemini_status
        }
    }


# ============================================================================
# PHASE 7: FORENSIC REPORTING ENDPOINTS
# ============================================================================

@app.post("/forensics/stream")
async def stream_forensic_report_endpoint(request: ForensicReportRequest):
    """
    Stream a forensic report using Google Gemini AI

    This endpoint:
    1. Accepts oracle payload (from Phase 6 Arbiter)
    2. Optionally accepts policy metadata (from Phase 1 NFT)
    3. Streams a human-readable forensic explanation via SSE
    4. Returns text chunks as they're generated by Gemini

    **Integration:**
    - Frontend: Use EventSource or fetch with streaming
    - Phase 6: Pass Arbiter's signed oracle data
    - Phase 1: Optionally include CIP-68 metadata for context

    **Returns:** text/event-stream with chunks of the forensic report
    """
    try:
        logger.info(f"Forensic report requested for policy: {request.oracle_payload.policy_id}")

        # Prepare data for gemini_reporter
        data = {
            "oracle_payload": request.oracle_payload.model_dump(),
        }

        if request.policy_metadata:
            data["policy_metadata"] = request.policy_metadata.model_dump()

        # Stream response using Server-Sent Events (SSE)
        async def event_generator():
            """Generate SSE-formatted events"""
            try:
                async for chunk in stream_forensic_report(data):
                    # SSE format: data: <content>\n\n
                    yield f"data: {chunk}\n\n"

                # Send completion signal
                yield "data: [DONE]\n\n"

            except Exception as e:
                logger.error(f"Streaming error: {str(e)}")
                yield f"data: [ERROR] {str(e)}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/forensics/generate")
async def generate_static_report(request: ForensicReportRequest):
    """
    Generate a complete (non-streaming) forensic report

    Useful for:
    - PDF export
    - Email notifications
    - Archival/audit logs

    **Returns:** JSON with full report text
    """
    try:
        logger.info(f"Static report requested for policy: {request.oracle_payload.policy_id}")

        # Prepare data
        data = {
            "oracle_payload": request.oracle_payload.model_dump(),
        }

        if request.policy_metadata:
            data["policy_metadata"] = request.policy_metadata.model_dump()

        # Collect all chunks into one string
        reporter = get_gemini_reporter()
        report_text = await reporter.generate_static_report(
            oracle_payload=data["oracle_payload"],
            policy_metadata=data.get("policy_metadata")
        )

        return {
            "success": True,
            "policy_id": request.oracle_payload.policy_id,
            "report": report_text,
            "timestamp": request.oracle_payload.measurement_time
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error(f"Report generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# EXAMPLE: OTHER PHASE ENDPOINTS (Stubs for integration)
# ============================================================================

@app.get("/policies/{policy_id}")
async def get_policy(policy_id: str):
    """
    Phase 1: Retrieve CIP-68 policy NFT metadata
    (Stub - implement with Blockfrost/Koios in actual deployment)
    """
    return {
        "policy_id": policy_id,
        "status": "active",
        "message": "Phase 1 integration pending"
    }


@app.get("/treasury/{vault_address}")
async def get_vault_balance(vault_address: str):
    """
    Phase 2: Query treasury vault balance
    (Stub - implement with Cardano API)
    """
    return {
        "vault_address": vault_address,
        "balance": {"lovelace": 0, "USDM": 0},
        "message": "Phase 2 integration pending"
    }


@app.post("/oracle/submit")
async def submit_oracle_data(payload: OraclePayload):
    """
    Phase 6: Submit oracle data (Arbiter endpoint)
    (Stub - integrate with actual Arbiter service)
    """
    return {
        "success": True,
        "policy_id": payload.policy_id,
        "message": "Phase 6 integration pending"
    }


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return {
        "error": "Internal server error",
        "status_code": 500
    }


# ============================================================================
# STARTUP/SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Project Hyperion API starting up...")

    # Test Gemini connection
    try:
        reporter = get_gemini_reporter()
        logger.info("✓ Gemini reporter initialized")
    except Exception as e:
        logger.error(f"✗ Gemini reporter failed: {str(e)}")

    logger.info("API ready to accept requests")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Project Hyperion API shutting down...")


# ============================================================================
# DEVELOPMENT SERVER (for testing)
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes (dev only)
        log_level="info"
    )
