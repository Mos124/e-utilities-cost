# ระบบควบคุม-ติดตามค่าสาธารณูปโภค (e-utilities-cost)

> ระบบบันทึกและติดตามค่าสาธารณูปโภคสำหรับสถานศึกษา  
> ครอบคลุมค่าไฟฟ้า น้ำประปา อินเตอร์เน็ต โทรศัพท์ และขยะมูลฝอย

## 🌐 Docker Hub Images

| Image | Pull Command |
|-------|-------------|
| Backend API | `docker pull mos124/e-utilities-backend:latest` |
| Frontend App | `docker pull mos124/e-utilities-frontend:latest` |

---

## ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| 📊 **Dashboard** | สรุปยอดรายเดือน, กราฟแท่ง 12 เดือน, กราฟวงกลมแยกประเภท |
| 💸 **Expense Tracking** | บันทึก/แก้ไข/ลบ รายการค่าสาธารณูปโภค |
| 🏷️ **Category CRUD** | จัดการประเภทค่าใช้จ่าย (Admin only) |
| 💰 **Budget Management** | ผูกรายการกับหมวดเงินงบประมาณ (ปวช./ปวส./รายได้สถานศึกษา) |
| 📈 **Report History** | รายงานย้อนหลัง, เปรียบเทียบปีต่อปี |
| 🔐 **Auth (JWT)** | Login/Logout, Role-Based Access (Admin / Staff / User) |
| 🐳 **Docker Ready** | Multi-stage build, Nginx static serve, MariaDB |

---

## 🔑 บัญชีทดสอบ (Default Credentials)

| Role | Username | Password | สิทธิ์ |
|------|----------|----------|--------|
| 👑 Admin | `admin` | `admin123` | เต็มรูปแบบ (CRUD ทุกเมนู) |
| 📝 Staff | `staff` | `staff123` | บันทึก/แก้ไข ค่าใช้จ่าย |
| 👀 User  | `user`  | `user123`  | ดู Dashboard และรายงาน |

---

## 🚀 วิธีรันโปรเจกต์

### Option A: Docker Compose (แนะนำ - Production)

```bash
# ดึง images จาก Docker Hub แล้วรันทั้งระบบ
docker compose up -d
```

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3030
- **MariaDB**: localhost:3306

### Option B: Build & Run เอง

```bash
# Build แล้วรัน
docker compose -f docker-compose.build.yml up -d --build
```

### Option C: Local Development (Node.js)

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev
# Backend → http://localhost:3000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
# Frontend → http://localhost:8080
```

---

## 🐳 Build & Push to Docker Hub

```powershell
# Login ก่อน
docker login

# รัน build script
.\build-push.ps1
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vue 3, Vite, Tailwind CSS, Pinia, Chart.js |
| **Backend** | Node.js, Express.js, Sequelize ORM |
| **Database** | SQLite (dev) / MariaDB (production) |
| **Auth** | JWT + HttpOnly Cookie Refresh Token |
| **Deploy** | Docker, Nginx (multi-stage), Docker Compose |

---

## 📁 โครงสร้างโปรเจกต์

```
e-utilities-cost/
├── backend/
│   ├── src/
│   │   ├── controllers/   # auth, expense, category, dashboard
│   │   ├── middlewares/   # auth, error handler
│   │   ├── models/        # User, Expense, ExpenseCategory, BudgetCategory
│   │   ├── routes/        # auth, expense, category, dashboard
│   │   ├── seeders/       # ข้อมูลเริ่มต้น (users, categories, sample expenses)
│   │   ├── config/        # DB config (SQLite/MariaDB)
│   │   ├── app.js
│   │   └── server.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── views/         # Login, Dashboard, Expense, Category, Report
│   │   ├── stores/        # Pinia auth store
│   │   ├── services/      # API service, auth service
│   │   ├── router/        # Vue Router + auth guards
│   │   └── App.vue
│   └── Dockerfile         # Multi-stage: Vite build + Nginx serve
├── docker-compose.yml         # Production (uses Docker Hub images)
├── docker-compose.build.yml   # Local build
├── build-push.ps1             # Script สำหรับ push ไป Docker Hub
├── plan.md                    # เอกสารแผนการดำเนินงานและออกแบบระบบ
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | เข้าสู่ระบบ | ❌ |
| POST | `/api/auth/logout` | ออกจากระบบ | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| GET | `/api/auth/me` | ข้อมูลตัวเอง | ✅ |
| GET | `/api/expenses` | รายการค่าใช้จ่าย | ✅ |
| POST | `/api/expenses` | สร้างรายการ | ✅ Staff+ |
| PUT | `/api/expenses/:id` | แก้ไขรายการ | ✅ Staff+ |
| DELETE | `/api/expenses/:id` | ลบรายการ | ✅ Staff+ |
| GET | `/api/expense-categories` | ประเภทค่าใช้จ่าย | ✅ |
| GET | `/api/budget-categories` | หมวดเงินงบประมาณ | ✅ |
| GET | `/api/dashboard/summary` | สรุป Dashboard | ✅ |
| GET | `/api/health` | Health check | ❌ |
