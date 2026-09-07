# State Management Architecture

## Cart State (`CartContext.tsx`)
- Provides cart item collections, drawer toggle states, and mutation actions.
- Automatically synchronizes with browser `localStorage` under `yaperz-cart`.
- Handles hydration safely with client-side mount checks.
