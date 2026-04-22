// ============================================================
// server/controllers/categoryController.js
// ============================================================

const Category = require('../models/Category');

const getAll = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (err) {
    console.error('getAll categories error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

const getById = async (req, res) => {
  try {
    const cat = await Category.getById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Không tìm thấy danh mục.' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

const create = async (req, res) => {
  try {
    const { id, label, icon } = req.body;
    if (!id || !label) {
      return res.status(400).json({ error: 'Thiếu id và label.' });
    }
    // Kiểm tra id đã tồn tại chưa
    const existing = await Category.getById(id);
    if (existing) {
      return res.status(409).json({ error: `ID '${id}' đã tồn tại.` }); // 409 Conflict
    }
    const cat = await Category.create({ id, label, icon });
    res.status(201).json(cat);
  } catch (err) {
    console.error('create category error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

const update = async (req, res) => {
  try {
    const existing = await Category.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Không tìm thấy danh mục.' });
    const { label, icon } = req.body;
    if (!label) return res.status(400).json({ error: 'Thiếu label.' });
    const updated = await Category.update(req.params.id, { label, icon: icon || existing.icon });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await Category.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy danh mục.' });
    res.json({ message: 'Đã xóa danh mục.' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

module.exports = { getAll, getById, create, update, remove };
