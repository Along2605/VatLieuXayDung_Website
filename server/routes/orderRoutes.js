// ============================================================
// server/routes/orderRoutes.js
//
// Sơ đồ endpoints:
//
//   POST   /api/orders              → tạo đơn hàng mới (frontend gọi khi checkout)
//   GET    /api/orders              → danh sách tất cả đơn (admin)
//   GET    /api/orders/:id          → lấy 1 đơn theo orderId (frontend polling)
//   PATCH  /api/orders/:id/confirm  → xác nhận thanh toán (n8n gọi)
//   GET    /api/orders/user/:userId → lịch sử đơn của user
//
// ── Cách n8n gọi endpoint confirm ─────────────────────────
//   URL:    PATCH http://your-server:5000/api/orders/DH123/confirm
//   Header: x-webhook-secret: vlxd-secret-2026
//   Body:   (không cần body)
// ============================================================

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/orderController');

// Lưu ý: route /user/:userId phải đặt TRƯỚC /:id
// vì Express match từ trên xuống — nếu /:id ở trước,
// request GET /user/5 sẽ bị nhận nhầm là /:id = "user"
router.get   ('/user/:userId',    controller.getByUser);  // lịch sử đơn của user
router.get   ('/',                controller.getAll);      // danh sách tất cả (admin)
router.get   ('/:id',             controller.getById);     // polling trạng thái
router.post  ('/',                controller.create);      // tạo đơn mới
router.patch ('/:id/confirm',     controller.confirm);     // n8n xác nhận thanh toán

module.exports = router;
