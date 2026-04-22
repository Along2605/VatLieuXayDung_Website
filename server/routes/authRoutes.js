// ============================================================
// server/routes/authRoutes.js
// ============================================================

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/authController');

// POST /api/auth/register — đăng ký tài khoản mới
router.post('/register', controller.register);

// POST /api/auth/login — đăng nhập
router.post('/login', controller.login);

module.exports = router;
