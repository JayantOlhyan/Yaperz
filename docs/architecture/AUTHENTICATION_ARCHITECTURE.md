# Yaperz — Authentication Architecture (Phase 3)

## Overview
This document specifies the server-authoritative application-managed authentication architecture implemented for Yaperz during Phase 3. It replaces client-side simulation with database-backed credentials, scrypt password hashing, SHA-256 session token hashes, and HttpOnly cookies.

## Core Flow

```text
[Client / UI]
    │
    ├── POST /api/auth/register ──> [Register Schema Validation] ──> [scrypt Hash] ──> [DB: customers + customer_credentials]
    ├── POST /api/auth/login ─────> [Login Schema Validation] ──> [scrypt Verify] ─> [DB: sessions] ──> [Set HttpOnly Cookie]
    ├── POST /api/auth/logout ────> [Extract Session Cookie] ───> [Delete Session] ─> [Clear Cookie]
    └── GET  /api/auth/session ───> [Validate Token Hash] ──────> [Touch Session] ──> [Return Safe Customer]
```

## Email Normalization & Identity
- All email inputs are deterministically normalized (`email.trim().toLowerCase()`).
- Uniqueness is enforced at the database layer via unique indexes (`uniqueIndex('idx_customers_email')`).
- Registration attempts with existing emails raise `DuplicateAccountError` (HTTP 409).

## API Endpoints
- `POST /api/auth/register`: Creates new customer profile, hashes password, generates session.
- `POST /api/auth/login`: Authenticates credentials, generates new session token (session rotation).
- `POST /api/auth/logout`: Revokes server-side session, clears HttpOnly cookie.
- `GET /api/auth/session`: Validates session cookie, resolves safe customer entity.
- `POST /api/auth/forgot-password`: Generates reset token (generic response prevents email enumeration).
- `POST /api/auth/reset-password`: Consumes token, updates scrypt password hash, invalidates all sessions.

## Rate Limiting & Abuse Protection
- In-memory sliding window rate limiter (`rateLimiter`).
- Limits login failures to 5 attempts per 15 minutes per email/IP.
- Limits registration to 10 attempts per 15 minutes per IP.
- Limits password reset requests to 3 attempts per 15 minutes.
