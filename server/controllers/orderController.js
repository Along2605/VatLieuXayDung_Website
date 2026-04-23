// ============================================================
// server/controllers/orderController.js
//
// Xử lý các endpoint liên quan đến đơn hàng.
//
// Endpoint quan trọng nhất:
//   PATCH /api/orders/:id/confirm
//   → n8n gọi endpoint này sau khi admin nhắn "ok DH123" trên Telegram
//   → server đổi status = 'paid' trong DB
//   → frontend đang polling sẽ nhận được status = 'paid' → chuyển trang
//
// Bảo vệ endpoint confirm bằng SECRET KEY để tránh ai cũng gọi được:
//   n8n gửi header: x-webhook-secret: <SECRET>
//   server kiểm tra header này trước khi xác nhận
// ============================================================

const Order = require('../models/Order');

// Secret key để xác thực webhook từ n8n
// Đặt giá trị này trong server/.env: WEBHOOK_SECRET=your_secret_here
// n8n phải gửi đúng secret này trong header "x-webhook-secret"
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'vlxd-secret-2026';

// ── POST /api/orders ───────────────────────────────────────────────────────
// Frontend gọi khi user bấm "Đặt hàng" → lưu đơn vào DB
const create = async (req, res) => {
  try {
    const { orderId, customer, items, totalItems, totalAmount, payment, expireAt } = req.body;

    // Validate các field bắt buộc
    if (!orderId || !customer || !items || !totalAmount || !expireAt) {
      return res.status(400).json({ error: 'Thiếu thông tin đơn hàng.' });
    }
    if (!customer.fullName || !customer.phone || !customer.address) {
      return res.status(400).json({ error: 'Thiếu thông tin giao hàng.' });
    }

    // Lấy userId từ request body (frontend gửi kèm khi đặt hàng)
    const userId = req.body.userId || null;

    const order = await Order.create({
      orderId, customer, items,
      totalItems, totalAmount, payment,
      userId, expireAt,
    });

    res.status(201).json({ message: 'Đặt hàng thành công!', order });
  } catch (err) {
    // Lỗi trùng orderId (đặt hàng 2 lần)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Đơn hàng đã tồn tại.' });
    }
    console.error('create order error:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo đơn hàng.' });
  }
};

// ── GET /api/orders/:id ────────────────────────────────────────────────────
// Frontend polling mỗi 3 giây để kiểm tra status
const getById = async (req, res) => {
  try {
    // Tự động huỷ các đơn hết hạn trước khi trả kết quả
    // (không cần chạy cron job riêng)
    await Order.cancelExpired();

    const order = await Order.getById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });

    // Chỉ trả về các field cần thiết cho frontend polling
    // (không trả toàn bộ để tránh lộ thông tin không cần thiết)
    // Chuyển expire_at và created_at thành ISO string chuẩn (có "T" và "Z")
    // MySQL trả về Date object hoặc "2026-04-23 10:30:00" (không có timezone)
    // Nếu frontend dùng new Date("2026-04-23 10:30:00") → parse sai múi giờ → báo hết hạn ngay
    // ISO string "2026-04-23T10:30:00.000Z" → parse đúng UTC trên mọi trình duyệt
    res.json({
      orderId:     order.order_id,
      status:      order.status,
      totalAmount: order.total_amount,
      expireAt:    new Date(order.expire_at).toISOString(),  // ← fix: luôn ISO string
      createdAt:   new Date(order.created_at).toISOString(),
    });
  } catch (err) {
    console.error('getById order error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

// ── PATCH /api/orders/:id/confirm ─────────────────────────────────────────
// n8n gọi endpoint này sau khi admin nhắn "ok DH123" trên Telegram
// Cần gửi header: x-webhook-secret: vlxd-secret-2026
const confirm = async (req, res) => {
  try {
    // Kiểm tra secret key — bảo vệ endpoint không cho ai tuỳ tiện gọi
    const secret = req.headers['x-webhook-secret'];
    if (secret !== WEBHOOK_SECRET) {
      console.warn(`[confirm] Sai secret: "${secret}" từ ${req.ip}`);
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { id: orderId } = req.params;
    console.log(`[confirm] Xác nhận đơn hàng: ${orderId}`);

    const result = await Order.confirm(orderId);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ message: `Đơn hàng ${orderId} đã được xác nhận.`, order: result.order });
  } catch (err) {
    console.error('confirm order error:', err);
    res.status(500).json({ error: 'Lỗi server khi xác nhận đơn hàng.' });
  }
};

// ── GET /api/orders/user/:userId ──────────────────────────────────────────
// Lịch sử đơn hàng của một user
const getByUser = async (req, res) => {
  try {
    await Order.cancelExpired();
    const orders = await Order.getByUser(req.params.userId);
    res.json(orders);
  } catch (err) {
    console.error('getByUser error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

// ── GET /api/orders (admin) ────────────────────────────────────────────────
// Danh sách tất cả đơn hàng, lọc theo status
const getAll = async (req, res) => {
  try {
    await Order.cancelExpired();
    const { status } = req.query; // VD: ?status=pending
    const orders = await Order.getAll({ status });
    res.json(orders);
  } catch (err) {
    console.error('getAll orders error:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
};

module.exports = { create, getById, confirm, getByUser, getAll };
