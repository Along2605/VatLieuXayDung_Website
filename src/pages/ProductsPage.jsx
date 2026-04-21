// ============================================================
// pages/ProductsPage.jsx — Trang danh sách sản phẩm
//
// Kiến thức sử dụng:
//   - useEffect + fetch: tải dữ liệu từ json-server khi vào trang
//   - useState: lưu danh sách sản phẩm, danh mục, bộ lọc
//   - filter + sort: lọc và sắp xếp mảng sản phẩm
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

export default function ProductsPage({ setSelectedProduct }) {
  const navigate = useNavigate();

  // Dữ liệu gốc từ API
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  // Bộ lọc — người dùng chọn
  const [search,      setSearch]      = useState("");      // tìm theo tên
  const [selectedCat, setSelectedCat] = useState("all");  // lọc theo danh mục
  const [sortBy,      setSortBy]      = useState("default"); // sắp xếp

  // Tải dữ liệu khi component mount
  useEffect(() => {
    setLoading(true);
    Promise.all([fetch("/api/products"), fetch("/api/categories")])
      .then(async ([pRes, cRes]) => {
        if (!pRes.ok) throw new Error("Không tải được sản phẩm");
        if (!cRes.ok) throw new Error("Không tải được danh mục");
        const products   = await pRes.json();
        const categories = await cRes.json();
        setProducts(products);
        // Đảm bảo "Tất cả" luôn là mục đầu tiên
        const hasAll = categories.some((c) => c.id === "all");
        setCategories(
          hasAll
            ? categories
            : [{ id: "all", label: "Tất cả", icon: "grid" }, ...categories]
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []); // [] = chỉ chạy 1 lần khi component mount

  function handleSelect(product) {
    setSelectedProduct(product);        // lưu vào App.jsx để ProductDetailPage dùng
    navigate(`/products/${product.id}`);
  }

  // ── Lọc và sắp xếp (tính toán trực tiếp, không cần state riêng) ──────────
  // Mỗi lần render, danh sách này được tính lại từ đầu dựa trên bộ lọc
  let filtered = products.filter((item) => {
    // Lọc theo danh mục (bỏ qua nếu chọn "all")
    const matchCat    = selectedCat === "all" || item.category === selectedCat;
    // Lọc theo tên — toLowerCase để không phân biệt hoa thường
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Sắp xếp (tạo bản sao bằng [...filtered] để không thay đổi mảng gốc)
  if (sortBy === "price-asc")  filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "rating")     filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  // ── Màn hình loading ─────────────────────────────────────────────────────
  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary mb-3"></div>
      <p className="text-muted">Đang tải sản phẩm...</p>
    </div>
  );

  // ── Màn hình lỗi ─────────────────────────────────────────────────────────
  if (error) return (
    <div className="container py-5 text-center">
      <div className="alert alert-danger d-inline-block">
        <i className="bi bi-exclamation-triangle me-2"></i>{error}
        <div className="mt-2 small text-muted">
          Hãy chắc <code>json-server</code> đang chạy (<code>npm run dev</code>)
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <h2 className="text-center fw-bold mb-1">Vật Liệu Xây Dựng</h2>
      <p className="text-center text-muted mb-4">Chất lượng đảm bảo – Giao hàng toàn quốc</p>

      {/* ── Tìm kiếm + sắp xếp ── */}
      <div className="row g-2 mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)} // cập nhật state mỗi lần gõ
            />
            {/* Nút xóa tìm kiếm — chỉ hiện khi đang tìm */}
            {search && (
              <button className="btn btn-outline-secondary" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Sắp xếp mặc định</option>
            <option value="price-asc">Giá: Thấp → Cao</option>
            <option value="price-desc">Giá: Cao → Thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      {/* ── Nút lọc danh mục ── */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`btn btn-sm rounded-pill ${
              selectedCat === cat.id ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => setSelectedCat(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tổng số kết quả */}
      <p className="text-muted small mb-3">
        Hiển thị <strong>{filtered.length}</strong> sản phẩm
      </p>

      {/* ── Danh sách sản phẩm ── */}
      {filtered.length > 0 ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
          {filtered.map((product) => (
            <div className="col" key={product.id}>
              <ProductCard product={product} onSelect={handleSelect} />
            </div>
          ))}
        </div>
      ) : (
        // Không có kết quả
        <div className="text-center py-5">
          <i className="bi bi-search" style={{ fontSize: 48, color: "#94a3b8" }}></i>
          <p className="text-muted mt-3">Không tìm thấy sản phẩm phù hợp.</p>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => { setSearch(""); setSelectedCat("all"); }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
