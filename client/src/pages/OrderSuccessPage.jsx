// pages/OrderSuccessPage.jsx — Trang thanh toán / đặt hàng thành công
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CheckoutSteps from "../components/CheckoutSteps";
import { loadOrderFromStorage, clearOrderFromStorage } from "../services/orderService";

const formatPrice = (price) =>
  price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

// Thông tin hiển thị theo phương thức thanh toán
const PAYMENT_META = {
  cod: {
    label:   "Thanh toán khi nhận hàng (COD)",
    icon:    "bi-cash-coin",
    // Thông báo riêng cho COD sau khi đặt hàng thành công
    message: "Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ liên hệ và giao hàng sớm nhất có thể. Vui lòng chuẩn bị tiền mặt khi nhận hàng.",
    color:   "#16a34a",
    bg:      "#dcfce7",
  },
  bank: {
    label:   "Chuyển khoản ngân hàng",
    icon:    "bi-bank",
    message: "Chúng tôi đã xác nhận thanh toán của bạn. Đơn hàng sẽ được xử lý và giao trong thời gian sớm nhất.",
    color:   "#2563eb",
    bg:      "#eff6ff",
  },
  momo: {
    label:   "Ví MoMo",
    icon:    "bi-wallet2",
    message: "Chúng tôi đã xác nhận thanh toán qua MoMo. Đơn hàng sẽ được xử lý và giao trong thời gian sớm nhất.",
    color:   "#9d174d",
    bg:      "#fdf2f8",
  },
};

export default function OrderSuccessPage() {
  const navigate         = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const saved = loadOrderFromStorage();
    if (!saved) {
      navigate("/", { replace: true });
      return;
    }
    setOrder(saved);
    clearOrderFromStorage();
  }, [navigate]);

  if (!order) return null;

  const isCOD    = order.payment === "cod";
  const meta     = PAYMENT_META[order.payment] || PAYMENT_META.bank;
  const createdAt = new Date(order.createdAt).toLocaleString("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-8 col-lg-6">
          <CheckoutSteps current={4} />

          <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-body p-4 p-md-5">

              {/* ── Icon + Tiêu đề ── */}
              <div className="text-center mb-4">
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 80, height: 80, background: "#dcfce7" }}>
                  <i className="bi bi-check-lg" style={{ fontSize: 40, color: "#16a34a" }}></i>
                </div>

                {isCOD ? (
                  <>
                    <h4 className="fw-bold mb-1">Đặt hàng thành công! 🎉</h4>
                    <p className="text-muted small mb-0">
                      Cảm ơn bạn đã đặt hàng tại <strong>VLXD Đức Phiến</strong>
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="fw-bold mb-1">Thanh toán thành công! 🎉</h4>
                    <p className="text-muted small mb-0">
                      Cảm ơn bạn đã tin tưởng <strong>VLXD Đức Phiến</strong>
                    </p>
                  </>
                )}
              </div>

              {/* ── Thông báo theo phương thức thanh toán ── */}
              <div className="rounded-3 p-3 mb-4 d-flex align-items-start gap-3"
                style={{ background: meta.bg, border: `1px solid ${meta.color}33` }}>
                <i className={`bi ${meta.icon} mt-1 flex-shrink-0`}
                  style={{ fontSize: 22, color: meta.color }}></i>
                <div>
                  <div className="fw-semibold small mb-1" style={{ color: meta.color }}>
                    {meta.label}
                  </div>
                  <div className="small text-muted">{meta.message}</div>
                </div>
              </div>

              {/* ── Mã đơn hàng ── */}
              <div className="rounded-3 p-3 mb-4 text-center"
                style={{ background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
                <div className="text-muted small mb-1">Mã đơn hàng</div>
                <div className="fw-bold fs-5" style={{ color: "#2563eb", letterSpacing: 1 }}>
                  #{order.orderId}
                </div>
                <div className="text-muted small mt-1">{createdAt}</div>
              </div>

              {/* ── Thông tin giao hàng ── */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-geo-alt me-2 text-primary"></i>Thông tin giao hàng
                </h6>
                <div className="small d-flex flex-column gap-2">
                  <div className="d-flex gap-2">
                    <i className="bi bi-person text-muted mt-1 flex-shrink-0"></i>
                    <span><strong>{order.customer.fullName}</strong></span>
                  </div>
                  <div className="d-flex gap-2">
                    <i className="bi bi-telephone text-muted mt-1 flex-shrink-0"></i>
                    <span>{order.customer.phone}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <i className="bi bi-house text-muted mt-1 flex-shrink-0"></i>
                    <span>{order.customer.address}</span>
                  </div>
                  {order.customer.note && (
                    <div className="d-flex gap-2">
                      <i className="bi bi-chat-left-text text-muted mt-1 flex-shrink-0"></i>
                      <span className="fst-italic text-muted">"{order.customer.note}"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Danh sách sản phẩm ── */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-box me-2 text-primary"></i>
                  Sản phẩm ({order.totalItems})
                </h6>
                <div style={{ maxHeight: 180, overflowY: "auto" }}>
                  {order.items.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between small text-muted mb-2">
                      <span className="text-truncate me-2">{item.name} × {item.qty}</span>
                      <span className="fw-semibold text-dark text-nowrap">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Tổng cộng</span>
                  <span style={{ color: "#2563eb" }}>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              {/* ── Bước tiếp theo (khác nhau theo COD vs online) ── */}
              <div className="rounded-3 p-3 mb-4 small"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="fw-semibold mb-2">
                  <i className="bi bi-list-check me-2 text-primary"></i>
                  {isCOD ? "Quy trình tiếp theo" : "Đơn hàng của bạn"}
                </div>
                {isCOD ? (
                  <div className="d-flex flex-column gap-2 text-muted">
                    <div><i className="bi bi-1-circle-fill me-2 text-primary"></i>Admin xác nhận đơn và liên hệ với bạn</div>
                    <div><i className="bi bi-2-circle-fill me-2 text-primary"></i>Đơn hàng được đóng gói và vận chuyển</div>
                    <div><i className="bi bi-3-circle-fill me-2 text-primary"></i>Bạn nhận hàng và thanh toán tiền mặt</div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2 text-muted">
                    <div><i className="bi bi-check-circle-fill me-2 text-success"></i>Thanh toán đã được xác nhận</div>
                    <div><i className="bi bi-box-seam me-2 text-primary"></i>Đơn hàng đang được chuẩn bị và đóng gói</div>
                    <div><i className="bi bi-truck me-2 text-primary"></i>Giao hàng trong thời gian sớm nhất</div>
                  </div>
                )}
              </div>

              {/* ── Nút hành động ── */}
              <div className="d-grid gap-2">
                <button className="btn btn-primary fw-bold py-2"
                  onClick={() => navigate("/products")}>
                  <i className="bi bi-bag me-2"></i>Tiếp tục mua sắm
                </button>
                <Link to="/" className="btn btn-outline-secondary">
                  <i className="bi bi-house me-2"></i>Về trang chủ
                </Link>
              </div>

              {/* Ghi chú hỗ trợ */}
              <p className="text-center text-muted small mt-4 mb-0">
                <i className="bi bi-headset me-1"></i>
                Cần hỗ trợ? Gọi <strong>0909 123 456</strong> hoặc nhắn qua{" "}
                <Link to="/contact" className="text-decoration-none">trang liên hệ</Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
