# ENVY — Athletic & Streetwear E-Commerce Store

Web Development Internship Assessment for **CubeTech Innovations**.

ENVY is a full-stack e-commerce web application for a fictional athletic/streetwear brand, featuring a responsive **Customer Storefront** and a protected **Admin Dashboard** backed by a shared **PostgreSQL 18** database via a **Laravel 13** REST API.

---

## Tech Stack

- **Frontend**: React 19, Vite, React Router, Tailwind CSS v4, Lucide Icons
- **Backend**: Laravel 13 (PHP 8.5), Laravel Sanctum (token-based demo admin auth)
- **Database**: PostgreSQL 18

---

## Storage Approach & Limitations

- **Authoritative Backend (`PostgreSQL 18` + `Laravel 13`)**:
  - Categories, products, orders, order items, and admin sessions are stored in PostgreSQL.
  - All checkout calculations, stock checks, price verification, and order status transitions are enforced on the server inside `DB::transaction()` with `lockForUpdate()`.
  - `order_items` stores `product_name_snapshot` and `unit_price_snapshot` at purchase time so later product edits do not alter historical orders.
- **Guest Cart (`localStorage`)**:
  - Pre-checkout cart items persist in browser `localStorage` across page refreshes.
  - Because `localStorage` is browser-local and user-editable, the backend re-validates live product availability, price, and stock on `POST /api/checkout` (returning `409 Conflict` if anything changed).
- **Demo Authentication & RBAC**:
  - Uses Laravel Sanctum bearer tokens with Role-Based Access Control (`admin` vs `customer`).
  - Customers can browse and add to cart as guests, and sign in / register (`/login`, `/register`) at Checkout; `EnsureAdminRole` middleware returns `403 Forbidden` if a customer attempts to access any `/api/admin/*` endpoint.
  - **Simulated demo credentials are for assessment demonstration only and are unsuitable for production.**

---

## Setup & Run Instructions

### Prerequisites
- PHP `>= 8.3` (tested on `8.5.12`) with `pdo_pgsql` and `pgsql` extensions enabled
- Composer `>= 2.x`
- Node.js `>= 20` & `npm`
- PostgreSQL `18` (running locally)

### 1. Backend (`backend/`)
```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Update `backend/.env` with your PostgreSQL credentials (placeholders below—do not commit real secrets):
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=envy_db
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
FRONTEND_URL=http://localhost:5173
```

Create the database (`envy_db`) in PostgreSQL, then run migrations, seeders, and the API server:
```powershell
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8000
```

### 2. Frontend (`frontend/`)
```powershell
cd frontend
npm install
copy .env.example .env
```

Ensure `frontend/.env` points to the Laravel API:
```env
VITE_API_URL=http://localhost:8000/api
```

Start the Vite dev server:
```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://localhost:5173` in your browser.

---

## Seed & Reset Instructions

Run `php artisan migrate:fresh --seed` inside `backend/` to reset the database and seed:
- **1 Demo Admin User**
- **3 Categories**: `Gorpcore Jackets`, `Y2K T-Shirts`, `Streetwear Pants`
- **12 ENVY Products** (including 1 inactive product: `ENVY Prototype Exo-Shell Pant`, 1 active `0`-stock product: `ENVY Legacy Y2K Graphic Tee`, and `PHP 120.00` / `PHP 85.50` items for exact centavo verification)

---

## Routes & Demo Credentials

### Demo Credentials *(Demo-Only — Unsuitable for Production)*
- **Unified Sign-In** (`/login` — `/admin/login` redirects to `/login`):
  - **Customer**: `customer@envy-demo.test` / `EnvyCustomer2026!`
  - **Admin**: `admin@envy-demo.test` / `EnvyDemo2026!`

### Customer Routes
| Route | Description |
| :--- | :--- |
| `/` | Home page (hero banner, category links, featured products, fictional demo footer) |
| `/products` | Product listing with combined search, category filter, and price sorting |
| `/products/:id` | Product details, stock status, quantity selector, and up to 3 related active products |
| `/cart` | Persistent shopping cart with duplicate-item merging and safe PHP calculations |
| `/login` & `/register` | Unified customer/admin sign-in and customer account registration |
| `/checkout` | Authenticated customer checkout form with validation, live price/stock recheck, and submit lock |
| `/order-confirmation` | Order summary with unique order number and initial `Pending` status |
| `/orders` | Customer order history & live status tracker (for signed-in customers) |

### Admin Routes *(Protected — Redirects to `/login` when unauthenticated)*
| Route | Description |
| :--- | :--- |
| `/admin/login` | Redirects to unified `/login` screen |
| `/admin` | Overview dashboard (5 KPI summary cards) |
| `/admin/products` | Product CRUD, filters, and order-reference delete guard ("Mark Inactive Instead") |
| `/admin/categories` | Category CRUD with case-insensitive uniqueness and assigned-product delete block |
| `/admin/orders` | Orders list sorted newest-first |
| `/admin/orders/:id` | Order details with snapshots and strict status workflow controls |
| `/admin/customers` | Read-only customer summary derived from orders (normalized email) |

---

## System-Flow & Data-Model Summary

### Database Schema (`PostgreSQL`)
- `categories` (`id`, `name` with case-insensitive unique index)
- `products` (`id`, `category_id` FK `RESTRICT`, `name`, `slug`, `description`, `price NUMERIC(10,2) > 0`, `stock_quantity >= 0`, `image_url`, `is_active`)
- `orders` (`id`, `order_number`, `customer_name`, `customer_email`, `customer_contact`, `delivery_address`, `payment_method`, `order_notes`, `status`, `subtotal`, `total`, `stock_restored`)
- `order_items` (`id`, `order_id` FK `CASCADE`, `product_id` FK `RESTRICT`, `product_name_snapshot`, `unit_price_snapshot`, `quantity`, `line_total`)
- `users` & `personal_access_tokens` (Sanctum demo admin auth)

### Order Lifecycle
1. Customer submits checkout → `CheckoutService` locks products (`lockForUpdate`), verifies active status + live price + stock (`409` on change), creates `Order` (`Pending`) + `OrderItem` snapshots, and decrements stock atomically.
2. Admin advances status strictly along: `Pending → Confirmed → Preparing → Shipped → Completed`.
3. Cancellation is permitted only from `Pending` or `Confirmed`, restoring stock **exactly once** (`stock_restored = true`). `Completed` and `Cancelled` are final.

---

## Scope Notes & AI Disclosure

- **Single-SKU Clothing Products**: Each ENVY apparel item tracks one `stock_quantity` (size/color variant matrices were omitted to align cleanly with the assessment's data model and 15–20 hour scope).
- **AI Assistance Disclosure**: Built with AI coding assistance (Google Antigravity) for scaffolding, test generation, code review, and documentation, with all code reviewed, tested (`php artisan test`, `npm run lint`, `npm run build`).
