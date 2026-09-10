# Yaperz — Session Security & Cookie Architecture

## Session Token Security
Raw session tokens are 32-byte cryptographically random strings (`crypto.randomBytes(32)` -> 64 hex characters) generated on the server. Raw tokens are never stored directly in the database. Instead, the server computes a SHA-256 hash (`hashToken(rawToken)`) and stores the hash in the `sessions` table.

## Cookie Configuration
Session cookies use the following security flags:
```ts
export const AUTH_COOKIE_NAME = 'yaperz_auth_session';

Cookie Flags:
- HttpOnly: true (prevents client-side JavaScript / XSS extraction)
- Secure: process.env.NODE_ENV === 'production' (requires HTTPS in production)
- SameSite: 'lax' (mitigates CSRF while preserving top-level navigation)
- Path: '/'
- Max-Age: 2,592,000 seconds (30 days)
```

## Session Lifecycle & Rotation
1. **Creation**: Upon successful login or registration, a new 32-byte token is created and its SHA-256 hash stored.
2. **Session Rotation**: Every successful authentication generates a brand-new token, invalidating prior session IDs.
3. **Idle Tracking**: If `lastActiveAt` is older than 24 hours during validation, the server updates `lastActiveAt`.
4. **Expiration**: Sessions expire after 30 days (`expiresAt`). Expired sessions are deleted upon access attempt.
5. **Revocation**: Logging out deletes the session record. Changing passwords revokes all active customer sessions.
