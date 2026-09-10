# Yaperz — Password Hashing & Cryptographic Security

## Modern Password Hashing (scrypt)
Password storage uses Node's native C++ `crypto.scryptSync` implementation with production-grade key derivation parameters:
- **Salt**: 16 cryptographically random bytes (`crypto.randomBytes(16)`)
- **Cost Factor ($N$)**: 16,384
- **Block Size ($r$)**: 8
- **Parallelization ($p$)**: 1
- **Key Length**: 64 bytes
- **Serialized Storage Format**: `scrypt$N=16384,r=8,p=1$<saltHex>$<derivedKeyHex>`

## Password Security Invariants
- **No Plaintext Storage**: Plaintext passwords are never logged, stored, or echoed.
- **Timing Safe Equal**: Password verification uses `crypto.timingSafeEqual` on binary buffers to prevent timing side-channel attacks.
- **Exclusion from APIs**: Password hashes are stored in the dedicated `customer_credentials` table and are strictly excluded from all client-facing API responses.
- **Password Strength Rules**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
