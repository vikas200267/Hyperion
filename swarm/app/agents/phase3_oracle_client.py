"""
Project Hyperion - Phase 3: Oracle Client
Real-time weather monitoring and oracle trigger submission
"""

import asyncio
import time
import cbor2
from typing import Optional
from nacl.signing import SigningKey, VerifyKey

try:
    from pycardano import (
        BlockFrostChainContext,
        Network,
        TransactionBuilder,
        TransactionOutput,
        UTxO,
        PlutusData,
        plutus_script_hash,
    )
except ImportError:
    # Graceful degradation if pycardano not installed yet
    BlockFrostChainContext = None
    print("⚠️  pycardano not installed - install with: pip install pycardano")


class Phase3OracleDatum(PlutusData if PlutusData else object):
    """Phase 3 Oracle Datum structure - matches on-chain definition"""
    
    CONSTR_ID = 0
    
    oracle_vk: bytes          # Ed25519 public key (32 bytes)
    threshold_wind_speed: int # Threshold in m/s × 100
    max_age_ms: int           # Maximum data age (milliseconds)
    last_nonce: int           # Replay protection counter
    location_id: bytes        # Geographic binding


class Phase3OracleRedeemer(PlutusData if PlutusData else object):
    """Phase 3 Oracle Redeemer structure - matches on-chain definition"""
    
    CONSTR_ID = 0
    
    wind_speed: int           # Measured wind speed (m/s × 100)
    measurement_time: int     # POSIX timestamp (milliseconds)
    nonce: int                # Unique nonce
    policy_id: bytes          # Insurance policy identifier (28 bytes)
    location_id: bytes        # Must match datum location_id
    signature: bytes          # Ed25519 signature (64 bytes)


class Phase3OracleClient:
    """
    Real-time oracle client for Project Hyperion Phase 3
    
    Features:
    - Ed25519 signature generation matching on-chain format
    - Continuous weather monitoring with < 60s response time
    - Automatic nonce management and replay protection
    - Transaction building with PyCardano integration
    """
    
    def __init__(
        self,
        oracle_sk_hex: str,
        blockfrost_project_id: str,
        network: str = "testnet"
    ):
        """
        Initialize oracle client
        
        Args:
            oracle_sk_hex: Ed25519 signing key (64 hex chars)
            blockfrost_project_id: BlockFrost API key
            network: "testnet" or "mainnet"
        """
        self.oracle_sk = SigningKey(bytes.fromhex(oracle_sk_hex))
        self.oracle_vk = self.oracle_sk.verify_key
        self.network = Network.TESTNET if network == "testnet" else Network.MAINNET
        
        if BlockFrostChainContext:
            self.context = BlockFrostChainContext(
                project_id=blockfrost_project_id,
                network=self.network
            )
        else:
            self.context = None
            print("⚠️  Running in offline mode - PyCardano not available")
    
    def build_canonical_message(
        self,
        policy_id: bytes,
        location_id: bytes,
        wind_speed: int,
        timestamp: int,
        nonce: int
    ) -> bytes:
        """
        Build canonical message for signing - MUST match phase3_build_message() exactly
        
        This is the critical function that ensures on-chain validation passes.
        Any deviation from the on-chain format will cause signature verification failure.
        
        Args:
            policy_id: 28-byte policy identifier
            location_id: Geographic location identifier
            wind_speed: Wind speed in m/s × 100
            timestamp: POSIX timestamp in milliseconds
            nonce: Unique incrementing nonce
            
        Returns:
            Canonical message bytes ready for signing
        """
        msg = b"HYPERION_ORACLE_V1|"
        msg += policy_id  # 28 bytes
        msg += b"|"
        msg += location_id
        msg += b"|"
        msg += cbor2.dumps(wind_speed)
        msg += b"|"
        msg += cbor2.dumps(timestamp)
        msg += b"|"
        msg += cbor2.dumps(nonce)
        return msg
    
    def sign_oracle_data(
        self,
        policy_id: bytes,
        location_id: bytes,
        wind_speed: int,
        measurement_time: int,
        nonce: int
    ) -> bytes:
        """
        Sign oracle data with Ed25519
        
        Returns:
            64-byte signature
        """
        message = self.build_canonical_message(
            policy_id, location_id, wind_speed, measurement_time, nonce
        )
        signed = self.oracle_sk.sign(message)
        return signed.signature  # Returns 64 bytes
    
    async def trigger_oracle(
        self,
        oracle_utxo: "UTxO",
        policy_id: bytes,
        location_id: bytes,
        wind_speed: int,
        measurement_time: int,
        payment_skey,
        change_address
    ) -> str:
        """
        Submit oracle trigger transaction
        
        Args:
            oracle_utxo: Current oracle UTxO
            policy_id: 28-byte policy identifier
            location_id: Geographic location identifier
            wind_speed: Wind speed in m/s × 100
            measurement_time: POSIX timestamp in milliseconds
            payment_skey: Payment signing key for transaction fees
            change_address: Address to receive change
            
        Returns:
            Transaction hash
        """
        if not self.context:
            raise RuntimeError("PyCardano not available - cannot submit transaction")
        
        # Get current nonce from datum
        datum = Phase3OracleDatum.from_cbor(oracle_utxo.output.datum.cbor)
        new_nonce = datum.last_nonce + 1
        
        # Sign the oracle data
        signature = self.sign_oracle_data(
            policy_id, location_id, wind_speed, measurement_time, new_nonce
        )
        
        # Build redeemer
        redeemer = Phase3OracleRedeemer(
            wind_speed=wind_speed,
            measurement_time=measurement_time,
            nonce=new_nonce,
            policy_id=policy_id,
            location_id=location_id,
            signature=signature,
        )
        
        # Build updated datum (nonce incremented)
        new_datum = Phase3OracleDatum(
            oracle_vk=datum.oracle_vk,
            threshold_wind_speed=datum.threshold_wind_speed,
            max_age_ms=datum.max_age_ms,
            last_nonce=new_nonce,  # ✅ Updated!
            location_id=datum.location_id,
        )
        
        # Build transaction
        builder = TransactionBuilder(self.context)
        builder.add_script_input(oracle_utxo, redeemer=redeemer)
        builder.add_output(
            TransactionOutput(
                address=oracle_utxo.output.address,
                amount=oracle_utxo.output.amount,
                datum=new_datum,
            )
        )
        
        # Set validity interval (required for freshness check)
        current_slot = await self.context.last_block_slot
        builder.validity_start = current_slot
        builder.ttl = current_slot + 300  # 5 minutes
        
        # Sign and submit
        tx = builder.build_and_sign([payment_skey], change_address)
        tx_hash = self.context.submit_tx(tx)
        
        print(f"✅ Oracle triggered! Tx: {tx_hash}")
        return tx_hash
    
    async def fetch_weather_data(self, location_id: bytes) -> dict:
        """
        Fetch real-time weather data from external API
        
        This is a placeholder - integrate with your weather data provider:
        - OpenWeatherMap
        - WeatherAPI
        - NOAA API
        - Custom IoT sensors
        
        Args:
            location_id: Geographic location identifier
            
        Returns:
            dict with 'wind_speed_ms' and 'timestamp'
        """
        # TODO: Replace with real API integration
        # Example: OpenWeatherMap API
        # async with aiohttp.ClientSession() as session:
        #     async with session.get(f"https://api.openweathermap.org/data/2.5/weather?id={location_id}&appid={API_KEY}") as resp:
        #         data = await resp.json()
        #         return {
        #             'wind_speed_ms': data['wind']['speed'],
        #             'timestamp': int(time.time() * 1000)
        #         }
        
        # Placeholder - returns mock data
        import random
        return {
            'wind_speed_ms': random.uniform(10.0, 30.0),  # Random wind speed
            'timestamp': int(time.time() * 1000)
        }
    
    async def monitor_weather_realtime(
        self,
        oracle_utxo_ref: str,
        policy_id: bytes,
        location_id: bytes,
        payment_skey,
        change_address,
        poll_interval: int = 30,
    ):
        """
        Real-time monitoring loop with < 60 second response time
        
        This continuously monitors weather conditions and automatically
        triggers the oracle when the parametric condition is met.
        
        Args:
            oracle_utxo_ref: Oracle UTxO reference (txhash#index)
            policy_id: 28-byte policy identifier
            location_id: Geographic location identifier
            payment_skey: Payment signing key for fees
            change_address: Change address
            poll_interval: Seconds between checks (default: 30s)
        """
        print(f"🔍 Phase 3 Oracle Monitor Started")
        print(f"   Location ID: {location_id.hex()}")
        print(f"   Policy ID: {policy_id.hex()}")
        print(f"   Poll interval: {poll_interval}s")
        print(f"   Target: < 60s event-to-confirmation latency")
        
        while True:
            try:
                # Fetch real-time weather data
                weather = await self.fetch_weather_data(location_id)
                wind_speed_ms = weather['wind_speed_ms']
                wind_speed_int = int(wind_speed_ms * 100)  # Convert to m/s × 100
                timestamp = weather['timestamp']
                
                print(f"📊 [{time.strftime('%H:%M:%S')}] Wind: {wind_speed_ms:.1f} m/s")
                
                if not self.context:
                    print("⚠️  Offline mode - skipping transaction submission")
                    await asyncio.sleep(poll_interval)
                    continue
                
                # Get current oracle UTxO
                oracle_utxos = await self.context.utxos(oracle_utxo_ref)
                if not oracle_utxos:
                    print("❌ Oracle UTxO not found")
                    await asyncio.sleep(poll_interval)
                    continue
                
                oracle_utxo = oracle_utxos[0]
                datum = Phase3OracleDatum.from_cbor(oracle_utxo.output.datum.cbor)
                
                # Check if threshold exceeded
                threshold_ms = datum.threshold_wind_speed / 100.0
                
                if wind_speed_int >= datum.threshold_wind_speed:
                    print(f"⚠️  THRESHOLD EXCEEDED! {wind_speed_ms:.1f} m/s >= {threshold_ms:.1f} m/s")
                    print(f"🚀 Triggering oracle...")
                    
                    await self.trigger_oracle(
                        oracle_utxo,
                        policy_id,
                        location_id,
                        wind_speed_int,
                        timestamp,
                        payment_skey,
                        change_address
                    )
                    
                    # Cooldown after trigger (5 minutes)
                    print("⏳ Cooldown period: 5 minutes")
                    await asyncio.sleep(300)
                else:
                    print(f"✅ Below threshold ({threshold_ms:.1f} m/s)")
                
            except Exception as e:
                print(f"❌ Error in monitoring loop: {e}")
                import traceback
                traceback.print_exc()
            
            await asyncio.sleep(poll_interval)


# ═══════════════════════════════════════════════════════════════════════════
# CLI USAGE EXAMPLE
# ═══════════════════════════════════════════════════════════════════════════

async def main():
    """Example usage of Phase 3 Oracle Client"""
    
    # Configuration (replace with your values)
    ORACLE_SK = "your_64_char_hex_signing_key_here"
    BLOCKFROST_KEY = "your_blockfrost_project_id"
    ORACLE_UTXO_REF = "txhash#0"
    POLICY_ID = bytes.fromhex("your_28_byte_policy_id_here" + "0" * 56)
    LOCATION_ID = b"NYC_JFK_AIRPORT"
    
    # Initialize client
    client = Phase3OracleClient(
        oracle_sk_hex=ORACLE_SK,
        blockfrost_project_id=BLOCKFROST_KEY,
        network="testnet"
    )
    
    # Start real-time monitoring
    await client.monitor_weather_realtime(
        oracle_utxo_ref=ORACLE_UTXO_REF,
        policy_id=POLICY_ID,
        location_id=LOCATION_ID,
        payment_skey=None,  # Load from file
        change_address=None,  # Your address
        poll_interval=30  # Check every 30 seconds
    )


if __name__ == "__main__":
    print("=" * 80)
    print("PROJECT HYPERION - PHASE 3: ORACLE CLIENT")
    print("=" * 80)
    asyncio.run(main())
