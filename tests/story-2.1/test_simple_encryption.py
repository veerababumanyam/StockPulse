"""
Simple API Key Encryption Tests
Tests that can run without full application context.
"""
import sys
import os

# Add the backend app to the path
sys.path.append('../../services/backend')

from app.services.api_keys import APIKeyEncryption


def test_encrypt_decrypt_key():
    """Test that encryption and decryption work correctly."""
    # Initialize encryption with test key
    encryption = APIKeyEncryption("test_encryption_key_for_testing")
    
    # Test data
    original_key = "sk-test-1234567890abcdef"
    
    # Encrypt the key
    encrypted = encryption.encrypt_key(original_key)
    
    # Verify it's actually encrypted (not the same as original)
    assert encrypted != original_key
    assert len(encrypted) > len(original_key)
    
    # Decrypt the key
    decrypted = encryption.decrypt_key(encrypted)
    
    # Verify decryption worked
    assert decrypted == original_key


def test_hash_key():
    """Test that key hashing works consistently."""
    key1 = "sk-test-key-12345"
    key2 = "sk-test-key-67890"
    
    # Same key should produce same hash
    hash1 = APIKeyEncryption.hash_key(key1)
    hash2 = APIKeyEncryption.hash_key(key1)
    assert hash1 == hash2
    
    # Different keys should produce different hashes
    hash3 = APIKeyEncryption.hash_key(key2)
    assert hash1 != hash3
    
    # Hash should be consistent length (SHA-256 = 64 hex chars)
    assert len(hash1) == 64
    assert len(hash3) == 64


def test_mask_key():
    """Test key masking for display purposes."""
    # Test normal length key
    original = "sk-test-1234567890abcdef"
    masked = APIKeyEncryption.mask_key(original)
    
    # Should show first 4 and last 4 characters
    assert masked.startswith("sk-t")
    assert masked.endswith("cdef")
    assert "*" in masked
    assert len(masked) == len(original)
    
    # Test short key
    short_key = "12345"
    masked_short = APIKeyEncryption.mask_key(short_key)
    assert masked_short == "*****"


if __name__ == "__main__":
    print("🔑 Testing API Key Encryption...")
    
    try:
        test_encrypt_decrypt_key()
        print("✅ Encryption/Decryption test passed")
        
        test_hash_key()
        print("✅ Key hashing test passed")
        
        test_mask_key()
        print("✅ Key masking test passed")
        
        print("\n🎉 All encryption tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise 