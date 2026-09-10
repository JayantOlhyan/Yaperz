# Yaperz — Database Architecture & ORM Specification

> **Phase**: Phase 2 — Production Commerce Architecture & Database Foundation  
> **Database Engine**: PostgreSQL 16+ (Supabase / Neon / Self-hosted)  
> **ORM & Query Layer**: Drizzle ORM (`drizzle-orm` v0.45+) with `postgres.js` driver  
> **Driver Engine**: `postgres` (porsager/postgres)  

---

## 1. ORM Evaluation & Selection Rationale

### Why Drizzle ORM Over Prisma / TypeORM?
During Phase 2 architecture design, Drizzle ORM was chosen as the authoritative database abstraction layer for the following verified reasons:

| Evaluation Criterion | Drizzle ORM | Prisma ORM | Architectural Decision Rationale |
| :--- | :--- | :--- | :--- |
| **Runtime Overhead** | **Zero binary engine** (pure TypeScript AST) | Heavy Rust binary engine (~40MB per serverless cold start) | Drizzle compiles instantly without binary extraction delays in Vercel/Netlify serverless workers. |
| **Type Safety** | Native TypeScript schema inference (`$inferSelect`, `$inferInsert`) | Code-generated `.prisma/client` types requiring `prisma generate` | Schema definitions in `src/lib/db/schema.ts` compile directly with standard `tsc` and Vite/Turbopack. |
| **Serverless Cold Starts** | < 10ms connection initialization | 150ms–400ms engine spin-up | Essential for high-converting luxury streetwear drops where flash-sale traffic surges. |
| **SQL Expression Control** | Direct SQL expressions (`sql`, `ilike`, `forUpdate()`) | Abstracted query builder requiring raw queries for complex locks | Allows granular row-level locking (`SELECT ... FOR UPDATE`) critical for atomic inventory reservation. |
| **Next.js 16 App Router Compatibility** | Full support for Server Components, Server Actions, and Route Handlers | Known engine bundling quirks in Turbopack | Seamless integration with React 19 and Next.js 16 App Router. |

---

## 2. Connection Strategy & Pooling

### Connection Architecture
Database access is encapsulated in `src/lib/db/client.ts` with strict `'server-only'` encapsulation to prevent accidental bundling into client chunks:

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Server Runtime                    │
│      Route Handlers (/api/*) · Server Actions · Services    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               src/lib/db/client.ts (Drizzle)                │
│    Connection Pooler: max 20 (prod), max 5 (dev)            │
│    Idle timeout: 30s · Connect timeout: 10s                 │
│    prepare: false (PgBouncer Transaction Mode compatible)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ TCP / SSL
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          PostgreSQL Database (Supabase / Neon)              │
│    Pooler Port 6543 (Transaction) / Direct Port 5432        │
└─────────────────────────────────────────────────────────────┘
```

### Fallback & Offline Resilience Strategy
If `DATABASE_URL` is unconfigured (such as during offline development, initial git clones, or static CI checks), `src/lib/db/client.ts` exports `isDatabaseConfigured() === false`. Repositories automatically utilize an in-memory repository pre-populated by `src/lib/db/catalog-data.ts`, ensuring zero crashes during `npm run build` or local inspection.

---

## 3. Migration Strategy

Drizzle Kit is configured via `drizzle.config.ts`:
- Schema Location: `src/lib/db/schema.ts`
- Migrations Output: `drizzle/`
- Dialect: `postgresql`

### Command Matrix
```bash
# Generate SQL migration file from schema modifications
npm run db:generate

# Push schema changes directly to staging/development database
npm run db:push

# Deterministically seed normalized catalog and discount codes
npm run db:seed
```

---

## 4. Transaction & Concurrency Isolation

All state-modifying commerce actions are executed within transactional boundaries with appropriate isolation levels:
1. **Order Creation & Inventory Reservation**: Wrapped in transaction with atomic update:
   ```sql
   UPDATE product_variants
   SET reserved_quantity = reserved_quantity + $qty
   WHERE id = $id AND (inventory_quantity - reserved_quantity) >= $qty
   RETURNING *;
   ```
2. **Payment Confirmation & Stock Commitment**: Atomically moves reserved units to committed inventory and logs an immutable record to `inventory_movements`.
3. **Rollback Behavior**: If order persistence or payment initiation fails after reservation, the reserved quantity is immediately released.

---

## 5. Security & Row Level Security (RLS)

When running against managed PostgreSQL (such as Supabase):
- **Catalog Tables** (`products`, `categories`, `collections`, `product_images`, `product_variants`): Read access granted to `anon` and `authenticated` roles. Write operations restricted strictly to `service_role`.
- **Commerce State Tables** (`orders`, `order_items`, `payments`, `carts`, `cart_items`): Access granted only to server-side services via service role connection.
- **Service Secret Isolation**: Service connection strings and credentials are restricted to server environments and never prefixed with `NEXT_PUBLIC_`.
