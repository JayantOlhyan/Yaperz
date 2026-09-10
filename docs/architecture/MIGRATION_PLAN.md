# Yaperz — Database Migration & Catalog Cutover Plan

> **Phase**: Phase 2 — Production Commerce Architecture & Database Foundation  
> **Source Data**: `src/data/products.json` (17 items)  
> **Target Schema**: 20 Normalized PostgreSQL Tables via Drizzle ORM  

---

## 1. Migration Overview & Non-Destructive Principles

Per prompt requirement 28:
> **Do NOT simply delete `src/data/products.json` during this phase.**  
> First establish: `products.json` ↓ migration/seed ↓ PostgreSQL ↓ verification.  
> Then gradually migrate application reads from JSON to database.

### The 4-Stage Cutover Pipeline
```
Stage 1: Normalization Spec
         Deterministic mapping from flat JSON to relational schema (catalog-data.ts)
                    │
                    ▼
Stage 2: Schema Migration & Seeding
         Drizzle Kit pushes schema to PostgreSQL; seed script executes upsert
                    │
                    ▼
Stage 3: Data Parity Verification
         Verify that all 17 products, categories, variants, and images match exactly
                    │
                    ▼
Stage 4: Read Cutover
         API routes and server components query PostgreSQL via repository
```

---

## 2. Step-by-Step Execution Guide

### Step 1: Provision Managed PostgreSQL Database
1. Provision a PostgreSQL 16+ instance on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Obtain the connection pooler URL (PgBouncer mode, port 6543) and direct connection URL (port 5432).
3. Set in `.env.local`:
   ```bash
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"
   DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require"
   ```

### Step 2: Push Relational Schema
Run Drizzle Kit to create tables, enums, indexes, and foreign keys:
```bash
npm run db:push
```

### Step 3: Run Deterministic Catalog Seed
Run the seed script to import products, variants, images, tags, collections, and discounts:
```bash
npm run db:seed
```

### Step 4: Verification Queries
Execute verification queries to ensure 100% data fidelity:
```sql
-- 1. Verify all 17 products are imported
SELECT COUNT(*) FROM products; -- Expected: 17

-- 2. Verify all SKU-level variants are generated
SELECT COUNT(*) FROM product_variants; -- Expected: 100+ variants

-- 3. Verify category associations
SELECT c.name, COUNT(p.id) 
FROM categories c 
JOIN products p ON p.category_id = c.id 
GROUP BY c.name;

-- 4. Verify discount codes
SELECT code, discount_type, value FROM discounts;
```

---

## 3. Rollback & Fail-Safe Protection

If database network latency issues occur or credentials are reset:
1. `src/lib/db/client.ts` detects database state.
2. The application falls back seamlessly to the in-memory catalog repository (`normalizedCatalog`).
3. Storefront browsing, product details, cart, and checkout continue to function without crashing.
