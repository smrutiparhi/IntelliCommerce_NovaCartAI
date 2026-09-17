# NovaCart frontend

## Visual system

The shared theme uses warm cream and white surfaces in light mode, charcoal/olive
surfaces in dark mode, and the existing lime accent in both. Theme tokens live in
`src/index.css`; layouts, interactions, responsive rules and component refinements
live in `src/design.css`. The original NovaCart logo is retained.

The storefront has a photo-led editorial hero, category rail, filterable/sortable
product grid, quick-look dialogs, and visible quick-add actions. The same system
extends to authentication, product details, wishlist, cart, checkout/payment,
account and order pages. Seller studio has overview, catalogue/inventory, and
order views. Existing API calls and route paths are retained.

Animations respect reduced-motion preferences. Dialogs support Escape, focus
containment and return focus to their opener. Mobile navigation exposes account,
seller and wishlist routes when desktop controls are hidden.

## Verification

From this directory, using Node/npm:

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd test
npm.cmd run test:ui
```

`test:ui` starts its own Vite server on port 5180 and runs the isolated Playwright
suite in installed Chrome. All `/api/v1/` requests are intercepted. Product images
still need network access for visual checks. Screenshots are written to ignored
`test-results/`; the HTML report is in ignored `playwright-report/`.

The suite covers light/dark appearance and persistence, responsive widths from
320 to 1440px, navigation, keyboard dialogs, live-catalogue cart/wishlist items,
buy-now, address validation, coupon and actual seller-ID checkout payloads,
seller editing and fulfillment, and account/product/auth routes.

These tests validate frontend behavior, not real payment/refund settlement or
backend authorization. `test:e2e` also includes the existing real-backend checkout
test; run that only against a deliberately configured test backend/payment setup.

## Local preview

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

Open the URL printed by Vite. Backend service startup is unchanged.
