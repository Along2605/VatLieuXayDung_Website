// pages/CheckoutPage.jsx
// Kiến thức: useState, useNavigate, controlled inputs, form validation, useCart, useAuth
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ProductImage from "../components/ProductImage";
import CheckoutSteps from "../components/CheckoutSteps";
import { createOrder, saveOrderToStorage, saveOrderToDB, sendOrderToN8n } from "../services/orderService";

const formatPrice = (price) =>
  price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

// ── Validators ──────────────────────────────────────────────
function validatePhone(phone) {
  const s = String(phone).replace(/\s+/g, "");
  return /^(\+84|84|0)(3|5|7|8|9)\d{8}$/.test(s);
}

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    icon: "bi-cash-coin",
    desc: "Trả tiền mặt khi nhận được hàng",
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    icon: "bi-bank",
    desc: "Chuyển khoản trước qua tài khoản ngân hàng",
  },
  {
    id: "momo",
    label: "Ví MoMo",
    icon: "bi-wallet2",
    desc: "Thanh toán nhanh qua ví điện tử MoMo",
  },
];

export default function CheckoutPage() {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Prefill từ user đã đăng nhập
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: "",
    note: "",
    payment: "cod",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Nếu giỏ hàng trống → redirect
  if (!cart || cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-cart-x" style={{ fontSize: 72, color: "#94a3b8" }}></i>
        <h4 className="mt-3 fw-bold">Giỏ hàng trống</h4>
        <p className="text-muted">Không có sản phẩm để thanh toán.</p>
        <button className="btn btn-primary mt-2" onClick={() => navigate("/products")}>
          Xem sản phẩm ngay
        </button>
      </div>
    );
  }

  // ── Validate từng field ────────────────────────────────────
  const validateField = (name, value) => {
    let msg = "";
    if (name === "fullName" && !value.trim()) msg = "Vui lòng nhập họ và tên.";
    if (name === "phone") {
      if (!value.trim()) msg = "Vui lòng nhập số điện thoại.";
      else if (!validatePhone(value)) msg = "Số điện thoại không đúng định dạng (VD: 09xxxxxxxx).";
    }
    if (name === "address" && !value.trim()) msg = "Vui lòng nhập địa chỉ giao hàng.";
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate tất cả field bắt buộc
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên.";
    if (!form.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại.";
    else if (!validatePhone(form.phone)) newErrors.phone = "Số điện thoại không đúng định dạng.";
    if (!form.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ giao hàng.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // 1. Tạo order với userId để liên kết tài khoản trong DB
      const order = createOrder(form, cart, totalPrice, totalItems, user?.id || null);

      // 2. Lưu vào localStorage (backup + OrderSuccessPage đọc)
      saveOrderToStorage(order);

      // 3. Lưu vào MySQL qua Express (nguồn thật để polling)
      await saveOrderToDB(order);

      // 4. Gửi n8n webhook (fire & forget — không await)
      sendOrderToN8n(order);

      // 5. Xoá giỏ hàng
      clearCart();

      // 6. Chuyển sang trang chờ thanh toán
      navigate("/waiting-payment", { replace: true });
    } catch (err) {
      console.error("Lỗi tạo đơn hàng:", err);
      setLoading(false);
    }
  };

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === form.payment);

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
          <li className="breadcrumb-item"><Link to="/cart">Giỏ hàng</Link></li>
          <li className="breadcrumb-item active">Thanh toán</li>
        </ol>
      </nav>

      <CheckoutSteps current={2} />

      <h4 className="fw-bold mb-4">
        <i className="bi bi-credit-card me-2"></i>Thanh toán
      </h4>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          {/* ── CỘT TRÁI: Form thông tin ── */}
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
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-person text-muted"></i>
                    </span>
                    <input
                      type="text"
                      name="fullName"
                      className={`form-control ${errors.fullName ? "is-invalid" : form.fullName ? "is-valid" : ""}`}
                      placeholder="Nguyễn Văn A"
                      value={form.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-telephone text-muted"></i>
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-control ${errors.phone ? "is-invalid" : form.phone && !errors.phone ? "is-valid" : ""}`}
                      placeholder="0901234567"
                      value={form.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Địa chỉ giao hàng <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-house text-muted"></i>
                    </span>
                    <input
                      type="text"
                      name="address"
                      className={`form-control ${errors.address ? "is-invalid" : form.address ? "is-valid" : ""}`}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      value={form.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </div>
                </div>

                {/* Ghi chú */}
                <div className="mb-0">
                  <label className="form-label fw-semibold">Ghi chú (tuỳ chọn)</label>
                  <textarea
                    name="note"
                    className="form-control"
                    rows={2}
                    placeholder="Giao giờ hành chính, gọi trước khi giao..."
                    value={form.note}
                    onChange={handleChange}
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
                        className="d-flex align-items-center gap-3 p-3 rounded-3 cursor-pointer"
                        style={{
                          border: isSelected ? "2px solid #2563eb" : "2px solid #e2e8f0",
                          background: isSelected ? "#eff6ff" : "#fff",
                          cursor: "pointer",
                          transition: "all .15s",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={isSelected}
                          onChange={handleChange}
                          className="form-check-input mt-0"
                          style={{ width: 18, height: 18, flexShrink: 0 }}
                        />
                        <i
                          className={`bi ${method.icon} fs-4`}
                          style={{ color: isSelected ? "#2563eb" : "#64748b", flexShrink: 0 }}
                        ></i>
                        <div>
                          <div className="fw-semibold" style={{ fontSize: 14 }}>{method.label}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>{method.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Hướng dẫn chuyển khoản */}
                {form.payment === "bank" && (
                  <div className="alert alert-info mt-3 mb-0 small">
                    <i className="bi bi-info-circle me-2"></i>
                    Vui lòng chuyển khoản đến: <strong>MB Bank – 0123456789</strong> – Chủ TK: <strong>VLXD ĐỨC PHIẾN</strong>. Nội dung ghi số điện thoại của bạn.
                  </div>
                )}
                {form.payment === "momo" && (
                  <div className="alert alert-info mt-3 mb-0 small">
                    <i className="bi bi-info-circle me-2"></i>
                    Chuyển MoMo đến số: <strong>0901234567</strong> – Tên: <strong>NGUYEN VAN A</strong>. Nội dung ghi số điện thoại của bạn.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── CỘT PHẢI: Tóm tắt đơn hàng ── */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm sticky-top" style={{ borderRadius: 12, top: 80 }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-receipt me-2"></i>Đơn hàng ({totalItems} sản phẩm)
                </h5>

                {/* Danh sách sản phẩm */}
                <div className="mb-3" style={{ maxHeight: 260, overflowY: "auto" }}>
                  {cart.map((item) => (
                    <div key={item.id} className="d-flex align-items-center gap-2 mb-2">
                      <div
                        className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                        style={{ background: "#f8fafc", width: 48, height: 48, overflow: "hidden" }}
                      >
                        <ProductImage img={item.img} name={item.name} size={40} />
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-semibold text-truncate" style={{ fontSize: 13 }}>{item.name}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>x{item.qty}</div>
                      </div>
                      <div className="fw-bold text-nowrap" style={{ fontSize: 13, color: "#2563eb" }}>
                        {formatPrice(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                <hr />

                {/* Phí & tổng */}
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Tạm tính:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Phí vận chuyển:</span>
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
                  <span>Tổng cộng:</span>
                  <span style={{ color: "#2563eb" }}>{formatPrice(totalPrice)}</span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
                  ) : (
                    <><i className="bi bi-check-circle me-2"></i>Đặt hàng ngay</>
                  )}
                </button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    <i className="bi bi-shield-check text-success me-1"></i>Thanh toán bảo mật 100%
                  </small>
                </div>

                <div className="text-center mt-2">
                  <Link to="/cart" className="text-muted small text-decoration-none">
                    <i className="bi bi-arrow-left me-1"></i>Quay lại giỏ hàng
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
