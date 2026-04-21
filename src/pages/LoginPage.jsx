// ============================================================
// pages/LoginPage.jsx — Trang đăng nhập
//
// Kiến thức sử dụng:
//   - useState: quản lý giá trị form, lỗi, loading
//   - controlled input: value + onChange đồng bộ với state
//   - validate: kiểm tra dữ liệu trước khi gửi
//   - async/await: gọi hàm login() từ AuthContext
//   - useLocation: đọc trang user muốn vào trước khi bị redirect
// ============================================================

import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  // Nếu user bị redirect về /login do chưa đăng nhập,
  // location.state.from lưu trang muốn vào ban đầu
  // Sau khi login → navigate về trang đó thay vì về "/"
  const redirectTo = location.state?.from?.pathname || "/";

  // State form — "controlled input": React quản lý giá trị, không để DOM tự quản lý
  const [form, setForm]         = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({});      // lỗi validate từng field
  const [apiError, setApiError] = useState("");      // lỗi từ server (email/mật khẩu sai)
  const [loading, setLoading]   = useState(false);   // đang chờ response
  const [showPass, setShowPass] = useState(false);   // ẩn/hiện mật khẩu

  // Validate một field khi user rời khỏi ô input (onBlur)
  function validateField(name, value) {
    let msg = "";
    if (name === "email") {
      if (!value.trim()) msg = "Vui lòng nhập email.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = "Email không đúng định dạng.";
    }
    if (name === "password" && !value) msg = "Vui lòng nhập mật khẩu.";
    // Cập nhật lỗi của đúng field, giữ nguyên lỗi của field khác
    setErrors((prev) => ({ ...prev, [name]: msg }));
  }

  // Khi user gõ vào ô input → cập nhật state form
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi khi user bắt đầu sửa lại
    if (errors[name])  setErrors((prev)  => ({ ...prev, [name]: "" }));
    if (apiError)      setApiError("");
  }

  // Khi submit form
  async function handleSubmit(e) {
    e.preventDefault(); // ngăn trình duyệt reload trang

    // Validate tất cả field trước khi gửi
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Email không đúng định dạng.";
    if (!form.password) newErrors.password = "Vui lòng nhập mật khẩu.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // dừng lại nếu có lỗi
    }

    setLoading(true);
    try {
      const result = await login(form); // gọi hàm login từ AuthContext
      if (result.ok) {
        navigate(redirectTo, { replace: true }); // về trang muốn vào ban đầu
      } else {
        setApiError(result.error); // hiển thị lỗi từ server
      }
    } catch {
      setApiError("Không kết nối được server. Hãy chắc json-server đang chạy.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ background: "#f1f5f9" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-7 col-lg-5">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body p-4 p-md-5">

                {/* Logo + tiêu đề */}
                <div className="text-center mb-4">
                  <h4 className="fw-bold">VLXD <span style={{ color: "#2563eb" }}>Đức Phiến</span></h4>
                  <h5 className="fw-bold mt-3 mb-1">Đăng nhập</h5>
                  <p className="text-muted small">Chào mừng bạn trở lại!</p>
                </div>

                {/* Lỗi từ server */}
                {apiError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    {apiError}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-envelope text-muted"></i>
                      </span>
                      <input
                        type="email"
                        name="email"
                        // is-invalid/is-valid: Bootstrap tự động hiển thị viền đỏ/xanh
                        className={`form-control ${errors.email ? "is-invalid" : form.email ? "is-valid" : ""}`}
                        placeholder="example@email.com"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>

                  {/* Mật khẩu */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Mật khẩu</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      {/* type thay đổi theo showPass để ẩn/hiện mật khẩu */}
                      <input
                        type={showPass ? "text" : "password"}
                        name="password"
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        placeholder="Nhập mật khẩu"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                      />
                      {/* Nút mắt — toggle ẩn/hiện */}
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPass(!showPass)}
                        tabIndex={-1} // bỏ qua khi dùng Tab trên bàn phím
                      >
                        <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>

                  {/* Nút submit */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-bold"
                    disabled={loading} // vô hiệu hóa khi đang chờ
                  >
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
                      : <><i className="bi bi-box-arrow-in-right me-2"></i>Đăng nhập</>
                    }
                  </button>
                </form>

                {/* Link sang trang đăng ký */}
                <hr className="my-4" />
                <p className="text-center text-muted mb-0 small">
                  Chưa có tài khoản?{" "}
                  <Link to="/register" className="fw-semibold text-decoration-none">Đăng ký ngay</Link>
                </p>
              </div>
            </div>

            {/* Về trang chủ */}
            <div className="text-center mt-3">
              <Link to="/" className="text-muted small text-decoration-none">
                <i className="bi bi-arrow-left me-1"></i>Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
