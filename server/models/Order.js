// ============================================================
// server/models/Order.js — Các hàm truy vấn bảng orders
//
// Luồng dữ liệu:
//   1. CheckoutPage tạo order → POST /api/orders → Order.create()
//   2. WaitingPaymentPage polling → GET /api/orders/:id → Order.getById()
//   3. n8n admin xác nhận → PATCH /api/orders/:id/confirm → Order.confirm()
//   4. Hết hạn → PATCH cancel → Order.cancel()
// ============================================================

const pool = require('../config/db');

const Order = {

  // ── TẠO ĐƠN HÀNG MỚI ─────────────────────────────────────────────────────
  /**
   * Nhận object order từ frontend (đã có orderId, expireAt)
   * và lưu vào database
   */
  create: async (orderData) => {
    const {
      orderId,
      customer,
      items,
      totalItems,
      totalAmount,
      payment,
      userId,
      expireAt,
    } = orderData;

    const sql = `
      INSERT INTO orders
        (order_id, customer_name, customer_phone, customer_address, customer_note,
         items, total_items, total_amount, payment, user_id, status, expire_at)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `;

    await pool.query(sql, [
      orderId,
      customer.fullName,
      customer.phone,
      customer.address,
      customer.note || '',
      JSON.stringify(items),   // lưu mảng sản phẩm thành chuỗi JSON
      totalItems,
      totalAmount,
      payment,
      userId || null,
      // expireAt từ frontend là ISO string, MySQL cần datetime
      new Date(expireAt).toISOString().slice(0, 19).replace('T', ' '),
    ]);

    return Order.getById(orderId);
  },

  // ── LẤY ĐƠN HÀNG THEO ID ─────────────────────────────────────────────────
  getById: async (orderId) => {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE order_id = ?',
      [orderId]
    );
    if (!rows[0]) return null;

    const order = rows[0];
    // Parse items từ JSON string về mảng (MySQL trả về string hoặc object tuỳ driver)
    if (typeof order.items === 'string') {
      order.items = JSON.parse(order.items);
    }
    return order;
  },

  // ── XÁC NHẬN ĐÃ THANH TOÁN (admin nhắn "ok DH123") ──────────────────────
  confirm: async (orderId) => {
    // Lấy đơn trước để kiểm tra
    const order = await Order.getById(orderId);
    if (!order) return { ok: false, error: 'Không tìm thấy đơn hàng.' };
    if (order.status === 'paid') return { ok: false, error: 'Đơn hàng đã được xác nhận.' };
    if (order.status === 'cancelled') return { ok: false, error: 'Đơn hàng đã bị huỷ.' };

    // Kiểm tra hết hạn ở server — không tin hoàn toàn vào frontend
    if (new Date() > new Date(order.expire_at)) {
      // Tự động cancel đơn hết hạn
      await pool.query(
        "UPDATE orders SET status = 'cancelled' WHERE order_id = ?",
        [orderId]
      );
      return { ok: false, error: 'Đơn hàng đã hết hạn.' };
    }

    // Cập nhật status = paid
    await pool.query(
      "UPDATE orders SET status = 'paid' WHERE order_id = ?",
      [orderId]
    );

    return { ok: true, order: await Order.getById(orderId) };
  },

  // ── HUỶ ĐƠN HÀNG ─────────────────────────────────────────────────────────
  cancel: async (orderId) => {
    await pool.query(
      "UPDATE orders SET status = 'cancelled' WHERE order_id = ?",
      [orderId]
    );
    return Order.getById(orderId);
  },

  // ── LẤY DANH SÁCH ĐƠN CỦA USER ──────────────────────────────────────────
  getByUser: async (userId) => {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    // Parse items cho từng đơn
    return rows.map((r) => ({
      ...r,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
    }));
  },

  // ── LẤY TẤT CẢ ĐƠN HÀNG (admin) ─────────────────────────────────────────
  getAll: async ({ status, limit = 50 } = {}) => {
    let sql    = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.query(sql, params);
    return rows.map((r) => ({
      ...r,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
    }));
  },

  // ── TỰ ĐỘNG HUỶ CÁC ĐƠN HẾT HẠN ─────────────────────────────────────────
  // Gọi định kỳ hoặc trước khi trả kết quả cho client
  cancelExpired: async () => {
    const [result] = await pool.query(`
      UPDATE orders
      SET status = 'cancelled'
      WHERE status = 'pending'
        AND expire_at < NOW()
    `);
    return result.affectedRows; // số đơn bị huỷ
  },
};

module.exports = Order;
