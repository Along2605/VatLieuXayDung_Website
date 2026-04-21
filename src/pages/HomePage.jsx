// pages/HomePage.jsx
// Sửa: đọc từ /api thay vì file tĩnh → sản phẩm luôn cập nhật
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import BrandIcon from "../components/BrandIcon";

export default function HomePage({ setSelectedProduct }) {
  const navigate = useNavigate();

  const [categories,   setCategories]   = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/products"), fetch("/api/categories")])
      .then(async ([pRes, cRes]) => {
        const products   = pRes.ok  ? await pRes.json()  : [];
        const categories = cRes.ok  ? await cRes.json()  : [];
        setCategories(categories.filter((c) => c.id !== "all").slice(0, 6));
        setSaleProducts(products.filter((p) => p.sale).slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (product) => {
    setSelectedProduct(product);
    navigate(`/products/${product.id}`);
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f4c81 100%)", color: "white", padding: "80px 0" }}>
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3">Vật Liệu Xây Dựng Chất Lượng Cao</h1>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: 560, color: "rgba(255,255,255,0.8)" }}>
            Hàng chính hãng, giao hàng toàn quốc – Đồng hành cùng mọi công trình của bạn
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button className="btn btn-warning btn-lg fw-bold px-5" onClick={() => navigate("/products")}>Mua ngay</button>
            <button className="btn btn-outline-light btn-lg px-5" onClick={() => navigate("/about")}>Tìm hiểu thêm</button>
          </div>
        </div>
      </section>

      {/* Danh mục nổi bật */}
      {!loading && categories.length > 0 && (
        <section className="py-5 bg-light">
          <div className="container">
            <h3 className="fw-bold text-center mb-4">Danh Mục Sản Phẩm</h3>
            <div className="row g-3 justify-content-center">
              {categories.map((cat) => (
                <div className="col-6 col-sm-4 col-md-2" key={cat.id}>
                  <button
                    className="btn btn-white border w-100 py-3 d-flex flex-column align-items-center gap-1 shadow-sm"
                    style={{ borderRadius: 12 }}
                    onClick={() => navigate("/products")}
                  >
                    <BrandIcon size={28} />
                    <span className="small fw-semibold">{cat.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sản phẩm khuyến mãi */}
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

      {/* Tại sao chọn chúng tôi */}
      <section className="py-5 bg-light">
        <div className="container">
          <h3 className="fw-bold text-center mb-4">Tại Sao Chọn VLXD Đức Phiến?</h3>
          <div className="row g-4 text-center">
            {[
              { icon: "bi-shield-check", title: "Hàng chính hãng", desc: "100% sản phẩm có nguồn gốc rõ ràng, cam kết chất lượng" },
              { icon: "bi-truck",        title: "Giao hàng toàn quốc", desc: "Vận chuyển nhanh chóng đến tận công trình của bạn" },
              { icon: "bi-headset",      title: "Hỗ trợ 24/7", desc: "Đội ngũ tư vấn sẵn sàng giải đáp mọi thắc mắc" },
              { icon: "bi-tag",          title: "Giá cạnh tranh", desc: "Cam kết giá tốt nhất thị trường, nhiều ưu đãi hấp dẫn" },
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
