# SeedSanskriti — Frontend

A complete React 19 (JavaScript, no TypeScript) frontend for the SeedSanskriti Spring Boot
backend — a marketplace for vegetable, fruit, flower and grain seeds, saplings and buds.

## Stack

- React 19 + Vite
- React Router DOM v6
- Axios (with JWT interceptor + centralized error handling)
- Bootstrap 5 + Bootstrap Icons (custom "seed & soil" theme via CSS variables)
- Context API for auth, cart, and toast notifications
- JWT stored in `localStorage`, attached automatically to every request

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000` by default (see `vite.config.js`).

### Backend URL

Configured via the `VITE_API_BASE_URL` environment variable (see `.env`):

```
VITE_API_BASE_URL=http://localhost:8080/api
```

Point this at wherever your Spring Boot backend is running. Make sure the backend's CORS
configuration allows requests from the frontend's origin (`http://localhost:3000` in dev).

## Project structure

```
src/
 ├── assets/            static assets
 ├── components/
 │   ├── auth/           route guards (Protected/Role/Guest)
 │   ├── common/          Navbar, Footer, Sidebar, DataTable, Modal, Pagination, etc.
 │   └── product/        ProductCard, ProductFilters, ProductForm
 ├── context/            AuthContext, CartContext, ToastContext
 ├── hooks/               useAuth, useCart, useToast, useDebounce, useConfirm, useApi
 ├── layouts/             MainLayout + role-specific dashboard layouts
 ├── pages/
 │   ├── public/          Home, About, Contact, Products, ProductDetails, auth pages
 │   ├── customer/        Dashboard, Profile, Cart, Checkout, Orders, Wishlist, etc.
 │   ├── supplier/        Dashboard, MyProducts, Add/EditProduct, OrdersReceived, etc.
 │   └── admin/           Dashboard + all management pages, Reports
 ├── routes/              AppRoutes.jsx (all route definitions)
 ├── services/            one file per backend controller (Axios calls)
 ├── styles/              theme.css (Bootstrap variable overrides)
 └── utils/               constants.js (enums mirrored from backend), formatters.js
```

## Authentication notes

- `POST /api/auth/login` returns the **raw JWT string** as the response body (not JSON). The
  frontend stores it directly and then calls `GET /api/users/me` to hydrate the user's profile
  and role, since the token itself does not carry role information.
- The token is attached to every request via an Axios request interceptor.
- A response interceptor centralizes handling of 401 (forces logout + redirect to `/login`),
  403 (redirect to `/unauthorized`), 404, and 500 errors, and normalizes the backend's two error
  shapes (`ApiErrorResponse` and field-validation maps) into a single `{ message, fieldErrors }`
  shape used throughout the UI.
- Role-based routing is enforced via `<RoleRoute allowedRoles={[...]} />`; pages outside a
  user's role redirect to `/unauthorized`.

## Notes on backend coverage

Every endpoint exposed by the backend (Auth, Users, Products, Cart, Orders, Payments,
Deliveries, Wishlist, Reviews, Supplier, Admin) has a corresponding function in `src/services/`.
A couple of pages are intentionally read-only or computed client-side because the backend does
not expose a corresponding write/list endpoint:

- **Category Management** (admin): categories are a fixed backend enum with no CRUD endpoint, so
  this page shows the taxonomy with live product counts per category.
- **Payment Management** (admin): the backend has no payment-status update endpoint, so this page
  is view-only.
- **Admin dashboard "recent" panels**: `DashboardStatsResponse` only returns aggregate counts, so
  recent orders/payments/deliveries are derived by fetching and sorting the full admin lists.
