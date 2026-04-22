// pages/ProductsPage.jsx
// Kiến thức: useNavigate, useState, useEffect, fetch API
// Sửa: đọc từ /api thay vì file tĩnh → cập nhật ngay khi admin thêm/sửa/xóa

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import BrandIcon from "../components/BrandIcon";

export default function ProductsPage({ setSelectedProduct }) {
  const navigate = useNavigate();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [searchTerm,  setSearchTerm]  = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [sortBy,      setSortBy]      = useState("default");

  // Đọc từ json-server API — luôn phản ánh db.json mới nhất
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/products"),
      fetch("/api/categories"),
    ])
      .then(async ([pRes, cRes]) => {
        if (!pRes.ok) throw new Error("Không tải được sản phẩm");
        if (!cRes.ok) throw new Error("Không tải được danh mục");
        const products   = await pRes.json();
        const categories = await cRes.json();
        setProducts(products);
        // Thêm "Tất cả" lên đầu nếu chưa có
        const hasAll = categories.some((c) => c.id === "all");
        setCategories(hasAll ? categories : [{ id: "all", label: "Tất cả", icon: "grid" }, ...categories]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
        <i className="bi bi-exclamation-triangle me-2"></i>{error}
        <div className="mt-2 small">Hãy chắc chắn <code>json-server</code> đang chạy (<code>npm run dev</code>)</div>
      </div>
    </div>
  );

  // Lọc + sắp xếp
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

      {/* Tìm kiếm + sắp xếp */}
      <div className="row g-2 mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted"></i>
            </span>
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

      {/* Danh mục */}
      {/* justify-content-start: giữ các nút bắt đầu từ trái, không bị căn giữa */}
      <div className="d-flex flex-wrap gap-2 mb-4 justify-content-start">
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

      <p className="text-muted small mb-3">
        Hiển thị <strong>{filtered.length}</strong> sản phẩm
      </p>

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
