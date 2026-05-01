// ============================================================
// pages/CartPage.jsx — Giỏ hàng
//
// Hiển thị danh sách sản phẩm đã thêm, cho phép thay đổi số lượng,
// xóa sản phẩm, và tiến hành thanh toán
// ============================================================

import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems, selectTotalItems, selectTotalPrice,
  removeItem, increaseQty, decreaseQty, clearCart,
} from "../features/cart/cartSlice";
import { useAuth } from "../context/AuthContext";
import ProductImage from "../components/ProductImage";
import CheckoutSteps from "../components/CheckoutSteps";

function formatPrice(price) {
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function CartPage() {
  // useSelector: đọc state từ Redux store
  const cart       = useSelector(selectCartItems);
  const totalItems = useSelector(selectTotalItems);
  const totalPrice = useSelector(selectTotalPrice);
  // useDispatch: gửi action đến Redux store
  const dispatch   = useDispatch();
  // Wrap các action với dispatch
  const handleRemove  = (id)  => dispatch(removeItem(id));
  const handleIncrease = (id) => dispatch(increaseQty(id));
  const handleDecrease = (id) => dispatch(decreaseQty(id));
  const handleClear   = ()    => dispatch(clearCart());
  const { user }   = useAuth();
  const navigate   = useNavigate();

  // Giỏ trống → hiện thông báo
  if (!cart || cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-cart-x" style={{ fontSize: 72, color: "#94a3b8" }}></i>
        <h4 className="mt-3 fw-bold">Giỏ hàng trống</h4>
        <p className="text-muted">Hãy thêm sản phẩm để bắt đầu mua sắm.</p>
        <button className="btn btn-primary mt-2" onClick={() => navigate("/products")}>
          Xem sản phẩm ngay
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Thanh tiến trình bước 1 */}
      <CheckoutSteps current={1} />

      {/* Tiêu đề + info user */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-cart3 me-2"></i>Giỏ hàng ({totalItems} sản phẩm)
        </h4>
        {user && (
          <span className="text-muted small">
            <i className="bi bi-person-check text-success me-1"></i>
            Đang mua với tài khoản <strong>{user.fullName}</strong>
          </span>
        )}
      </div>

      <div className="row g-4">

        {/* Danh sách sản phẩm */}
        <div className="col-lg-8">
          {cart.map((item) => (
            <div key={item.id} className="card border-0 shadow-sm mb-3" style={{ borderRadius: 12 }}>
              <div className="card-body">
                <div className="row align-items-center g-3">

                  {/* Ảnh */}
                  <div className="col-3 col-md-2">
                    <div className="d-flex align-items-center justify-content-center rounded"
                      style={{ background: "#f8fafc", height: 70 }}>
                      <ProductImage img={item.img} name={item.name} size={60} />
                    </div>
                  </div>

                  {/* Tên + thương hiệu */}
                  <div className="col-9 col-md-4">
                    <h6 className="fw-bold mb-1" style={{ fontSize: 14 }}>{item.name}</h6>
                    <span className="badge bg-light text-secondary" style={{ fontSize: 11 }}>{item.brand}</span>
                    <p className="text-muted small mb-0 mt-1">
                      Đơn giá: {formatPrice(item.price)} / {item.unit}
                    </p>
                  </div>

                  {/* Điều chỉnh số lượng */}
                  <div className="col-auto">
                    <div className="input-group input-group-sm" style={{ width: 110 }}>
                      <button className="btn btn-outline-secondary" onClick={() => handleDecrease(item.id)}>−</button>
                      {/* Hiện số lượng — readOnly, không cho nhập tay */}
                      <span className="form-control text-center fw-bold">{item.qty}</span>
                      <button className="btn btn-outline-secondary" onClick={() => handleIncrease(item.id)}>+</button>
                    </div>
                  </div>

                  {/* Tổng tiền + xóa */}
                  <div className="col-auto ms-auto text-end">
                    <p className="fw-bold text-primary mb-1">{formatPrice(item.price * item.qty)}</p>
                    <button className="btn btn-link text-danger p-0 small" onClick={() => handleRemove(item.id)}>
                      <i className="bi bi-trash me-1"></i>Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Nút hành động */}
          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-outline-secondary" onClick={() => navigate("/products")}>
              ← Tiếp tục mua
            </button>
            <button className="btn btn-outline-danger" onClick={handleClear}>
              <i className="bi bi-trash me-1"></i>Xóa toàn bộ
            </button>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Tóm tắt đơn hàng</h5>

              {/* Liệt kê từng sản phẩm */}
              {cart.map((item) => (
                <div key={item.id} className="d-flex justify-content-between small text-muted mb-2">
                  <span className="text-truncate me-2">{item.name} × {item.qty}</span>
                  <span className="fw-bold text-dark">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}

              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Phí vận chuyển:</span>
                <span className="text-success fw-bold">Miễn phí</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Tổng cộng:</span>
                <span style={{ color: "#2563eb" }}>{formatPrice(totalPrice)}</span>
              </div>

              {/* Nút thanh toán — navigate sang /checkout */}
              <button
                className="btn btn-primary w-100 mt-4 py-2 fw-bold"
                onClick={() => navigate("/checkout")}
              >
                <i className="bi bi-credit-card me-2"></i>Tiến hành thanh toán
              </button>

              <div className="text-center mt-3">
                <small className="text-muted">
                  <i className="bi bi-shield-check text-success me-1"></i>Thanh toán bảo mật 100%
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
