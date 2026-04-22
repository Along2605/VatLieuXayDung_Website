# VLXD Đức Phiến — Fullstack (React + Express + MySQL)

## Cấu trúc project

```
vlxd-fullstack/
├── client/                      # React + Vite (frontend)
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js           # ← Tất cả gọi API dùng axios
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Xác thực, phân quyền
│   │   │   └── CartContext.jsx  # Giỏ hàng
│   │   ├── hooks/
│   │   │   ├── useProducts.js   # CRUD sản phẩm/danh mục
│   │   │   └── useCountdown.js  # Đếm ngược thanh toán
│   │   ├── components/          # Header, Footer, ProductCard...
│   │   ├── pages/               # Tất cả các trang
│   │   └── App.jsx              # Router
│   ├── package.json
│   └── vite.config.js           # Proxy /api → localhost:5000
│
├── server/                      # Express (backend)
│   ├── config/
│   │   └── db.js                # Kết nối MySQL pool
│   ├── models/
│   │   ├── Product.js           # SQL queries cho products
│   │   ├── Category.js          # SQL queries cho categories
│   │   └── User.js              # SQL queries cho users
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── authController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── app.js                   # Entry point Express
│   ├── package.json
│   └── .env                     # Biến môi trường (DB, PORT)
│
└── database/
    └── init.sql                 # Schema + toàn bộ dữ liệu
```

---

## Hướng dẫn cài đặt

### Bước 1: Cài đặt MySQL

Đảm bảo MySQL đang chạy với:
- user: `sa`
- password: `sapassword`

Nếu dùng XAMPP → mở XAMPP Control Panel → Start MySQL.

Nếu cần tạo user `sa`:
```sql
CREATE USER 'sa'@'localhost' IDENTIFIED BY 'sapassword';
GRANT ALL PRIVILEGES ON *.* TO 'sa'@'localhost';
FLUSH PRIVILEGES;
```

### Bước 2: Khởi tạo database

```bash
mysql -u sa -psapassword < database/init.sql
```

Hoặc mở MySQL Workbench / phpMyAdmin → chạy file `database/init.sql`.

Kiểm tra:
```sql
USE vlxd_db;
SELECT COUNT(*) FROM products;   -- phải ra 212
SELECT COUNT(*) FROM categories; -- phải ra 12
SELECT COUNT(*) FROM users;      -- phải ra 2
```

### Bước 3: Cài đặt và chạy Backend

```bash
cd server
npm install
npm run dev
```

Server chạy tại: http://localhost:5000

Kiểm tra: http://localhost:5000/api/health

### Bước 4: Cài đặt và chạy Frontend

```bash
cd client
npm install
npm run dev
```

Frontend chạy tại: http://localhost:5173

---

## Tài khoản mặc định

| Loại | Email | Mật khẩu |
|------|-------|-----------|
| Root Admin | admin@vlxdducphien.vn | Admin@vlxd2026 |
| Customer | nal26052005@gmail.com | Nguyenanhlong123@ |

---

## API Endpoints

### Products
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | /api/products | Lấy tất cả (có filter) |
| GET | /api/products/:id | Lấy 1 sản phẩm |
| POST | /api/products | Thêm mới |
| PUT | /api/products/:id | Cập nhật |
| DELETE | /api/products/:id | Xóa |

### Categories
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | /api/categories | Lấy tất cả |
| POST | /api/categories | Thêm mới |
| PUT | /api/categories/:id | Cập nhật |
| DELETE | /api/categories/:id | Xóa |

### Auth
| Method | URL | Mô tả |
|--------|-----|-------|
| POST | /api/auth/login | Đăng nhập |
| POST | /api/auth/register | Đăng ký |

### Users (Admin only)
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | /api/users | Danh sách user |
| PATCH | /api/users/:id/grant | Cấp quyền admin |
| PATCH | /api/users/:id/revoke | Thu hồi quyền admin |

---

## Ghi chú quan trọng

### Sự khác biệt tên field (JSON cũ → MySQL mới)

| JSON cũ (camelCase) | MySQL / Backend (snake_case) |
|---------------------|------------------------------|
| `fullName` | `full_name` |
| `isRoot` | `is_root` |
| `oldPrice` | `old_price` |
| `desc` | `description` |
| `createdAt` | `created_at` |

Frontend đã được cập nhật để xử lý cả hai tên field.

### Luồng dữ liệu

```
React Component
  → api.js (axios)
  → Vite proxy (/api → localhost:5000)
  → Express Router
  → Controller
  → Model (SQL)
  → MySQL Database
  → Model trả data
  → Controller trả JSON
  → axios nhận res.data
  → Component cập nhật state
```
