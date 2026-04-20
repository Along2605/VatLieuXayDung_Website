// components/ProductCard.jsx
import { useCart } from "../context/CartContext";
import ProductImage from "./ProductImage";

const formatPrice = (price) =>
  price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function ProductCard({ product, onSelect }) {
  const { addToCart } = useCart();

  return (
    <div
      className="card h-100 shadow-sm border-0"
      style={{ borderRadius: "12px", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* Sale badge */}
      {product.sale && (
        <span
          className="badge bg-danger position-absolute"
          style={{ top: 12, left: 12, fontSize: "11px", zIndex: 1 }}
        >
          GIẢM GIÁ
        </span>
      )}

      {/* Ảnh sản phẩm */}
      <div
        className="d-flex align-items-center justify-content-center p-2"
        style={{ height: 160, background: "#f8fafc", borderRadius: "12px 12px 0 0", overflow: "hidden" }}
        onClick={() => onSelect(product)}
      >
        <ProductImage img={product.img} name={product.name} size={140} />
      </div>

      <div className="card-body d-flex flex-column p-3">
        <span className="badge bg-light text-secondary mb-1" style={{ fontSize: 11, width: "fit-content" }}>
          {product.brand}
        </span>
        <h6
          className="card-title mb-1"
          style={{ fontSize: 15, minHeight: 44, overflow: "hidden", color: "#1e293b" }}
          onClick={() => onSelect(product)}
        >
          {product.name}
        </h6>

        {/* Rating */}
        <div className="d-flex align-items-center gap-1 mb-2">
          <span style={{ color: "#f59e0b", fontSize: 13 }}>
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
          </span>
          <span className="text-muted" style={{ fontSize: 12 }}>({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="mb-2">
          <span className="fw-bold" style={{ fontSize: 17, color: "#2563eb" }}>
            {formatPrice(product.price)}
          </span>
          <span className="text-muted ms-1" style={{ fontSize: 13 }}>/ {product.unit}</span>
          {product.oldPrice && (
            <div>
              <span className="text-decoration-line-through text-muted" style={{ fontSize: 13 }}>
                {formatPrice(product.oldPrice)}
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="d-flex gap-2 mt-auto">
          <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => onSelect(product)}>
            Chi tiết
          </button>
          <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => addToCart(product)}>
            <i className="bi bi-cart-plus me-1"></i>Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
