// services/orderService.js
// Kiến thức: module, async/await, fetch API, localStorage
// Tách biệt logic nghiệp vụ ra khỏi component

// ── CẤU HÌNH ─────────────────────────────────────────────────────────────────
// TODO: Thay bằng URL webhook n8n thật của bạn
const N8N_WEBHOOK_URL =
  "https://say-hi-jimmy.app.n8n.cloud/webhook/7483a7aa-7d9b-40bc-af19-2361d2ee6cfe";

// Thời gian hết hạn đơn hàng: 15 phút (tính bằng ms)
const ORDER_EXPIRE_MS = 15 * 60 * 1000;

// Key lưu trong localStorage
const LS_KEY = "vlxd_pending_order";

// ── TẠO ORDER ────────────────────────────────────────────────────────────────
/**
 * Tạo đối tượng order mới từ form + giỏ hàng
 * @param {object} form   - thông tin giao hàng (fullName, phone, address, note, payment)
 * @param {Array}  cart   - danh sách sản phẩm trong giỏ
 * @param {number} totalPrice
 * @param {number} totalItems
 * @returns {object} order
 */
export function createOrder(form, cart, totalPrice, totalItems) {
  const now = Date.now();
  return {
    orderId: "DH" + now, // VD: DH1718000000000
    customer: {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      note: form.note.trim(),
    },
    items: cart, // [{id, name, price, qty, ...}]
    totalItems,
    totalAmount: totalPrice,
    payment: form.payment, // "bank" | "momo" | "cod"
    status: "pending", // pending → paid → done
    createdAt: new Date(now).toISOString(),
    expireAt: new Date(now + ORDER_EXPIRE_MS).toISOString(),
  };
}

// ── LOCALSTORAGE ─────────────────────────────────────────────────────────────
/** Lưu đơn hàng vào localStorage */
export function saveOrderToStorage(order) {
  localStorage.setItem(LS_KEY, JSON.stringify(order));
}

/** Đọc đơn hàng từ localStorage */
export function loadOrderFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Cập nhật trạng thái đơn trong localStorage */
export function updateOrderStatus(orderId, status) {
  const order = loadOrderFromStorage();
  if (order && order.orderId === orderId) {
    const updated = { ...order, status };
    saveOrderToStorage(updated);
    return updated;
  }
  return null;
}

/** Xoá đơn hàng khỏi localStorage */
export function clearOrderFromStorage() {
  localStorage.removeItem(LS_KEY);
}

// ── KIỂM TRA HẾT HẠN ────────────────────────────────────────────────────────
/** Trả về true nếu đơn hàng đã quá 15 phút */
export function isOrderExpired(order) {
  if (!order?.expireAt) return true;
  return Date.now() > new Date(order.expireAt).getTime();
}

/** Trả về số giây còn lại (>=0) */
export function secondsRemaining(order) {
  if (!order?.expireAt) return 0;
  const diff = new Date(order.expireAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

// ── GỬI N8N WEBHOOK ──────────────────────────────────────────────────────────
/**
 * Gửi thông tin đơn hàng đến n8n webhook
 * n8n sẽ nhận → gửi Telegram cho admin
 * @param {object} order
 * @returns {Promise<boolean>} true nếu thành công
 */
export async function sendOrderToN8n(order) {
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.orderId,
        customer: order.customer,
        items: order.items.map((i) => ({
          name: i.name,
          qty: i.qty,
          price: i.price,
        })),
        totalAmount: order.totalAmount,
        payment: order.payment,
        createdAt: order.createdAt,
        expireAt: order.expireAt,
      }),
    });
    return res.ok;
  } catch (err) {
    // Network lỗi hoặc n8n chưa cấu hình → không chặn luồng mua hàng
    console.warn("[orderService] Không gửi được n8n webhook:", err.message);
    return false;
  }
}

// ── POLLING TRẠNG THÁI ───────────────────────────────────────────────────────
/**
 * Polling: cứ mỗi `intervalMs` lại đọc localStorage kiểm tra status.
 * n8n sẽ gọi một endpoint (hoặc ta dùng cách khác) để cập nhật status.
 *
 * Trong demo này: n8n webhook confirm sẽ gọi về
 * /webhook/vlxd-confirm?orderId=DH123&secret=xxx
 * → frontend dùng một endpoint riêng hoặc polling localStorage.
 *
 * Vì không có backend, ta dùng BroadcastChannel để
 * một tab khác (hoặc Service Worker) cập nhật localStorage rồi notify.
 *
 * Giải pháp đơn giản nhất: n8n gọi webhook xác nhận của chính n8n
 * rồi set một flag trong một public endpoint → ta polling endpoint đó.
 *
 * Trong file này ta export hàm để component dùng setInterval tự quản lý.
 */
export function pollOrderStatus(orderId, onPaid, onExpired, intervalMs = 5000) {
  const timer = setInterval(() => {
    const order = loadOrderFromStorage();

    // Không còn đơn hoặc sai orderId → dừng
    if (!order || order.orderId !== orderId) {
      clearInterval(timer);
      return;
    }

    // Hết hạn
    if (isOrderExpired(order)) {
      clearInterval(timer);
      clearOrderFromStorage();
      onExpired();
      return;
    }

    // Đã thanh toán
    if (order.status === "paid") {
      clearInterval(timer);
      onPaid(order);
    }
  }, intervalMs);

  return timer; // trả về để component có thể clearInterval khi unmount
}
