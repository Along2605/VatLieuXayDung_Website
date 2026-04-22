// ============================================================
// client/src/pages/ProductDetailPage.jsx
// Thay đổi: fetch(`/api/products?category=...`) → api.products.getAll({ category })
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductImage from '../components/ProductImage';
import api from '../services/api';

function formatPrice(price) {
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

export default function ProductDetailPage({ product, onSelectRelated }) {
  const { addToCart } = useCart();
  const navigate      = useNavigate();

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [qty,   setQty]   = useState(1);
  const [added, setAdded] = useState(false);

  // Lấy sản phẩm liên quan khi product thay đổi
  useEffect(() => {
    if (!product?.category) return;
    // GET /api/products?category=xi-mang — lọc ở server
    api.products.getAll({ category: product.category })
      .then((res) => setRelatedProducts(
        res.data.filter((p) => p.id !== product.id).slice(0, 4)
      ))
      .catch(() => {});
  }, [product?.id]);

  if (!product) return (
    <div className="container py-5 text-center">
      <h3>Không tìm thấy sản phẩm</h3>
      <button className="btn btn-primary mt-3" onClick={() => navigate('/products')}>Về danh sách</button>
    </div>
  );

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleSelectRelated(p) {
    onSelectRelated(p);
    navigate(`/products/${p.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate('/')}>Trang chủ</button>
          </li>
          <li className="breadcrumb-item">
            <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate('/products')}>Sản phẩm</button>
          </li>
          <li className="breadcrumb-item active text-truncate" style={{ maxWidth: 220 }}>{product.name}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Ảnh */}
        <div className="col-md-5">
          <div className="d-flex align-items-center justify-content-center rounded-3 p-3"
            style={{ background: '#f8fafc', height: 340 }}>
            <ProductImage img={product.img} name={product.name} size={300} />
          </div>
          {product.sale && (
            <div className="alert alert-danger py-2 mt-2 text-center small fw-bold">
              🔥 Đang giảm giá! Tiết kiệm {formatPrice((product.old_price || product.oldPrice) - product.price)}
            </div>
          )}
        </div>

        {/* Thông tin */}
        <div className="col-md-7">
          <span className="badge bg-light text-secondary mb-2">{product.brand}</span>
          <h3 className="fw-bold mb-2">{product.name}</h3>
          <div className="d-flex align-items-center gap-2 mb-3">
            <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(product.rating))}</span>
            <span className="fw-bold">{product.rating}</span>
            <span className="text-muted small">({product.reviews} đánh giá)</span>
          </div>
          <div className="mb-3">
            <span className="fw-bold" style={{ fontSize: 28, color: '#2563eb' }}>{formatPrice(product.price)}</span>
            <span className="text-muted ms-1">/ {product.unit}</span>
            {(product.old_price || product.oldPrice) && (
              <span className="text-decoration-line-through text-muted ms-2" style={{ fontSize: 18 }}>
                {formatPrice(product.old_price || product.oldPrice)}
              </span>
            )}
          </div>
          <p className="text-muted small mb-3">
            <i className="bi bi-box me-1"></i>Còn lại: <strong>{product.stock} {product.unit}</strong>
          </p>
          {/* Backend trả về field 'description', JSON cũ dùng 'desc' */}
          <p className="text-secondary mb-4">{product.description || product.desc}</p>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="input-group" style={{ width: 130 }}>
              <button className="btn btn-outline-secondary" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="form-control text-center fw-bold">{qty}</span>
              <button className="btn btn-outline-secondary" onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className={`btn ${added ? 'btn-success' : 'btn-primary'} flex-grow-1`} onClick={handleAddToCart}>
              {added ? <><i className="bi bi-check-lg me-1"></i>Đã thêm!</> : <><i className="bi bi-cart-plus me-1"></i>Thêm vào giỏ</>}
            </button>
          </div>
          <button className="btn btn-outline-secondary w-100" onClick={() => navigate('/products')}>← Quay lại danh sách</button>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div className="mt-5">
          <h5 className="fw-bold mb-3">Sản phẩm liên quan</h5>
          <div className="row row-cols-2 row-cols-md-4 g-3">
            {relatedProducts.map((item) => (
              <div className="col" key={item.id}>
                <div className="card h-100 border-0 shadow-sm text-center p-3"
                  style={{ cursor: 'pointer', borderRadius: 10 }}
                  onClick={() => handleSelectRelated(item)}>
                  <div className="d-flex align-items-center justify-content-center" style={{ height: 100 }}>
                    <ProductImage img={item.img} name={item.name} size={90} />
                  </div>
                  <p className="small fw-bold mb-1 mt-2">{item.name}</p>
                  <p className="text-primary fw-bold small mb-2">{formatPrice(item.price)}</p>
                  <button className="btn btn-outline-primary btn-sm"
                    onClick={(e) => { e.stopPropagation(); addToCart(item); }}>
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
