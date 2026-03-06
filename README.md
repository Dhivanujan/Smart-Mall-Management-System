# Smart Mall Management System

A full-scale enterprise-style web platform that digitizes and optimizes shopping mall operations using **FastAPI** + **React**. A real-time, multi-role SaaS system with WebSocket support.

## Tech Stack

| Layer      | Technology                                       |
| ---------- | ------------------------------------------------ |
| Backend    | Python 3.10+, FastAPI, Pydantic Settings, Uvicorn |
| Frontend   | React 18, TypeScript, Vite, React Router v6      |
| Auth       | JWT (python-jose), Passlib (bcrypt)              |
| HTTP       | Axios (with interceptors)                        |
| Linting    | Ruff (backend), TypeScript strict mode           |
| Testing    | Pytest + pytest-cov, Vitest                      |
| Infra      | Docker Compose                                   |

## Project Structure

```
├── .editorconfig                  # Editor formatting rules
├── .gitignore                     # Git ignore rules
├── docker-compose.yml             # Container orchestration
├── backend/
│   ├── .env.example               # Environment variable template
│   ├── Dockerfile
│   ├── pyproject.toml             # Dependencies, Ruff, Pytest config
│   ├── app/
│   │   ├── main.py                # FastAPI app factory (lifespan)
│   │   ├── models/                # Domain models (Pydantic + dataclass)
│   │   │   ├── queue.py           # Queue state machine
│   │   │   └── store.py           # Store & product schemas
│   │   ├── api/v1/
│   │   │   ├── admin/routes.py    # Admin management endpoints
│   │   │   ├── auth/routes.py     # Login / registration
│   │   │   ├── queues/routes.py   # Queue management
│   │   │   └── stores/routes.py   # Store CRUD
│   │   ├── auth/
│   │   │   ├── schemas/           # Token & user Pydantic schemas
│   │   │   └── services/          # Security (env-based JWT) & user services
│   │   ├── core/
│   │   │   ├── config/            # pydantic-settings based config
│   │   │   └── logging/           # Structured logging setup
│   │   └── websocket/
│   │       ├── managers/queues.py # WebSocket connection manager
│   │       └── routes/queues.py   # WebSocket endpoints
│   └── tests/
│       ├── conftest.py            # Shared test fixtures
│       └── unit/
│           ├── test_auth.py
│           ├── test_health_endpoints.py
│           └── test_stores.py
└── frontend/
    ├── .env.example               # Environment variable template
    ├── index.html
    ├── package.json
    ├── tsconfig.json              # TypeScript config with @/ path alias
    ├── vite.config.ts             # Vite config with path alias resolve
    └── src/
        ├── main.tsx
        ├── vite-env.d.ts          # Vite/env type declarations
        ├── types/index.ts         # Shared TypeScript interfaces
        ├── constants/navigation.ts # Shared navigation config
        ├── app/
        │   ├── providers/AuthProvider.tsx
        │   └── routing/           # AppRoutes & ProtectedRoute
        ├── components/layout/DashboardLayout.tsx
        ├── features/
        │   ├── auth/LoginPage.tsx
        │   ├── customer/          # MallOverview & StoreDetails
        │   ├── store-admin/       # AdminDashboard & AdminStores
        │   └── super-admin/       # Tenants, Admins, Dashboard
        ├── pages/                 # HomePage & NotFoundPage
        ├── services/api/client.ts # Axios client with interceptors
        └── styles/global.css
```

## User Roles

| Role          | Capabilities                                           |
| ------------- | ------------------------------------------------------ |
| Customer      | Browse mall, view stores and queue status               |
| Store Admin   | Manage own store, dashboard analytics, queue management |
| Super Admin   | Manage all tenants, admins, and system-wide dashboard   |

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 22+
- Docker & Docker Compose (optional)

### Environment Setup

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### Run with Docker

```bash
docker compose up --build
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

### Run Locally

**Backend:**

```bash
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Run Tests

```bash
# Backend (with coverage)
cd backend
pytest --cov

# Frontend
cd frontend
npm test
```

### Lint

```bash
# Backend
cd backend
ruff check .
ruff format .
```

## API Endpoints

| Method | Path                          | Description           |
| ------ | ----------------------------- | --------------------- |
| GET    | `/health`                     | Liveness check        |
| GET    | `/health/ready`               | Readiness check       |
| POST   | `/api/v1/auth/login`          | User login            |
| GET    | `/api/v1/auth/me`             | Current user profile  |
| GET    | `/api/v1/stores`              | List stores           |
| GET    | `/api/v1/stores/{id}`         | Store details         |
| GET    | `/api/v1/queues/{id}`         | Queue state           |
| POST   | `/api/v1/queues/{id}/join`    | Join a queue          |
| GET    | `/api/v1/admin/dashboard`     | Admin dashboard       |
| GET    | `/api/v1/admin/stores`        | Admin store list      |
| GET    | `/api/v1/admin/super/*`       | Super admin endpoints |
| WS     | `/ws/queues/{store_id}`       | Real-time queue feed  |

## Demo Credentials

| Role        | Email                     | Password  |
| ----------- | ------------------------- | --------- |
| Admin       | admin@example.com         | admin123  |
| Super Admin | superadmin@example.com    | super123  |
