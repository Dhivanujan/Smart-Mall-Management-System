# Smart Mall Management System

Smart Mall Management System is a full-stack, multi-role mall operations platform built with FastAPI + React.

It includes:
- Secure JWT authentication
- Role-based access (customer, admin, super admin)
- Store and product management
- Queue management with WebSocket updates
- Parking operations
- Loyalty and rewards
- Offers and redemptions
- Complaint handling
- Notifications
- Analytics dashboards

## Tech Stack

### Backend
- Python 3.10+
- FastAPI
- Pydantic / pydantic-settings
- MongoDB (Motor + Beanie)
- JWT auth (python-jose)
- Password hashing (bcrypt)
- Uvicorn
- Pytest + pytest-cov
- Ruff

### Frontend
- React 18 (JavaScript)
- Vite
- React Router v6
- Axios
- Vitest

### Infrastructure
- Docker Compose
- MongoDB 7 container

## Architecture Overview

- Backend service exposes REST APIs under `/api/v1` and a WebSocket endpoint under `/ws/queues/{store_id}`.
- Frontend consumes REST APIs for all CRUD/business flows and subscribes to queue updates via WebSocket.
- MongoDB stores users, stores, products, queues, complaints, loyalty data, notifications, offers, and parking data.
- On backend startup, the app initializes DB and seeds demo data when DB is empty.

## User Roles

- Customer:
  - Browse stores and products
  - Join and track queues
  - Reserve/release parking
  - View loyalty account and redeem points
  - View/redeem offers
  - Create and track complaints
  - Read notifications

- Admin:
  - Dashboard and monitoring
  - Store-level metrics
  - Queue operations (next, skip, pause, resume)
  - Product management
  - Parking admin actions
  - Offer management
  - Complaint assignment and status handling

- Super Admin:
  - Platform dashboard
  - Admin/tenant oversight
  - User lifecycle management
  - Store lifecycle management
  - Platform analytics endpoints

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
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── stores/
│   │   │   ├── queues/
│   │   │   ├── parking/
│   │   │   ├── loyalty/
│   │   │   ├── complaints/
│   │   │   ├── notifications/
│   │   │   ├── offers/
│   │   │   ├── analytics/
│   │   │   └── users/
│   │   ├── auth/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   └── websocket/
│   └── tests/
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
```

## Environment Variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`.

Required/important settings:
- `APP_ENV`
- `APP_DEBUG`
- `APP_VERSION`
- `SECRET_KEY`
- `JWT_ALGORITHM`
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
- `BACKEND_CORS_ORIGINS`

Notes:
- Backend configuration is loaded through `pydantic-settings`.
- MongoDB URL/DB are also read from environment, with defaults in config.

### Frontend (`frontend/.env`)

Copy from `frontend/.env.example`.

- `VITE_API_BASE_URL=http://localhost:8000`

## Getting Started

## Option 1: Run with Docker (recommended)

From repository root:

```bash
docker compose up --build
```

Services:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- MongoDB: `mongodb://localhost:27017`

## Option 2: Run Locally

### 1) Backend

```bash
cd backend
python -m venv ../.venv
```

Activate virtual environment:

- PowerShell:

```powershell
..\.venv\Scripts\Activate.ps1
```

- Bash:

```bash
source ../.venv/Scripts/activate
```

Install dependencies and run:

```bash
python -m pip install -e ".[dev]"
python -m uvicorn app.main:app --reload --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Demo Credentials (Seed Data)

- Admin:
  - Username: `admin@example.com`
  - Password: `admin123`

- Super Admin:
  - Username: `superadmin@example.com`
  - Password: `super123`

- Customer:
  - Username: `customer@example.com`
  - Password: `customer123`

## API Surface (High Level)

### Health
- `GET /health`
- `GET /health/ready`

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/register`

### Stores / Products
- `GET /api/v1/stores/`
- `GET /api/v1/stores/map`
- `GET /api/v1/stores/{store_id}`
- `GET /api/v1/stores/{store_id}/products`
- `POST /api/v1/stores/{store_id}/products` (admin)
- `PUT /api/v1/stores/{store_id}/products/{product_id}` (admin)
- `DELETE /api/v1/stores/{store_id}/products/{product_id}` (admin)
- `POST /api/v1/stores/admin/create` (super admin)
- `PUT /api/v1/stores/admin/{store_id}` (super admin)
- `DELETE /api/v1/stores/admin/{store_id}` (super admin)

### Queues
- `GET /api/v1/queues/{store_id}`
- `POST /api/v1/queues/{store_id}/join`
- `GET /api/v1/queues/{store_id}/status`

### Admin Queue Controls
- `GET /api/v1/admin/queues`
- `POST /api/v1/admin/queues/{store_id}/next`
- `POST /api/v1/admin/queues/{store_id}/skip`
- `POST /api/v1/admin/queues/{store_id}/pause`
- `POST /api/v1/admin/queues/{store_id}/resume`

### Parking
- `GET /api/v1/parking/summary`
- `GET /api/v1/parking/slots`
- `GET /api/v1/parking/available`
- `POST /api/v1/parking/reserve`
- `POST /api/v1/parking/release/{slot_id}`
- `GET /api/v1/parking/my-slots`
- `GET /api/v1/parking/admin/overview` (admin)
- `POST /api/v1/parking/admin/occupy` (admin)
- `POST /api/v1/parking/admin/release/{slot_id}` (admin)

### Loyalty
- `GET /api/v1/loyalty/account`
- `GET /api/v1/loyalty/history`
- `POST /api/v1/loyalty/earn`
- `POST /api/v1/loyalty/redeem`

### Complaints
- `GET /api/v1/complaints/my`
- `POST /api/v1/complaints/`
- `GET /api/v1/complaints/{complaint_id}`
- `GET /api/v1/complaints/admin/all` (admin)
- `PUT /api/v1/complaints/admin/{complaint_id}/status` (admin)
- `PUT /api/v1/complaints/admin/{complaint_id}/assign` (admin)
- `POST /api/v1/complaints/admin/{complaint_id}/escalate` (admin)
- `POST /api/v1/complaints/admin/{complaint_id}/log` (admin)

### Notifications
- `GET /api/v1/notifications/`
- `POST /api/v1/notifications/{notification_id}/read`
- `POST /api/v1/notifications/read-all`

### Offers
- `GET /api/v1/offers/active`
- `GET /api/v1/offers/store/{store_id}`
- `GET /api/v1/offers/{offer_id}`
- `POST /api/v1/offers/{offer_id}/redeem`
- `POST /api/v1/offers/admin/create` (admin)
- `PUT /api/v1/offers/admin/{offer_id}` (admin)
- `DELETE /api/v1/offers/admin/{offer_id}` (admin)
- `GET /api/v1/offers/admin/recommendations` (admin)

### Analytics
- `GET /api/v1/analytics/store/sales` (admin)
- `GET /api/v1/analytics/store/customers` (admin)
- `GET /api/v1/analytics/mall/overview` (super admin)
- `GET /api/v1/analytics/mall/crowd` (super admin)
- `GET /api/v1/analytics/mall/queue-efficiency` (super admin)
- `GET /api/v1/analytics/mall/parking` (super admin)

### Users
- `POST /api/v1/users/register`
- `GET /api/v1/users/profile`
- `PUT /api/v1/users/profile`
- `GET /api/v1/users/admin/list` (super admin)
- `POST /api/v1/users/admin/create` (super admin)
- `PUT /api/v1/users/admin/{username}` (super admin)
- `POST /api/v1/users/admin/{username}/reset-password` (super admin)
- `DELETE /api/v1/users/admin/{username}` (super admin)

## WebSocket

Queue updates stream endpoint:
- `WS /ws/queues/{store_id}`

Behavior:
- Sends initial queue snapshot when connected
- Broadcasts queue updates on queue state changes

## Testing

### Backend

```bash
cd backend
pytest --cov
```

### Frontend

```bash
cd frontend
npm test
```

## Linting and Formatting

### Backend

```bash
cd backend
ruff check .
ruff format .
```

## Build Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Troubleshooting

- If frontend cannot call backend:
  - Check `VITE_API_BASE_URL` in `frontend/.env`
  - Ensure backend is running on port 8000

- If auth fails unexpectedly:
  - Confirm `SECRET_KEY` and token settings in backend `.env`
  - Re-login to refresh tokens

- If demo users are missing:
  - Seeding runs only when user collection is empty
  - Reset database if you need fresh seed data

## License

Proprietary.
