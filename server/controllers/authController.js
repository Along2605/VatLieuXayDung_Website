// ============================================================
// server/controllers/authController.js — Đăng nhập & Đăng ký
//
// Lưu ý về bảo mật (project học tập):
//   - Password đang lưu plain text — trong thực tế dùng bcrypt
//   - Không dùng JWT — frontend tự lưu session qua localStorage
//   - Trong thực tế nên dùng JWT hoặc session cookie
// ============================================================

const User = require('../models/User');

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Validate bắt buộc
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email này đã được đăng ký.' });
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingPhone = await User.findByPhone(phone);
    if (existingPhone) {
      return res.status(409).json({ error: 'Số điện thoại đã được đăng ký.' });
    }

    // Tạo user mới (role mặc định = 'customer')
    const newUser = await User.create({ fullName, email, phone, password });
    res.status(201).json({ message: 'Đăng ký thành công!', user: newUser });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Lỗi server khi đăng ký.' });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' });
    }

    // Tìm user theo email (bao gồm password để so sánh)
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Email chưa được đăng ký.' }); // 401 Unauthorized
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Mật khẩu không đúng.' });
    }

    // Trả về thông tin user (KHÔNG trả về password)
    const { password: _pwd, ...safeUser } = user; // destructure loại bỏ password
    res.json({ message: 'Đăng nhập thành công!', user: safeUser });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Lỗi server khi đăng nhập.' });
  }
};

module.exports = { register, login };
