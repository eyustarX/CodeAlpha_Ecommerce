# Alpha Store 🛒

A full-stack, production-grade e-commerce application built with **Node.js, Express.js, PostgreSQL, Prisma ORM, and Vanilla JavaScript**, developed as part of the **CodeAlpha Full Stack Development Internship (Task 1)**.

![Status](https://img.shields.io/badge/Status-Completed-success)
![Node](https://img.shields.io/badge/Node.js-v20+-green)
![Express](https://img.shields.io/badge/Express-5.x-lightgrey)
![Database](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-blue)
![ORM](https://img.shields.io/badge/Prisma-6.x-indigo)
![Tests](https://img.shields.io/badge/Tests-8%2F8_Passing-brightgreen)

---

## 🌟 Highlights & Key Engineering Decisions

- **Layered Clean Architecture**: Strict separation of concerns across Routes, Controllers, Services, Middleware, and Database configuration.
- **Relational Integrity with Prisma**: Strong relational constraints, cascade rules, and schema migrations on cloud PostgreSQL.
- **ACID Transactional Checkout**: Uses `prisma.$transaction()` to guarantee that stock verification, line item creation with historical price snapshots, inventory deduction, and cart clearing either all succeed together or roll back atomically.
- **Historical Price Snapshotting**: `OrderItem` stores the product price at the exact moment of checkout, preventing past receipts from being altered by future price edits.
- **Production-Ready Security & RBAC**: Password hashing via `bcryptjs` (10 rounds), stateless JWT issuance/verification, and Role-Based Access Control (`CUSTOMER` vs `ADMIN`).
- **Comprehensive Automated Testing**: 8 integration test suites powered by **Jest** and **Supertest** covering health checks, product pagination, registration uniqueness, JWT login, and authorization guards.

---

## 🏗️ System Architecture

```
                  BROWSER / CLIENT
    ┌───────────────────────────────────────────────┐
    │  HTML5 + Modern CSS + Vanilla JavaScript      │
    │  (Fetch API, Token Persistence, Responsive UI)│
    └───────────────────────┬───────────────────────┘
                            │ HTTP / JSON REST APIs
                            ▼
                  EXPRESS.JS REST API
    ┌───────────────────────────────────────────────┐
    │  • CORS & Body Parsing Middleware             │
    │  • JWT Auth & RBAC Authorization Middleware   │
    │  • Centralized Error & 404 Handlers           │
    │  • REST Controllers (Input sanitization)      │
    │  • Services Layer (ACID Transactions)         │
    └───────────────────────┬───────────────────────┘
                            │ Prisma Client (Singleton)
                            ▼
                 POSTGRESQL (NEON CLOUD)
    ┌───────────────────────────────────────────────┐
    │  Tables: users, products, cart_items, orders, │
    │          order_items                          │
    └───────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Relationships

- **User (1 : N) Order**: Customers can place multiple orders.
- **User (1 : N) CartItem**: Database-backed cart persists across client devices and sessions.
- **Product (1 : N) CartItem**: Tracks added items with inventory caps.
- **Order (1 : N) OrderItem**: Each order captures multiple purchased items.
- **OrderItem**: Records `price` snapshot at time of purchase.

---

## 🚀 REST API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new customer or admin |
| `POST` | `/api/v1/auth/login` | Public | Authenticate credentials & return JWT |
| `GET` | `/api/v1/auth/me` | Protected | Fetch authenticated user profile |

### Products (`/api/v1/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/products` | Public | List products (search, category filter, pagination) |
| `GET` | `/api/v1/products/:id` | Public | Get single product details |
| `POST` | `/api/v1/products` | Admin | Create product |
| `PUT` | `/api/v1/products/:id` | Admin | Update product details & inventory |
| `DELETE` | `/api/v1/products/:id` | Admin | Delete product |

### Cart (`/api/v1/cart`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/cart` | Protected | View user's cart with subtotal |
| `POST` | `/api/v1/cart/items` | Protected | Add product or increment quantity |
| `PATCH` | `/api/v1/cart/items/:id` | Protected | Modify line item quantity |
| `DELETE` | `/api/v1/cart/items/:id` | Protected | Remove item from cart |
| `DELETE` | `/api/v1/cart` | Protected | Clear entire cart |

### Orders (`/api/v1/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/orders` | Protected | Checkout cart inside atomic transaction |
| `GET` | `/api/v1/orders` | Protected | Get order history (or all orders for Admin) |
| `GET` | `/api/v1/orders/:id` | Protected | Get individual order breakdown |
| `PATCH` | `/api/v1/orders/:id/status` | Admin | Transition status (`PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |

---

## 💻 Local Setup & Installation

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **Git**
- **PostgreSQL** (Local instance or free [Neon.tech](https://neon.tech) database)

### 2. Clone and Setup
```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/CodeAlpha_Ecommerce.git
cd CodeAlpha_Ecommerce/backend
npm install
```

### 3. Environment Configuration
Create a `.env` file inside `backend/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
JWT_SECRET="your_secure_jwt_secret_key"
```

### 4. Database Migration & Seeding
```bash
npx prisma migrate dev
npm run seed
```

### 5. Running the Application
```bash
# Start backend in development mode:
npm run dev

# Open frontend in your browser:
# Open CodeAlpha_Ecommerce/frontend/pages/index.html
```

### 6. Pre-seeded Demo Accounts
- **Customer Account**: `customer@alphastore.com` / `customer123`
- **Admin Account**: `admin@alphastore.com` / `admin123`

---

## 🧪 Automated Testing

Run the full integration test suite with Jest & Supertest:
```bash
cd backend
npm test
```
Result: **8/8 Passing Suites** (Verifying health, pagination, registration uniqueness, password authentication, JWT validation, 401 unauthorized protection, and 403 admin RBAC guards).

