// ============================================================
// server/app.js — Điểm khởi chạy Express server
//
// Luồng xử lý một request:
//   Browser gửi request
//     → CORS middleware (cho phép frontend truy cập)
//     → JSON middleware (parse body)
//     → Router phân loại theo URL
//     → Controller xử lý
//     → Model truy vấn DB
//     → Trả JSON về browser
// ============================================================

const express = require('express');
const cors    = require('cors');
require('dotenv').config(); // đọc file .env

const app = express();

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────

// CORS: cho phép frontend (localhost:5173) gọi API từ backend (localhost:5000)
// Nếu không có cors → trình duyệt chặn request vì khác origin
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// Tự động parse request body dạng JSON
// Nhờ middleware này, req.body sẽ là object thay vì chuỗi thô
app.use(express.json());

// ── ROUTES ────────────────────────────────────────────────────────────────────
// Gắn từng router vào tiền tố URL tương ứng
// Ví dụ: productRoutes xử lý tất cả request bắt đầu bằng /api/products

app.use('/api/products',   require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/users',      require('./routes/userRoutes'));
app.use('/api/orders',     require('./routes/orderRoutes')); // đơn hàng

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
// Endpoint kiểm tra server có đang chạy không
// Gọi: GET http://localhost:5000/api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VLXD Server đang chạy!', time: new Date() });
});

// ── 404 HANDLER ───────────────────────────────────────────────────────────────
// Nếu không route nào khớp → trả 404
app.use((req, res) => {
  res.status(404).json({ error: `Không tìm thấy endpoint: ${req.method} ${req.url}` });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
// Bắt tất cả lỗi chưa được xử lý (express nhận ra vì có 4 tham số)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Lỗi server không xác định.' });
});

// ── KHỞI ĐỘNG SERVER ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`   Thử: GET http://localhost:${PORT}/api/health`);
});
