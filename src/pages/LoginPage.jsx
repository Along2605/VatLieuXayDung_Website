// pages/LoginPage.jsx
// Kiến thức: useState, useNavigate, useLocation, controlled inputs, form validation
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Nếu có trang muốn vào trước đó → redirect về đó sau khi login
  const from = location.state?.from?.pathname || "/";

  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // ── Validate từng field khi blur ────────────────────────────
  const validateField = (name, value) => {
    let msg = "";
    if (name === "email") {
      if (!value.trim()) msg = "Vui lòng nhập email.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = "Email không đúng định dạng.";
    }
    if (name === "password") {
      if (!value) msg = "Vui lòng nhập mật khẩu.";
    }
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi khi user bắt đầu gõ lại
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate toàn bộ trước khi gửi
    const newErrors = {};
    if (!form.email.trim())    newErrors.email    = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Email không đúng định dạng.";
    if (!form.password)        newErrors.password = "Vui lòng nhập mật khẩu.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await login(form);
      if (result.ok) {
        navigate(from, { replace: true });
      } else {
        setApiError(result.error);
      }
    } catch {
      setApiError("Không kết nối được server. Hãy chắc chắn json-server đang chạy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ background: "#f1f5f9" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-7 col-lg-5">

            {/* Card */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body p-4 p-md-5">

                {/* Logo */}
                <div className="text-center mb-4">
                  <h4 className="fw-bold mb-0" style={{ color: "#1e293b" }}>
                    <span style={{ color: "#1e293b" }}>VLXD </span>
                    <span style={{ color: "#2563eb" }}>Đức Phiến</span>
                  </h4>
                  <h5 className="fw-bold mt-3 mb-1">Đăng nhập</h5>
                  <p className="text-muted small">Chào mừng bạn trở lại!</p>
                </div>

                {/* API Error banner */}
                {apiError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    <span>{apiError}</span>
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
                        className={`form-control ${errors.email ? "is-invalid" : form.email ? "is-valid" : ""}`}
                        placeholder="example@email.com"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="email"
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Mật khẩu</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type={showPass ? "text" : "password"}
                        name="password"
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        placeholder="Nhập mật khẩu"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPass(!showPass)}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-bold"
                    disabled={loading}
                  >
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
                      : <><i className="bi bi-box-arrow-in-right me-2"></i>Đăng nhập</>
                    }
                  </button>
                </form>

                {/* Register link */}
                <hr className="my-4" />
                <p className="text-center text-muted mb-0 small">
                  Chưa có tài khoản?{" "}
                  <Link to="/register" className="fw-semibold text-decoration-none">
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </div>

            {/* Back home */}
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
