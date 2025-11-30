"""
Hyperion AI Backend - FastAPI Application
AI-Powered Parametric Insurance Protocol
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# Initialize FastAPI app
app = FastAPI(
    title="Hyperion AI Backend",
    description="AI-Powered Parametric Insurance Protocol API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "service": "Hyperion AI Backend",
        "version": "0.1.0",
        "status": "operational",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "components": {
            "api": "up",
            "ai_agents": "standby",
            "blockchain": "disconnected",
            "oracle": "ready",  # Phase 3 Oracle
            "forensics": "ready",  # Phase 7 Gemini Forensic Reporting
        },
    }


# Import and include routers
from app.api import oracle
from app.api import forensics

app.include_router(
    oracle.router,
    prefix="/api/v1/oracle",
    tags=["Phase 3 Oracle"]
)

# Phase 7: Gemini Forensic Reporting
app.include_router(
    forensics.router,
    prefix="/api/v1/forensics",
    tags=["Phase 7 Forensic Reporting"]
)

# Future routers (to be implemented)
# from app.api import risk, claims, policies
# app.include_router(risk.router, prefix="/api/v1/risk", tags=["Risk Assessment"])
# app.include_router(claims.router, prefix="/api/v1/claims", tags=["Claims"])
# app.include_router(policies.router, prefix="/api/v1/policies", tags=["Policies"])
