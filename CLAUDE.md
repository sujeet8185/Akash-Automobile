# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Akash Automobile is a stock/inventory management system for an automobile parts business. It consists of a Django REST API backend, a React + Vite + TypeScript frontend, and a MySQL database — all orchestrated via Docker Compose.

## Running the Project

### With Docker (recommended)

```batch
START.bat       # Builds and starts all services; opens http://akash-automobile:3000
STOP.bat        # Stops containers (preserves data — uses docker compose stop, not down)
```

Requires Docker Desktop running. First run takes 5-10 minutes. Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Database: localhost:3306

Optional: run `SETUP-HOSTNAME.bat` as Administrator to access via `http://akash-automobile:3000`.

Default credentials: **sumitkalaskar / sunilkalaskar**

### Manual (without Docker)

**Backend:**
```powershell
cd backend
pip install -r requirements.txt

$env:DB_HOST="127.0.0.1"; $env:DB_NAME="akash_automobile"
$env:DB_USER="akash_user"; $env:DB_PASSWORD="sujeet8185"

python manage.py migrate
python manage.py create_admin   # creates default admin if not exists
python manage.py runserver
```

Or use the provided script from the project root: `.\start-backend.ps1`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
cd backend
python manage.py test
python manage.py test apps.inventory   # single app
```

## Architecture

### Backend (`backend/`)

Django project with three apps under `backend/apps/`:

- **`accounts`** — Custom User model (extends `AbstractUser`, `db_table="users"`), token-based auth views (login/logout/register/me), and a `create_admin` management command.
- **`companies`** — Supplier/manufacturer CRUD. Includes a `/dropdown/` custom action returning a lightweight list for UI dropdowns. Soft-deleted via `is_active`.
- **`inventory`** — Core domain. Two models:
  - `Item` — Stock item with pricing, unit type, min stock level, FK to Company.
  - `StockTransaction` — Audit log (ADD/REMOVE/ADJUST). `save()` auto-updates `Item.quantity`.
  - Custom actions on `ItemViewSet`: `add-stock`, `remove-stock`, `transactions`.
  - `DashboardView` aggregates summary stats, low-stock items, monthly activity, and recent transactions in a single endpoint.

**URL structure:**
```
/api/auth/{login,logout,register,me}/
/api/inventory/items/                      # list, create, retrieve, update, destroy
/api/inventory/items/{id}/{add-stock,remove-stock,transactions}/
/api/inventory/dashboard/
/api/companies/                            # list, create, retrieve, update, destroy
/api/companies/dropdown/
/admin/
```

**Settings** (`backend/core/settings.py`): reads DB credentials from env vars with fallback defaults. `AUTH_USER_MODEL = "accounts.User"`. Timezone: `Asia/Kolkata`. PyMySQL installed as MySQLdb.

### Frontend (`frontend/`)

React 18 + Vite + TypeScript. Key libraries: Shadcn UI (Radix UI), Tailwind CSS, React Router 6, TanStack React Query, React Hook Form + Zod, Axios, Recharts.

Alias `@` maps to `frontend/src/`. The Vite dev server proxies `/api` to `VITE_API_URL` (set in `.env`; defaults to AWS ELB in the committed env file — override locally for dev).

### Docker Compose

Three services: `db` (MySQL 8.0), `backend` (Python 3.12-slim), `frontend` (node:20-alpine). Backend startup command runs `migrate` → `create_admin` → `runserver` automatically. Persistent data in `mysql_data` volume.

## Key Environment Variables

| Variable | Default (Docker) |
|---|---|
| `DB_HOST` | `db` |
| `DB_NAME` | `akash_automobile` |
| `DB_USER` | `akash_user` |
| `DB_PASSWORD` | `sujeet8185` |
| `SECRET_KEY` | `akash-automobile-secret-key-2024-very-secure` |
| `DEBUG` | `True` |
| `ALLOWED_HOSTS` | `*` |
| `VITE_API_URL` | `http://backend:8000` |

## Brand Colors

`#1b4965` (dark navy primary), `#62b6cb` (medium blue), `#5fa8d3` (blue accent), `#bee9e8` (lightest teal), `#cae9ff` (light sky blue).
