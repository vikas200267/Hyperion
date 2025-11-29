"""
═══════════════════════════════════════════════════════════════════════════
PROJECT HYPERION - PHASE 6: CARDANO SIGNER
═══════════════════════════════════════════════════════════════════════════
Module: app/services/cardano_signer.py
Purpose: Ed25519 message signing for oracle payloads
═══════════════════════════════════════════════════════════════════════════
"""

import os
import logging
from typing import Optional
import hashlib

# Cryptography imports
try:
    from nacl.signing import SigningKey
    from nacl.encoding import HexEncoder
    NACL_AVAILABLE = True
except ImportError:
    NACL_AVAILABLE = False
    logging.warning("PyNaCl not available - install with: pip install pynacl")

from app.models import Phase6CanonicalMessage

logger = logging.getLogger(__name__)


class Phase6CardanoSigner:
    """
    Cardano message signer using Ed25519.
    
    Signs oracle messages with the same format as Phase 3 Aiken validator expects.
    """
    
    def __init__(self):
        # Get signing key from environment
        sk_hex = os.getenv("CARDANO_SK_HEX")
        
        if not sk_hex:
            raise ValueError(
                "CARDANO_SK_HEX environment variable is required. "
                "Generate with: python -c 'from nacl.signing import SigningKey; "
                "sk = SigningKey.generate(); print(sk.encode(encoder=HexEncoder).decode())'"
            )
        
        if not NACL_AVAILABLE:
            raise RuntimeError(
                "PyNaCl is required for signing. Install with: pip install pynacl"
            )
        
        try:
            # Parse hex-encoded private key
            self.signing_key = SigningKey(sk_hex, encoder=HexEncoder)
            self.verify_key = self.signing_key.verify_key
            
            # Log public key (safe to log)
            vk_hex = self.verify_key.encode(encoder=HexEncoder).decode()
            logger.info(f"✅ Cardano signer initialized")
            logger.info(f"📍 Verification Key: {vk_hex[:16]}...{vk_hex[-16:]}")
        
        except Exception as e:
            raise ValueError(f"Invalid CARDANO_SK_HEX: {e}")
    
    async def sign_oracle_message(
        self,
        policy_id: str,
        location_id: str,
        wind_speed: int,
        measurement_time: int,
        nonce: int
    ) -> str:
        """
        Sign oracle message with Ed25519.
        
        CRITICAL: Message format MUST match Phase 3 Aiken validator exactly!
        
        Args:
            policy_id: Cardano policy ID (hex string)
            location_id: Location identifier
            wind_speed: Wind speed (m/s × 100)
            measurement_time: POSIX timestamp (milliseconds)
            nonce: Unique nonce
            
        Returns:
            Signature as hex string (64 bytes = 128 hex chars)
        """
        logger.info("🔐 Signing oracle message...")
        
        try:
            # Build canonical message (MUST match Phase 3 Aiken validator!)
            canonical_message = Phase6CanonicalMessage(
                policy_id=policy_id,
                location_id=location_id,
                wind_speed=wind_speed,
                measurement_time=measurement_time,
                nonce=nonce
            )
            
            message_bytes = canonical_message.to_bytes()
            
            # Log message for debugging (truncated)
            logger.debug(f"Message (first 64 bytes): {message_bytes[:64].hex()}")
            logger.debug(f"Message length: {len(message_bytes)} bytes")
            
            # Sign with Ed25519
            signed = self.signing_key.sign(message_bytes)
            signature_bytes = signed.signature  # 64 bytes
            
            # Convert to hex string
            signature_hex = signature_bytes.hex()
            
            logger.info(f"✅ Signature: {signature_hex[:16]}...{signature_hex[-16:]}")
            
            # Verify signature immediately (sanity check)
            self._verify_signature(message_bytes, signature_bytes)
            
            return signature_hex
        
        except Exception as e:
            logger.error(f"❌ Signing failed: {e}")
            raise
    
    def _verify_signature(self, message: bytes, signature: bytes):
        """
        Verify signature (sanity check).
        
        Args:
            message: Original message bytes
            signature: Signature bytes
            
        Raises:
            ValueError: If signature verification fails
        """
        try:
            self.verify_key.verify(message, signature)
            logger.debug("✅ Signature verification passed (self-check)")
        except Exception as e:
            logger.error(f"❌ Signature verification failed: {e}")
            raise ValueError("Signature verification failed - signing key may be corrupt")
    
    def get_public_key_hex(self) -> str:
        """
        Get public key (verification key) as hex.
        
        Returns:
            Verification key (32 bytes = 64 hex chars)
        """
        return self.verify_key.encode(encoder=HexEncoder).decode()
    
    def get_public_key_bytes(self) -> bytes:
        """
        Get public key (verification key) as bytes.
        
        Returns:
            Verification key (32 bytes)
        """
        return bytes(self.verify_key)


# ═══════════════════════════════════════════════════════════════════════════
# KEY GENERATION UTILITY
# ═══════════════════════════════════════════════════════════════════════════

def phase6_generate_keypair() -> dict:
    """
    Generate a new Ed25519 keypair for oracle signing.
    
    Returns:
        Dictionary with signing_key and verify_key (both hex)
    """
    if not NACL_AVAILABLE:
        raise RuntimeError("PyNaCl is required. Install with: pip install pynacl")
    
    sk = SigningKey.generate()
    vk = sk.verify_key
    
    keypair = {
        "signing_key": sk.encode(encoder=HexEncoder).decode(),
        "verify_key": vk.encode(encoder=HexEncoder).decode(),
    }
    
    print("=" * 80)
    print("🔑 NEW ED25519 KEYPAIR GENERATED")
    print("=" * 80)
    print(f"Signing Key (KEEP SECRET!):  {keypair['signing_key']}")
    print(f"Verify Key (Share on-chain): {keypair['verify_key']}")
    print("=" * 80)
    print("\nSet environment variable:")
    print(f"export CARDANO_SK_HEX='{keypair['signing_key']}'")
    print("\nStore verify key in Phase 3 OracleDatum:")
    print(f"oracle_vk = '{keypair['verify_key']}'")
    print("=" * 80)
    
    return keypair


# ═══════════════════════════════════════════════════════════════════════════
# INTEGRATION NOTES
# ═══════════════════════════════════════════════════════════════════════════
#
# CRYPTOGRAPHIC SIGNATURES:
# - Algorithm: Ed25519 (fast, secure, 64-byte signatures)
# - Library: PyNaCl (Python bindings for libsodium)
# - Compatible with Cardano's cryptographic primitives
#
# MESSAGE FORMAT (CRITICAL):
# Must match Phase 3 Aiken validator build_message() exactly:
# "HYPERION_ORACLE_V1|{policy_id}|{location_id}|{wind_speed}|{timestamp}|{nonce}"
#
# The Phase6CanonicalMessage.to_bytes() method in models.py handles this.
#
# KEY MANAGEMENT:
# 1. Generate keypair: python -m app.services.cardano_signer
# 2. Store signing key in environment: CARDANO_SK_HEX
# 3. Store verify key in Phase 3 OracleDatum (on-chain)
#
# SECURITY:
# ✓ Private key never logged
# ✓ Signatures are deterministic (same input → same signature)
# ✓ Verification check after signing (sanity test)
# ✓ Ed25519 is quantum-resistant (up to certain bounds)
#
# ENVIRONMENT VARIABLES:
# - CARDANO_SK_HEX (required): Ed25519 private key (64 hex chars)
#
# DEPENDENCIES:
# - pynacl: pip install pynacl
#
# PHASE 3 INTEGRATION:
# 1. Off-chain (Phase 6): Sign message with CARDANO_SK_HEX
# 2. On-chain (Phase 3): Verify signature with oracle_vk (public key)
# 3. Aiken validator uses: builtin.verify_ed25519_signature()
#
# REAL-TIME PERFORMANCE:
# - Ed25519 signing: < 1ms typically
# - Verification: < 1ms typically
# - No blocking I/O (pure computation)
#
# MERGE-SAFE:
# ✓ All symbols prefixed with "Phase6" or "phase6_"
# ✓ No global state
# ✓ Environment-based configuration
#
# PRODUCTION RECOMMENDATIONS:
# 1. Use hardware security module (HSM) for key storage
# 2. Rotate keys periodically (requires new OracleDatum)
# 3. Monitor signing failures (could indicate key compromise)
# 4. Never commit CARDANO_SK_HEX to version control!
#
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    # Generate keypair when run as script
    phase6_generate_keypair()
