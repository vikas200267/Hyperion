"""
═══════════════════════════════════════════════════════════════════════════
PROJECT HYPERION - PHASE 6: DATA MODELS
═══════════════════════════════════════════════════════════════════════════
Module: app/models.py
Purpose: Pydantic models for API requests/responses
═══════════════════════════════════════════════════════════════════════════
"""

from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, validator


# ═══════════════════════════════════════════════════════════════════════════
# REQUEST MODELS
# ═══════════════════════════════════════════════════════════════════════════

class Phase6OracleRequest(BaseModel):
    """Request model for oracle execution."""
    
    policy_id: str = Field(
        ...,
        description="Cardano policy ID (28 bytes hex)",
        min_length=56,
        max_length=56,
    )
    
    location_id: str = Field(
        ...,
        description="Unique location identifier",
        min_length=1,
        max_length=64,
    )
    
    latitude: float = Field(
        ...,
        description="Latitude in decimal degrees",
        ge=-90.0,
        le=90.0,
    )
    
    longitude: float = Field(
        ...,
        description="Longitude in decimal degrees",
        ge=-180.0,
        le=180.0,
    )
    
    threshold_wind_speed: int = Field(
        default=2500,
        description="Wind speed threshold in m/s × 100 (e.g. 2500 = 25.0 m/s)",
        ge=0,
        le=50000,  # 500 m/s max (unrealistic but safe upper bound)
    )
    
    class Config:
        schema_extra = {
            "example": {
                "policy_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
                "location_id": "miami_fl_hurricane_zone",
                "latitude": 25.7617,
                "longitude": -80.1918,
                "threshold_wind_speed": 2500,
            }
        }


# ═══════════════════════════════════════════════════════════════════════════
# RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════════

class Phase6OracleResponse(BaseModel):
    """
    Response model for oracle execution.
    
    This matches the Phase 3 OracleRedeemer structure exactly.
    """
    
    # Core oracle data (matches Phase 3 Aiken validator)
    policy_id: str = Field(..., description="Cardano policy ID (28 bytes hex)")
    location_id: str = Field(..., description="Location identifier")
    wind_speed: int = Field(..., description="Wind speed in m/s × 100")
    measurement_time: int = Field(..., description="POSIX timestamp (milliseconds)")
    nonce: int = Field(..., description="Unique nonce for replay protection")
    signature: str = Field(..., description="Ed25519 signature (64 bytes hex)")
    
    # Additional metadata (not sent on-chain)
    trigger: bool = Field(..., description="Whether threshold was exceeded")
    confidence: float = Field(..., description="Confidence score (0-1)")
    sources: Dict[str, Any] = Field(
        default_factory=dict,
        description="Data sources used for decision"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Response generation timestamp"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "policy_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
                "location_id": "miami_fl_hurricane_zone",
                "wind_speed": 2750,
                "measurement_time": 1730000000000,
                "nonce": 42,
                "signature": "abcd1234ef567890..." * 4,  # 64 bytes hex
                "trigger": True,
                "confidence": 0.95,
                "sources": {
                    "primary": "OpenWeatherMap",
                    "secondary": "NOAA",
                },
                "timestamp": "2024-01-01T12:00:00Z",
            }
        }


class Phase6HealthResponse(BaseModel):
    """Health check response model."""
    
    status: str = Field(..., description="Overall health status")
    phase: int = Field(default=6, description="Phase number")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Health check timestamp"
    )
    agents: Dict[str, str] = Field(
        default_factory=dict,
        description="Agent status map"
    )
    services: Dict[str, bool] = Field(
        default_factory=dict,
        description="Service availability map"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "status": "healthy",
                "phase": 6,
                "timestamp": "2024-01-01T12:00:00Z",
                "agents": {
                    "meteorologist": "online",
                    "auditor": "online",
                    "arbiter": "online",
                },
                "services": {
                    "weather_api": True,
                    "cardano_signer": True,
                }
            }
        }


# ═══════════════════════════════════════════════════════════════════════════
# AGENT INTERNAL MODELS (Not exposed via API)
# ═══════════════════════════════════════════════════════════════════════════

class Phase6WeatherData(BaseModel):
    """Weather data from Meteorologist agent."""
    
    wind_speed: int = Field(..., description="Wind speed in m/s × 100")
    wind_direction: Optional[int] = Field(None, description="Wind direction in degrees")
    temperature: Optional[float] = Field(None, description="Temperature in Celsius")
    pressure: Optional[float] = Field(None, description="Pressure in hPa")
    humidity: Optional[int] = Field(None, description="Humidity percentage")
    timestamp: int = Field(..., description="Measurement timestamp (POSIX ms)")
    source: str = Field(default="OpenWeatherMap", description="Data source")
    confidence: float = Field(default=1.0, description="Data quality score")


class Phase6AuditResult(BaseModel):
    """Audit result from Auditor agent."""
    
    validated: bool = Field(..., description="Whether data is validated")
    wind_speed_confirmed: int = Field(..., description="Confirmed wind speed")
    discrepancy: Optional[int] = Field(None, description="Discrepancy from primary")
    secondary_sources: Dict[str, Any] = Field(
        default_factory=dict,
        description="Secondary data sources"
    )
    confidence: float = Field(..., description="Validation confidence")
    notes: Optional[str] = Field(None, description="Auditor notes")


class Phase6ArbiterDecision(BaseModel):
    """Final decision from Arbiter agent."""
    
    trigger: bool = Field(..., description="Whether to trigger oracle")
    final_wind_speed: int = Field(..., description="Final wind speed value")
    confidence: float = Field(..., description="Decision confidence")
    reasoning: str = Field(..., description="Decision reasoning")
    nonce: int = Field(..., description="Unique nonce")
    signature: Optional[str] = Field(None, description="Signature if triggered")


# ═══════════════════════════════════════════════════════════════════════════
# CANONICAL MESSAGE MODEL (Matches Phase 3 Aiken validator)
# ═══════════════════════════════════════════════════════════════════════════

class Phase6CanonicalMessage(BaseModel):
    """
    Canonical message structure for Ed25519 signing.
    
    CRITICAL: Must match Phase 3 oracle validator build_message() exactly:
    "HYPERION_ORACLE_V1|{policy_id}|{location_id}|{wind_speed}|{timestamp}|{nonce}"
    """
    
    policy_id: str
    location_id: str
    wind_speed: int
    measurement_time: int
    nonce: int
    
    def to_bytes(self) -> bytes:
        """
        Build canonical message bytes for signing.
        
        MUST match Phase 3 Aiken validator format exactly!
        """
        prefix = b"HYPERION_ORACLE_V1|"
        
        # Convert policy_id and location_id from hex to bytes
        policy_bytes = bytes.fromhex(self.policy_id)
        location_bytes = self.location_id.encode('utf-8')
        
        # Serialize integers (using CBOR-like encoding)
        import cbor2
        wind_bytes = cbor2.dumps(self.wind_speed)
        time_bytes = cbor2.dumps(self.measurement_time)
        nonce_bytes = cbor2.dumps(self.nonce)
        
        # Concatenate with delimiters
        message = prefix
        message += policy_bytes
        message += b"|"
        message += location_bytes
        message += b"|"
        message += wind_bytes
        message += b"|"
        message += time_bytes
        message += b"|"
        message += nonce_bytes
        
        return message


# ═══════════════════════════════════════════════════════════════════════════
# INTEGRATION NOTES
# ═══════════════════════════════════════════════════════════════════════════
#
# PHASE 3 COMPATIBILITY:
# The Phase6OracleResponse model matches the Phase3OracleRedeemer exactly:
# - policy_id: ByteArray (hex string)
# - location_id: ByteArray (hex string)
# - wind_speed: Int (m/s × 100)
# - measurement_time: Int (POSIX milliseconds)
# - nonce: Int (monotonic, replay protection)
# - signature: ByteArray (64 bytes Ed25519 signature, hex)
#
# PHASE 5 INTEGRATION:
# Frontend receives Phase6OracleResponse and submits to Cardano:
#
# const response = await fetch('/oracle/run', { method: 'POST', ... });
# const oracleData = await response.json();
#
# // Submit to Cardano using Phase 5 wallet
# const { lucid } = useWallet();
# const tx = await lucid.newTx()
#   .collectFrom([oracleUtxo], {
#     wind_speed: oracleData.wind_speed,
#     measurement_time: oracleData.measurement_time,
#     nonce: oracleData.nonce,
#     policy_id: oracleData.policy_id,
#     location_id: oracleData.location_id,
#     signature: oracleData.signature,
#   })
#   .complete();
#
# MERGE-SAFE:
# ✓ All models prefixed with "Phase6"
# ✓ No conflicts with other phases
# ✓ Pydantic validation for type safety
# ✓ Compatible with FastAPI auto-docs
#
# ═══════════════════════════════════════════════════════════════════════════
