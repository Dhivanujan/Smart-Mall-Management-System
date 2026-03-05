# Smart Mall Management System

A full-scale enterprise-style web platform that digitizes and optimizes shopping mall operations using **FastAPI** + **React**. A real-time, multi-role SaaS system with WebSocket support.

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Backend  | Python 3.10+, FastAPI, Pydantic, Uvicorn      |
| Frontend | React 18, TypeScript, Vite, React Router v6   |
| Auth     | JWT (python-jose), Passlib (bcrypt)            |
| HTTP     | Axios                                         |
| Infra    | Docker Compose                                |

## Project Structure

```
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── api/v1/
│   │   │   ├── admin/routes.py      # Admin management endpoints
│   │   │   ├── auth/routes.py       # Login / registration
│   │   │   ├── queues/routes.py     # Queue management
│   │   │   └── stores/routes.py     # Store CRUD
│   │   ├── auth/
│   │   │   ├── schemas/             # Token & user schemas
│   │   │   └── services/            # Security & user services
│   │   ├── core/
│   │   │   ├── config/              # App settings
│   │   │   └── logging/             # Logging setup
│   │   └── websocket/
│   │       ├── managers/queues.py   # WebSocket connection manager
│   │       └── routes/queues.py     # WebSocket endpoints
│   └── tests/unit/
│       └── test_health_endpoints.py
└── frontend/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── app/
        │   ├── providers/AuthProvider.tsx
        │   └── routing/              # AppRoutes & ProtectedRoute
        ├── components/layout/DashboardLayout.tsx
        ├── features/
        │   ├── auth/LoginPage.tsx
        │   ├── customer/             # MallOverview & StoreDetails
        │   ├── store-admin/          # AdminDashboard & AdminStores
        │   └── super-admin/          # Tenants, Admins, Dashboard
        ├── pages/                    # HomePage & NotFoundPage
        ├── services/api/client.ts    # Axios API client
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
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## API Endpoints

| Method | Path                          | Description           |
| ------ | ----------------------------- | --------------------- |
| GET    | `/api/v1/health`              | Health check          |
| POST   | `/api/v1/auth/login`          | User login            |
| POST   | `/api/v1/auth/register`       | User registration     |
| GET    | `/api/v1/stores`              | List stores           |
| GET    | `/api/v1/queues`              | List queues           |
| GET    | `/api/v1/admin/*`             | Admin management      |
| WS     | `/ws/queues/{store_id}`       | Real-time queue feed  |
