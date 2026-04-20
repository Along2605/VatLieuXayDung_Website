// pages/OrderSuccessPage.jsx
// Kiến thức: useEffect, useState, useNavigate, sessionStorage
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CheckoutSteps from "../components/CheckoutSteps";
import { loadOrderFromStorage, clearOrderFromStorage } from "../services/orderService";

const formatPrice = (price) =>
  price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const PAYMENT_LABELS = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
  momo: "Ví MoMo",
};

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Đọc đơn hàng từ localStorage (lưu bởi orderService)
    const saved = loadOrderFromStorage();
    if (!saved) {
      navigate("/", { replace: true });
      return;
    }
    setOrder(saved);
    // Xoá khỏi localStorage sau khi hiển thị thành công
    clearOrderFromStorage();
  }, [navigate]);

  if (!order) return null;

  const createdAt = new Date(order.createdAt).toLocaleString("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-8 col-lg-6">
          <CheckoutSteps current={4} />
          <div className="card border-0 shadow-sm text-center" style={{ borderRadius: 16 }}>
            <div className="card-body p-4 p-md-5">
              {/* Icon thành công */}
              <div
                className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 80, height: 80, background: "#dcfce7" }}
              >
                <i className="bi bi-check-lg" style={{ fontSize: 40, color: "#16a34a" }}></i>
              </div>

              <h4 className="fw-bold mb-1">Đặt hàng thành công!</h4>
              <p className="text-muted small mb-4">
                Cảm ơn bạn đã mua sắm tại <strong>VLXD Đức Phiến</strong>.<br />
                Chúng tôi sẽ liên hệ xác nhận đơn sớm nhất có thể.
              </p>

              {/* Mã đơn hàng */}
              <div
                className="rounded-3 p-3 mb-4"
                style={{ background: "#f8fafc", border: "1px dashed #cbd5e1" }}
              >
                <div className="text-muted small mb-1">Mã đơn hàng</div>
                <div className="fw-bold fs-5" style={{ color: "#2563eb", letterSpacing: 1 }}>
                  #{order.id}
                </div>
                <div className="text-muted small mt-1">{createdAt}</div>
              </div>

              {/* Thông tin giao hàng */}
              <div className="text-start mb-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-geo-alt me-2 text-primary"></i>Thông tin giao hàng
                </h6>
                <div className="small text-muted d-flex flex-column gap-2">
                  <div className="d-flex gap-2">
                    <i className="bi bi-person text-secondary mt-1"></i>
                    <span><strong>{order.customer.fullName}</strong></span>
                  </div>
                  <div className="d-flex gap-2">
                    <i className="bi bi-telephone text-secondary mt-1"></i>
                    <span>{order.customer.phone}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <i className="bi bi-house text-secondary mt-1"></i>
                    <span>{order.customer.address}</span>
                  </div>
                  {order.customer.note && (
                    <div className="d-flex gap-2">
                      <i className="bi bi-chat-left-text text-secondary mt-1"></i>
                      <span className="fst-italic">"{order.customer.note}"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sản phẩm */}
              <div className="text-start mb-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-box me-2 text-primary"></i>Sản phẩm ({order.totalItems})
                </h6>
                {order.items.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between small text-muted mb-1">
                    <span className="text-truncate me-2">{item.name} × {item.qty}</span>
                    <span className="fw-semibold text-dark text-nowrap">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Tổng cộng</span>
                  <span style={{ color: "#2563eb" }}>{formatPrice(order.totalPrice)}</span>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div
                className="rounded-3 p-3 mb-4 text-start small"
                style={{ background: "#eff6ff" }}
              >
                <i className="bi bi-wallet2 me-2 text-primary"></i>
                <strong>Thanh toán:</strong> {PAYMENT_LABELS[order.payment]}
              </div>

              {/* Nút hành động */}
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary fw-bold"
                  onClick={() => navigate("/products")}
                >
                  <i className="bi bi-bag me-2"></i>Tiếp tục mua sắm
                </button>
                <Link to="/" className="btn btn-outline-secondary">
                  <i className="bi bi-house me-2"></i>Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
