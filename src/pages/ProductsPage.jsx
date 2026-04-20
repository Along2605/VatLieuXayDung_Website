// pages/ProductsPage.jsx
// Kiến thức: useNavigate, useFetch, useState
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import ProductCard from "../components/ProductCard";
import BrandIcon from "../components/BrandIcon";

export default function ProductsPage({ setSelectedProduct }) {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch("/data/products.json");

  const [searchTerm,   setSearchTerm]   = useState("");
  const [selectedCat,  setSelectedCat]  = useState("all");
  const [sortBy,       setSortBy]       = useState("default");

  const handleSelect = (product) => {
    setSelectedProduct(product);
    navigate(`/products/${product.id}`);
  };

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary mb-3" role="status"></div>
      <p className="text-muted">Đang tải sản phẩm...</p>
    </div>
  );

  if (error) return (
    <div className="container py-5 text-center">
      <div className="alert alert-danger d-inline-block">
        <i className="bi bi-exclamation-triangle me-2"></i>Lỗi: {error}
      </div>
    </div>
  );

  const products   = data?.products   || [];
  const categories = data?.categories || [];

  let filtered = products.filter((item) => {
    const matchCat    = selectedCat === "all" || item.category === selectedCat;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  if (sortBy === "price-asc")  filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "rating")     filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="container py-4">
      <h2 className="text-center fw-bold mb-1">Vật Liệu Xây Dựng</h2>
      <p className="text-center text-muted mb-4">Chất lượng đảm bảo – Giao hàng toàn quốc</p>

      <div className="row g-2 mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
            <input
              type="text" className="form-control"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="btn btn-outline-secondary" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Sắp xếp mặc định</option>
            <option value="price-asc">Giá: Thấp → Cao</option>
            <option value="price-desc">Giá: Cao → Thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`btn btn-sm rounded-pill ${selectedCat === cat.id ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setSelectedCat(cat.id)}
          >
            <BrandIcon size={16} className="me-1 align-text-bottom" />
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-muted small mb-3">Hiển thị <strong>{filtered.length}</strong> sản phẩm</p>

      {filtered.length > 0 ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
          {filtered.map((product) => (
            <div className="col" key={product.id}>
              <ProductCard product={product} onSelect={handleSelect} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-search" style={{ fontSize: 48, color: "#94a3b8" }}></i>
          <p className="text-muted mt-3">Không tìm thấy sản phẩm phù hợp.</p>
          <button className="btn btn-outline-primary btn-sm"
            onClick={() => { setSearchTerm(""); setSelectedCat("all"); }}>
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
