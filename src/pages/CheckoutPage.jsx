// ============================================================
// pages/CheckoutPage.jsx — Trang đặt hàng
//
// Người dùng điền thông tin giao hàng + chọn phương thức thanh toán
// Khi submit: tạo order → lưu localStorage → gửi n8n → sang trang chờ
// ============================================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ProductImage from "../components/ProductImage";
import CheckoutSteps from "../components/CheckoutSteps";
import { createOrder, saveOrderToStorage, sendOrderToN8n } from "../services/orderService";

function formatPrice(price) {
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

// Validate số điện thoại VN
function validatePhone(phone) {
  return /^(\+84|84|0)(3|5|7|8|9)\d{8}$/.test(String(phone).replace(/\s+/g, ""));
}

// 3 phương thức thanh toán
const PAYMENT_METHODS = [
  { id: "cod",  label: "Thanh toán khi nhận hàng (COD)", icon: "bi-cash-coin",  desc: "Trả tiền mặt khi nhận hàng" },
  { id: "bank", label: "Chuyển khoản ngân hàng",         icon: "bi-bank",       desc: "Chuyển khoản trước khi giao" },
  { id: "momo", label: "Ví MoMo",                        icon: "bi-wallet2",    desc: "Thanh toán qua ví MoMo" },
];

export default function CheckoutPage() {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  // Prefill từ thông tin user đăng nhập
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone:    user?.phone    || "",
    address:  "",
    note:     "",
    payment:  "cod", // mặc định COD
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  // Giỏ trống → không cho vào trang này
  if (!cart || cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-cart-x" style={{ fontSize: 72, color: "#94a3b8" }}></i>
        <h4 className="mt-3 fw-bold">Giỏ hàng trống</h4>
        <button className="btn btn-primary mt-2" onClick={() => navigate("/products")}>
          Xem sản phẩm ngay
        </button>
      </div>
    );
  }

  // Validate khi rời ô input (onBlur)
  function validateField(name, value) {
    let msg = "";
    if (name === "fullName" && !value.trim())  msg = "Vui lòng nhập họ và tên.";
    if (name === "phone") {
      if (!value.trim())         msg = "Vui lòng nhập số điện thoại.";
      else if (!validatePhone(value)) msg = "Số điện thoại không đúng (VD: 0901234567).";
    }
    if (name === "address" && !value.trim()) msg = "Vui lòng nhập địa chỉ giao hàng.";
    setErrors((prev) => ({ ...prev, [name]: msg }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  // Submit form — async vì gọi n8n webhook
  async function handleSubmit(e) {
    e.preventDefault();

    // Validate toàn bộ
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên.";
    if (!form.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại.";
    else if (!validatePhone(form.phone)) newErrors.phone = "Số điện thoại không đúng.";
    if (!form.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Bước 1: Tạo object đơn hàng (orderId, expireAt, status=pending...)
      const order = createOrder(form, cart, totalPrice, totalItems);

      // Bước 2: Lưu vào localStorage → WaitingPaymentPage sẽ đọc
      saveOrderToStorage(order);

      // Bước 3: Gửi webhook đến n8n (fire & forget — không chờ)
      sendOrderToN8n(order);

      // Bước 4: Xóa giỏ hàng
      clearCart();

      // Bước 5: Chuyển sang trang chờ thanh toán
      navigate("/waiting-payment", { replace: true });
    } catch (err) {
      console.error("Lỗi tạo đơn:", err);
      setLoading(false);
    }
  }

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === form.payment);

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
          <li className="breadcrumb-item"><Link to="/cart">Giỏ hàng</Link></li>
          <li className="breadcrumb-item active">Thanh toán</li>
        </ol>
      </nav>

      <CheckoutSteps current={2} />

      <h4 className="fw-bold mb-4">
        <i className="bi bi-credit-card me-2"></i>Đặt hàng
      </h4>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">

          {/* ── CỘT TRÁI: Form ── */}
          <div className="col-lg-7">

            {/* Thông tin giao hàng */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-geo-alt me-2 text-primary"></i>Thông tin giao hàng
                </h5>

                {/* Họ tên */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Họ và tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text" name="fullName"
                    className={`form-control ${errors.fullName ? "is-invalid" : form.fullName ? "is-valid" : ""}`}
                    placeholder="Nguyễn Văn A"
                    value={form.fullName} onChange={handleChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                  />
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>

                {/* Điện thoại */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel" name="phone"
                    className={`form-control ${errors.phone ? "is-invalid" : form.phone && !errors.phone ? "is-valid" : ""}`}
                    placeholder="0901234567"
                    value={form.phone} onChange={handleChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>

                {/* Địa chỉ */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Địa chỉ giao hàng <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text" name="address"
                    className={`form-control ${errors.address ? "is-invalid" : form.address ? "is-valid" : ""}`}
                    placeholder="Số nhà, đường, phường, quận, tỉnh/thành"
                    value={form.address} onChange={handleChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                  />
                  {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="form-label fw-semibold">Ghi chú (tuỳ chọn)</label>
                  <textarea
                    name="note" className="form-control" rows={2}
                    placeholder="Giao giờ hành chính, gọi trước khi giao..."
                    value={form.note} onChange={handleChange}
                    style={{ resize: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-wallet me-2 text-primary"></i>Phương thức thanh toán
                </h5>

                <div className="d-flex flex-column gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = form.payment === method.id;
                    return (
                      <label
                        key={method.id}
                        className="d-flex align-items-center gap-3 p-3 rounded-3"
                        style={{
                          border:     `2px solid ${isSelected ? "#2563eb" : "#e2e8f0"}`,
                          background: isSelected ? "#eff6ff" : "#fff",
                          cursor:     "pointer",
                          transition: "all .15s",
                        }}
                      >
                        {/* Radio button — onChange cập nhật form.payment */}
                        <input
                          type="radio" name="payment" value={method.id}
                          checked={isSelected}
                          onChange={handleChange}
                          className="form-check-input mt-0"
                          style={{ width: 18, height: 18, flexShrink: 0 }}
                        />
                        <i className={`bi ${method.icon} fs-4`}
                          style={{ color: isSelected ? "#2563eb" : "#64748b", flexShrink: 0 }}></i>
                        <div>
                          <div className="fw-semibold" style={{ fontSize: 14 }}>{method.label}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>{method.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Hướng dẫn chuyển khoản theo phương thức đã chọn */}
                {form.payment === "bank" && (
                  <div className="alert alert-info mt-3 mb-0 small">
                    <i className="bi bi-info-circle me-1"></i>
                    Chuyển khoản: <strong>MB Bank – 0123456789 – VLXD ĐỨC PHIẾN</strong>.
                    Nội dung ghi mã đơn hàng sau khi đặt.
                  </div>
                )}
                {form.payment === "momo" && (
                  <div className="alert alert-info mt-3 mb-0 small">
                    <i className="bi bi-info-circle me-1"></i>
                    MoMo: <strong>0901234567 – NGUYEN VAN A</strong>.
                    Nội dung ghi mã đơn hàng sau khi đặt.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── CỘT PHẢI: Tóm tắt đơn ── */}
          <div className="col-lg-5">
            {/* sticky-top: card dính khi scroll */}
            <div className="card border-0 shadow-sm sticky-top" style={{ borderRadius: 12, top: 80 }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-receipt me-2"></i>Đơn hàng ({totalItems} sản phẩm)
                </h5>

                {/* Danh sách sản phẩm */}
                <div className="mb-3" style={{ maxHeight: 240, overflowY: "auto" }}>
                  {cart.map((item) => (
                    <div key={item.id} className="d-flex align-items-center gap-2 mb-2">
                      <div className="flex-shrink-0 rounded" style={{ background: "#f8fafc", width: 44, height: 44, overflow: "hidden" }}>
                        <ProductImage img={item.img} name={item.name} size={44} />
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="small fw-semibold text-truncate">{item.name}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>x{item.qty}</div>
                      </div>
                      <div className="fw-bold text-nowrap" style={{ fontSize: 13, color: "#2563eb" }}>
                        {formatPrice(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                <hr />
                <div className="d-flex justify-content-between mb-1 small">
                  <span className="text-muted">Tạm tính:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-1 small">
                  <span className="text-muted">Phí ship:</span>
                  <span className="text-success fw-bold">Miễn phí</span>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Thanh toán:</span>
                  <span className="fw-semibold">
                    <i className={`bi ${selectedMethod?.icon} me-1`}></i>
                    {selectedMethod?.label}
                  </span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                  <span>Tổng:</span>
                  <span style={{ color: "#2563eb" }}>{formatPrice(totalPrice)}</span>
                </div>

                {/* Nút đặt hàng */}
                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
                    : <><i className="bi bi-check-circle me-2"></i>Đặt hàng ngay</>
                  }
                </button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    <i className="bi bi-shield-check text-success me-1"></i>Thanh toán bảo mật
                  </small>
                </div>
                <div className="text-center mt-2">
                  <Link to="/cart" className="text-muted small text-decoration-none">
                    ← Quay lại giỏ hàng
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
