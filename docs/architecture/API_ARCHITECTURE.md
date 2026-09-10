# Yaperz — REST API Architecture & Service Contract

> **Phase**: Phase 2 — Production Commerce Architecture & Database Foundation  
> **Protocol**: HTTPS / JSON  
> **Authentication**: Cookie-based session token (`yaperz_session`) for cart; external auth-ready in Phase 3  

---

## 1. Architectural Principles

1. **Clean Service Boundaries**: UI components never query the database directly. All interactions traverse:
   ```
   Client UI ──HTTP/JSON──> Route Handler ──Zod Validation──> Service ──> Repository ──> Database
   ```
2. **Zero Client Trust**: Pricing, taxes, coupon discounts, and inventory availability are calculated strictly on the server.
3. **Standard Response Envelope**:
   ```typescript
   // Success Response (HTTP 200 / 201)
   {
     "success": true,
     "data": { ... }
   }

   // Error Response (HTTP 400 / 404 / 409 / 500)
   {
     "success": false,
     "code": "OUT_OF_STOCK",
     "error": "Human readable error description",
     "issues": [ ... ] // Zod validation details if applicable
   }
   ```

---

## 2. API Endpoint Catalog

### 2.1 Catalog Endpoints

#### `GET /api/products`
Retrieves paginated, faceted product catalog.
- **Query Parameters**:
  - `category` (string, optional): Category slug or name.
  - `collection` (string, optional): Collection slug (e.g. `'winter-collection'`).
  - `minPrice` / `maxPrice` (number, optional): Price filter in INR rupees.
  - `sizes` (comma-separated string, optional): e.g. `'S,M,L'`.
  - `colors` (comma-separated string, optional): e.g. `'Brown,Black'`.
  - `inStock` (boolean, optional): Only products with available inventory.
  - `sort` (string, optional): `'featured'` | `'price-asc'` | `'price-desc'` | `'newest'`.
  - `page` (number, default 1): Page index.
  - `pageSize` (number, default 12): Items per page.
  - `search` (string, optional): Search keyword matching title, description, or tags.
- **Response**: `{ success: true, data: PaginatedProducts }`.

#### `GET /api/products/[slug]`
Retrieves full details for a single product.
- **Path Parameters**: `slug` (string, required): Product slug.
- **Response**: `{ success: true, data: NormalizedProduct }`.
- **Errors**: 404 (`PRODUCT_NOT_FOUND`).

#### `GET /api/collections`
Retrieves all curated collections and associated product counts.
- **Response**: `{ success: true, data: Array<NormalizedCollection & { productCount: number }> }`.

---

### 2.2 Shopping Cart Endpoints

#### `GET /api/cart`
Retrieves the server-side shopping cart associated with the visitor's `yaperz_session` cookie.
- **Response**: `{ success: true, data: DetailedServerCart }`.

#### `POST /api/cart/items`
Adds an SKU variant to the server-side cart.
- **Request Body**:
  ```json
  {
    "variantId": "var-1-brn-m",
    "quantity": 1
  }
  ```
- **Response**: `{ success: true, data: DetailedServerCart }`.
- **Errors**: 400 (`VALIDATION_ERROR`), 409 (`INSUFFICIENT_STOCK`).

#### `PATCH /api/cart/items`
Updates quantity for an existing cart item.
- **Request Body**: `{ "variantId": "var-1-brn-m", "quantity": 2 }`.

#### `DELETE /api/cart/items?variantId=...`
Removes an item from the cart.

#### `DELETE /api/cart`
Empties the active session cart.

---

### 2.3 Checkout & Pricing Endpoints

#### `POST /api/checkout/quote`
**Core P0 Defense**: Computes authoritative pricing breakdown with zero client trust.
- **Request Body**:
  ```json
  {
    "items": [
      { "variantId": "var-1-brn-m", "quantity": 1 },
      { "variantId": "var-3-ofw-l", "quantity": 2 }
    ],
    "shippingMethod": "standard",
    "couponCode": "WELCOME10",
    "postalCode": "110048"
  }
  ```
- **Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [ ... ],
      "itemCount": 3,
      "subtotalPaise": 2550000,
      "subtotalFormatted": "₹25,500",
      "discountPaise": 100000,
      "discountFormatted": "₹1,000",
      "appliedCoupon": {
        "code": "WELCOME10",
        "description": "10% off on orders above ₹2,500",
        "savingsPaise": 100000
      },
      "shippingFeePaise": 0,
      "shippingFeeFormatted": "FREE",
      "shippingMethod": "standard",
      "taxPaise": 294000,
      "taxFormatted": "₹2,940",
      "taxRatePercent": 12,
      "grandTotalPaise": 2450000,
      "grandTotalFormatted": "₹24,500",
      "isEligibleForFreeShipping": true,
      "amountNeededForFreeShippingPaise": 0
    }
  }
  ```

---

### 2.4 Orders & Fulfillment Endpoints

#### `POST /api/orders`
Transactionally places an order, reserves inventory, snapshots items, and initiates payment intent.
- **Request Body**:
  ```json
  {
    "customerEmail": "customer@yaperz.com",
    "customerPhone": "9876543210",
    "shippingAddress": {
      "firstName": "Jayant",
      "lastName": "Olhyan",
      "phone": "9876543210",
      "addressLine1": "M-81, Block M, GK-II",
      "city": "New Delhi",
      "state": "Delhi",
      "postalCode": "110048",
      "country": "IN"
    },
    "items": [{ "variantId": "var-1-brn-m", "quantity": 1 }],
    "shippingMethod": "standard",
    "paymentMethod": "RAZORPAY",
    "idempotencyKey": "idem-84920192"
  }
  ```
- **Response (HTTP 201)**:
  ```json
  {
    "success": true,
    "data": {
      "order": {
        "id": "ord-17180291-a8d9e",
        "orderNumber": "YP-2026-849201",
        "status": "PENDING",
        "subtotal": 1850000,
        "grandTotal": 1850000,
        "items": [ ... ]
      },
      "paymentOrder": {
        "provider": "MOCK",
        "providerOrderId": "mock_order_17180291",
        "amountPaise": 1850000,
        "currency": "INR"
      }
    }
  }
  ```

#### `GET /api/orders?identifier=YP-2026-849201`
Retrieves order details by human-readable order number.

#### `GET /api/shipping/track?trackingNumber=YP-AWB-84920192`
Retrieves live courier tracking milestones.
