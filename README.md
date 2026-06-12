# PrintFlow — ระบบติดตามงานพิมพ์

ระบบจัดการและติดตาม Job สำหรับทีม Production + Sales  
ทุกคนเห็นความคืบหน้าแบบ real-time ผ่านเว็บเบราว์เซอร์ ไม่ต้องติดตั้งแอพ

---

## สิ่งที่ต้องมีก่อน

- VPS ที่รัน **MariaDB** อยู่แล้ว
- **Docker** + **Docker Compose** (`docker compose version`)
- Port `3000` (frontend) และ `4000` (API) ว่างอยู่

---

## การติดตั้ง

### 1. Clone โปรเจกต์ขึ้น VPS

```bash
git clone <your-repo> printflow
cd printflow
```

หรืออัปโหลดโฟลเดอร์ขึ้นไปได้เลย

---

### 2. ตั้งค่า Database

เชื่อมต่อ MariaDB แล้วรัน schema:

```bash
mysql -u root -p < backend/schema.sql
```

สิ่งที่ script นี้ทำ:
- สร้าง database `printflow`
- สร้างตาราง `sales`, `users`, `jobs`, `job_history`
- เพิ่มชื่อเซลล์ทั้ง 4 คนพร้อมสีประจำตัว

---

### 3. ตั้งค่า Environment

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

แก้ค่าให้ตรงกับ MariaDB ของคุณ:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=printflow          # ← user MariaDB
DB_PASSWORD=your_password  # ← password
DB_NAME=printflow

JWT_SECRET=ใส่_random_string_ยาวๆ_ที่นี่
PORT=4000
```

> **JWT_SECRET** ใช้อะไรก็ได้ที่เดาไม่ได้ เช่น `openssl rand -hex 32`

---

### 4. สร้าง Production User (Pond)

```bash
cd backend
npm install
node src/seed.js
```

ระบบจะสร้าง user `Pond` password `491693148qQ` ในฐานข้อมูล

---

### 5. รัน Docker Compose

```bash
cd ..   # กลับมาที่ root โปรเจกต์
docker compose up -d --build
```

รอสักครู่แล้วเปิด `http://YOUR_VPS_IP:3000`

---

## การใช้งาน

### Sales (ดูความคืบหน้า)
1. เปิด `http://YOUR_VPS_IP:3000`
2. เห็นงานทุกงานทันที ไม่ต้อง login
3. กดปุ่มชื่อตัวเองเพื่อกรองดูเฉพาะงานของตัวเอง
4. กดที่การ์ดงานเพื่อดูรายละเอียดและ progress timeline

### Production (Pond)
1. กด **🔐 Production** มุมขวาบน
2. Login: `Pond` / `491693148qQ`
3. ทำได้ทุกอย่าง: เพิ่ม / แก้ไข / ลบงาน / เปลี่ยนสถานะ

---

## Status Flow

| สถานะ | ความหมาย |
|---|---|
| 📥 รับงาน | เพิ่งได้รับ Job |
| 🎨 ทำอาร์ตเวิร์ค / ตรวจปรู๊ฟ | กำลังออกแบบหรือตรวจงาน |
| 🖼️ ทำ Mockup | ทำภาพ mockup ให้ลูกค้าดู |
| 🖨️ ปริ้นท์ปรู๊ฟ | พิมพ์ตัวอย่างออกมา |
| ⏳ รอคอนเฟิร์ม | **รอ sales / ลูกค้า approve** ← highlight สีแดง |
| ✏️ แก้ไข | มีการแก้ไขตามคอมเมนต์ |
| 🏭 ทำเพลท / รอปริ้นท์ | เตรียมพิมพ์จริง |
| ✅ เสร็จแล้ว | งานเสร็จ พร้อมส่ง |

> งานที่สถานะ **รอคอนเฟิร์ม** จะมีแถบแดงเด่นเพื่อให้ sales รู้ว่าต้องตอบกลับ

---

## สีประจำ Sales

| ชื่อ | สี |
|---|---|
| สุรีวรรณ | 🔵 Blue `#3b82f6` |
| ยอตะวัน | 🟢 Green `#10b981` |
| อภิรดี | 🟠 Orange `#f97316` |
| จันทิมา | 🟣 Purple `#8b5cf6` |

แถบสีซ้ายของแต่ละการ์ด = สีประจำเซลล์เจ้าของงาน

---

## โครงสร้างโปรเจกต์

```
printflow/
├── backend/
│   ├── src/
│   │   ├── index.js      API routes (Express)
│   │   ├── db.js         MariaDB connection
│   │   ├── auth.js       JWT middleware
│   │   └── seed.js       สร้าง user Pond
│   ├── schema.sql        สร้าง DB ครั้งแรก
│   ├── .env.example      ตัวอย่าง config
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx       หน้าหลัก Job board
│   │   ├── constants.js  Status, helpers
│   │   └── components/
│   │       ├── JobCard.jsx    การ์ดแต่ละงาน
│   │       ├── JobModal.jsx   Form เพิ่ม/แก้ไข/ดู
│   │       └── StatusBar.jsx  Progress timeline
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## คำสั่งที่ใช้บ่อย

```bash
# ดู logs
docker compose logs -f api
docker compose logs -f frontend

# Restart
docker compose restart api

# หยุด
docker compose down

# อัปเดตโค้ดแล้ว rebuild
docker compose up -d --build
```

---

## แก้ปัญหาเบื้องต้น

**API เชื่อมต่อ DB ไม่ได้**
- ตรวจสอบค่าใน `backend/.env`
- ถ้า MariaDB รันบน host ให้ใช้ `DB_HOST=172.17.0.1` แทน `localhost`

**หน้าเว็บขึ้น 502 Bad Gateway**
- รอ API start ก่อน 10-15 วิ แล้ว refresh ใหม่

**ลืม password**
- แก้ใน `backend/src/seed.js` แล้วรัน `node src/seed.js` ใหม่
