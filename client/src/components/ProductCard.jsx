// ============================================================
// components/ProductCard.jsx — Thẻ sản phẩm
//
// Nhận vào: product (object) và onSelect (hàm xử lý khi click)
// Hiển thị: ảnh, tên, giá, rating, nút Chi tiết + Thêm giỏ
// ============================================================

import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
// useDispatch + action từ cartSlice thay thế useCart()
import ProductImage from "./ProductImage";

// Hàm định dạng số thành tiền VND (VD: 95000 → "95.000 ₫")
function formatPrice(price) {
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function ProductCard({ product, onSelect }) {
  // Lấy hàm addToCart từ CartContext
  // useDispatch: lấy hàm dispatch để gửi action đến Redux store
  const dispatch = useDispatch();

  return (
    <div
      className="card h-100 shadow-sm border-0"
      style={{ borderRadius: 12, transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
      // Hiệu ứng nổi khi hover chuột
      onMouseEnter={(e) => {
        e.currentTarget.style.transform  = "translateY(-4px)";
        e.currentTarget.style.boxShadow  = "0 8px 25px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform  = "translateY(0)";
        e.currentTarget.style.boxShadow  = "";
      }}
    >
      {/* Badge "GIẢM GIÁ" — chỉ hiện khi product.sale = true */}
      {product.sale && (
        <span
          className="badge bg-danger position-absolute"
          style={{ top: 12, left: 12, fontSize: 11, zIndex: 1 }}
        >
          GIẢM GIÁ
        </span>
      )}

      {/* Vùng ảnh — click để xem chi tiết */}
      <div
        className="d-flex align-items-center justify-content-center p-2"
        style={{ height: 160, background: "#f8fafc", borderRadius: "12px 12px 0 0" }}
        onClick={() => onSelect(product)} // gọi hàm từ ProductsPage/HomePage
      >
        <ProductImage img={product.img} name={product.name} size={140} />
      </div>

      <div className="card-body d-flex flex-column p-3">
        {/* Thương hiệu */}
        <span className="badge bg-light text-secondary mb-1" style={{ fontSize: 11, width: "fit-content" }}>
          {product.brand}
        </span>

        {/* Tên sản phẩm */}
        <h6
          className="card-title mb-1"
          style={{ fontSize: 15, minHeight: 44, overflow: "hidden", color: "#1e293b" }}
          onClick={() => onSelect(product)}
        >
          {product.name}
        </h6>

        {/* Rating: hiển thị sao đầy và sao rỗng */}
        <div className="d-flex align-items-center gap-1 mb-2">
          <span style={{ color: "#f59e0b", fontSize: 13 }}>
            {"★".repeat(Math.round(product.rating))}    {/* sao đầy */}
            {"☆".repeat(5 - Math.round(product.rating))} {/* sao rỗng */}
          </span>
          <span className="text-muted" style={{ fontSize: 12 }}>({product.reviews})</span>
        </div>

        {/* Giá */}
        <div className="mb-2">
          <span className="fw-bold" style={{ fontSize: 17, color: "#2563eb" }}>
            {formatPrice(product.price)}
          </span>
          <span className="text-muted ms-1" style={{ fontSize: 13 }}>/ {product.unit}</span>
          {/* Giá cũ gạch ngang — chỉ hiện khi có oldPrice */}
          {product.oldPrice && (
            <div>
              <span className="text-decoration-line-through text-muted" style={{ fontSize: 13 }}>
                {formatPrice(product.oldPrice)}
              </span>
            </div>
          )}
        </div>

        {/* Nút hành động — mt-auto: đẩy xuống đáy card */}
        <div className="d-flex gap-2 mt-auto">
          <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => onSelect(product)}>
            Chi tiết
          </button>
          <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => dispatch(addToCart(product))}>
            <i className="bi bi-cart-plus me-1"></i>Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
