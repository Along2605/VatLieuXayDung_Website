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

  // ── QUAN TRỌNG: charset utf8mb4 cho tiếng Việt ──────────────────────────
  // utf8mb4 hỗ trợ đầy đủ Unicode bao gồm tiếng Việt có dấu
  // Nếu thiếu → dữ liệu lấy ra bị mất dấu (Xi Mang thay vì Xi Măng)
  charset: 'utf8mb4',

  // Tự động chạy SET NAMES sau mỗi lần pool tạo kết nối mới
  // Đảm bảo 100% kết nối dùng utf8mb4, không chỉ kết nối đầu tiên
  // Đây là cách đúng nhất với mysql2, không cần afterConnect callback
  multipleStatements: false,

  // Tự động chuyển số 0/1 từ MySQL thành false/true trong JavaScript
  typeCast: function(field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      return field.string() === '1'; // TINYINT(1) → boolean
    }
    return next();
  },

  // KHÔNG set timezone ở đây để driver dùng UTC xuyên suốt
  timezone: 'Z',
});

// ── Đảm bảo mọi kết nối dùng utf8mb4 ───────────────────────────────────────
// pool.on('connection') chạy mỗi khi pool tạo kết nối MySQL mới
// → SET NAMES đảm bảo kết nối đó dùng utf8mb4 để đọc/ghi dữ liệu
pool.on('connection', function(connection) {
  connection.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
});

// Test kết nối khi server khởi động
(async () => {
  try {
    const conn = await pool.getConnection();
    // Chạy SET NAMES ngay trên kết nối test
    await conn.execute("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
    console.log('✅ Kết nối MySQL thành công (charset: utf8mb4)!');
    conn.release();
  } catch (err) {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
    console.error('   Kiểm tra: MySQL đang chạy? user/password đúng? database tồn tại?');
    process.exit(1);
  }
})();

module.exports = pool;
