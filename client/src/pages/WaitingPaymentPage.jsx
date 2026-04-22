// ============================================================
// pages/WaitingPaymentPage.jsx — Trang chờ xác nhận thanh toán
//
// Luồng hoạt động:
//   1. Đọc đơn hàng từ localStorage (do CheckoutPage lưu)
//   2. Hiển thị đồng hồ đếm ngược 15 phút
//   3. Polling mỗi 5 giây: kiểm tra status trong localStorage
//   4a. Nếu status = "paid" → navigate sang /order-success
//   4b. Nếu hết 15 phút   → xóa đơn, hiện màn hình hết hạn
// ============================================================

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/CheckoutSteps";
import CountdownTimer from "../components/CountdownTimer";
import {
  loadOrderFromStorage,
  clearOrderFromStorage,
  isOrderExpired,
  pollOrderStatus,
} from "../services/orderService";

function formatPrice(price) {
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

// Thông tin tài khoản theo phương thức thanh toán
const PAYMENT_INFO = {
  bank: {
    icon: "bi-bank",
    label: "Chuyển khoản ngân hàng",
    lines: [
      { label: "Ngân hàng",     value: "MB Bank" },
      { label: "Số TK",         value: "0123456789" },
      { label: "Chủ TK",        value: "VLXD ĐỨC PHIẾN" },
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
  cod: { icon: "bi-cash-coin", label: "Thanh toán khi nhận hàng", lines: [] },
};

export default function WaitingPaymentPage() {
  const navigate = useNavigate();

  // Đọc order từ localStorage ngay khi component tạo (lazy initial state)
  const [order,   setOrder]   = useState(() => loadOrderFromStorage());
  const [expired, setExpired] = useState(false); // đã hết 15 phút
  const [paid,    setPaid]    = useState(false);  // đã được xác nhận
  const [copied,  setCopied]  = useState(false);  // đã copy mã đơn

  // useRef lưu timerId của polling để có thể clearInterval khi unmount
  // useRef không gây re-render khi thay đổi (khác useState)
  const pollingRef = useRef(null);

  useEffect(() => {
    const current = loadOrderFromStorage();

    // Không có đơn → về giỏ hàng
    if (!current) { navigate("/cart", { replace: true }); return; }

    // Đã hết hạn trước khi vào trang (VD: user mở lại tab sau 15 phút)
    if (isOrderExpired(current)) { handleExpire(); return; }

    // Đã được xác nhận (VD: user refresh sau khi admin ok)
    if (current.status === "paid") { handlePaid(current); return; }

    setOrder(current);

    // Bắt đầu polling mỗi 5 giây
    pollingRef.current = pollOrderStatus(
      current.orderId,
      handlePaid,    // gọi khi paid
      handleExpire,  // gọi khi hết hạn
      5000
    );

    // Cleanup: dừng polling khi component unmount (user thoát trang)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []); // chỉ chạy 1 lần khi mount

  function handleExpire() {
    if (pollingRef.current) clearInterval(pollingRef.current);
    clearOrderFromStorage(); // xóa đơn hết hạn
    setExpired(true);
  }

  function handlePaid(paidOrder) {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setPaid(true);
    // Đợi 1.5s để user thấy animation thành công rồi mới chuyển trang
    setTimeout(() => navigate("/order-success", { replace: true }), 1500);
  }

  function copyToClipboard(text) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Màn hình hết hạn ─────────────────────────────────────────────────────
  if (expired) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-6 col-lg-5">
            <CheckoutSteps current={3} />
            <div className="card border-0 shadow-sm text-center p-5" style={{ borderRadius: 16 }}>
              <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 80, height: 80, background: "#fef2f2" }}>
                <i className="bi bi-clock-history" style={{ fontSize: 40, color: "#dc2626" }}></i>
              </div>
              <h5 className="fw-bold mb-2 text-danger">Đơn hàng đã hết hạn</h5>
              <p className="text-muted small mb-4">
                Đơn hàng quá 15 phút chưa được xác nhận. Vui lòng đặt lại.
              </p>
              <button className="btn btn-primary fw-bold" onClick={() => navigate("/cart")}>
                <i className="bi bi-arrow-left me-2"></i>Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Màn hình đã thanh toán (đang chuyển trang) ────────────────────────────
  if (paid) {
    return (
      <div className="container py-5 text-center">
        <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: 80, height: 80, background: "#dcfce7" }}>
          <i className="bi bi-check-lg" style={{ fontSize: 40, color: "#16a34a" }}></i>
        </div>
        <h5 className="fw-bold text-success">Thanh toán được xác nhận!</h5>
        <p className="text-muted">Đang chuyển hướng...</p>
        <div className="spinner-border text-success"></div>
      </div>
    );
  }

  if (!order) return null;

  const payInfo = PAYMENT_INFO[order.payment] || PAYMENT_INFO.bank;

  return (
    <div className="container py-4">
      <nav className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/">Trang chủ</a></li>
          <li className="breadcrumb-item"><a href="/cart">Giỏ hàng</a></li>
          <li className="breadcrumb-item active">Chờ thanh toán</li>
        </ol>
      </nav>

      <CheckoutSteps current={3} />

      <div className="row justify-content-center g-4">
        <div className="col-lg-6 col-md-8">

          {/* Đồng hồ đếm ngược */}
          <CountdownTimer order={order} onExpire={handleExpire} />

          {/* Thông tin đơn hàng */}
          <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-receipt me-2 text-primary"></i>Thông tin đơn hàng
                </h5>
                <span className="badge" style={{ background: "#fef3c7", color: "#92400e" }}>
                  <i className="bi bi-hourglass-split me-1"></i>Chờ xác nhận
                </span>
              </div>

              {/* Mã đơn hàng — khách cần copy làm nội dung CK */}
              <div className="rounded-3 p-3 mb-3 d-flex justify-content-between align-items-center"
                style={{ background: "#eff6ff", border: "1px dashed #93c5fd" }}>
                <div>
                  <div className="small text-muted mb-1">Mã đơn / Nội dung chuyển khoản</div>
                  <div className="fw-bold fs-5" style={{ color: "#1d4ed8" }}>{order.orderId}</div>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => copyToClipboard(order.orderId)}
                >
                  {copied
                    ? <><i className="bi bi-check2 me-1"></i>Đã chép</>
                    : <><i className="bi bi-clipboard me-1"></i>Sao chép</>
                  }
                </button>
              </div>

              {/* Số tiền */}
              <div className="rounded-3 p-3 mb-3 text-center"
                style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
                <div className="small text-muted mb-1">Số tiền cần thanh toán</div>
                <div className="fw-bold" style={{ fontSize: 28, color: "#15803d" }}>
                  {formatPrice(order.totalAmount)}
                </div>
              </div>

              {/* Thông tin tài khoản */}
              {payInfo.lines.length > 0 && (
                <div className="mb-3">
                  <div className="fw-semibold small mb-2">
                    <i className={`bi ${payInfo.icon} me-1 text-primary`}></i>{payInfo.label}
                  </div>
                  {payInfo.lines.map((line) => (
                    <div key={line.label} className="d-flex justify-content-between small py-1"
                      style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <span className="text-muted">{line.label}:</span>
                      <span className="fw-semibold">{line.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Thông tin người nhận */}
              <div className="small text-muted mt-3">
                <i className="bi bi-person me-1"></i><strong>{order.customer.fullName}</strong>
                {" — "}{order.customer.phone}
                <br />
                <i className="bi bi-geo-alt me-1"></i>{order.customer.address}
              </div>
            </div>
          </div>

          {/* Hướng dẫn */}
          <div className="alert alert-info mt-3 small" style={{ borderRadius: 10 }}>
            <div className="fw-bold mb-1"><i className="bi bi-info-circle me-1"></i>Hướng dẫn</div>
            <ol className="mb-0 ps-3">
              <li>Chuyển đúng <strong>số tiền</strong> và nội dung: <strong>{order.orderId}</strong></li>
              <li>Admin kiểm tra và xác nhận trong vài phút</li>
              <li>Trang tự cập nhật khi đơn được xác nhận</li>
              <li>Đơn hủy sau <strong>15 phút</strong> nếu không thanh toán</li>
            </ol>
          </div>

          {/* Indicator đang polling */}
          <div className="text-center mt-3">
            <span className="text-muted small">
              <span className="spinner-grow spinner-grow-sm me-1" style={{ color: "#2563eb" }}></span>
              Đang chờ xác nhận từ admin...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
