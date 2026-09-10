# Yaperz — Security Architecture & Production Hardening

> **Phase**: Phase 2 — Production Commerce Architecture & Database Foundation  
> **Security Standards**: OWASP Top 10, Zero Client Trust, Server-Only Isolation  

---

## 1. Zero Client Trust Model (Remediation of P0 Blocker)

The central security tenet of the Yaperz commerce backend:
> **The browser is an untrusted presentation surface. No calculation performed on the client is authoritative.**

1. **Price Tampering Defense**:
   - Clients never send prices, discounts, or tax amounts in order requests.
   - All unit prices are fetched by variant ID from the database or authoritative repository.
   - Any attempt to alter browser variables or tamper with payloads results in the server ignoring client numbers and calculating authoritative totals.

2. **Inventory Depletion Defense**:
   - Inventory checks occur during server-side quote calculation and are atomically enforced at order creation time.
   - Negative quantities or numbers exceeding warehouse stock are rejected with `409 INSUFFICIENT_STOCK`.

---

## 2. Server-Only Data Access & Secret Isolation

1. **`server-only` Package Guard**:
   `src/lib/db/client.ts` strictly imports `'server-only'`. If any developer inadvertently imports the database client into a client component (e.g. `src/components/Header.tsx`), the Next.js compiler halts the build with a compile-time error.

2. **Environment Variable Segregation**:
   - Server-Only Secrets: `DATABASE_URL`, `AUTH_SECRET`, `RAZORPAY_KEY_SECRET`, `SHIPROCKET_PASSWORD`. These are NEVER prefixed with `NEXT_PUBLIC_` and never bundled into client JS.
   - Public Variables: Restricted strictly to `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`.

3. **No Leaked Secrets**:
   - `.env.example` contains only empty placeholder strings.
   - Zero real API keys or passwords exist in repository code or commit history.

---

## 3. Input Validation & Injection Defense

1. **Zod Boundary Enforcement**:
   Every incoming HTTP request to `/api/*` is validated through strict Zod schemas:
   - PIN codes: Enforced as 6-digit regex (`^\d{6}$`).
   - Mobile numbers: Enforced as 10-digit Indian numbers (`^\d{10}$`).
   - Email addresses: Validated using RFC 5322 syntax.
   - Quantities: Restricted to positive integers (`1 <= qty <= 10`).

2. **SQL Injection Defense**:
   - Drizzle ORM uses parameterized SQL queries exclusively.
   - Raw string concatenation in SQL queries is prohibited.

---

## 4. Safe Error Propagation & Data Leakage Prevention

1. **Structured Domain Error Hierarchy**:
   All business errors inherit from `AppError` with predefined error codes (`PRODUCT_NOT_FOUND`, `OUT_OF_STOCK`, `INVALID_COUPON`, `VALIDATION_ERROR`).
2. **Zero Database Stack Traces to Clients**:
   If an unexpected database exception occurs, the error handler logs the stack trace server-side with request ID and returns a generic `{ "success": false, "error": "Internal server error" }` with HTTP 500. Raw SQL tables, column names, or connection strings are never exposed to clients.
