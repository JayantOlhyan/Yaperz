# Yaperz — Environment Variable Classification & Configuration Guide

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Reference File**: `.env.example` (Root directory)  
> **Security Rule**: The frontend currently runs 100% without any environment variables defined. In Phase 2, environment variables will be introduced strictly for backend services.  

---

## 1. Master Environment Variable Matrix

| Variable Name | Classification | Scope | Security Level | Purpose & Service |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | **Required for production** | Public (Client + Server) | Non-secret | Canonical site origin (e.g. `https://yaperz.com` or `https://yaperz.netlify.app`) used for SEO canonical tags, OpenGraph, and OAuth redirects. |
| `DATABASE_URL` | **Required for production** (Phase 2) | Server-only | **SECRET** | Connection string for PostgreSQL database (Supabase / AWS RDS / Neon) with connection pooling. |
| `DIRECT_URL` | **Required for production** (Phase 2) | Server-only | **SECRET** | Direct connection string for Prisma/Drizzle database schema migrations. |
| `AUTH_SECRET` | **Required for production** (Phase 2) | Server-only | **SECRET** | 32-byte cryptographic secret used by NextAuth.js / Auth.js to sign session cookies and JWTs. |
| `AUTH_GOOGLE_CLIENT_ID` | **Optional** (Phase 2) | Server-only | Non-secret | Google OAuth application client ID for 1-click customer login. |
| `AUTH_GOOGLE_CLIENT_SECRET` | **Optional** (Phase 2) | Server-only | **SECRET** | Google OAuth application client secret. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **Required for production** (Phase 2) | Public (Client + Server) | Non-secret | Razorpay public key ID (`rzp_live_...`) required to mount the frontend payment checkout modal. |
| `RAZORPAY_KEY_SECRET` | **Required for production** (Phase 2) | Server-only | **SECRET** | Razorpay private API secret used to create orders and capture payments. |
| `RAZORPAY_WEBHOOK_SECRET` | **Required for production** (Phase 2) | Server-only | **SECRET** | Shared secret used to verify cryptographic HMAC signatures on incoming Razorpay webhooks. |
| `SHIPROCKET_EMAIL` | **Future integration** (Phase 2/3) | Server-only | **SECRET** | Authentication email for Shiprocket Logistics REST API. |
| `SHIPROCKET_PASSWORD` | **Future integration** (Phase 2/3) | Server-only | **SECRET** | Authentication password for Shiprocket API token generation. |
| `SHIPROCKET_CLIENT_ID` | **Future integration** (Phase 2/3) | Server-only | Non-secret | Custom App Client ID for Shiprocket webhook registration. |
| `SHIPROCKET_CLIENT_SECRET` | **Future integration** (Phase 2/3) | Server-only | **SECRET** | Custom App Client Secret for Shiprocket. |
| `SHIPROCKET_WEBHOOK_SECRET` | **Future integration** (Phase 2/3) | Server-only | **SECRET** | Verifies courier status push updates from Shiprocket. |
| `EMAIL_PROVIDER` | **Required for production** (Phase 2) | Server-only | Non-secret | Identifier of transactional mail provider (`resend`, `sendgrid`, `postmark`). |
| `EMAIL_FROM` | **Required for production** (Phase 2) | Server-only | Non-secret | Verified sender email address (e.g. `orders@yaperz.com`). |
| `EMAIL_API_KEY` | **Required for production** (Phase 2) | Server-only | **SECRET** | API key for transactional email delivery. |
| `WHATSAPP_PHONE_NUMBER_ID` | **Future integration** (Phase 2/3) | Server-only | Non-secret | Meta WhatsApp Business Cloud API Phone Number ID. |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | **Future integration** (Phase 2/3) | Server-only | Non-secret | Meta WhatsApp Business Manager Account ID. |
| `WHATSAPP_ACCESS_TOKEN` | **Future integration** (Phase 2/3) | Server-only | **SECRET** | Long-lived System User access token for sending WhatsApp order notifications. |
| `WHATSAPP_VERIFY_TOKEN` | **Future integration** (Phase 2/3) | Server-only | **SECRET** | Custom token for Meta webhook verification handshake. |
| `STORAGE_PROVIDER` | **Future integration** (Phase 2/3) | Server-only | Non-secret | Media CDN provider (`s3`, `r2`, `uploadcare`). |
| `S3_ENDPOINT` | **Future integration** (Phase 2/3) | Server-only | Non-secret | Custom S3-compatible API endpoint (e.g. Cloudflare R2 endpoint). |
| `S3_REGION` | **Future integration** (Phase 2/3) | Server-only | Non-secret | Storage region (e.g. `ap-south-1`). |
| `S3_BUCKET` | **Future integration** (Phase 2/3) | Server-only | Non-secret | Target storage bucket name for product images and user lookbooks. |
| `S3_ACCESS_KEY_ID` | **Future integration** (Phase 2/3) | Server-only | **SECRET** | AWS IAM / Cloudflare R2 access key ID. |
| `S3_SECRET_ACCESS_KEY` | **Future integration** (Phase 2/3) | Server-only | **SECRET** | AWS IAM / Cloudflare R2 secret access key. |
| `NEXT_PUBLIC_GA_ID` | **Optional** | Public (Client + Server) | Non-secret | Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`). |
| `NEXT_PUBLIC_META_PIXEL_ID` | **Optional** | Public (Client + Server) | Non-secret | Meta Pixel ID for tracking conversion events. |
| `ENCRYPTION_KEY` | **Required for production** (Phase 2) | Server-only | **SECRET** | 32-byte hexadecimal key for encrypting sensitive customer data at rest. |
| `CRON_SECRET` | **Required for production** (Phase 2) | Server-only | **SECRET** | Bearer token securing scheduled API cron jobs (e.g. inventory syncing). |

---

## 2. Key Guardrails

1. **Prefix Rule**: ONLY variables prefixed with `NEXT_PUBLIC_` are exposed to client JavaScript bundles. NEVER prefix database credentials, payment secrets, or private API keys with `NEXT_PUBLIC_`.
2. **Current State**: The Phase 1 frontend builds and runs completely independently of these environment variables, ensuring zero deployment blocker on Netlify.
