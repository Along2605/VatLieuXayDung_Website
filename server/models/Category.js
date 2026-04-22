// ============================================================
// server/models/Category.js — Các hàm truy vấn bảng categories
// ============================================================

const pool = require('../config/db');

const Category = {

  // Lấy tất cả danh mục, sắp xếp theo thứ tự label
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY label ASC');
    return rows;
  },

  // Lấy 1 danh mục theo id (VD: 'xi-mang')
  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  },

  // Thêm danh mục mới
  // id là slug do người dùng đặt (VD: 'gach-men'), không AUTO_INCREMENT
  create: async ({ id, label, icon }) => {
    await pool.query(
      'INSERT INTO categories (id, label, icon) VALUES (?, ?, ?)',
      [id, label, icon || 'box']
    );
    return Category.getById(id);
  },

  // Cập nhật label và icon (không cho sửa id vì là khóa chính)
  update: async (id, { label, icon }) => {
    await pool.query(
      'UPDATE categories SET label = ?, icon = ? WHERE id = ?',
      [label, icon, id]
    );
    return Category.getById(id);
  },

  // Xóa danh mục
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Category;
