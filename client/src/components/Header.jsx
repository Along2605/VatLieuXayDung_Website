// ============================================================
// components/Header.jsx — Thanh điều hướng trên cùng
//
// Hiển thị: Logo | Nav links | Giỏ hàng | Đăng nhập/Dropdown user
// Nếu là admin → dropdown có thêm menu Quản trị
// ============================================================

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import BrandIcon from "./BrandIcon";

export default function Header() {
  const { totalItems } = useCart(); // số lượng sản phẩm trong giỏ
  const { user, logout, isAdminUser } = useAuth(); // thông tin user đang đăng nhập
  const navigate = useNavigate();

  function handleLogout() {
    logout(); // xóa user khỏi state + localStorage
    navigate("/"); // về trang chủ
  }

  // Danh sách link điều hướng chính
  const navLinks = [
    { to: "/", label: "Trang Chủ", end: true }, // end=true: chỉ active khi URL = "/"
    { to: "/products", label: "Sản Phẩm" },
    { to: "/about", label: "Giới Thiệu" },
    { to: "/contact", label: "Liên Hệ" },
  ];

  return (
    // sticky-top: navbar dính trên cùng khi scroll
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top"
      style={{ background: "#1e293b" }}
    >
      <div className="container">
        {/* Logo + Tên cửa hàng */}
        <Link
          to="/"
          className="navbar-brand fw-bold text-warning text-decoration-none d-flex align-items-center gap-2"
        >
          <BrandIcon size={32} />
          VLXD Đức Phiến
        </Link>

        {/* Nút hamburger — chỉ hiện trên mobile (< lg) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav" // khớp với id bên dưới
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nội dung navbar — collapse trên mobile */}
        <div className="collapse navbar-collapse" id="mainNav">
          {/* Nav links — me-auto: đẩy sang trái */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {navLinks.map((item) => (
              <li className="nav-item" key={item.to}>
                {/* NavLink tự thêm class "active" khi URL khớp */}
                <NavLink
                  to={item.to}
                  end={item.end}
                  className="nav-link"
                  style={({ isActive }) =>
                    isActive
                      ? { color: "#f59e0b", fontWeight: 700 } // đang ở trang này
                      : { color: "rgba(255,255,255,0.85)" }
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Phần bên phải: giỏ hàng + auth */}
          <div className="d-flex align-items-center gap-2">
            {/* Nút giỏ hàng + badge số lượng */}
            <Link
              to="/cart"
              className="btn btn-warning fw-bold position-relative"
            >
              <i className="bi bi-cart3 me-1"></i>Giỏ hàng
              {/* Badge số lượng: chỉ hiện khi có sản phẩm */}
              {totalItems > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Nếu đã đăng nhập → hiện dropdown user */}
            {user ? (
              <div className="dropdown">
                {/* Nút mở dropdown */}
                <button
                  className="btn btn-outline-light btn-sm dropdown-toggle"
                  data-bs-toggle="dropdown" // Bootstrap JS xử lý mở/đóng
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {/* Lấy chữ cuối của họ tên (tên riêng) */}
                  {user.fullName.split(" ").pop()}
                </button>

                {/* Menu dropdown */}
                <ul className="dropdown-menu dropdown-menu-end">
                  {/* Thông tin user */}
                  <li>
                    <span className="dropdown-item-text small text-muted">
                      {user.email}
                    </span>
                  </li>
                  {user.phone && (
                    <li>
                      <span className="dropdown-item-text small">
                        <i className="bi bi-telephone me-1"></i>
                        {user.phone}
                      </span>
                    </li>
                  )}

                  {/* Link giỏ hàng */}
                  <li>
                    <hr className="dropdown-divider my-1" />
                  </li>
                  <li>
                    <Link to="/cart" className="dropdown-item small">
                      <i className="bi bi-cart3 me-2"></i>Giỏ hàng
                    </Link>
                  </li>

                  {/* Menu admin — chỉ hiện khi isAdminUser = true */}
                  {isAdminUser && (
                    <>
                      <li>
                        <hr className="dropdown-divider my-1" />
                      </li>
                      <li>
                        <span
                          className="dropdown-item-text text-muted fw-semibold"
                          style={{ fontSize: 11 }}
                        >
                          <i className="bi bi-shield-check me-1 text-primary"></i>
                          QUẢN TRỊ
                        </span>
                      </li>
                      <li>
                        <Link
                          to="/admin/products"
                          className="dropdown-item small"
                        >
                          <i className="bi bi-box-seam me-2"></i>Quản lý sản
                          phẩm
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/users" className="dropdown-item small">
                          <i className="bi bi-people me-2"></i>Quản lý người
                          dùng
                        </Link>
                      </li>
                    </>
                  )}

                  {/* Đăng xuất */}
                  <li>
                    <hr className="dropdown-divider my-1" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              // Chưa đăng nhập → nút Đăng nhập
              <Link to="/login" className="btn btn-outline-light btn-sm">
                <i className="bi bi-person me-1"></i>Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
