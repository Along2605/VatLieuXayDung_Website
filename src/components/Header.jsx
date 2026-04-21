// components/Header.jsx
// Kiến thức: useNavigate, Link, NavLink, useAuth, useCart
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import BrandIcon from "./BrandIcon";

export default function Header() {
  const { totalItems } = useCart();
  const { user, logout, isAdminUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/",         label: "Trang Chủ", end: true },
    { to: "/products", label: "Sản Phẩm" },
    { to: "/about",    label: "Giới Thiệu" },
    { to: "/contact",  label: "Liên Hệ" },
  ];

  const activeStyle = { color: "#f59e0b", fontWeight: 700 };
  const normalStyle = { color: "rgba(255,255,255,0.85)" };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ background: "#1e293b" }}>
      <div className="container">
        {/* Logo */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 text-decoration-none"
          style={{ color: "#f59e0b" }}
        >
          <BrandIcon size={36} alt="VLXD Đức Phiến" className="flex-shrink-0" />
          <span className="text-white" style={{ fontSize: "0.95rem", maxWidth: 280, lineHeight: 1.25 }}>
            VLXD Đức Phiến
          </span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          {/* Nav links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {navLinks.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className="nav-link"
                  style={({ isActive }) => (isActive ? activeStyle : normalStyle)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="d-flex align-items-center gap-2">
            {/* Giỏ hàng */}
            <Link to="/cart" className="btn btn-warning fw-bold position-relative text-decoration-none">
              <i className="bi bi-cart3 me-1"></i>
              Giỏ hàng
              {totalItems > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light btn-sm dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user.fullName.split(" ").pop()}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text small text-muted">{user.email}</span>
                  </li>
                  {user.phone ? (
                    <li>
                      <span className="dropdown-item-text small">
                        <i className="bi bi-telephone me-1"></i>
                        {user.phone}
                      </span>
                    </li>
                  ) : null}
                  <li>
                    <Link to="/cart" className="dropdown-item small">
                      <i className="bi bi-cart3 me-2"></i>Giỏ hàng
                    </Link>
                  </li>
                  {/* Menu Admin — chỉ hiện khi là admin */}
                  {isAdminUser && (
                    <>
                      <li><hr className="dropdown-divider my-1" /></li>
                      <li>
                        <span className="dropdown-item-text small text-muted fw-semibold" style={{ fontSize: 11 }}>
                          <i className="bi bi-shield-check me-1 text-primary"></i>QUẢN TRỊ
                        </span>
                      </li>
                      <li>
                        <Link to="/admin/products" className="dropdown-item small">
                          <i className="bi bi-box-seam me-2"></i>Quản lý sản phẩm
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/users" className="dropdown-item small">
                          <i className="bi bi-people me-2"></i>Quản lý người dùng
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline-light btn-sm text-decoration-none">
                <i className="bi bi-person me-1"></i>Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
