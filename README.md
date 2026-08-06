# E-Utilities Cost — Utility Expense Tracking & Control System

A full-stack web application for tracking and managing utility expenses (electricity, water, etc.).

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MariaDB (Docker) / SQLite (local dev) |
| ORM | Sequelize |
| Auth | JWT (access + refresh tokens) |
| Container | Docker + Docker Compose |

---

## 🚀 Quick Start with Docker

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Run all services

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:3000 |
| MariaDB | localhost:3306 |

### Stop services

```bash
docker compose down
```

### Stop & remove volumes (reset database)

```bash
docker compose down -v
```

---

## 💻 Local Development (without Docker)

### Backend

```bash
cd backend
cp .env.example .env   # edit as needed (SQLite works out of the box)
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
jobb4/
├── backend/
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Route controllers
│   │   ├── middlewares/  # Auth, error handling
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # Express routes
│   │   └── seeders/      # Initial data
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🔐 Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust values.  
**Never commit `.env` files — they are in `.gitignore`.**

| Variable | Description |
|----------|-------------|
| `DB_DIALECT` | `sqlite` or `mariadb` |
| `DB_HOST` | Database host |
| `JWT_SECRET` | Secret key for JWT signing |
