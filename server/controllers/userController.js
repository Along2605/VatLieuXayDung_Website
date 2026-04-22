// ============================================================
// server/controllers/userController.js — Quản lý người dùng
// Chỉ admin mới gọi được các endpoint này (kiểm tra ở routes)
// ============================================================

const User = require('../models/User');

// ── GET /api/users ────────────────────────────────────────────────────────────
// Lấy danh sách tất cả user (không có password)
const getAll = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (err) {
    console.error('getAll users error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

// ── GET /api/users/:id ────────────────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

// ── PATCH /api/users/:id/grant-admin ─────────────────────────────────────────
// Cấp quyền admin cho một customer
const grantAdmin = async (req, res) => {
  try {
    const target = await User.getById(req.params.id);
    if (!target) return res.status(404).json({ error: 'Không tìm thấy user.' });
    if (target.role === 'admin') return res.status(400).json({ error: 'User này đã là admin.' });

    const updated = await User.updateRole(req.params.id, { role: 'admin', is_root: false });
    res.json({ message: 'Đã cấp quyền admin.', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

// ── PATCH /api/users/:id/revoke-admin ────────────────────────────────────────
// Thu hồi quyền admin (chỉ root admin được gọi endpoint này)
const revokeAdmin = async (req, res) => {
  try {
    const target = await User.getById(req.params.id);
    if (!target)      return res.status(404).json({ error: 'Không tìm thấy user.' });
    if (target.is_root)  return res.status(400).json({ error: 'Không thể thu hồi Root Admin.' });
    if (target.role !== 'admin') return res.status(400).json({ error: 'User này không phải admin.' });

    const updated = await User.updateRole(req.params.id, { role: 'customer', is_root: false });
    res.json({ message: 'Đã thu hồi quyền admin.', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

module.exports = { getAll, getById, grantAdmin, revokeAdmin };
