// ============================================================
// server/config/db.js — Kết nối MySQL
//
// Dùng "pool" thay vì kết nối đơn lẻ vì:
//   - Pool giữ sẵn nhiều kết nối, tái sử dụng thay vì tạo mới mỗi request
//   - Nhanh hơn, không bị tắc nghẽn khi nhiều người dùng cùng lúc
//
// Cách dùng ở nơi khác:
//   const pool = require('../config/db');
//   const [rows] = await pool.query('SELECT * FROM products');
// ============================================================

const mysql = require('mysql2/promise');
require('dotenv').config(); // đọc biến từ file .env

// Tạo connection pool
const pool = mysql.createPool({
  host:     process.env.DB_HOST,     // thường là 'localhost'
  user:     process.env.DB_USER,     // 'sa'
  password: process.env.DB_PASSWORD, // 'sapassword'
  database: process.env.DB_NAME,     // 'vlxd_db'
  port:     process.env.DB_PORT,     // 3306

  // Số kết nối tối đa trong pool
  connectionLimit: 10,

  // Tự động chuyển số 0/1 từ MySQL thành false/true trong JavaScript
  typeCast: function(field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      return field.string() === '1'; // TINYINT(1) → boolean
    }
    return next();
  },

  // KHÔNG set timezone ở đây để driver dùng UTC xuyên suốt
  // Nếu set '+07:00', driver sẽ interpret datetime lưu vào DB theo UTC+7
  // → expire_at bị lệch 7 giờ → cancelExpired() huỷ đơn ngay lập tức
  timezone: 'Z',  // 'Z' = UTC, nhất quán với ISO string từ JavaScript
});

// Test kết nối khi server khởi động
// (async IIFE — hàm async tự gọi ngay lập tức)
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Kết nối MySQL thành công!');
    conn.release(); // trả kết nối về pool sau khi test xong
  } catch (err) {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
    console.error('   Kiểm tra: MySQL đang chạy? user/password đúng? database tồn tại?');
    process.exit(1); // dừng server nếu không kết nối được DB
  }
})();

module.exports = pool;
