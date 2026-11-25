# ENVY — CubeTech Acceptance Test Log

Test results against the 10 acceptance checks defined in Section 17 of the CubeTech Web Development Internship Assessment.

- **Automated Backend Suite**: `php artisan test` (`24` tests, `149` assertions — SQLite `:memory:` via `RefreshDatabase`, including RBAC, customer auth, and security hardening tests)
- **Frontend Checks**: `npm run lint`, `npm run build`, and Node money-math check (`PHP 325.50`)
- **Live Browser QA**: Tested against `http://localhost:5173` (Vite) + `http://127.0.0.1:8000` (Laravel + PostgreSQL 18) at `1280×800` (Desktop) and `375×812` (Mobile)

| ID | Acceptance Check | Result | Verification & Notes |
| :--- | :--- | :--- | :--- |
| **01** | Search, category filter, and both price sorts work together; no-match and invalid product states handled. | **Pass** | Verified in `StorefrontTest` (combined search, `Streetwear Pants` filter, `price_desc` sort, inactive item hidden) and live storefront. |
| **02** | Cart merges duplicate products, persists after refresh, and calculates the `PHP 325.50` example correctly. | **Pass** | Verified in live browser (`2 × PHP 120.00 + 1 × PHP 85.50 = PHP 325.50`, persisted across reload) and `money.js` assertion. |
| **03** | Empty checkout, invalid customer fields, and invalid/excessive quantities are blocked. | **Pass** | Verified in live browser (empty/invalid email & phone errors shown) and `CheckoutTest::test_checkout_validates_required_fields_and_blocks_whitespace_name`. |
| **04** | Inactive/out-of-stock items cannot be ordered; checkout detects price or availability changes before saving. | **Pass** | Verified `Out of Stock` disabled button in live browser; `409 Conflict` price/availability/stock detection verified in `CheckoutTest`. |
| **05** | Successful order shows confirmation, appears in admin, reduces stock, and clears cart; failed saves preserve cart. | **Pass** | Verified live (`ORD-20261118-ATOQD6` created as `Pending`, cart cleared, appeared in Admin) and `CheckoutTest`. |
| **06** | Admin product/category changes appear on customer site after refresh; referenced records cannot be deleted. | **Pass** | Verified in `AdminCatalogTest` (`409` delete block on referenced products and assigned categories; product CRUD) and live Admin UI. |
| **07** | Valid statuses save; invalid transitions fail; eligible cancellation restores stock once, including after refresh. | **Pass** | Live browser verified `Pending → Confirmed → Preparing → Shipped → Completed`; invalid skips & single-restore cancellation verified in `AdminOrderTest`. |
| **08** | Completed-order totals and unique-email customer counts match underlying orders. | **Pass** | Verified live (`Total Sales = PHP 325.50` only after `Completed`, `alex@example.com` customer summary) and `AdminOrderTest`. |
| **09** | Existing order prices/names remain unchanged after product edits; data persists across restarts. | **Pass** | Verified in `AdminOrderTest::test_order_state_machine_restores_stock_once_on_cancel_and_preserves_snapshots` and PostgreSQL persistence. |
| **10** | Customer/admin screens work at ~375px and ~1280px widths; no clipped controls, horizontal page scroll, or major console errors. | **Pass** | Verified in live browser at `1280×800` and `375×812` (`0` console/network errors, `0px` horizontal page overflow). |
