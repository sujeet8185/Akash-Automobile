# Akash Automobile — Stock Management System

## Tech Stack
- **Backend**: Django 5, Django REST Framework, JWT Auth
- **Frontend**: React 18, Vite, TypeScript, Shadcn UI, Tailwind CSS, Recharts
- **Database**: MySQL 8.0
- **Container**: Docker Compose

## Quick Start (Docker)

```bash
docker-compose up --build
```

Then open: http://localhost:3000

**Login credentials:**
- Username: `sumitkalaskar`
- Password: `sunilkalaskar`

---

## Manual Setup (Without Docker)

### Prerequisites
- Python 3.12+
- Node.js 20+
- MySQL 8.0 running locally

### Backend

```bash
cd backend
pip install -r requirements.txt

# Set environment variables (or edit settings.py directly)
$env:DB_HOST="127.0.0.1"
$env:DB_NAME="akash_automobile"
$env:DB_USER="root"          # or akash_user if created
$env:DB_PASSWORD="sujeet8185"

python manage.py migrate
python manage.py create_admin
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

---

## Features

### Dashboard
- Summary cards: total items, low stock alerts, out of stock, inventory value
- Monthly stock activity bar chart (add vs remove)
- Items by company pie chart
- Low stock alerts list
- Recent transaction activity

### Items Management
- List all items with search & filters (by company, stock level)
- Add / Edit / Delete items
- Item form: company (dropdown), name, part number, unit, quantity, prices, min stock level

### Stock Management
- Add stock (with notes/reference)
- Remove stock / mark as sold (with notes)
- Full transaction history per item

### Companies
- Full CRUD for supplier companies
- Fields: name, contact person, phone, email, address, city, state, GST number
- Shows item count per company

### Authentication
- JWT-based login with auto token refresh
- Branded login page with "Akash Automobile" branding
- Secure logout with token blacklist

---

## Color Palette
- `#bee9e8` — Lightest teal
- `#62b6cb` — Medium blue
- `#1b4965` — Dark navy (primary)
- `#cae9ff` — Light sky blue
- `#5fa8d3` — Medium blue accent

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/auth/me/` | Current user |
| GET/POST | `/api/inventory/items/` | Items list/create |
| GET/PUT/DELETE | `/api/inventory/items/{id}/` | Item detail |
| POST | `/api/inventory/items/{id}/add-stock/` | Add stock |
| POST | `/api/inventory/items/{id}/remove-stock/` | Remove stock |
| GET | `/api/inventory/items/{id}/transactions/` | Transactions |
| GET | `/api/inventory/dashboard/` | Dashboard data |
| GET/POST | `/api/companies/` | Companies list/create |
| GET/PUT/DELETE | `/api/companies/{id}/` | Company detail |
| GET | `/api/companies/dropdown/` | Companies for dropdown |

## DATABASE Connection
Use MySQL Workbench or DBeaver (free) with these connection settings:

Field	Value
- Host —	127.0.0.1
- Port —	3306
- Username —	akash_user
- Password —	sujeet*1**
- Database —	akash_automobile

