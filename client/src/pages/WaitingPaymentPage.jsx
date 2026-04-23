// pages/WaitingPaymentPage.jsx
// Kiến thức: useEffect, useState, useNavigate, polling với setInterval, localStorage
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/CheckoutSteps";
import CountdownTimer from "../components/CountdownTimer";
import {
  loadOrderFromStorage,
  clearOrderFromStorage,
  isOrderExpired,
  pollOrderStatus,
} from "../services/orderService";

const formatPrice = (price) =>
  price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const PAYMENT_INFO = {
  bank: {
    icon: "bi-bank",
    label: "Chuyển khoản ngân hàng",
    lines: [
      { label: "Ngân hàng",   value: "MB Bank" },
      { label: "Số tài khoản", value: "0123456789" },
      { label: "Chủ tài khoản", value: "VLXD ĐỨC PHIẾN" },
    ],
  },
  momo: {
    icon: "bi-wallet2",
    label: "Ví MoMo",
    lines: [
      { label: "Số điện thoại", value: "0901234567" },
      { label: "Tên",           value: "NGUYEN VAN A" },
    ],
  },
  cod: {
    icon: "bi-cash-coin",
    label: "Thanh toán khi nhận hàng",
    lines: [],
  },
};

// ── COMPONENT CHÍNH ──────────────────────────────────────────────────────────
export default function WaitingPaymentPage() {
  const navigate = useNavigate();

  // Đọc order từ localStorage khi mount
  const [order, setOrder]       = useState(() => loadOrderFromStorage());
  const [expired, setExpired]   = useState(false);
  const [paid, setPaid]         = useState(false);
  const [copied, setCopied]     = useState(false);
  const pollingRef               = useRef(null);

  // ── Khi mount: kiểm tra ngay, rồi bắt đầu polling ─────────
  useEffect(() => {
    const current = loadOrderFromStorage();

    // Không có đơn → về giỏ hàng
    if (!current) {
      navigate("/cart", { replace: true });
      return;
    }

    // Đã hết hạn trước khi vào trang
    if (isOrderExpired(current)) {
      handleExpire();
      return;
    }

    // Đã paid (ví dụ user refresh sau khi admin xác nhận)
    if (current.status === "paid") {
      handlePaid(current);
      return;
    }

    setOrder(current);

    // Bắt đầu polling mỗi 5 giây
    pollingRef.current = pollOrderStatus(
      current.orderId,
      handlePaid,    // callback khi paid
      handleExpire,  // callback khi expire
      5000
    );

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ── Callbacks — dùng useCallback để không tạo function mới mỗi render ──
  // Nếu không dùng useCallback, CountdownTimer sẽ nhận onExpire mới mỗi render
  // → useCountdown chạy lại → timer reset → countdown giật
  const handleExpire = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    clearOrderFromStorage();
    setExpired(true);
  }, []);

  const handlePaid = useCallback((paidOrder) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setPaid(true);
    setTimeout(() => {
      navigate("/order-success", { replace: true });
    }, 1500);
  }, [navigate]);

  // ── Copy nội dung CK ───────────────────────────────────────
  function copyToClipboard(text) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── HẾT HẠN ───────────────────────────────────────────────
  if (expired) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-7 col-lg-5">
            <CheckoutSteps current={3} />
            <div
              className="card border-0 shadow-sm text-center p-5"
              style={{ borderRadius: 16 }}
            >
              <div
                className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 80, height: 80, background: "#fef2f2" }}
              >
                <i className="bi bi-clock-history" style={{ fontSize: 40, color: "#dc2626" }}></i>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "#dc2626" }}>Đơn hàng đã hết hạn</h5>
              <p className="text-muted small mb-4">
                Đơn hàng đã quá 15 phút mà chưa được xác nhận thanh toán.
                <br />Vui lòng đặt lại để tiếp tục.
              </p>
              <button
                className="btn btn-primary fw-bold"
                onClick={() => navigate("/cart")}
              >
                <i className="bi bi-arrow-left me-2"></i>Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ĐÃ THANH TOÁN (đang chuyển trang) ─────────────────────
  if (paid) {
    return (
      <div className="container py-5 text-center">
        <div
          className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: 80, height: 80, background: "#dcfce7" }}
        >
          <i className="bi bi-check-lg" style={{ fontSize: 40, color: "#16a34a" }}></i>
        </div>
        <h5 className="fw-bold text-success">Thanh toán đã được xác nhận!</h5>
        <p className="text-muted">Đang chuyển hướng...</p>
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  // ── CHƯA CÓ ORDER ─────────────────────────────────────────
  if (!order) return null;

  const payInfo = PAYMENT_INFO[order.payment] || PAYMENT_INFO.bank;

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/">Trang chủ</a></li>
          <li className="breadcrumb-item"><a href="/cart">Giỏ hàng</a></li>
          <li className="breadcrumb-item active">Chờ thanh toán</li>
        </ol>
      </nav>

      <CheckoutSteps current={3} />

      <div className="row justify-content-center g-4">
        <div className="col-lg-6 col-md-8">

          {/* ── Countdown ── */}
          <CountdownTimer order={order} onExpire={handleExpire} />

          {/* ── Thông tin đơn ── */}
          <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-receipt me-2 text-primary"></i>Thông tin đơn hàng
                </h5>
                <span
                  className="badge"
                  style={{ background: "#fef3c7", color: "#92400e", fontSize: 12 }}
                >
                  <i className="bi bi-hourglass-split me-1"></i>Chờ xác nhận
                </span>
              </div>

              {/* Mã đơn hàng — nổi bật để khách copy */}
              <div
                className="rounded-3 p-3 mb-3 d-flex justify-content-between align-items-center"
                style={{ background: "#eff6ff", border: "1px dashed #93c5fd" }}
              >
                <div>
                  <div className="small text-muted mb-1">Mã đơn hàng / Nội dung chuyển khoản</div>
                  <div className="fw-bold fs-5" style={{ color: "#1d4ed8", letterSpacing: 1 }}>
                    {order.orderId}
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => copyToClipboard(order.orderId)}
                  title="Sao chép mã đơn hàng"
                >
                  {copied
                    ? <><i className="bi bi-check2 me-1"></i>Đã chép</>
                    : <><i className="bi bi-clipboard me-1"></i>Sao chép</>
                  }
                </button>
              </div>

              {/* Số tiền cần chuyển */}
              <div
                className="rounded-3 p-3 mb-3 text-center"
                style={{ background: "#f0fdf4", border: "1px solid #86efac" }}
              >
                <div className="small text-muted mb-1">Số tiền cần thanh toán</div>
                <div className="fw-bold" style={{ fontSize: 28, color: "#15803d" }}>
                  {formatPrice(order.totalAmount)}
                </div>
              </div>

              {/* Thông tin tài khoản chuyển khoản */}
              {payInfo.lines.length > 0 && (
                <div className="mb-3">
                  <div className="fw-semibold small mb-2">
                    <i className={`bi ${payInfo.icon} me-1 text-primary`}></i>
                    {payInfo.label}
                  </div>
                  {payInfo.lines.map((line) => (
                    <div
                      key={line.label}
                      className="d-flex justify-content-between small py-1"
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <span className="text-muted">{line.label}:</span>
                      <span className="fw-semibold">{line.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Người nhận */}
              <div className="small text-muted mt-3">
                <i className="bi bi-person me-1"></i>
                <strong>{order.customer.fullName}</strong> — {order.customer.phone}
                <br />
                <i className="bi bi-geo-alt me-1"></i>{order.customer.address}
              </div>
            </div>
          </div>

          {/* ── Hướng dẫn ── */}
          <div className="alert alert-info mt-3 small" style={{ borderRadius: 10 }}>
            <div className="fw-bold mb-1">
              <i className="bi bi-info-circle me-1"></i>Hướng dẫn
            </div>
            <ol className="mb-0 ps-3">
              <li>Chuyển khoản đúng <strong>số tiền</strong> và ghi <strong>nội dung: {order.orderId}</strong></li>
              <li>Admin sẽ kiểm tra và xác nhận trong vài phút</li>
              <li>Trang này tự động cập nhật khi đơn được xác nhận</li>
              <li>Đơn hàng hết hạn sau <strong>15 phút</strong> nếu chưa thanh toán</li>
            </ol>
          </div>

          {/* ── Polling indicator ── */}
          <div className="text-center mt-3">
            <span className="text-muted small">
              <span
                className="spinner-grow spinner-grow-sm me-1"
                style={{ color: "#2563eb" }}
                role="status"
              ></span>
              Đang chờ xác nhận từ admin...
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
