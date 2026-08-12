# Fundsroom ERP + CRM.

## Project Overview

Mini ERP + CRM Operations Portal for a wholesale/distribution company. This full-stack application provides comprehensive tools for customer relationship management, inventory tracking, and sales challan management with role-based access control.

## Features

### Authentication & Authorization
- JWT-based authentication with secure password hashing
- Role-based access control with 4 roles: ADMIN, SALES, WAREHOUSE, ACCOUNTS
- Protected API routes and middleware
- Admin-only user registration

### Core Modules
- **Customers:** CRM with lead management, contact tracking, customer classification (RETAIL/WHOLESALE/DISTRIBUTOR), follow-up scheduling, and notes
- **Products:** Inventory management with SKU tracking, category organization, unit pricing, and low-stock alerts
- **Stock Movements:** IN/OUT inventory tracking with audit trail, reason logging, and movement history
- **Challans:** Sales challan creation with automatic numbering, draft/save/confirm/cancel workflow, multi-product support, and automatic stock movement on confirmation
- **Dashboard:** Real-time overview with KPIs including customer counts, product inventory, stock alerts, and challan status

### Security
- Bcrypt password hashing with salt rounds
- Secure JWT token generation and validation
- CORS configuration for local development
- Environment variable management for sensitive data
- API-level authorization enforcement

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- React Router 7 for routing
- Axios for API communication
- CSS Modules for styling

### Backend
- Node.js with TypeScript
- Express 5 for REST API
- Prisma 7 ORM with PostgreSQL
- JWT for authentication
- Zod for input validation
- Bcrypt for password hashing

### Database
- PostgreSQL 14+
- Prisma migrations
- Relational schema with proper foreign keys

## Architecture

The application follows a traditional three-tier architecture:

**Frontend Layer:** React SPA with client-side routing and state management via Context API

**Backend Layer:** Express REST API with middleware for authentication, authorization, validation, and error handling

**Data Layer:** PostgreSQL database managed through Prisma ORM with type-safe queries

**Key Design Decisions:**
- JWT tokens stored in localStorage for simplicity (production should use httpOnly cookies)
- API-level authorization as source of truth
- Frontend role-based navigation for UX improvement
- Automatic stock movement generation on challan confirmation to maintain data integrity

## Project Structure

```
Fundsroom-ERP-CRM/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── config/                # Configuration (database, env)
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/            # Auth, validation, error handling
│   │   ├── routes/                # API route definitions
│   │   ├── services/              # Business logic
│   │   ├── types/                 # TypeScript types
│   │   ├── utils/                 # Validation schemas
│   │   └── server.ts              # Express app entry
│   ├── .env                       # Environment variables (not committed)
│   ├── .env.example               # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                   # Axios client setup
│   │   ├── components/            # Reusable components (Layout)
│   │   ├── context/               # AuthContext for state
│   │   ├── pages/                 # Page components
│   │   ├── types/                 # TypeScript types
│   │   └── App.tsx                # React entry
│   ├── public/
│   └── package.json
├── postman/
│   └── Fundsroom-ERP-CRM.postman_collection.json
├── .gitignore
├── package.json                   # Root package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+
- Git (for version control)

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/fundsroom_erp?schema=public
PORT=5000
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

**Important:** Never commit `.env` files. Use `.env.example` as a template.

## Database Setup

1. **Create PostgreSQL database:**
```bash
createdb fundsroom_erp
```

2. **Configure environment:**
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

3. **Run migrations:**
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

4. **The database schema includes:**
- Users (with roles)
- Customers (with types and status)
- Products (with stock tracking)
- Stock Movements (with audit trail)
- Challans (with items and status)

## Backend Setup

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The API runs at `http://localhost:5000`

Health check: `GET http://localhost:5000/api/health`

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`

## Running Locally

### Quick Start (both servers)
```bash
# From project root
npm install
npm run dev
```

### Individual Servers
```bash
# Backend only
cd backend
npm run dev

# Frontend only
cd frontend
npm run dev
```

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start with Docker

1. **Create environment file:**
```bash
cp .env.docker.example .env
# Edit .env with your production values
```

2. **Start all services:**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Backend API on port 5001 (5000 is used for local development)
- Frontend on port 80

Access the application at `http://localhost`

**Note:** Docker uses port 5001 for the backend to avoid conflicts with local development (which uses port 5000). If you don't have local development running, you can change the backend port to 5000 in docker-compose.yml.

### Docker Commands

**Start services:**
```bash
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**Stop and remove volumes (deletes database):**
```bash
docker-compose down -v
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

**Rebuild services:**
```bash
docker-compose up -d --build
```

**Run database migrations in Docker:**
```bash
docker-compose exec backend npx prisma migrate deploy
```

**Access backend container:**
```bash
docker-compose exec backend sh
```

**Access PostgreSQL:**
```bash
docker-compose exec postgres psql -U fundsroom -d fundsroom_erp
```

### Docker Environment Variables

Create a `.env` file in the project root with:

```bash
# PostgreSQL
POSTGRES_USER=fundsroom
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_DB=fundsroom_erp

# Backend
JWT_SECRET=your_64_char_hex_secret_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost

# Frontend
VITE_API_BASE_URL=http://localhost:5000/api
```

**Important:** Never commit the `.env` file. Use `.env.docker.example` as a template.

### Docker Architecture

- **PostgreSQL:** Official PostgreSQL 15 Alpine image with persistent volume
- **Backend:** Multi-stage build (build + production) with Node.js 18 Alpine
- **Frontend:** Multi-stage build (build + nginx) serving static files
- **Network:** Bridge network for service communication
- **Health Checks:** All services have health checks for monitoring

### Database Persistence

PostgreSQL data is persisted in a Docker volume named `postgres_data`. This volume survives container restarts but is removed with `docker-compose down -v`.

### Migrations in Docker

When starting with Docker for the first time:

1. The backend container runs Prisma migrations automatically on startup
2. The database schema is created from `backend/prisma/schema.prisma`
3. No seed data is included - you'll need to create initial data manually or via API

## Development Scripts

| Location   | Command              | Description              |
|------------|----------------------|--------------------------|
| root       | `npm run dev`        | Start both backend and frontend |
| backend    | `npm run dev`        | Start API with hot reload |
| backend    | `npm run build`      | Compile TypeScript       |
| backend    | `npm run prisma:generate` | Generate Prisma client |
| backend    | `npm run prisma:migrate` | Run database migrations |
| frontend   | `npm run dev`        | Start Vite dev server    |
| frontend   | `npm run build`      | Production build         |

## Demo/Test Credentials

**For local development and testing only:**

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| ADMIN | admin@test.com | TempPassword123! | Full access to all modules and user management |
| SALES | sales@test.com | SalesPass123! | Customers (CRUD), Products (view), Challans (create/view/update/cancel) |
| WAREHOUSE | warehouse@test.com | WarehousePass123! | Products (CRUD), Stock movements (create/view), Challans (view/confirm) |
| ACCOUNTS | accounts@test.com | AccountsPass123! | Customers (view), Products (view), Challans (view) |

**Important:** These are temporary demo credentials. Change passwords before production deployment.

## API Overview

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (ADMIN only)
- `GET /api/auth/me` - Get current user
- `GET /api/auth/admin-check` - Admin access check

### Customers
- `GET /api/customers` - List customers (with search/filter/pagination)
- `POST /api/customers` - Create customer (ADMIN, SALES)
- `GET /api/customers/:id` - Get customer details (ADMIN, SALES, ACCOUNTS)
- `PUT /api/customers/:id` - Update customer (ADMIN, SALES)
- `DELETE /api/customers/:id` - Delete customer (ADMIN only)

### Products
- `GET /api/products` - List products (with search/filter/pagination)
- `POST /api/products` - Create product (ADMIN, WAREHOUSE)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product (ADMIN, WAREHOUSE)

### Stock Movements
- `GET /api/stock-movements` - List movements (with search/filter/pagination)
- `POST /api/stock-movements` - Create movement (ADMIN, WAREHOUSE)

### Challans
- `GET /api/challans` - List challans (with search/filter/pagination)
- `POST /api/challans` - Create draft challan (ADMIN, SALES)
- `GET /api/challans/:id` - Get challan details
- `PUT /api/challans/:id` - Update draft challan (ADMIN, SALES)
- `POST /api/challans/:id/confirm` - Confirm challan (ADMIN, WAREHOUSE)
- `POST /api/challans/:id/cancel` - Cancel challan (ADMIN, SALES)

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard KPIs (all authenticated roles)

**API Base URL:** `http://localhost:5000/api`

**Authentication:** Include `Authorization: Bearer <token>` header for protected routes

## Deployment

### Intended Deployment Architecture

**Option 1: Docker Compose (Recommended for Development/Testing)**
- Full-stack deployment with Docker Compose
- PostgreSQL, Backend, and Frontend in containers
- Single command deployment
- Persistent database volumes
- Ideal for development, testing, and on-premises deployment

**Option 2: Cloud Hosting (Production)**
- Backend: Node.js hosting (Vercel, Render, Railway, or similar)
- PostgreSQL database (supabase, Railway, AWS RDS, or similar)
- Frontend: Static hosting (Vercel, Netlify, or similar)
- Environment variables configured via hosting platform
- Production builds with `npm run build`

**Current Status:**
This application supports both Docker Compose deployment and traditional cloud hosting. Choose the deployment method based on your requirements:

- **Docker Compose:** Quick setup, ideal for development/testing, on-premises
- **Cloud Hosting:** Scalable, managed services, ideal for production

**Docker Deployment Steps:**
1. Copy `.env.docker.example` to `.env` and configure values
2. Run `docker-compose up -d`
3. Access application at `http://localhost`

**Cloud Deployment Steps:**
1. Create production PostgreSQL database
2. Set environment variables on hosting platform
3. Deploy backend with `npm run build && npm start`
4. Deploy frontend with `npm run build`
5. Run database migrations on production database
6. Configure CORS for production domain
7. Update frontend API base URL for production

## Assumptions

1. **Local Development:** The application supports both local development (npm) and Docker deployment. Docker does not interfere with local npm-based development.

2. **Single Organization:** The application assumes a single organization/tenant model without multi-tenancy requirements.

3. **Synchronous Operations:** All database operations are synchronous; async job queues are not implemented for bulk operations.

4. **JWT Storage:** JWT tokens are stored in localStorage for simplicity. Production should use httpOnly cookies for enhanced security.

5. **Time Zone:** All timestamps use the database server's time zone. Time zone conversion is not implemented.

6. **Currency:** All monetary values are in a single currency (INR implied). Multi-currency support is not implemented.

7. **File Uploads:** The application does not support file uploads (e.g., customer documents, product images).

8. **Email Notifications:** Email notifications for follow-ups or alerts are not implemented.

9. **Audit Trail:** While stock movements have audit trails, comprehensive audit logging for all operations is not implemented.

10. **Data Export:** CSV/PDF export functionality is not implemented.

## Known Limitations

1. **Frontend Route Access:** Frontend routes show CRUD forms to all authenticated users. While API-level authorization properly rejects unauthorized requests, users can access form pages via direct URL. This is a UX limitation, not a security issue.

2. **No Seed File:** Database seeding is not automated. Demo data must be created manually or via custom scripts.

3. **No Postman Collection:** API testing must be done manually or via custom tools (Postman collection is recommended but not included).

4. **No API Rate Limiting:** The API does not implement rate limiting for protection against abuse.

5. **No Request Logging:** Request/response logging for debugging and monitoring is not implemented.

6. **No Database Backups:** Automated database backup mechanisms are not included.

7. **Soft Deletes:** The application uses hard deletes. Soft delete functionality is not implemented.

8. **Validation:** Form validation exists but may not cover all edge cases. Additional validation may be needed for production.

9. **Error Handling:** While centralized error handling exists, some edge cases may return generic error messages.

10. **Concurrent Updates:** The application does not implement optimistic locking or conflict resolution for concurrent updates.

## Business Logic Notes

### Challan Confirmation Flow
When a challan is confirmed:
1. System validates sufficient stock exists for all items
2. Product stock is decremented by item quantities
3. StockMovement records are automatically created with type OUT
4. Challan status changes to CONFIRMED
5. Cannot confirm already confirmed or cancelled challans
6. Cannot confirm challans with no items

### Stock Movement Logic
- Stock movements are created manually via API or automatically on challan confirmation
- IN movements increase product stock
- OUT movements decrease product stock
- Stock cannot go negative (validation prevents this)
- Movement history is maintained for audit trail

### Customer Management
- Customers can be LEAD, ACTIVE, or INACTIVE
- Customer types: RETAIL, WHOLESALE, DISTRIBUTOR
- Follow-up dates and notes are optional
- Mobile number is unique and required

### Product Inventory
- SKU must be unique
- Current stock defaults to 0
- Minimum stock alert quantity triggers low-stock warnings
- Stock can be updated manually or via movements/challans

### Role-Based Access
- ADMIN: Full access including user management
- SALES: Customer CRUD, product view, challan create/edit/cancel
- WAREHOUSE: Product CRUD, stock movements, challan view/confirm
- ACCOUNTS: Read-only access to customers, products, and challans

### Password Security
- Passwords are hashed with bcrypt (12 salt rounds)
- JWT tokens expire after 7 days (configurable)
- Password reset functionality is not implemented
