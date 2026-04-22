// ============================================================
// server/controllers/productController.js
//
// Controller xử lý logic cho từng endpoint sản phẩm.
// Nhận Request → gọi Model → trả Response (JSON).
//
// Quy tắc xử lý lỗi:
//   - Lỗi nghiệp vụ (không tìm thấy, thiếu field) → 4xx
//   - Lỗi server/database                          → 500
// ============================================================

const Product = require('../models/Product');

// ── GET /api/products ─────────────────────────────────────────────────────────
// Lấy tất cả sản phẩm, hỗ trợ query: ?category=xi-mang&sale=true&search=hà tiên
const getAll = async (req, res) => {
  try {
    // req.query: object chứa các tham số trên URL (?key=value)
    const { category, sale, search } = req.query;
    const products = await Product.getAll({ category, sale, search });
    res.json(products); // trả về mảng JSON
  } catch (err) {
    console.error('getAll products error:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách sản phẩm.' });
  }
};

// ── GET /api/products/:id ─────────────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id); // req.params.id = giá trị :id trong URL
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    }
    res.json(product);
  } catch (err) {
    console.error('getById product error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

// ── POST /api/products ────────────────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { name, price, unit, category } = req.body; // req.body: dữ liệu JSON từ client

    // Validate: kiểm tra các field bắt buộc
    if (!name || !price || !unit || !category) {
      return res.status(400).json({ error: 'Thiếu thông tin: name, price, unit, category là bắt buộc.' });
    }

    const product = await Product.create(req.body);
    res.status(201).json(product); // 201 Created
  } catch (err) {
    console.error('create product error:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo sản phẩm.' });
  }
};

// ── PUT /api/products/:id ─────────────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const existing = await Product.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    }

    const updated = await Product.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('update product error:', err);
    res.status(500).json({ error: 'Lỗi server khi cập nhật sản phẩm.' });
  }
};

// ── DELETE /api/products/:id ──────────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const deleted = await Product.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    }
    res.json({ message: 'Đã xóa sản phẩm thành công.' });
  } catch (err) {
    console.error('delete product error:', err);
    res.status(500).json({ error: 'Lỗi server khi xóa sản phẩm.' });
  }
};

module.exports = { getAll, getById, create, update, remove };
