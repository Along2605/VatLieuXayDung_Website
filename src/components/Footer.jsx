// components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-5">
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-md-4">
            <h5 className="fw-bold" style={{ color: "#f59e0b" }}>VLXD Đức Phiến</h5>
            <p className="text-white-50 small">
              Chuyên cung cấp vật liệu xây dựng chính hãng, chất lượng cao cho các công trình dân dụng và công nghiệp.
            </p>
          </div>
          <div className="col-md-4">
            <h6 className="fw-bold mb-3">Liên kết nhanh</h6>
            <ul className="list-unstyled small">
              <li className="mb-1"><Link to="/products" className="text-white-50 text-decoration-none">Sản phẩm</Link></li>
              <li className="mb-1"><Link to="/about"    className="text-white-50 text-decoration-none">Giới thiệu</Link></li>
              <li className="mb-1"><Link to="/contact"  className="text-white-50 text-decoration-none">Liên hệ</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="fw-bold mb-3">Liên hệ</h6>
            <p className="text-white-50 small mb-1"><i className="bi bi-telephone me-2"></i>0909 123 456</p>
            <p className="text-white-50 small mb-1"><i className="bi bi-envelope me-2"></i>info@vlxshop.vn</p>
            <p className="text-white-50 small"><i className="bi bi-geo-alt me-2"></i>TP. Hồ Chí Minh</p>
          </div>
        </div>
        <hr className="border-secondary" />
        <p className="text-center text-white-50 small mb-0">© 2026 VLXD Đức Phiến. All rights reserved.</p>
      </div>
    </footer>
  );
}
