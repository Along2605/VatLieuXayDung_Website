// pages/HomePage.jsx
import { useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import ProductCard from "../components/ProductCard";
import BrandIcon from "../components/BrandIcon";

export default function HomePage({ setSelectedProduct }) {
  const navigate = useNavigate();
  const { data, loading } = useFetch("/data/products.json");

  const categories   = data?.categories || [];
  const saleProducts = (data?.products  || []).filter((p) => p.sale).slice(0, 4);

  const handleSelect = (product) => {
    setSelectedProduct(product);
    navigate(`/products/${product.id}`);
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f4c81 100%)", color: "white", padding: "80px 0" }}>
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3"> Vật Liệu Xây Dựng Chất Lượng Cao</h1>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: 560, color: "rgba(255,255,255,0.8)" }}>
            Hàng chính hãng, giao hàng toàn quốc – Đồng hành cùng mọi công trình của bạn
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button className="btn btn-warning btn-lg fw-bold px-5" onClick={() => navigate("/products")}>Mua ngay</button>
            <button className="btn btn-outline-light btn-lg px-5" onClick={() => navigate("/about")}>Tìm hiểu thêm</button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-warning-subtle py-3">
        <div className="container">
          <div className="row text-center g-3">
            {[
              { icon: "bi-truck",        text: "Giao hàng toàn quốc" },
              { icon: "bi-patch-check",  text: "Hàng chính hãng 100%" },
              { icon: "bi-arrow-repeat", text: "Đổi trả trong 7 ngày" },
              { icon: "bi-shield-lock",  text: "Thanh toán an toàn" },
            ].map((f, i) => (
              <div className="col-6 col-md-3" key={i}>
                <i className={`bi ${f.icon}`} style={{ fontSize: 24, color: "#0f4c81" }}></i>
                <p className="small fw-bold mb-0 mt-1">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-5">
        <h3 className="fw-bold text-center mb-4">Danh mục sản phẩm</h3>
        {loading ? (
          <div className="text-center"><div className="spinner-border text-primary" role="status"></div></div>
        ) : (
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-3 justify-content-center">
            {categories.filter((c) => c.id !== "all").map((cat) => (
              <div className="col" key={cat.id}>
                <div
                  className="card border-0 shadow-sm text-center p-3 h-100"
                  style={{ borderRadius: 12, cursor: "pointer", transition: "all 0.2s" }}
                  onClick={() => navigate("/products")}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <BrandIcon size={40} className="d-block mx-auto" />
                  <p className="small fw-bold mb-0 mt-2">{cat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sale */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">🔥 Đang giảm giá</h3>
            <button className="btn btn-outline-primary btn-sm" onClick={() => navigate("/products")}>Xem tất cả →</button>
          </div>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
              {saleProducts.map((product) => (
                <div className="col" key={product.id}>
                  <ProductCard product={product} onSelect={handleSelect} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-5" style={{ background: "#1e293b", color: "white" }}>
        <div className="container">
          <div className="row text-center g-4">
            {[
              { num: "10.000+", label: "Sản phẩm" },
              { num: "50.000+", label: "Khách hàng" },
              { num: "63",      label: "Tỉnh thành" },
              { num: "15",      label: "Năm kinh nghiệm" },
            ].map((s, i) => (
              <div className="col-6 col-md-3" key={i}>
                <h2 className="fw-bold" style={{ color: "#f59e0b" }}>{s.num}</h2>
                <p className="mb-0" style={{ color: "rgba(255,255,255,0.6)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
