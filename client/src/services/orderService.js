// ============================================================
// src/services/orderService.js — Logic đơn hàng
//
// Thay đổi so với phiên bản cũ (chỉ dùng localStorage):
//   - saveOrderToDB: MỚI → POST /api/orders để lưu vào MySQL
//   - pollOrderStatus: CẬP NHẬT → GET /api/orders/:id mỗi 3s
//   - localStorage vẫn dùng để lưu tạm (dự phòng, OrderSuccessPage đọc)
//
// Luồng đầy đủ:
//   1. CheckoutPage bấm "Đặt hàng"
//      → createOrder() tạo object
//      → saveOrderToStorage() lưu localStorage
//      → saveOrderToDB() lưu MySQL qua POST /api/orders
//      → sendOrderToN8n() gửi Telegram cho admin
//      → navigate /waiting-payment
//
//   2. WaitingPaymentPage mount
//      → pollOrderStatus() GET /api/orders/:id mỗi 3 giây
//
//   3. Admin nhắn "ok DH123" trên Telegram
//      → n8n Code JS trích xuất orderId
//      → n8n HTTP Request: PATCH /api/orders/DH123/confirm
//      → MySQL: status = "paid"
//
//   4. Lần poll tiếp theo frontend nhận status = "paid"
//      → clearInterval → navigate /order-success
// ============================================================

const N8N_WEBHOOK_URL =
  'https://say-hi-jimmy.app.n8n.cloud/webhook/7483a7aa-7d9b-40bc-af19-2361d2ee6cfe';

const API_BASE        = '/api';                // Vite proxy → localhost:5000
const ORDER_EXPIRE_MS = 15 * 60 * 1000;        // 15 phút
const LS_KEY          = 'vlxd_pending_order';  // key trong localStorage

// ── TẠO ĐỐI TƯỢNG ORDER ───────────────────────────────────────────────────────
export function createOrder(form, cart, totalPrice, totalItems, userId = null) {
  const now = Date.now();
  return {
    orderId:     'DH' + now,
    customer: {
      fullName: form.fullName.trim(),
      phone:    form.phone.trim(),
      address:  form.address.trim(),
      note:     form.note?.trim() || '',
    },
    items:       cart,
    totalItems,
    totalAmount: totalPrice,
    payment:     form.payment,
    status:      'pending',
    userId,
    createdAt:   new Date(now).toISOString(),
    expireAt:    new Date(now + ORDER_EXPIRE_MS).toISOString(),
  };
}

// ── LOCALSTORAGE ───────────────────────────────────────────────────────────────
export function saveOrderToStorage(order) {
  localStorage.setItem(LS_KEY, JSON.stringify(order));
}

export function loadOrderFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearOrderFromStorage() {
  localStorage.removeItem(LS_KEY);
}

// ── KIỂM TRA HẾT HẠN (client-side, dự phòng) ─────────────────────────────────
export function isOrderExpired(order) {
  if (!order?.expireAt) return true;
  return Date.now() > new Date(order.expireAt).getTime();
}

export function secondsRemaining(order) {
  if (!order?.expireAt) return 0;
  const diff = new Date(order.expireAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

// ── LƯU ORDER VÀO DATABASE (MỚI) ─────────────────────────────────────────────
/**
 * POST /api/orders → Express → MySQL
 * Gọi ngay sau saveOrderToStorage()
 *
 * @param {object} order - object từ createOrder()
 * @returns {Promise<boolean>}
 */
export async function saveOrderToDB(order) {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId:     order.orderId,
        customer:    order.customer,
        items: order.items.map((i) => ({
          id: i.id, name: i.name, price: i.price, qty: i.qty, unit: i.unit,
        })),
        totalItems:  order.totalItems,
        totalAmount: order.totalAmount,
        payment:     order.payment,
        userId:      order.userId,
        expireAt:    order.expireAt,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[orderService] Lưu DB thất bại:', err.error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[orderService] Không kết nối được server:', err.message);
    return false;
  }
}

// ── GỬI N8N WEBHOOK ───────────────────────────────────────────────────────────
export async function sendOrderToN8n(order) {
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId:     order.orderId,
        customer:    order.customer,
        items: order.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        totalAmount: order.totalAmount,
        payment:     order.payment,
        createdAt:   order.createdAt,
        expireAt:    order.expireAt,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('[orderService] Không gửi được n8n:', err.message);
    return false;
  }
}

// ── POLLING TRẠNG THÁI TỪ DATABASE (CẬP NHẬT) ────────────────────────────────
/**
 * Gọi GET /api/orders/:orderId mỗi intervalMs milliseconds
 * Khi n8n PATCH /api/orders/:id/confirm → MySQL status = "paid"
 * → Lần poll tiếp theo nhận được status = "paid" → gọi onPaid()
 *
 * @param {string}   orderId
 * @param {function} onPaid      - gọi khi status = "paid"
 * @param {function} onExpired   - gọi khi status = "cancelled" hoặc hết hạn
 * @param {number}   intervalMs  - mặc định 3000ms
 * @returns {number} timerId
 */
export function pollOrderStatus(orderId, onPaid, onExpired, intervalMs = 3000) {
  const timerId = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`);

      if (res.status === 404) {
        // Đơn không tồn tại trong DB → dừng poll
        clearInterval(timerId);
        return;
      }
      if (!res.ok) return; // lỗi tạm thời → thử lại lần sau

      const data = await res.json();
      // data = { orderId, status, totalAmount, expireAt, createdAt }

      if (data.status === 'paid') {
        // ✅ Admin đã xác nhận → cập nhật localStorage rồi chuyển trang
        clearInterval(timerId);
        const local = loadOrderFromStorage();
        if (local) saveOrderToStorage({ ...local, status: 'paid' });
        onPaid(data);
        return;
      }

      if (data.status === 'cancelled') {
        // ❌ Server đã huỷ (hết hạn) → dừng, báo expired
        clearInterval(timerId);
        clearOrderFromStorage();
        onExpired();
        return;
      }

      // KHÔNG dùng data.expireAt để kiểm tra thêm ở đây
      // Lý do: server đã chạy cancelExpired() trước khi trả response
      // Nếu đơn hết hạn → status đã là "cancelled" → đã xử lý ở trên rồi
      // Việc tự parse expireAt ở client dễ bị lỗi múi giờ
    } catch {
      // Mất mạng → im lặng, thử lại lần sau
    }
  }, intervalMs);

  return timerId;
}
