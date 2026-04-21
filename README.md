# SimpleCalc — Next.js Calculator App

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)

---

## Prerequisites
- Node.js >= 18
- npm >= 9
- A [Supabase](https://supabase.com) project

---

## Project Structure
```
/
├── frontend/          # Next.js app
├── backend/           # Express API
├── package.json       # Root workspace config
└── .env.example
```

---

## Supabase Setup

1. Create a new Supabase project at https://app.supabase.com
2. Run the following SQL in the Supabase SQL Editor:

```sql
create table if not exists calculations (
  id uuid primary key default gen_random_uuid(),
  expression text not null,
  result numeric not null,
  created_at timestamptz default now()
);
```

---

## Environment Variables

Copy `.env.example` to `.env` in both `frontend/` and `backend/`:

```bash
cp .env.example frontend/.env.local
cp .env.example backend/.env
```

Fill in your Supabase credentials.

---

## Installation & Running

### Install all dependencies
```bash
npm install
```

### Run the backend (Express)
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:4000
```

### Run the frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## Features
- Basic arithmetic: `+`, `-`, `×`, `÷`
- Keyboard support
- Calculation history stored in Supabase
- History panel with clear option
- Responsive UI

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/calculate` | Evaluate expression, save to DB |
| GET | `/api/history` | Fetch calculation history |
| DELETE | `/api/history` | Clear all history |

---

## Scripts (root)
```bash
npm run dev:frontend   # Start Next.js
npm run dev:backend    # Start Express
```