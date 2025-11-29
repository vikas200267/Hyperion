"""
Hyperion API - Oracle Endpoints
Phase 3 Oracle trigger management and monitoring
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import asyncio

from app.agents.phase3_oracle_client import Phase3OracleClient

router = APIRouter()

# Global oracle client instance (initialized on startup)
oracle_client: Optional[Phase3OracleClient] = None
monitoring_tasks: Dict[str, asyncio.Task] = {}


class OracleConfig(BaseModel):
    """Oracle configuration"""
    oracle_sk: str = Field(..., description="Ed25519 signing key (hex)")
    blockfrost_key: str = Field(..., description="BlockFrost API project ID")
    network: str = Field(default="testnet", description="testnet or mainnet")


class OracleTriggerRequest(BaseModel):
    """Manual oracle trigger request"""
    oracle_utxo_ref: str = Field(..., description="Oracle UTxO reference (txhash#index)")
    policy_id: str = Field(..., description="28-byte policy ID (hex)")
    location_id: str = Field(..., description="Location identifier")
    wind_speed: float = Field(..., description="Wind speed in m/s", ge=0)
    measurement_time: Optional[int] = Field(None, description="POSIX timestamp (ms)")


class MonitoringRequest(BaseModel):
    """Start real-time monitoring"""
    oracle_utxo_ref: str = Field(..., description="Oracle UTxO reference")
    policy_id: str = Field(..., description="28-byte policy ID (hex)")
    location_id: str = Field(..., description="Location identifier")
    poll_interval: int = Field(default=30, description="Polling interval in seconds", ge=10, le=300)


@router.post("/initialize")
async def initialize_oracle(config: OracleConfig):
    """
    Initialize oracle client with signing key and network configuration
    
    Call this endpoint first before using other oracle functions.
    """
    global oracle_client
    
    try:
        oracle_client = Phase3OracleClient(
            oracle_sk_hex=config.oracle_sk,
            blockfrost_project_id=config.blockfrost_key,
            network=config.network
        )
        
        return {
            "status": "success",
            "message": "Oracle client initialized",
            "network": config.network,
            "oracle_vk": oracle_client.oracle_vk.encode().hex()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Initialization failed: {str(e)}")


@router.post("/trigger")
async def trigger_oracle(request: OracleTriggerRequest):
    """
    Manually trigger oracle with specific weather data
    
    This bypasses the monitoring loop and directly submits an oracle trigger.
    Use for testing or manual interventions.
    """
    if not oracle_client:
        raise HTTPException(
            status_code=400,
            detail="Oracle client not initialized. Call /initialize first."
        )
    
    try:
        import time
        
        # Convert parameters
        policy_id = bytes.fromhex(request.policy_id)
        location_id = request.location_id.encode()
        wind_speed_int = int(request.wind_speed * 100)  # m/s × 100
        measurement_time = request.measurement_time or int(time.time() * 1000)
        
        # Sign the data
        signature = oracle_client.sign_oracle_data(
            policy_id=policy_id,
            location_id=location_id,
            wind_speed=wind_speed_int,
            measurement_time=measurement_time,
            nonce=1  # Placeholder - should get from current datum
        )
        
        return {
            "status": "success",
            "message": "Oracle data signed",
            "signature": signature.hex(),
            "wind_speed": request.wind_speed,
            "measurement_time": measurement_time,
            "note": "Transaction submission requires PyCardano integration"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trigger failed: {str(e)}")


@router.post("/monitor/start")
async def start_monitoring(request: MonitoringRequest, background_tasks: BackgroundTasks):
    """
    Start real-time weather monitoring for automatic oracle triggers
    
    This starts a background task that continuously monitors weather conditions
    and automatically triggers the oracle when the parametric condition is met.
    """
    if not oracle_client:
        raise HTTPException(
            status_code=400,
            detail="Oracle client not initialized. Call /initialize first."
        )
    
    monitor_id = f"{request.policy_id}_{request.location_id}"
    
    if monitor_id in monitoring_tasks:
        return {
            "status": "already_running",
            "message": f"Monitoring already active for {monitor_id}",
            "monitor_id": monitor_id
        }
    
    try:
        # Convert parameters
        policy_id = bytes.fromhex(request.policy_id)
        location_id = request.location_id.encode()
        
        # Start monitoring in background
        async def monitor_task():
            await oracle_client.monitor_weather_realtime(
                oracle_utxo_ref=request.oracle_utxo_ref,
                policy_id=policy_id,
                location_id=location_id,
                payment_skey=None,  # TODO: Load from config
                change_address=None,  # TODO: Load from config
                poll_interval=request.poll_interval
            )
        
        task = asyncio.create_task(monitor_task())
        monitoring_tasks[monitor_id] = task
        
        return {
            "status": "started",
            "message": "Weather monitoring started",
            "monitor_id": monitor_id,
            "poll_interval": request.poll_interval,
            "oracle_utxo_ref": request.oracle_utxo_ref
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start monitoring: {str(e)}")


@router.post("/monitor/stop/{monitor_id}")
async def stop_monitoring(monitor_id: str):
    """
    Stop real-time weather monitoring
    
    Args:
        monitor_id: Monitor identifier (policy_id_location_id)
    """
    if monitor_id not in monitoring_tasks:
        raise HTTPException(
            status_code=404,
            detail=f"No active monitoring found for {monitor_id}"
        )
    
    task = monitoring_tasks[monitor_id]
    task.cancel()
    del monitoring_tasks[monitor_id]
    
    return {
        "status": "stopped",
        "message": f"Monitoring stopped for {monitor_id}",
        "monitor_id": monitor_id
    }


@router.get("/monitor/status")
async def get_monitoring_status():
    """
    Get status of all active monitoring tasks
    """
    active_monitors = []
    
    for monitor_id, task in monitoring_tasks.items():
        active_monitors.append({
            "monitor_id": monitor_id,
            "status": "running" if not task.done() else "completed",
            "done": task.done(),
            "cancelled": task.cancelled()
        })
    
    return {
        "active_count": len(monitoring_tasks),
        "monitors": active_monitors,
        "oracle_initialized": oracle_client is not None
    }


@router.get("/health")
async def oracle_health():
    """
    Oracle service health check
    """
    return {
        "service": "Phase 3 Oracle",
        "status": "operational",
        "oracle_initialized": oracle_client is not None,
        "active_monitors": len(monitoring_tasks),
        "features": {
            "ed25519_signing": True,
            "realtime_monitoring": True,
            "pycardano_integration": oracle_client is not None and oracle_client.context is not None
        }
    }


@router.post("/sign")
async def sign_message(
    policy_id: str,
    location_id: str,
    wind_speed: float,
    measurement_time: int,
    nonce: int
):
    """
    Sign oracle data (for testing/debugging)
    
    Returns the canonical message and Ed25519 signature.
    """
    if not oracle_client:
        raise HTTPException(
            status_code=400,
            detail="Oracle client not initialized"
        )
    
    try:
        policy_id_bytes = bytes.fromhex(policy_id)
        location_id_bytes = location_id.encode()
        wind_speed_int = int(wind_speed * 100)
        
        # Build canonical message
        message = oracle_client.build_canonical_message(
            policy_id_bytes,
            location_id_bytes,
            wind_speed_int,
            measurement_time,
            nonce
        )
        
        # Sign
        signature = oracle_client.sign_oracle_data(
            policy_id_bytes,
            location_id_bytes,
            wind_speed_int,
            measurement_time,
            nonce
        )
        
        return {
            "message": message.hex(),
            "signature": signature.hex(),
            "oracle_vk": oracle_client.oracle_vk.encode().hex(),
            "parameters": {
                "policy_id": policy_id,
                "location_id": location_id,
                "wind_speed": wind_speed,
                "measurement_time": measurement_time,
                "nonce": nonce
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signing failed: {str(e)}")
