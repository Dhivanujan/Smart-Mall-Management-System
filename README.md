# Smart Mall Management System

Smart Mall Management System is a full-stack platform for mall operations, customer engagement, and real-time services.

The project includes:
- JWT authentication and role-based authorization
- Customer, Admin, and Super Admin dashboards
- Store and product management
- Queue management with live WebSocket updates
- Parking reservation and administration
- Loyalty points and redemption
- Offers and redemption workflows
- Complaints and notifications
- Analytics for store and mall operations
- Extended modules for events, movies, favorites, discovery concierge, and lost-and-found

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Run with Docker Compose](#run-with-docker-compose)
- [Run Locally (Recommended for Development)](#run-locally-recommended-for-development)
- [Seed Data and Demo Credentials](#seed-data-and-demo-credentials)
- [API and WebSocket Overview](#api-and-websocket-overview)
- [Testing, Linting, and Build Commands](#testing-linting-and-build-commands)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Tech Stack

### Backend
- Python 3.10+
- FastAPI
- Pydantic + pydantic-settings
- MongoDB (Motor + Beanie)
- python-jose (JWT)
- bcrypt (password hashing)
- Uvicorn
- Pytest + pytest-cov
- Ruff

### Frontend
- React 18
- Vite
- React Router v6
- Axios
- Tailwind CSS
- Vitest

### Infrastructure
- Docker Compose
- MongoDB 7

## Architecture

- Frontend (Vite + React) consumes REST APIs from the backend.
- Backend (FastAPI) exposes APIs under /api/v1 and real-time queue updates over WebSocket.
- MongoDB stores all operational and user-domain data.
- On backend startup, database initialization runs and demo seed data is inserted when the user collection is empty.

Primary runtime endpoints:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- OpenAPI docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- MongoDB: mongodb://localhost:27017

## Repository Structure

```text
SmartMallManagementSystem/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── app/
│   │   ├── main.py
│   │   ├── api/v1/
│   │   │   ├── admin/
│   │   │   ├── analytics/
│   │   │   ├── auth/
│   │   │   ├── complaints/
│   │   │   ├── discovery/
│   │   │   ├── events/
│   │   │   ├── favorites/
│   │   │   ├── lost_found/
│   │   │   ├── loyalty/
│   │   │   ├── movies/
│   │   │   ├── notifications/
│   │   │   ├── offers/
│   │   │   ├── parking/
│   │   │   ├── queues/
│   │   │   ├── stores/
│   │   │   └── users/
│   │   ├── auth/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   └── websocket/
│   └── tests/
└── frontend/
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    └── src/
```

## Prerequisites

For local development:
- Python 3.10 or later
- Node.js 18 or later (Node 20+ or 22 recommended)
- npm
- MongoDB 7 (local install) or Docker

For containerized development:
- Docker Desktop with Docker Compose

## Environment Variables

### Backend

Create backend/.env from backend/.env.example.

```env
APP_ENV=development
APP_DEBUG=true
APP_VERSION=0.1.0
SECRET_KEY=change-me-to-a-random-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Additional backend settings supported by the app configuration:
- MONGODB_URL (default: mongodb://localhost:27017)
- MONGODB_DB_NAME (default: smart_mall)
- API_PREFIX (default: /api/v1)

### Frontend

Create frontend/.env from frontend/.env.example.

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Run with Docker Compose

From the project root:

```bash
docker compose up --build
```

What starts:
- mongodb service on 27017
- backend service on 8000
- frontend service on 5173

Notes:
- Backend uses backend/.env.
- Docker Compose overrides backend DB connection to use mongodb service.

To stop:

```bash
docker compose down
```

To stop and remove persisted Mongo volume:

```bash
docker compose down -v
```

## Run Locally (Recommended for Development)

### 1) Backend

From project root:

```powershell
cd backend
python -m venv ..\.venv
..\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
python -m uvicorn app.main:app --reload --port 8000
```

### 2) Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend development server:
- http://localhost:5173

## Seed Data and Demo Credentials

The backend automatically seeds demo data on startup only when the users collection is empty.

Seeded users:
- Admin
  - Username: admin@example.com
  - Password: admin123
- Super Admin
  - Username: superadmin@example.com
  - Password: super123
- Customer
  - Username: customer@example.com
  - Password: customer123

Seeded domains include:
- Users
- Stores and products
- Complaints
- Notifications
- Offers
- Parking slots

## API and WebSocket Overview

### Health
- GET /health
- GET /health/ready
- GET /

### Authentication and Access
- /api/v1/auth
- /api/v1/users
- /api/v1/admin

### Core Mall Operations
- /api/v1/stores
- /api/v1/queues
- /api/v1/parking
- /api/v1/loyalty
- /api/v1/offers
- /api/v1/complaints
- /api/v1/notifications
- /api/v1/analytics

### Extended Experience Modules
- /api/v1/events
- /api/v1/movies
- /api/v1/lost-found
- /api/v1/favorites
- /api/v1/discovery

### Real-Time Queue Channel
- WebSocket endpoint: /ws/queues/{store_id}
- Sends an initial queue snapshot on connection
- Pushes updates whenever queue state changes

Use interactive API docs for complete request/response schemas:
- /docs

## Testing, Linting, and Build Commands

### Backend tests

```bash
cd backend
pytest
pytest --cov
```

### Backend lint/format

```bash
cd backend
ruff check .
ruff format .
```

### Frontend tests

```bash
cd frontend
npm test
```

### Frontend build and preview

```bash
cd frontend
npm run build
npm run preview
```

### Frontend lint

```bash
cd frontend
npm run lint
```

## Troubleshooting

### Frontend cannot reach backend
- Confirm frontend/.env has VITE_API_BASE_URL=http://localhost:8000.
- Ensure backend is running on port 8000.
- Ensure BACKEND_CORS_ORIGINS includes your frontend origin.

### Authentication errors
- Validate SECRET_KEY and JWT settings.
- Clear stored tokens in browser storage and login again.

### Seed users are missing
- Seeding runs only when there are no users in DB.
- Reset MongoDB data and restart backend to reseed.

### Docker backend cannot connect to DB
- Verify mongodb container is healthy.
- Check docker-compose service logs.

## License

Proprietary.
