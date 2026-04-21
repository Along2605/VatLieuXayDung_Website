// ============================================================
// pages/ProductDetailPage.jsx — Trang chi tiết sản phẩm
//
// Nhận sản phẩm qua props (từ App.jsx state)
// Tự fetch sản phẩm liên quan từ /api theo category
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductImage from "../components/ProductImage";

function formatPrice(price) {
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function ProductDetailPage({ product, onSelectRelated }) {
  const { addToCart }    = useCart();
  const navigate         = useNavigate();

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [qty,    setQty]    = useState(1);   // số lượng muốn mua
  const [added,  setAdded]  = useState(false); // trạng thái nút sau khi thêm

  // Fetch sản phẩm liên quan khi product thay đổi
  // dependency: [product?.id] → chạy lại khi xem sản phẩm khác
  useEffect(() => {
    if (!product?.category) return;
    fetch(`/api/products?category=${product.category}`)
      .then((res) => res.ok ? res.json() : [])
      .then((all) =>
        // Bỏ sản phẩm đang xem, lấy tối đa 4 cái còn lại
        setRelatedProducts(all.filter((p) => p.id !== product.id).slice(0, 4))
      )
      .catch(() => {});
  }, [product?.id]);

  // Không có sản phẩm (user gõ URL trực tiếp) → về danh sách
  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h3>Không tìm thấy sản phẩm</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/products")}>
          Về danh sách
        </button>
      </div>
    );
  }

  function handleAddToCart() {
    // Thêm qty lần (vòng lặp đơn giản)
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000); // reset nút sau 2 giây
  }

  function handleSelectRelated(p) {
    onSelectRelated(p);           // cập nhật selectedProduct ở App.jsx
    navigate(`/products/${p.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" }); // cuộn lên đầu
  }

  return (
    <div className="container py-4">

      {/* Breadcrumb — cho user biết đang ở đâu */}
      <nav className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate("/")}>
              Trang chủ
            </button>
          </li>
          <li className="breadcrumb-item">
            <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate("/products")}>
              Sản phẩm
            </button>
          </li>
          <li className="breadcrumb-item active text-truncate" style={{ maxWidth: 220 }}>
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Nội dung chính: ảnh + thông tin */}
      <div className="row g-4">

        {/* Ảnh sản phẩm */}
        <div className="col-md-5">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 p-3"
            style={{ background: "#f8fafc", height: 340 }}
          >
            <ProductImage img={product.img} name={product.name} size={300} />
          </div>
          {/* Banner giảm giá */}
          {product.sale && (
            <div className="alert alert-danger py-2 mt-2 text-center small fw-bold">
              🔥 Đang giảm giá! Tiết kiệm {formatPrice(product.oldPrice - product.price)}
            </div>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="col-md-7">
          <span className="badge bg-light text-secondary mb-2">{product.brand}</span>
          <h3 className="fw-bold mb-2">{product.name}</h3>

          {/* Rating */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <span style={{ color: "#f59e0b" }}>{"★".repeat(Math.round(product.rating))}</span>
            <span className="fw-bold">{product.rating}</span>
            <span className="text-muted small">({product.reviews} đánh giá)</span>
          </div>

          {/* Giá */}
          <div className="mb-3">
            <span className="fw-bold" style={{ fontSize: 28, color: "#2563eb" }}>
              {formatPrice(product.price)}
            </span>
            <span className="text-muted ms-1">/ {product.unit}</span>
            {product.oldPrice && (
              <span className="text-decoration-line-through text-muted ms-2" style={{ fontSize: 18 }}>
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Tồn kho */}
          <p className="text-muted small mb-3">
            <i className="bi bi-box me-1"></i>
            Còn lại: <strong>{product.stock} {product.unit}</strong>
          </p>

          {/* Mô tả */}
          <p className="text-secondary mb-4">{product.desc}</p>

          {/* Chọn số lượng + nút Thêm vào giỏ */}
          <div className="d-flex align-items-center gap-3 mb-3">
            {/* Spinner số lượng */}
            <div className="input-group" style={{ width: 130 }}>
              <button className="btn btn-outline-secondary" onClick={() => setQty(Math.max(1, qty - 1))}>
                −
              </button>
              <input type="text" className="form-control text-center fw-bold" value={qty} readOnly />
              <button className="btn btn-outline-secondary" onClick={() => setQty(qty + 1)}>
                +
              </button>
            </div>
            {/* Nút Thêm vào giỏ — đổi màu và chữ sau khi click */}
            <button
              className={`btn ${added ? "btn-success" : "btn-primary"} flex-grow-1`}
              onClick={handleAddToCart}
            >
              {added
                ? <><i className="bi bi-check-lg me-1"></i>Đã thêm!</>
                : <><i className="bi bi-cart-plus me-1"></i>Thêm vào giỏ</>
              }
            </button>
          </div>

          {/* Nút quay lại */}
          <button className="btn btn-outline-secondary w-100" onClick={() => navigate("/products")}>
            ← Quay lại danh sách
          </button>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div className="mt-5">
          <h5 className="fw-bold mb-3">Sản phẩm liên quan</h5>
          <div className="row row-cols-2 row-cols-md-4 g-3">
            {relatedProducts.map((item) => (
              <div className="col" key={item.id}>
                <div
                  className="card h-100 border-0 shadow-sm text-center p-3"
                  style={{ cursor: "pointer", borderRadius: 10 }}
                  onClick={() => handleSelectRelated(item)}
                >
                  <div className="d-flex align-items-center justify-content-center" style={{ height: 100 }}>
                    <ProductImage img={item.img} name={item.name} size={90} />
                  </div>
                  <p className="small fw-bold mb-1 mt-2">{item.name}</p>
                  <p className="text-primary fw-bold small mb-2">{formatPrice(item.price)}</p>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation(); // ngăn sự kiện click lan lên div cha
                      addToCart(item);
                    }}
                  >
                    + Thêm giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
