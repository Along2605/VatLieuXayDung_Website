// ============================================================
// pages/HomePage.jsx — Trang chủ
//
// Hiển thị: hero banner, danh mục nổi bật, sản phẩm khuyến mãi
// Đọc dữ liệu từ /api (json-server) để luôn cập nhật
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import BrandIcon from "../components/BrandIcon";

export default function HomePage({ setSelectedProduct }) {
  const navigate = useNavigate();

  const [categories,   setCategories]   = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading,      setLoading]      = useState(true);

  // useEffect chạy 1 lần sau khi component render lần đầu
  // [] = dependency array rỗng → chỉ chạy 1 lần khi mount
  useEffect(() => {
    // Promise.all: gọi 2 API cùng lúc thay vì tuần tự (nhanh hơn)
    Promise.all([
      fetch("/api/products"),
      fetch("/api/categories"),
    ])
      .then(async ([pRes, cRes]) => {
        const products   = pRes.ok ? await pRes.json() : [];
        const categories = cRes.ok ? await cRes.json() : [];
        // Bỏ "Tất cả" (id=all), chỉ lấy 6 danh mục đầu
        setCategories(categories.filter((c) => c.id !== "all").slice(0, 6));
        // Chỉ lấy sản phẩm đang giảm giá (sale=true), tối đa 4 cái
        setSaleProducts(products.filter((p) => p.sale).slice(0, 4));
      })
      .catch(() => {}) // lỗi im lặng — trang vẫn hiển thị được (chỉ thiếu data)
      .finally(() => setLoading(false));
  }, []);

  // Khi user chọn sản phẩm: lưu vào state cha (App.jsx) + navigate
  function handleSelect(product) {
    setSelectedProduct(product);
    navigate(`/products/${product.id}`);
  }

  return (
    <div>

      {/* ── HERO BANNER ── */}
      <section
        style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f4c81 100%)", padding: "80px 0", color: "white" }}
      >
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3">Vật Liệu Xây Dựng Chất Lượng Cao</h1>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: 560, color: "rgba(255,255,255,0.8)" }}>
            Hàng chính hãng, giao hàng toàn quốc — Đồng hành cùng mọi công trình
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <button className="btn btn-warning btn-lg fw-bold px-5" onClick={() => navigate("/products")}>
              Mua ngay
            </button>
            <button className="btn btn-outline-light btn-lg px-5" onClick={() => navigate("/about")}>
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

      {/* ── DANH MỤC NỔI BẬT ── */}
      {!loading && categories.length > 0 && (
        <section className="py-5 bg-light">
          <div className="container">
            <h3 className="fw-bold text-center mb-4">Danh Mục Sản Phẩm</h3>
            <div className="row g-3 justify-content-center">
              {categories.map((cat) => (
                <div className="col-6 col-sm-4 col-md-2" key={cat.id}>
                  <button
                    className="btn btn-white border w-100 py-3 d-flex flex-column align-items-center gap-2 shadow-sm"
                    style={{ borderRadius: 12 }}
                    onClick={() => navigate("/products")} // về trang sản phẩm
                  >
                    {/* Icon danh mục từ Bootstrap Icons */}
                    <i className={`bi bi-${cat.icon}`} style={{ fontSize: 28, color: "#2563eb" }}></i>
                    <span className="small fw-semibold">{cat.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SẢN PHẨM KHUYẾN MÃI ── */}
      <section className="py-5">
        <div className="container">
          <h3 className="fw-bold text-center mb-1">Sản Phẩm Khuyến Mãi</h3>
          <p className="text-center text-muted mb-4">Giá tốt – Số lượng có hạn</p>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : saleProducts.length > 0 ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
              {saleProducts.map((product) => (
                <div className="col" key={product.id}>
                  <ProductCard product={product} onSelect={handleSelect} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">Hiện không có sản phẩm khuyến mãi.</p>
          )}

          <div className="text-center mt-4">
            <button className="btn btn-primary px-5 fw-bold" onClick={() => navigate("/products")}>
              Xem tất cả sản phẩm
            </button>
          </div>
        </div>
      </section>

      {/* ── LÝ DO CHỌN CHÚNG TÔI ── */}
      <section className="py-5 bg-light">
        <div className="container">
          <h3 className="fw-bold text-center mb-4 d-flex align-items-center justify-content-center gap-2">
            <BrandIcon size={32} />
            Tại Sao Chọn VLXD Đức Phiến?
          </h3>
          <div className="row g-4 text-center">
            {[
              { icon: "bi-shield-check", title: "Hàng chính hãng",     desc: "100% sản phẩm có nguồn gốc rõ ràng" },
              { icon: "bi-truck",        title: "Giao hàng toàn quốc", desc: "Vận chuyển nhanh đến tận công trình" },
              { icon: "bi-headset",      title: "Hỗ trợ 24/7",         desc: "Tư vấn sẵn sàng giải đáp mọi lúc" },
              { icon: "bi-tag",          title: "Giá cạnh tranh",       desc: "Cam kết giá tốt nhất thị trường" },
            ].map((item) => (
              <div className="col-6 col-md-3" key={item.title}>
                <div className="card border-0 shadow-sm h-100 p-3" style={{ borderRadius: 12 }}>
                  <i className={`bi ${item.icon} mb-2`} style={{ fontSize: 36, color: "#2563eb" }}></i>
                  <h6 className="fw-bold">{item.title}</h6>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
