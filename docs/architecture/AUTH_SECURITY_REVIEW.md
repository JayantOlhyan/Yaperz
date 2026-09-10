# Yaperz — Auth Security Review & Vulnerability Audit

## Vulnerability Audit & Defense Verification

### 1. Insecure Direct Object Reference (IDOR)
- **Status**: PASSED
- **Verification**: Protected routes (`/api/account/addresses/[id]`, `/api/account/orders/[id]`) inspect `existing.customerId === sessionData.customer.id`. Unauthorized access attempts return HTTP 403 Forbidden. Attempting to manipulate `customerId` parameters in query strings has 0 impact because `customerId` is resolved strictly from the server-side session.

### 2. Broken Access Control & Session Fixation
- **Status**: PASSED
- **Verification**: Session tokens are rotated on login/registration. Stale tokens are destroyed. Expired sessions return HTTP 401 Unauthorized.

### 3. Password Storage & Cryptographic Security
- **Status**: PASSED
- **Verification**: Dedicated `crypto.scryptSync` algorithm with salt, $N=16384, r=8, p=1$, keylen=64. Passwords are never logged or stored in plaintext. `crypto.timingSafeEqual` prevents timing attacks.

### 4. Account Enumeration Defense
- **Status**: PASSED
- **Verification**: `forgotPassword` API returns generic HTTP 200 responses regardless of whether the email address exists in the database.

### 5. Brute Force & Rate Limiting
- **Status**: PASSED
- **Verification**: In-memory sliding window rate limiter throttles failed login attempts (5 per 15 min per IP/email) and registration attempts (10 per 15 min per IP).

### 6. CSRF & Cookie Security
- **Status**: PASSED
- **Verification**: Cookies use `HttpOnly: true`, `SameSite: 'lax'`, `Path: '/'`, `Secure: process.env.NODE_ENV === 'production'`.
