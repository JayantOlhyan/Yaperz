# Yaperz — PostgreSQL Relational Entity-Relationship Diagram (ERD)

> **Schema Source**: `src/lib/db/schema.ts`  
> **Target Engine**: PostgreSQL 16+ via Drizzle ORM  
> **Entity Count**: 20 Normalized Tables & 11 Postgres Enums  

---

## 1. Complete Relational ERD

```mermaid
erDiagram
    categories ||--o{ products : "categorizes"
    collections ||--o{ product_collections : "groups"
    products ||--o{ product_collections : "belongs_to"
    products ||--o{ product_variants : "has_variants"
    products ||--o{ product_images : "has_images"
    products ||--o{ product_tags : "tagged_with"
    product_variants ||--o{ product_images : "variant_image"
    product_variants ||--o{ inventory_movements : "stock_history"
    product_variants ||--o{ cart_items : "added_to"
    
    customers ||--o{ customer_addresses : "owns_addresses"
    customers ||--o{ carts : "owns_cart"
    customers ||--o{ orders : "places"
    
    carts ||--o{ cart_items : "contains"
    
    discounts ||--o{ orders : "applied_to"
    
    orders ||--o{ order_items : "contains"
    order_addresses ||--o{ orders : "shipping_destination"
    order_addresses ||--o{ orders : "billing_destination"
    orders ||--o{ payments : "paid_via"
    payments ||--o{ payment_events : "payment_log"
    orders ||--o{ shipments : "fulfilled_by"
    shipments ||--o{ shipment_events : "logistics_trail"
    
    orders ||--o{ returns : "return_request"
    returns ||--o{ return_items : "items_returned"
    order_items ||--o{ return_items : "references_item"
    orders ||--o{ refunds : "refund_transaction"
    payments ||--o{ refunds : "refunds_payment"

    categories {
        text id PK
        text name
        text slug UK
        text description
        timestamp created_at
        timestamp updated_at
    }

    collections {
        text id PK
        text name
        text slug UK
        text description
        text banner_url
        timestamp created_at
        timestamp updated_at
    }

    products {
        text id PK
        text title
        text slug UK
        text description
        text care_instructions
        text category_id FK
        enum status
        text brand
        text hsn_code
        integer tax_rate_bps
        timestamp created_at
        timestamp updated_at
    }

    product_variants {
        text id PK
        text product_id FK
        text sku UK
        text size
        text color_name
        text color_hex
        integer price
        integer compare_at_price
        integer inventory_quantity
        integer reserved_quantity
        integer weight_grams
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    product_images {
        text id PK
        text product_id FK
        text variant_id FK
        text url
        text alt_text
        integer sort_order
        boolean is_primary
        timestamp created_at
    }

    product_collections {
        text product_id PK,FK
        text collection_id PK,FK
    }

    product_tags {
        text id PK
        text product_id FK
        text tag
    }

    inventory_movements {
        text id PK
        text variant_id FK
        enum movement_type
        integer quantity
        text reference_id
        text reason
        timestamp created_at
    }

    customers {
        text id PK
        text email UK
        text phone
        text first_name
        text last_name
        boolean marketing_consent
        enum account_status
        text external_auth_id UK
        timestamp created_at
        timestamp updated_at
    }

    customer_addresses {
        text id PK
        text customer_id FK
        text first_name
        text last_name
        text phone
        text address_line1
        text address_line2
        text city
        text state
        text postal_code
        text country
        text landmark
        enum address_type
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }

    carts {
        text id PK
        text session_token UK
        text customer_id FK
        timestamp created_at
        timestamp updated_at
    }

    cart_items {
        text id PK
        text cart_id FK
        text variant_id FK
        integer quantity
        timestamp created_at
        timestamp updated_at
    }

    discounts {
        text id PK
        text code UK
        enum discount_type
        integer value
        integer min_subtotal
        integer max_discount
        integer usage_limit
        integer used_count
        boolean is_active
        timestamp starts_at
        timestamp expires_at
        timestamp created_at
    }

    orders {
        text id PK
        text order_number UK
        text customer_id FK
        text guest_email
        text guest_phone
        enum status
        integer subtotal
        integer discount_total
        text discount_id FK
        integer shipping_fee
        text shipping_method
        integer tax_total
        integer grand_total
        text currency
        text shipping_address_id FK
        text billing_address_id FK
        text idempotency_key UK
        timestamp created_at
        timestamp updated_at
    }

    order_items {
        text id PK
        text order_id FK
        text product_id
        text variant_id
        text product_title
        text variant_sku
        text size
        text color
        integer unit_price
        integer quantity
        integer discount_amount
        integer tax_amount
        integer line_total
        timestamp created_at
    }

    order_addresses {
        text id PK
        text first_name
        text last_name
        text phone
        text address_line1
        text address_line2
        text city
        text state
        text postal_code
        text country
        text landmark
        timestamp created_at
    }

    payments {
        text id PK
        text order_id FK
        text provider
        text provider_order_id
        text provider_payment_id
        integer amount
        text currency
        enum status
        text method
        timestamp captured_at
        timestamp failed_at
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }

    payment_events {
        text id PK
        text payment_id FK
        text event_name
        jsonb event_payload
        timestamp created_at
    }

    shipments {
        text id PK
        text order_id FK
        text carrier
        text tracking_number
        text awb_code
        text shipping_label_url
        enum status
        timestamp estimated_delivery_date
        timestamp created_at
        timestamp updated_at
    }

    shipment_events {
        text id PK
        text shipment_id FK
        enum status
        text location
        text message
        timestamp occurred_at
        timestamp created_at
    }

    returns {
        text id PK
        text order_id FK
        enum status
        text reason
        timestamp created_at
        timestamp updated_at
    }

    return_items {
        text id PK
        text return_id FK
        text order_item_id FK
        integer quantity
        text condition_notes
        timestamp created_at
    }

    refunds {
        text id PK
        text return_id FK
        text order_id FK
        text payment_id FK
        integer amount
        enum status
        text provider_refund_id
        timestamp created_at
    }

    idempotency_keys {
        text key PK
        text scope
        text response_body
        integer status_code
        timestamp created_at
        timestamp expires_at
    }

    audit_logs {
        text id PK
        text actor
        text action
        text entity
        text entity_id
        jsonb before
        jsonb after
        timestamp created_at
    }
```

---

## 2. Table Indexing & Uniqueness Constraints

| Table | Index Name | Indexed Columns | Type | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `products` | `idx_products_slug` | `slug` | Unique | Clean SEO product routing |
| `products` | `idx_products_category` | `category_id` | B-Tree | Category navigation queries |
| `product_variants` | `idx_variants_sku` | `sku` | Unique | SKU inventory tracking |
| `product_variants` | `idx_variants_product` | `product_id` | B-Tree | Fetch variants for PDP |
| `orders` | `idx_orders_number` | `order_number` | Unique | Customer tracking lookup |
| `orders` | `idx_orders_idempotency` | `idempotency_key` | Unique | Duplicate checkout prevention |
| `customers` | `idx_customers_email` | `email` | Unique | Unique customer identity |
| `carts` | `idx_carts_session` | `session_token` | Unique | Cookie-based cart retrieval |
