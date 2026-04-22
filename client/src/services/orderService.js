// ============================================================
// services/orderService.js — Xử lý logic đơn hàng
//
// "Service" là file tách riêng các hàm nghiệp vụ ra khỏi component
// để component chỉ lo phần giao diện, không phải lo logic phức tạp.
//
// File này làm 4 việc:
//   1. Tạo đơn hàng (createOrder)
//   2. Lưu/đọc/xóa đơn trong localStorage
//   3. Kiểm tra hết hạn (15 phút)
//   4. Gửi đơn lên n8n webhook → n8n nhắn Telegram cho admin
//   5. Polling: cứ 5 giây kiểm tra đơn có được xác nhận chưa
// ============================================================

// ── CẤU HÌNH ─────────────────────────────────────────────────────────────────

// TODO: Thay bằng URL webhook n8n thật của bạn
const N8N_WEBHOOK_URL =
  "https://say-hi-jimmy.app.n8n.cloud/webhook/7483a7aa-7d9b-40bc-af19-2361d2ee6cfe";

// 15 phút tính bằng milliseconds (1 phút = 60.000ms)
const ORDER_EXPIRE_MS = 15 * 60 * 1000;

// Tên key lưu trong localStorage
const LS_KEY = "vlxd_pending_order";

// ── 1. TẠO ĐƠN HÀNG ──────────────────────────────────────────────────────────

/**
 * Tạo object đơn hàng từ dữ liệu form + giỏ hàng
 *
 * @param {object} form - { fullName, phone, address, note, payment }
 * @param {Array}  cart - mảng sản phẩm từ CartContext
 * @param {number} totalPrice - tổng tiền
 * @param {number} totalItems - tổng số lượng
 * @returns {object} order
 */
export function createOrder(form, cart, totalPrice, totalItems) {
  const now = Date.now(); // timestamp hiện tại (số)

  return {
    orderId:     "DH" + now,   // VD: DH1718000000000 — mã đơn duy nhất
    customer: {
      fullName: form.fullName.trim(),
      phone:    form.phone.trim(),
      address:  form.address.trim(),
      note:     form.note.trim(),
    },
    items:       cart,         // danh sách sản phẩm [{ id, name, price, qty }]
    totalItems,
    totalAmount: totalPrice,
    payment:     form.payment, // "cod" | "bank" | "momo"
    status:      "pending",    // trạng thái: pending → paid → done
    createdAt:   new Date(now).toISOString(),               // thời điểm tạo
    expireAt:    new Date(now + ORDER_EXPIRE_MS).toISOString(), // hết hạn sau 15 phút
  };
}

// ── 2. LOCALSTORAGE ───────────────────────────────────────────────────────────
// localStorage là bộ nhớ của trình duyệt, lưu dữ liệu dạng chuỗi text
// JSON.stringify: object → chuỗi để lưu
// JSON.parse: chuỗi → object để đọc

/** Lưu đơn hàng vào localStorage */
export function saveOrderToStorage(order) {
  localStorage.setItem(LS_KEY, JSON.stringify(order));
}

/** Đọc đơn hàng từ localStorage, trả về null nếu không có */
export function loadOrderFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // nếu dữ liệu bị hỏng → trả null
  }
}

/** Cập nhật trạng thái đơn hàng trong localStorage */
export function updateOrderStatus(orderId, status) {
  const order = loadOrderFromStorage();
  if (order && order.orderId === orderId) {
    const updated = { ...order, status }; // copy order, đổi status
    saveOrderToStorage(updated);
    return updated;
  }
  return null;
}

/** Xóa đơn hàng khỏi localStorage */
export function clearOrderFromStorage() {
  localStorage.removeItem(LS_KEY);
}

// ── 3. KIỂM TRA HẾT HẠN ──────────────────────────────────────────────────────

/** Trả về true nếu đơn hàng đã quá 15 phút */
export function isOrderExpired(order) {
  if (!order?.expireAt) return true;
  // So sánh thời điểm hiện tại với thời điểm hết hạn
  return Date.now() > new Date(order.expireAt).getTime();
}

/** Trả về số giây còn lại (tối thiểu 0) */
export function secondsRemaining(order) {
  if (!order?.expireAt) return 0;
  const diff = new Date(order.expireAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

// ── 4. GỬI N8N WEBHOOK ───────────────────────────────────────────────────────
// n8n là công cụ automation: nhận webhook → gửi Telegram cho admin
// Admin nhắn "ok DH123" → n8n gọi lại để xác nhận đơn → frontend cập nhật

/**
 * Gửi thông tin đơn hàng đến n8n
 * Dùng "fire & forget" — không chờ kết quả, không chặn luồng mua hàng
 */
export async function sendOrderToN8n(order) {
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId:     order.orderId,
        customer:    order.customer,
        // Chỉ gửi thông tin cần thiết, không gửi toàn bộ
        items: order.items.map((i) => ({
          name:  i.name,
          qty:   i.qty,
          price: i.price,
        })),
        totalAmount: order.totalAmount,
        payment:     order.payment,
        createdAt:   order.createdAt,
        expireAt:    order.expireAt,
      }),
    });
    return res.ok;
  } catch (err) {
    // Nếu n8n chưa cấu hình hoặc mất mạng → in cảnh báo nhưng không báo lỗi cho user
    console.warn("[orderService] Không gửi được webhook:", err.message);
    return false;
  }
}

// ── 5. POLLING TRẠNG THÁI ────────────────────────────────────────────────────
// Polling: cứ mỗi N giây, tự động kiểm tra trạng thái đơn hàng
// Khi admin xác nhận → n8n cập nhật localStorage → polling phát hiện → chuyển trang

/**
 * Bắt đầu polling kiểm tra trạng thái đơn hàng
 *
 * @param {string}   orderId     - mã đơn cần theo dõi
 * @param {function} onPaid      - callback khi đơn được xác nhận thanh toán
 * @param {function} onExpired   - callback khi đơn hết hạn
 * @param {number}   intervalMs  - kiểm tra mỗi bao nhiêu ms (mặc định 5000 = 5 giây)
 * @returns {number} timerId - để gọi clearInterval(timerId) khi cần dừng
 */
export function pollOrderStatus(orderId, onPaid, onExpired, intervalMs = 5000) {
  const timerId = setInterval(() => {
    const order = loadOrderFromStorage();

    // Không có đơn hoặc sai mã → dừng polling
    if (!order || order.orderId !== orderId) {
      clearInterval(timerId);
      return;
    }

    // Hết hạn 15 phút → xóa đơn và báo về component
    if (isOrderExpired(order)) {
      clearInterval(timerId);
      clearOrderFromStorage();
      onExpired();
      return;
    }

    // Admin đã xác nhận → báo về component
    if (order.status === "paid") {
      clearInterval(timerId);
      onPaid(order);
    }
  }, intervalMs);

  // Trả về timerId để component gọi clearInterval(timerId) khi unmount
  return timerId;
}
