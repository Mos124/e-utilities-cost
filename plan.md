# แผนการดำเนินงานและออกแบบระบบ (plan.md)
## โปรเจกต์: ระบบควบคุมและติดตามค่าสาธารณูปโภค (e-utilities-cost)

---

## 1. บทนำและวัตถุประสงค์ (Overview & Objectives)

ระบบควบคุมและติดตามค่าสาธารณูปโภค (**e-utilities-cost**) พัฒนาขึ้นเพื่อเป็นเครื่องมือในการบันทึก ติดตาม วิเคราะห์ และบริหารจัดการค่าใช้จ่ายด้านสาธารณูปโภคของสถานศึกษา (ได้แก่ ค่าไฟฟ้า, ค่าน้ำประปา, ค่าอินเตอร์เน็ต, ค่าโทรศัพท์, ค่าไปรษณีย์ และค่าขยะมูลฝอย) อย่างเป็นระบบ ช่วยให้ผู้บริหารและเจ้าหน้าที่สามารถติดตามภาระค่าใช้จ่ายรายเดือน เปรียบเทียบย้อนหลังรายปี และวางแผนการใช้งบประมาณได้อย่างมีประสิทธิภาพ

---

## 2. สถาปัตยกรรมระบบ (System Architecture)

ระบบถูกออกแบบในลักษณะ **Full-Stack Decoupled Architecture** พร้อมรองรับการทำ **Containerization** ด้วย Docker:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Browser                                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP (Port 8080)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Frontend Service (Nginx + Vue 3 SPA)                  │
│  - Vue 3 (Composition API)  - Vite Build Engine                        │
│  - Tailwind CSS             - Pinia Store                              │
│  - Chart.js / Vue-Chartjs   - Vue Router + Auth Guards                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Reverse Proxy /api/ -> http://backend:3000
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Backend API Service (Express.js)                     │
│  - Node.js + Express        - JWT Authentication                       │
│  - Bcrypt Password Hashing  - Sequelize ORM                              │
│  - Helmet + CORS Security   - Cookie Parser & Input Validator          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQL Connection
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Database Service (MariaDB 11)                       │
│  - Database: e_utilities_cost                                          │
│  - Persistent Volume: mariadb_data                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. สิทธิ์การใช้งานและระบบรักษาความปลอดภัย (Security & RBAC Matrix)

### 3.1 ระบบยืนยันตัวตน (Authentication)
* **JWT (JSON Web Token)**: ใช้ Signed Access Token สำหรับยืนยันตัวตนในทุก Request ผ่าน Header `Authorization: Bearer <token>`
* **Refresh Token**: ใช้ HttpOnly, SameSite Cookie สำหรับขอ Access Token ใหม่เมื่อ Token หมดอายุ
* **Bcrypt Password Hashing**: รหัสผ่านของผู้ใช้งานทั้งหมดจะถูก Hash ด้วย bcrypt (Salt Rounds = 10) ก่อนบันทึกลงฐานข้อมูล

### 3.2 ตารางสิทธิ์การใช้งาน (Role-Based Access Control)

| ฟีเจอร์ / เมนู | Admin (👑) | Staff (📝) | User (👀) |
|---|:---:|:---:|:---:|
| เข้าสู่ระบบ / ออกจากระบบ | ✅ | ✅ | ✅ |
| ดู Dashboard และกราฟสรุปยอด | ✅ | ✅ | ✅ |
| ดูรายงานย้อนหลัง & เปรียบเทียบ | ✅ | ✅ | ✅ |
| ดูรายการค่าใช้จ่ายจริง | ✅ | ✅ | ✅ |
| บันทึก / แก้ไข / ลบ รายการค่าใช้จ่าย | ✅ | ✅ | ❌ |
| จัดการประเภทค่าใช้จ่าย (Expense Categories) | ✅ | ❌ | ❌ |
| จัดการหมวดเงินเบิกจ่าย (Budget Categories) | ✅ | ❌ | ❌ |

---

## 4. ออกแบบฐานข้อมูล (Database Schema Specifications)

### 4.1 ตาราง `users` (ข้อมูลสมาชิก)
| ฟิลด์ | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | รหัสผู้ใช้งาน |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | ชื่อเข้าใช้งาน |
| `password` | VARCHAR(255) | NOT NULL | รหัสผ่าน (Bcrypt Hash) |
| `full_name` | VARCHAR(100) | NOT NULL | ชื่อ-นามสกุล |
| `role` | ENUM('admin', 'staff', 'user') | DEFAULT 'user' | สิทธิ์ผู้ใช้งาน |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | วันที่สร้าง |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | วันที่แก้ไขล่าสุด |

### 4.2 ตาราง `expense_categories` (ประเภทค่าสาธารณูปโภค)
| ฟิลด์ | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | รหัสประเภท |
| `name` | VARCHAR(100) | NOT NULL | ชื่อประเภท (เช่น ค่าไฟฟ้า, ค่าน้ำประปา) |
| `code` | VARCHAR(20) | UNIQUE, NOT NULL | รหัสอ้างอิง (เช่น ELEC, WATER) |
| `unit` | VARCHAR(20) | DEFAULT 'บาท' | หน่วยนับ |
| `is_active` | BOOLEAN | DEFAULT true | สถานะการใช้งาน |

### 4.3 ตาราง `budget_categories` (หมวดเงินเบิกจ่าย)
| ฟิลด์ | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | รหัสหมวดเงิน |
| `name` | VARCHAR(100) | NOT NULL | ชื่อหมวดเงิน (เช่น งบประมาณ ปวช., เงินรายได้) |
| `code` | VARCHAR(20) | UNIQUE, NOT NULL | รหัสหมวดเงิน |
| `is_active` | BOOLEAN | DEFAULT true | สถานะการใช้งาน |

### 4.4 ตาราง `expenses` (รายการค่าใช้จ่ายจริง)
| ฟิลด์ | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | รหัสรายการ |
| `expense_category_id` | INTEGER | FOREIGN KEY -> `expense_categories.id` | ประเภทค่าใช้จ่าย |
| `budget_category_id` | INTEGER | FOREIGN KEY -> `budget_categories.id` | หมวดเงินที่ใช้เบิก |
| `amount` | DECIMAL(12,2) | NOT NULL | ยอดเงิน (บาท) |
| `billing_month` | DATE | NOT NULL | รอบเดือนที่เบิกจ่าย (YYYY-MM-01) |
| `paid_date` | DATE | NULLABLE | วันที่ชำระเงิน |
| `invoice_no` | VARCHAR(50) | NULLABLE | เลขที่ใบแจ้งหนี้/ใบเสร็จ |
| `note` | TEXT | NULLABLE | หมายเหตุเพิ่มเติม |
| `attachment_path` | VARCHAR(255) | NULLABLE | พาธไฟล์แนบ |
| `created_by` | INTEGER | FOREIGN KEY -> `users.id` | ผู้บันทึกรายการ |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | วันที่สร้าง |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | วันที่แก้ไข |

---

## 5. รายละเอียด API Endpoints (REST API Specification)

| HTTP Method | Endpoint | สิทธิ์ที่ต้องการ | คำอธิบาย |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | เข้าสู่ระบบ และรับ JWT Token |
| `POST` | `/api/auth/logout` | Public | ออกจากระบบ และลบ Cookie |
| `POST` | `/api/auth/refresh` | Public | ขอ Access Token ใหม่ด้วย Refresh Token |
| `GET` | `/api/auth/me` | Authenticated | ดึงข้อมูลโปรไฟล์ผู้ใช้งานปัจจุบัน |
| `GET` | `/api/expense-categories` | Authenticated | รายการประเภทค่าใช้จ่ายทั้งหมด |
| `POST` | `/api/expense-categories` | Admin | เพิ่มประเภทค่าใช้จ่ายใหม่ |
| `PUT` | `/api/expense-categories/:id` | Admin | แก้ไขประเภทค่าใช้จ่าย |
| `DELETE` | `/api/expense-categories/:id` | Admin | ลบประเภทค่าใช้จ่าย |
| `GET` | `/api/budget-categories` | Authenticated | รายการหมวดเงินเบิกจ่ายทั้งหมด |
| `POST` | `/api/budget-categories` | Admin | เพิ่มหมวดเงินเบิกจ่าย |
| `PUT` | `/api/budget-categories/:id` | Admin | แก้ไขหมวดเงินเบิกจ่าย |
| `DELETE` | `/api/budget-categories/:id` | Admin | ลบหมวดเงินเบิกจ่าย |
| `GET` | `/api/expenses` | Authenticated | รายการค่าใช้จ่าย (รองรับ filter & pagination) |
| `GET` | `/api/expenses/:id` | Authenticated | ดึงรายละเอียดค่าใช้จ่ายตาม ID |
| `POST` | `/api/expenses` | Staff / Admin | บันทึกรายการค่าใช้จ่ายใหม่ |
| `PUT` | `/api/expenses/:id` | Staff / Admin | แก้ไขรายการค่าใช้จ่าย |
| `DELETE` | `/api/expenses/:id` | Staff / Admin | ลบรายการค่าใช้จ่าย |
| `GET` | `/api/dashboard/summary` | Authenticated | ข้อมูลสรุปยอดรายเดือน และ % ความเปลี่ยนแปลง |
| `GET` | `/api/dashboard/by-category` | Authenticated | สรุปยอดแยกตามประเภทค่าใช้จ่าย |
| `GET` | `/api/dashboard/by-budget` | Authenticated | สรุปยอดแยกตามหมวดเงินงบประมาณ |
| `GET` | `/api/dashboard/compare` | Authenticated | ข้อมูลเปรียบเทียบย้อนหลังระหว่างปี |
| `GET` | `/api/health` | Public | ตรวจสอบสถานะการทำงานของ API |

---

## 6. วงจร DevOps และการ Containerize (DevOps & Containerization Plan)

### 6.1 กลยุทธ์การจัดการ Source Code (Git / GitHub)
1. **Repository Structure**: โครงสร้างโฟลเดอร์แยกชัดเจนระหว่าง `backend`, `frontend` และไฟล์คอนฟิก Docker ใน Root Directory
2. **Git Commit Practice**: บันทึก Commit สม่ำเสมอแยกตาม Feature/Fix ไม่ commit รวบยอดในครั้งเดียว
3. **Security Standards**: มีไฟล์ `.gitignore` ป้องกันไม่ให้ `node_modules`, `.env`, `database.sqlite` และไฟล์ Build ปนขึ้นไปบน GitHub เด็ดขาด โดยใช้ `.env.example` เป็นแม่แบบในการตั้งค่า

### 6.2 กลยุทธ์การทำ Docker Containerization
* **Backend Dockerfile**: 
  - ใช้ Base Image `node:20-alpine` น้ำหนักเบา
  - ติดตั้งเฉพาะ Production Dependencies (`npm install --omit=dev`)
  - Expose Port 3000

* **Frontend Dockerfile (Multi-stage Build)**:
  - **Stage 1 (Builder)**: ใช้ `node:20-alpine` ในการติดตั้ง Dependencies และ Build Production Assets (`dist`)
  - **Stage 2 (Runner)**: ใช้ `nginx:alpine` ทำหน้าที่เป็น High-performance Static File Web Server พร้อม Reverse Proxy `/api/` ไปยัง Backend Container บน Port 3000

* **Docker Compose (`docker-compose.yml`)**:
  - รวมการทำงานของ 3 Services: `mariadb:11`, `backend` และ `frontend`
  - มี Healthcheck ตรวจสอบความพร้อมของฐานข้อมูล MariaDB ก่อนเริ่ม Backend Service
  - ใช้งาน Persistent Volume `mariadb_data` ในการรักษาข้อมูลฐานข้อมูล

### 6.3 การ Push ขึ้น Docker Hub
* **Backend Image**: `mos124/e-utilities-backend:latest`
* **Frontend Image**: `mos124/e-utilities-frontend:latest`
* **Automation Script**: ใช้ `build-push.ps1` สำหรับ automatising process ในการ build และ push ขึ้น registry

---

## 7. แผนการทดสอบและสอบทานระบบ (Verification Checklist)

- [x] **Authentication Test**: ทดสอบการ Login ด้วย Admin, Staff, User พร้อมการเช็ค Token Expire และ Logout
- [x] **Role Authorization Test**: สอบทานสิทธิ์การสร้าง/แก้ไข/ลบ ข้อมูลของแต่ละกลุ่มผู้ใช้งาน
- [x] **Category CRUD Test**: ทดสอบเพิ่ม แก้ไข และลบประเภทค่าใช้จ่ายและหมวดเงิน
- [x] **Expense CRUD Test**: บันทึกรายการค่าใช้จ่าย ค้นหา กรองตามปี/เดือน และลบรายการ
- [x] **Dashboard & Chart Test**: สอบทานความถูกต้องของการคำนวณยอดรวม กราฟ 12 เดือน และกราฟแยกหมวดหมู่
- [x] **Report History Test**: เลือกเปรียบเทียบข้อมูลย้อนหลังระหว่างปี 2025 และ 2026
- [x] **Responsive Design**: ทดสอบการแสดงผลรองรับ Desktop (1920px), Tablet (768px), และ Mobile (375px)
- [x] **Docker Compose Test**: ทดสอบ `docker compose up -d` ดึง Image จาก Docker Hub มารันระบบได้สมบูรณ์ 100%
