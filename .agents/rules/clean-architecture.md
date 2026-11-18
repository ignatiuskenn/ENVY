# ENVY E-Commerce — Clean Architecture & Engineering Rules

These rules apply to all code written in `frontend/` (React + Vite + Tailwind CSS) and `backend/` (Laravel 13 + Sanctum + PostgreSQL 18). Follow them as **broad engineering principles**—never as a closed list of filenames—so the codebase stays clean, readable, and easy to explain during review.

---

## Rule 1: Check Before Creating (Reuse First, Zero Duplication)
1. **Consult the Knowledge Graph & Existing Code First:**
   - Before creating any new file, component, hook, service, request, or utility, check `graphify-out/GRAPH_REPORT.md` (or run `graphify query`) and search `frontend/src/` or `backend/app/` to see if something similar already exists.
2. **Extend Instead of Duplicating:**
   - Reuse and cleanly extend shared UI primitives, currency/date formatters, API clients, and backend services rather than copying logic across files.
3. **Avoid Over-Engineering:**
   - Keep abstractions simple and traceable (e.g., use Eloquent directly inside Services/Controllers without adding unnecessary Repository layers).

---

## Rule 2: Folder Organization & Clear Responsibilities
Every file belongs in the layer that matches its job (examples below are illustrative, not an exhaustive file list):

### A. Frontend (`frontend/src/`)
- **`pages/`** — Route-level views (e.g., customer storefront/checkout and admin screens). Coordinate data hooks/context and layout.
- **`components/`** — Reusable UI building blocks (`components/ui/` for generic primitives like buttons, modals, badges, empty states; `components/shared/` for domain pieces like product cards, navbars, status badges).
- **`data/`** — All network calls, client state, and browser persistence (`data/api/` for HTTP requests, `data/context/` or `data/stores/` for cart/auth state, `data/storage/` for `localStorage` wrappers).
- **`hooks/`** — Reusable non-API UI/utility hooks (e.g., debouncing, media/viewport helpers).
- **`constants/`** — Centralized config readers and domain constants (e.g., order statuses, payment methods, API base URL).
- **`utils/`** — Pure, stateless helpers (e.g., peso currency formatting, safe centavo math, input validators).

### B. Backend (`backend/app/`)
- **`Http/Controllers/`** — Thin HTTP handlers: accept validated requests, delegate multi-step logic to `Services/`, and return JSON responses.
- **`Http/Requests/`** — Laravel `FormRequest` classes for server-side input validation.
- **`Http/Resources/`** — API response transformers when shaping model payloads.
- **`Services/`** — Multi-step business rules, database transactions, stock locking/restoration, state-machine checks, and dashboard aggregations.
- **`Models/`** — Eloquent models, relationships, casts, and simple query scopes.

---

## Rule 3: One Job Per File (Single Responsibility Principle)
1. **Single Purpose:** Every file should have one clear reason to change. Do not mix API transport, business rules, and UI rendering in the same file.
2. **One Primary Export & Consistent Naming:**
   - `frontend/`: `PascalCase.jsx` for React components/pages, `camelCase.js` for utilities, hooks, and API modules.
   - `backend/`: PSR-4 `PascalCase.php` matching the class name.
3. **Natural Modularity:** Split a file only when it genuinely handles multiple distinct responsibilities—never chop a cohesive unit into fragments just to chase a line count.

---

## Rule 4: Strict Layer Separation (No Leaky Layers)
1. **Frontend UI Never Touches Network or Storage Directly:**
   - Files in `pages/` and `components/` must **not** call `fetch()`, `axios`, or `localStorage` directly. Route all API calls and persistence through `src/data/`.
   - Reusable components should stay data-agnostic where practical: receive data via `props` and emit actions via callbacks.
2. **Backend Controllers Stay Thin:**
   - Controllers must **not** contain raw `DB::transaction()` blocks, `lockForUpdate()` queries, order state-machine rules, or complex aggregations. Delegate all multi-step and transactional logic to `App\Services\*`.

---

## Rule 5: Zero Hardcoded Magic Values, Safe Money Math & Secret Hygiene
1. **Centralized Config & Domain Constants:**
   - Never hardcode API base URLs, environment flags, or magic domain strings (such as order statuses or payment method names) inline across components or controllers. Read infrastructure values from `.env` (`VITE_API_URL`, Laravel `config/`) and keep domain constants in `constants/` / PHP enums or constants.
2. **Safe Money Calculations:**
   - Always format prices and totals to 2 decimal places (`PHP 0.00`).
   - Perform arithmetic safely (integer centavos on the frontend; `NUMERIC(10, 2)` / exact decimal math on the backend) to prevent floating-point rounding errors.
3. **Secrets & Demo Credentials Hygiene:**
   - Never commit real secrets, API keys, or `.env` files. Keep any demo admin credentials clearly labeled as demo-only and unsuitable for production.

---

## Rule 6: Authoritative Server Validation, Transactions & Snapshots
1. **Server Is the Source of Truth:**
   - Client-side validation is for UX only. Every backend write endpoint must validate inputs with a Laravel `FormRequest` and compute authoritative prices, totals, and stock availability from PostgreSQL.
2. **Atomic Transactions & Stock Integrity:**
   - Multi-write operations (placing an order and deducting stock; cancelling an eligible order and restoring stock once) must run inside a single `DB::transaction()` with row locking where needed.
   - Preserve the cart on failed checkout; clear it only after a confirmed save.
3. **Historical Order Snapshots:**
   - Order line items must store a snapshot of product name and unit price at purchase time so later product edits never alter existing orders.

---

## Rule 7: All 4 UI States & Mobile-First Responsiveness
1. **Handle All 4 Data States:** Every data-driven screen must explicitly render:
   - **Loading:** Clean spinner or skeleton state.
   - **Empty:** Helpful empty state when a list or search/filter returns `0` items.
   - **Error:** Clear, human-readable error message with a retry path (without losing user input or cart state).
   - **Success:** Cleanly rendered data.
2. **Responsive Layouts (~375px Mobile & ~1280px Desktop):**
   - Design mobile-first using Tailwind responsive utilities so both customer and admin screens render cleanly without clipped controls, horizontal page scrolling, or broken tables/grids.

---

## Rule 8: Feature Branches, Atomic Save Points, Graphify Sync & Plain-English Guidance
1. **Protect `main`:** Develop features and fixes on descriptive branches (`feat/<name>`, `fix/<name>`, `docs/<name>`).
2. **Atomic Save Points:** Commit working, verified increments frequently using Conventional Commits (`feat: ...`, `fix: ...`, `docs: ...`).
3. **Verify & Sync Before Committing:**
   - Run relevant checks (`npm run lint` / `npm run build` in `frontend/`, `php artisan test` in `backend/`) before committing.
   - Run `graphify update .` (using the saved interpreter in `graphify-out/.graphify_python`) after modifying code files so `graphify-out/` stays current.
4. **Plain-English Git Updates:** Whenever creating a branch, committing a save point, or merging, briefly explain in plain English what was saved and how to roll back if needed.
