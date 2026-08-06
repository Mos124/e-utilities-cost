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

## 🔑 3 บทบาทการใช้งาน (Default Accounts & Roles)

ระบบจำลองบัญชีผู้ใช้งานเริ่มต้นไว้ 3 สิทธิ์ดังนี้:

| Role (สิทธิ์) | Username | Password | สิทธิ์การใช้งาน |
|--------------|----------|----------|----------------|
| **👑 Admin (ผู้ดูแลระบบ)** | `admin` | `admin123` | ทำได้ทุกอย่าง (จัดการหมวดหมู่, บันทึก/แก้ไข/ลบ ค่าใช้จ่าย, ดูรายงาน) |
| **📝 Staff (เจ้าหน้าที่)** | `staff` | `staff123` | บันทึก/แก้ไข/ลบ ค่าใช้จ่าย, ดูรายงาน |
| **👀 User (ผู้ใช้งานทั่วไป)** | `user` | `user123` | ดูแดชบอร์ด, ดูรายการค่าใช้จ่าย และดูรายงาน (ดูได้อย่างเดียว) |

---

## 🔒 ระบบยืนยันตัวตน (Authentication & Security)

- **JWT Authentication**: ใช้งาน Access Token (อายุ 1 ชม.) แนบใน Header `Authorization: Bearer <token>` และ Refresh Token (อายุ 7 วัน) เก็บใน HTTP-Only Cookie
- **Password Hashing**: เข้ารหัสผ่านด้วย `bcryptjs` (salt rounds ≥ 10)
- **Role-Based Protection**: มี Navigation Guard ใน Vue Router และ Middleware ใน Express เพื่อตรวจสอบสิทธิ์การเข้าถึงแต่ละ Endpoint

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | ตรวจสอบชื่อผู้ใช้และรหัสผ่าน คืนค่า accessToken |
| `POST` | `/api/auth/logout` | ล้าง Refresh Token cookie |
| `POST` | `/api/auth/refresh` | ขอ accessToken ใหม่ด้วย Refresh Token |
| `GET`  | `/api/auth/me` | ดึงข้อมูลผู้ใช้ปัจจุบันที่เข้าสู่ระบบอยู่ |

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
