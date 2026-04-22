// ============================================================
// server/models/User.js — Các hàm truy vấn bảng users
// ============================================================

const pool = require('../config/db');

// Các field được trả về (loại bỏ password)
const SAFE_FIELDS = 'id, full_name, email, phone, role, is_root, created_at';

const User = {

  // Tìm user theo email (dùng khi đăng nhập)
  // Trả về bao gồm password để so sánh
  findByEmail: async (email) => {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    return rows[0]; // undefined nếu không tìm thấy
  },

  // Tìm user theo số điện thoại (kiểm tra khi đăng ký)
  findByPhone: async (phone) => {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );
    return rows[0];
  },

  // Lấy thông tin user theo ID (không có password)
  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  // Lấy tất cả users (không có password) — dùng ở AdminUsersPage
  getAll: async () => {
    const [rows] = await pool.query(
      `SELECT ${SAFE_FIELDS} FROM users ORDER BY id ASC`
    );
    return rows;
  },

  // Tạo user mới (đăng ký)
  create: async ({ fullName, email, phone, password }) => {
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, phone, password, role, is_root)
       VALUES (?, ?, ?, ?, 'customer', 0)`,
      [fullName.trim(), email.toLowerCase().trim(), phone, password]
    );
    return User.getById(result.insertId);
  },

  // Cập nhật role của user (cấp/thu hồi admin)
  updateRole: async (id, { role, is_root }) => {
    await pool.query(
      'UPDATE users SET role = ?, is_root = ? WHERE id = ?',
      [role, is_root ? 1 : 0, id]
    );
    return User.getById(id);
  },
};

module.exports = User;
