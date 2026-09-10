# Yaperz — Customer Account Architecture

## Customer Entity & Profile
The `customers` model tracks:
- `id`: Unique customer ID (`cust-<timestamp>-<hash>`)
- `email`: Normalized unique email address
- `phone`: Mobile contact number
- `firstName` & `lastName`: Personal customer name
- `marketingConsent`: Opt-in preference
- `accountStatus`: `ACTIVE` | `SUSPENDED` | `GUEST`

## Saved Delivery Addresses
Saved delivery addresses are managed via `customer_addresses` and the `AuthRepository`:
- **Default Address Enforcement**: Setting `isDefault = true` automatically unsets `isDefault` on all other addresses belonging to that customer.
- **Auto-Default First Address**: Creating a customer's first address sets `isDefault = true` automatically.
- **Default Re-assignment**: Deleting the default address promotes the next remaining address to default.

## Order History Access
- Orders placed by registered customers are linked via `orders.customerId`.
- Historical order snapshots (`order_items`, `order_addresses`) remain immutable.
- Protected route `/api/account/orders` returns only orders belonging to the authenticated customer.
