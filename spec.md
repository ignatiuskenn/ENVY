# Feature Specification: ENVY E-Commerce Website & Admin Dashboard

**Feature Branch**: `main` (base specification for `feat/*` branches)

**Created**: 2026-11-18

**Status**: Approved Specification

**Input**: CubeTech Innovations Web Development Internship Assessment (7-page PDF) + ENVY athletic/streetwear brand concept using React (Vite + Tailwind CSS), Laravel 13, and PostgreSQL 18.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Storefront Browsing, Search, Filter & Product Details (Priority: P1)

A customer visits the ENVY online store on mobile or desktop, explores the brand home page, browses products, searches/filters/sorts the catalog, and views individual product details.

**Why this priority**: Product discovery is the entry point of the customer journey (20% Customer Website Functionality weight).

**Independent Test**: Can be tested by loading Home, navigating to Product Listing, combining search + category filter + price sort, verifying inactive vs. zero-stock product behavior, and opening Product Details.

**Acceptance Scenarios**:

1. **Given** a customer visits the Home page, **When** the page loads, **Then** they see the ENVY store name/logo, working navigation menu, promotional banner, category links, featured products, and footer with clearly labeled fictional contact details and social links.
2. **Given** active products exist across 3 categories, **When** the customer applies a case-insensitive name search, category filter, and price sort (`low-to-high` or `high-to-low`) together, **Then** matching active products are displayed in a responsive grid, or a clear empty state appears when none match.
3. **Given** an inactive product exists, **When** browsing listings or visiting its direct URL, **Then** it is hidden from customer listings and cannot be viewed or ordered via direct link.
4. **Given** an active product has `0` stock, **When** viewing listings or its detail page, **Then** it remains visible with an **Out of Stock** label and its **Add to Cart** control is disabled.
5. **Given** an active product detail page, **When** it loads, **Then** it displays image, name, price (`PHP 0.00`), description, available stock, quantity selector, Add to Cart action, and up to 3 related active products from the same category (omitting the section if none exist).

---

### User Story 2 - Persistent Shopping Cart & Safe Money Calculations (Priority: P1)

A customer adds ENVY products to their cart, adjusts quantities or removes items, refreshes the browser, and sees accurate line totals and totals in PHP.

**Why this priority**: Accurate cart math and persistence across refreshes are explicitly tested in Acceptance Check 02.

**Independent Test**: Add 2 units of a `PHP 120.00` item and 1 unit of a `PHP 85.50` item, add a duplicate item, refresh the browser, and verify total equals `PHP 325.50`.

**Acceptance Scenarios**:

1. **Given** a product is already in the cart, **When** the customer adds the same product again, **Then** its quantity increases on the existing line instead of creating a duplicate row.
2. **Given** items in the cart, **When** the customer updates quantities, **Then** only positive whole numbers not exceeding available stock are accepted.
3. **Given** items in the cart, **When** the customer refreshes the browser, **Then** cart contents persist, and `subtotal` equals `total` formatted to two decimal places with zero rounding drift.
4. **Given** an empty cart, **When** the customer tries to proceed to checkout, **Then** checkout is blocked.

---

### User Story 3 - Guest Checkout, Atomic Order Placement & Stock Deduction (Priority: P1)

A customer fills in guest delivery/payment details, reviews their order, and submits it to create a persistent order in PostgreSQL.

**Why this priority**: Connects the customer storefront to the admin dashboard (Data Integration & System Flow) and enforces authoritative server-side validation.

**Independent Test**: Submit valid and invalid checkout forms, simulate a price/stock change before submission, complete an order, verify stock decreases, cart clears, and confirmation displays.

**Acceptance Scenarios**:

1. **Given** the checkout form, **When** the customer submits with blank/whitespace name, invalid email, empty phone, missing delivery address, or missing payment method, **Then** submission is blocked with clear validation errors.
2. **Given** valid checkout details, **When** the customer submits while a product's price, availability, or stock changed in the database since being added to cart, **Then** the server rejects the stale submission, displays the updated change, and requires customer review before retrying.
3. **Given** a valid checkout submission with sufficient stock, **When** saving succeeds, **Then** the submit button stays disabled while saving, order + snapshot line items save atomically, product stock decreases, the cart clears, and the confirmation page displays a unique order number, customer details, payment method, item summary, total, and `Pending` status.
4. **Given** saving fails on the server, **When** the error is returned, **Then** a useful error is shown, confirmation does not appear, and the cart is preserved.

---

### User Story 4 - Admin Demo Login, Overview Dashboard & Catalog Management (Priority: P1)

An admin logs into the protected admin dashboard to inspect store KPIs and manage products and categories.

**Why this priority**: Admin dashboard functionality carries the highest rubric weight (25%).

**Independent Test**: Attempt direct access to admin routes unauthenticated (blocked), log in with demo credentials, inspect 5 overview cards, and test Product/Category CRUD + deletion guards.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they visit any admin route directly, **Then** they are redirected to the clearly labeled demo login screen (marked unsuitable for production).
2. **Given** an authenticated admin on Overview, **When** metrics load, **Then** all 5 cards match underlying orders/products: Total Products (including inactive), Total Orders (including cancelled), Pending / Completed Orders counts, Total Customers (unique normalized emails), and Total Sales (`Completed` orders only).
3. **Given** Product Management, **When** an admin adds/edits a product, **Then** required fields, `price > 0`, and whole-number `stock >= 0` are enforced, and changes appear on the customer site after refresh.
4. **Given** a product referenced by an existing order, **When** an admin attempts to delete it, **Then** hard deletion is blocked and the UI offers to mark it inactive instead, preserving order history.
5. **Given** Category Management, **When** an admin adds/edits a category with a blank or case-insensitive duplicate name, **Then** it is rejected; deleting a category with assigned products is blocked with an explanation.

---

### User Story 5 - Admin Order Management, Status Transitions & Customer Summary (Priority: P1)

An admin reviews incoming orders newest-first, inspects order details, advances or cancels order statuses, and views the derived customer summary.

**Why this priority**: Completes the end-to-end order lifecycle, stock restoration, and historical snapshot guarantees (Checks 07, 08, 09).

**Independent Test**: Open a `Pending` order, advance it through valid statuses, test invalid backward/cancelled transitions, cancel an eligible order and verify stock restores once, and verify product edits do not alter past order snapshots.

**Acceptance Scenarios**:

1. **Given** saved orders, **When** viewing the Admin Orders list, **Then** orders appear newest first with order number, customer name, date/time, total, payment method, status, and View Details (or an empty state if none exist).
2. **Given** an order's detail page, **When** updating status, **Then** only `Pending -> Confirmed -> Preparing -> Shipped -> Completed` transitions are allowed; cancellation is permitted only from `Pending` or `Confirmed`.
3. **Given** an eligible order is cancelled, **When** the cancellation saves, **Then** product stock is restored **exactly once** (persisting across refresh), and repeated cancellation or backward status changes are rejected.
4. **Given** an existing order, **When** the admin later edits that product's name or price, **Then** the existing order's line-item name, unit price, and total remain unchanged.
5. **Given** the Admin Customers screen, **When** loaded, **Then** it shows a read-only list grouped by normalized email with the latest submitted name/contact, order count, and total value of `Completed` orders only.

---

### Edge Cases

- What happens when a customer accesses an inactive product's URL directly? Return `404` / unavailable state and block Add to Cart.
- What happens when two checkouts race for the last unit of stock? PostgreSQL row locking (`lockForUpdate`) inside a transaction ensures stock never drops below zero and rejects the second order cleanly.
- What happens when `subtotal` has centavo values? Exact decimal / integer-centavo arithmetic guarantees no floating-point drift (e.g., `2 x 120.00 + 1 x 85.50 = 325.50`).
- What happens on `375px` mobile and `1280px` desktop viewports? All customer and admin layouts adapt cleanly with no horizontal page scrolling, clipped controls, or major console errors.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present the **ENVY** athletic/streetwear brand with a responsive customer storefront and a connected admin dashboard sharing a single PostgreSQL 18 database via Laravel 13 REST APIs.
- **FR-002**: System MUST seed at least **10 products across 3 categories** (e.g., *Tops & Outerwear*, *Bottoms*, *Footwear & Gear*), including at least **1 inactive product** and **1 active product with `0` stock**, plus a demo admin user.
- **FR-003**: System MUST display all prices and totals in **PHP** to two decimal places (`PHP 0.00`), where `subtotal` equals `total` (no shipping, tax, or voucher fees).
- **FR-004**: Customer Product Listing MUST support combined case-insensitive name search, category filtering, and price sorting (`asc` / `desc`), plus a clear empty state.
- **FR-005**: System MUST hide inactive products from customer listings and block direct URL access/ordering, while keeping active `0`-stock products visible with an **Out of Stock** badge and disabled Add to Cart.
- **FR-006**: Customer Product Details MUST display up to 3 related active products from the same category (excluding current) and omit the section if none exist.
- **FR-007**: Shopping Cart MUST merge duplicate products by increasing quantity, enforce positive whole-number quantities `<= available stock`, and persist across browser refreshes.
- **FR-008**: Checkout MUST validate Customer Name (non-blank/whitespace), Email (valid format), Contact Number (non-empty phone format), Delivery Address (required), Payment Method (`Cash on Delivery`, `E-Wallet`, or `Bank Transfer`), and optional Order Notes—both in UI and authoritatively on the Laravel server.
- **FR-009**: Checkout MUST recheck live product availability, price, and stock before saving; if any changed, abort save, report the change, and require customer review.
- **FR-010**: Order placement MUST run in an atomic database transaction: create order (`Pending`) + line-item snapshots (`product_name_snapshot`, `unit_price_snapshot`), decrement stock (never `< 0`), and clear the cart only after confirmed save.
- **FR-011**: Admin routes MUST be protected behind a demo login/logout flow (Sanctum token/session) clearly labeled as demo-only and unsuitable for production.
- **FR-012**: Admin Overview MUST compute: Total Products (all), Total Orders (all), Pending & Completed Order counts, Total Customers (unique normalized emails), and Total Sales (`Completed` orders only).
- **FR-013**: Admin Product Management MUST support list/search/filter/add/edit/delete, block hard deletion if referenced by any order, and offer marking inactive instead.
- **FR-014**: Admin Category Management MUST support view/add/edit/delete, enforce non-blank case-insensitive unique names, and block deletion while any product is assigned.
- **FR-015**: Admin Order Management MUST enforce `Pending -> Confirmed -> Preparing -> Shipped -> Completed` with cancellation allowed only from `Pending` or `Confirmed`, restoring stock **exactly once** via a `stock_restored` guard.
- **FR-016**: Admin Customers MUST provide a read-only summary derived from orders (normalized email, latest name & contact, order count, total `Completed` order value).

### Key Entities

- **Category**: `id`, `name` (case-insensitive unique).
- **Product**: `id`, `category_id` (FK `RESTRICT`), `name`, `slug`, `description`, `price` (`NUMERIC(10,2) > 0`), `stock_quantity` (`>= 0`), `image_url`, `is_active` (`BOOLEAN`).
- **Order**: `id`, `order_number` (unique), `customer_name`, `customer_email` (normalized lowercase), `customer_contact`, `delivery_address`, `payment_method`, `order_notes`, `status`, `subtotal`, `total`, `stock_restored` (`BOOLEAN`).
- **OrderItem**: `id`, `order_id` (FK `CASCADE`), `product_id` (FK `RESTRICT`), `product_name_snapshot`, `unit_price_snapshot`, `quantity`, `line_total`.
- **User (Admin)**: `id`, `name`, `email`, `password` (demo admin credentials documented in `README.md`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes (Mapped to CubeTech Acceptance Checks 01–10)

- **SC-001 (Check 01)**: Combined search, category filter, and both price sorts return accurate results; no-match empty state and invalid/inactive product states are handled.
- **SC-002 (Check 02)**: Cart merges duplicate products, persists across refresh, and computes `2 x PHP 120.00 + 1 x PHP 85.50 = PHP 325.50` with zero rounding error.
- **SC-003 (Check 03)**: Empty checkout, blank/invalid customer fields, and non-positive or excessive quantities are blocked.
- **SC-004 (Check 04)**: Inactive and `0`-stock items cannot be ordered; checkout detects price or availability changes before saving.
- **SC-005 (Check 05)**: Successful order displays confirmation, appears in Admin, deducts stock, and clears cart; failed saves preserve cart.
- **SC-006 (Check 06)**: Admin product/category changes reflect on the customer site after refresh; referenced products/categories cannot be hard-deleted.
- **SC-007 (Check 07)**: Valid order status transitions persist; invalid backward/final transitions fail; eligible cancellation restores stock exactly once (verified across refresh).
- **SC-008 (Check 08)**: Dashboard Total Sales and Customer summary totals match `Completed` orders; unique customer count matches distinct normalized checkout emails.
- **SC-009 (Check 09)**: Existing order snapshots remain unchanged after product edits; all data persists in PostgreSQL across application restarts.
- **SC-010 (Check 10)**: All customer and admin screens operate cleanly at `375px` and `1280px` widths with no clipped controls, horizontal page overflow, or major console errors.

---

## Assumptions & Out of Scope

- **Single-SKU Clothing Products**: Each ENVY product has one `stock_quantity` and merges by product in the cart (size/color variant matrices are intentionally omitted to align with the assessment's data model and 15–20 hour scope).
- **Guest Checkout**: No customer registration or customer account login is required.
- **Out of Scope**: Real payment gateways, QR/e-wallet collection, shipping rate APIs, tax rules, refunds, multi-vendor support, and production security hardening.
