# AlphaStore - Full-Stack E-Commerce Platform 🛒

[![Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)](https://github.com/eyustarX/Ecommerce)
[![Node](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tests](https://img.shields.io/badge/Jest-Passing-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

A production-grade, full-stack e-commerce web platform engineered with **Node.js, Express.js, PostgreSQL (Neon Serverless), Prisma ORM v6, and modern Vanilla JavaScript**. Designed with clean layered architecture, ACID-compliant transactional checkout, historical price snapshotting, and Role-Based Access Control (RBAC).

---

## 🌟 Key Highlights & Engineering Highlights

- **Layered Clean Architecture**: Strict separation of concerns across Routes, Controllers, Services, Middleware, and Database configuration.
- **ACID Transactional Checkout**: Utilizes `prisma.$transaction()` to guarantee that stock availability validation, line item generation with historical price snapshots, inventory deduction, and cart clearing either commit atomically or roll back completely.
- **Historical Price Snapshotting**: The `OrderItem` model freezes the unit price at the exact moment of order placement, ensuring past receipts and billing records are impervious to future product price updates.
- **Persistent Cart Engine**: Database-backed cart items linked to user accounts, enabling seamless continuity across devices and sessions.
- **Enterprise-Grade Security & RBAC**: Salted password hashing via `bcryptjs` (10 rounds), stateless JWT authorization, and strict Role-Based Access Control distinguishing `CUSTOMER` from `ADMIN`.
- **Automated Integration Testing**: 8 integration test suites powered by **Jest** and **Supertest** validating authentication, catalog pagination, cart mutations, and checkout guards.

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
                              │ Prisma Client v6 (Singleton)
                              ▼
                   POSTGRESQL (NEON CLOUD)
      ┌───────────────────────────────────────────────┐
      │  Tables: users, products, cart_items, orders, │
      │          order_items                          │
      └───────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Relational Model

```mermaid
erDiagram
    USER ||--o{ ORDER : "places"
    USER ||--o{ CART_ITEM : "maintains"
    PRODUCT ||--o{ CART_ITEM : "referenced in"
    PRODUCT ||--o{ ORDER_ITEM : "purchased as"
    ORDER ||--o{ ORDER_ITEM : "contains"

    USER {
        uuid id PK
        string name
        string email UK
        string passwordHash
        enum role "CUSTOMER | ADMIN"
        datetime createdAt
    }

    PRODUCT {
        uuid id PK
        string title
        string description
        decimal price
        int stock
        string category
        string imageUrl
        datetime createdAt
    }

    CART_ITEM {
        uuid id PK
        uuid userId FK
        uuid productId FK
        int quantity
        datetime createdAt
    }

    ORDER {
        uuid id PK
        uuid userId FK
        decimal totalAmount
        enum status "PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED"
        datetime createdAt
    }

    ORDER_ITEM {
        uuid id PK
        uuid orderId FK
        uuid productId FK
        int quantity
        decimal priceSnapshot
        datetime createdAt
    }
```

---

## 📡 REST API Reference

All routes are mounted under the `/api/v1` namespace.

### 1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register a new customer or administrator |
| `POST` | `/api/v1/auth/login` | Public | Authenticate credentials & receive JWT |
| `GET` | `/api/v1/auth/me` | Protected | Retrieve authenticated user profile |

### 2. Product Catalog (`/api/v1/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/products` | Public | List products with search, category filtering & pagination |
| `GET` | `/api/v1/products/:id` | Public | Retrieve single product specifications |
| `POST` | `/api/v1/products` | Admin | Create product listing with initial inventory |
| `PUT` | `/api/v1/products/:id` | Admin | Update product details, pricing & stock |
| `DELETE` | `/api/v1/products/:id` | Admin | Delete product from catalog |

### 3. Shopping Cart (`/api/v1/cart`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/cart` | Protected | Retrieve user's cart with live subtotal calculation |
| `POST` | `/api/v1/cart/items` | Protected | Add item to cart or increment quantity |
| `PATCH` | `/api/v1/cart/items/:id` | Protected | Update item quantity |
| `DELETE` | `/api/v1/cart/items/:id` | Protected | Remove item from cart |
| `DELETE` | `/api/v1/cart` | Protected | Clear entire active cart |

### 4. Orders & Checkout (`/api/v1/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/orders` | Protected | Execute atomic checkout transaction |
| `GET` | `/api/v1/orders` | Protected | Fetch user order history (or all orders for Admin) |
| `GET` | `/api/v1/orders/:id` | Protected | Get detailed order receipt with price snapshots |
| `PATCH` | `/api/v1/orders/:id/status` | Admin | Transition status (`PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |

---

## 💻 Local Setup & Installation

### 1. Prerequisites
- **Node.js** (v18.x or v20.x+)
- **PostgreSQL** (Local instance or free [Neon](https://neon.tech) cloud account)
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/eyustarX/Ecommerce.git
cd Ecommerce/backend
npm install
```

### 3. Environment Variables
Create a `.env` file inside `backend/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@ep-host.region.neon.tech/neondb?sslmode=require"
JWT_SECRET="your_secure_jwt_secret_key"
```

### 4. Database Migration & Seeding
```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

### 5. Running the Application
```bash
# Start backend API server:
npm run dev

# Open frontend in your browser:
# Navigate to Ecommerce/frontend/pages/index.html (via Live Server or static server)
```

### 6. Pre-seeded Demo Credentials
- **Customer**: `customer@alphastore.com` / `customer123`
- **Admin**: `admin@alphastore.com` / `admin123`

---

## 🧪 Automated Testing

Execute the end-to-end integration test suite powered by **Jest** and **Supertest**:
```bash
cd backend
npm test
```
All **8 test suites** validate health endpoints, catalog pagination, unique email constraints, password encryption, JWT validation, 401 unauthorized guards, and 403 admin RBAC access controls.

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).
