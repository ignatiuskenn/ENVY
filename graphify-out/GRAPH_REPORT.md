# Graph Report - ENVY  (2026-11-25)

## Corpus Check
- 129 files · ~38,243 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 26 file(s) not represented in the graph (top: (none) 19, .css 3, .example 2)

## Summary
- 652 nodes · 1399 edges · 35 communities (16 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4bff3023`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- frontend/package.json
- composer.json
- backend/package.json
- Illuminate\Database\Schema\Blueprint
- User
- Illuminate\Foundation\Http\FormRequest
- CheckoutService.php
- User Scenarios & Testing *(mandatory)*
- App.jsx
- ENVY E-Commerce — Clean Architecture & Engineering Rules
- Illuminate\Foundation\Testing\RefreshDatabase
- AppServiceProvider
- TestCase
- api.php
- ExampleTest
- Controller.php
- PaymentMethod
- apiRequest
- React + Vite
- OrderStatus
- Illuminate\Http\JsonResponse

## God Nodes (most connected - your core abstractions)
1. `apiRequest()` - 30 edges
2. `LoadingState()` - 26 edges
3. `formatPeso()` - 26 edges
4. `EmptyState()` - 24 edges
5. `react` - 23 edges
6. `App()` - 22 edges
7. `lucide-react` - 22 edges
8. `ErrorState()` - 21 edges
9. `useAsyncData()` - 21 edges
10. `react-router-dom` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Storage Approach & Limitations` --references--> `EnsureAdminRole`  [INFERRED]
  README.md → backend/app/Http/Middleware/EnsureAdminRole.php
- `Order Lifecycle` --references--> `Order`  [INFERRED]
  README.md → backend/app/Models/Order.php
- `Order Lifecycle` --references--> `OrderItem`  [INFERRED]
  README.md → backend/app/Models/OrderItem.php
- `Order Lifecycle` --references--> `CheckoutService`  [INFERRED]
  README.md → backend/app/Services/CheckoutService.php
- `ENVY — CubeTech Acceptance Test Log` --references--> `AdminCatalogTest`  [INFERRED]
  TEST_LOG.md → backend/tests/Feature/AdminCatalogTest.php

## Import Cycles
- None detected.

## Communities (35 total, 19 thin omitted)

### Community 0 - "frontend/package.json"
Cohesion: 0.06
Nodes (44): dependencies, gsap@^3.15.1, @gsap/react@^2.1.2, lucide-react@^1.74.0, react@^19.3.1, react-dom@^19.3.1, react-router-dom@^7.18.5, three@^0.187.0 (+36 more)

### Community 1 - "composer.json"
Cohesion: 0.04
Nodes (48): pestphp/pest-plugin, php-http/discovery, autoload, autoload-dev, psr-4, psr-4, config, allow-plugins (+40 more)

### Community 2 - "backend/package.json"
Cohesion: 0.12
Nodes (20): devDependencies, concurrently@^10.0.3, laravel-vite-plugin@^3.1, tailwindcss@^4.0.0, @tailwindcss/vite@^4.0.0, vite@^8.0.0, tailwindcss, @tailwindcss/vite (+12 more)

### Community 3 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.07
Nodes (17): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}(), {closure#3}() (+9 more)

### Community 4 - "User"
Cohesion: 0.09
Nodes (5): UserRole, Admin, Customer, User, UserFactory

### Community 5 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.06
Nodes (19): EnsureAdminRole, AdminLoginRequest, {closure#1}(), {closure#1}(), UpdateOrderStatusRequest, CheckoutRequest, 1. Backend (`backend/`), 2. Frontend (`frontend/`) (+11 more)

### Community 6 - "CheckoutService.php"
Cohesion: 0.07
Nodes (11): CheckoutConflictException, CheckoutController, Category, Order, OrderItem, Product, CheckoutService, {closure#1}() (+3 more)

### Community 7 - "User Scenarios & Testing *(mandatory)*"
Cohesion: 0.13
Nodes (14): Assumptions & Out of Scope, Edge Cases, Feature Specification: ENVY E-Commerce Website & Admin Dashboard, Functional Requirements, Key Entities, Measurable Outcomes (Mapped to CubeTech Acceptance Checks 01–10), Requirements *(mandatory)*, Success Criteria *(mandatory)* (+6 more)

### Community 8 - "App.jsx"
Cohesion: 0.10
Nodes (57): App(), StorefrontShell(), AdminLayout(), NAV_ITEMS, EnvyPixelMark(), Footer(), Navbar(), OrderStatusBadge() (+49 more)

### Community 9 - "ENVY E-Commerce — Clean Architecture & Engineering Rules"
Cohesion: 0.17
Nodes (11): A. Frontend (`frontend/src/`), B. Backend (`backend/app/`), ENVY E-Commerce — Clean Architecture & Engineering Rules, Rule 1: Check Before Creating (Reuse First, Zero Duplication), Rule 2: Folder Organization & Clear Responsibilities, Rule 3: One Job Per File (Single Responsibility Principle), Rule 4: Strict Layer Separation (No Leaky Layers), Rule 5: Zero Hardcoded Magic Values, Safe Money Math & Secret Hygiene (+3 more)

### Community 10 - "Illuminate\Foundation\Testing\RefreshDatabase"
Cohesion: 0.06
Nodes (9): DatabaseSeeder, AdminAuthTest, AdminCatalogTest, AdminOrderTest, CheckoutTest, RbacAndCustomerAuthTest, SecurityHardeningTest, StorefrontTest (+1 more)

### Community 26 - "PaymentMethod"
Cohesion: 0.40
Nodes (4): PaymentMethod, BankTransfer, CashOnDelivery, EWallet

### Community 27 - "apiRequest"
Cohesion: 0.13
Nodes (31): API_BASE_URL, CUSTOMER_TOKEN_STORAGE_KEY, DEMO_ADMIN_STORAGE_KEY, adminLogin(), adminLogout(), createAdminCategory(), createAdminProduct(), deleteAdminCategory() (+23 more)

### Community 30 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 31 - "OrderStatus"
Cohesion: 0.18
Nodes (7): OrderStatus, Cancelled, Completed, Confirmed, Pending, Preparing, Shipped

### Community 35 - "Illuminate\Http\JsonResponse"
Cohesion: 0.05
Nodes (18): InvalidOrderTransitionException, AdminAuthController, AdminCategoryController, AdminOrderController, AdminOverviewController, AdminProductController, AuthController, CategoryController (+10 more)

## Knowledge Gaps
- **11 isolated node(s):** `BankTransfer`, `CashOnDelivery`, `EWallet`, `Cancelled`, `Completed` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 212 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `frontend/package.json`, `apiRequest`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `BankTransfer`, `CashOnDelivery`, `EWallet` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.061979648473635525 - nodes in this community are weakly interconnected._
- **Why does `ENVY — Athletic & Streetwear E-Commerce Store` connect `Illuminate\Foundation\Http\FormRequest` to `CheckoutService.php`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `composer.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `backend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11688311688311688 - nodes in this community are weakly interconnected._
- **Should `Illuminate\Database\Schema\Blueprint` be split into smaller, more focused modules?**
  _Cohesion score 0.07358156028368794 - nodes in this community are weakly interconnected._