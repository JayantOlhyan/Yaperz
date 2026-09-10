# Yaperz — Authorization & Resource Ownership Architecture

## Principle of Zero-Trust Server Authority
Authentication and authorization state is never determined from `localStorage`, client state, or request parameters. Every protected endpoint resolves customer identity strictly from the verified HttpOnly session cookie (`yaperz_auth_session`).

## Resource Ownership Matrix

| Endpoint | Operation | Ownership Validation Rule |
| :--- | :--- | :--- |
| `GET /api/account` | Read Profile | Derived from session `session.customerId` |
| `PATCH /api/account` | Update Profile | Derived from session `session.customerId` |
| `GET /api/account/addresses` | List Addresses | `address.customerId === session.customerId` |
| `POST /api/account/addresses` | Create Address | Binds `customerId = session.customerId` |
| `PATCH /api/account/addresses/[id]` | Edit Address | Asserts `address.customerId === session.customerId` (403 if mismatch) |
| `DELETE /api/account/addresses/[id]` | Delete Address | Asserts `address.customerId === session.customerId` (403 if mismatch) |
| `GET /api/account/orders` | Order History | `order.customerId === session.customerId` |
| `GET /api/account/orders/[id]` | Order Details | Asserts `order.customerId === session.customerId` (403/404 if mismatch) |

## Prevention of IDOR Vulnerabilities
Attempts by Customer A to supply `customerId=CustomerB` in query strings or path parameters are completely ignored. Path parameters such as `/api/account/addresses/[id]` look up the target resource and verify that its associated `customerId` matches the session customer ID before allowing mutation or deletion.
