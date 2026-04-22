// ============================================================
// server/models/Product.js — Các hàm truy vấn bảng products
//
// "Model" chứa toàn bộ logic SQL, controller chỉ gọi hàm này.
// Mỗi hàm trả về Promise → dùng async/await ở controller.
//
// Lý do tách Model ra riêng:
//   - Controller không cần biết SQL cụ thể
//   - Dễ thay đổi câu query ở một chỗ
//   - Dễ test từng hàm độc lập
// ============================================================

const pool = require('../config/db');

const Product = {

  // ── LẤY TẤT CẢ SẢN PHẨM ──────────────────────────────────────────────────
  // Hỗ trợ lọc theo: category, sale, tìm theo tên (search)
  // Ví dụ: GET /api/products?category=xi-mang&sale=true&search=hà tiên
  getAll: async ({ category, sale, search } = {}) => {
    // Bắt đầu với câu query cơ bản
    let sql    = 'SELECT * FROM products WHERE 1=1';
    const params = []; // mảng giá trị tương ứng với dấu ? trong SQL

    // Lọc theo danh mục
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    // Lọc sản phẩm đang sale
    if (sale === 'true') {
      sql += ' AND sale = 1';
    }

    // Tìm theo tên (LIKE '%từ khóa%')
    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`); // % = khớp bất kỳ ký tự nào
    }

    sql += ' ORDER BY id ASC';

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // ── LẤY 1 SẢN PHẨM THEO ID ────────────────────────────────────────────────
  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0]; // rows là mảng, lấy phần tử đầu tiên
  },

  // ── TẠO SẢN PHẨM MỚI ─────────────────────────────────────────────────────
  // Dùng destructuring để lấy từng field từ object data
  create: async (data) => {
    const { name, price, unit, category, img, brand, rating, reviews, sale, old_price, stock, description } = data;

    const sql = `
      INSERT INTO products
        (name, price, unit, category, img, brand, rating, reviews, sale, old_price, stock, description)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      name,
      price,
      unit,
      category,
      img   || null,
      brand || null,
      rating    || 4.5,
      reviews   || 0,
      sale      ? 1 : 0, // boolean → 0/1 cho MySQL
      old_price || null,
      stock     || 0,
      description || null,
    ];

    const [result] = await pool.query(sql, params);
    // result.insertId: ID vừa được tạo (AUTO_INCREMENT)
    return Product.getById(result.insertId);
  },

  // ── CẬP NHẬT SẢN PHẨM ────────────────────────────────────────────────────
  // Chỉ cập nhật những field được gửi lên (PATCH behavior)
  update: async (id, data) => {
    // Tạo động các cặp "field = ?" từ object data
    const fields  = Object.keys(data);
    const values  = Object.values(data);

    if (fields.length === 0) return null; // không có gì để update

    // Tạo chuỗi "name = ?, price = ?, ..." từ mảng fields
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const sql       = `UPDATE products SET ${setClause} WHERE id = ?`;

    await pool.query(sql, [...values, id]); // thêm id vào cuối cho WHERE
    return Product.getById(id); // trả về bản ghi đã cập nhật
  },

  // ── XÓA SẢN PHẨM ─────────────────────────────────────────────────────────
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    // result.affectedRows: số dòng bị xóa (0 nếu không tìm thấy id)
    return result.affectedRows > 0;
  },
};

module.exports = Product;
