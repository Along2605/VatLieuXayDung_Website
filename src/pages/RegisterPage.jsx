// pages/RegisterPage.jsx
// Kiến thức: useState, useNavigate, Link, form validation, fetch POST
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  // ── Validate từng field ──────────────────────────────────────
  const validateField = (name, value) => {
    let msg = "";
    switch (name) {
      case "fullName":
        if (!value.trim()) msg = "Vui lòng nhập họ và tên.";
        else if (value.trim().length < 2) msg = "Họ tên phải có ít nhất 2 ký tự.";
        break;
      case "email":
        if (!value.trim()) msg = "Vui lòng nhập email.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = "Email không đúng định dạng.";
        break;
      case "phone": {
        const s = value.replace(/\s+/g, "");
        if (!s.trim()) msg = "Vui lòng nhập số điện thoại.";
        else if (!/^(\+84|84|0)(3|5|7|8|9)\d{8}$/.test(s)) msg = "Số điện thoại không đúng định dạng (VD: 09xxxxxxxx).";
        break;
      }
      case "password":
        if (!value) msg = "Vui lòng nhập mật khẩu.";
        else if (value.length < 6) msg = "Mật khẩu tối thiểu 6 ký tự.";
        else if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value))
          msg = "Mật khẩu phải có cả chữ lẫn số.";
        break;
      case "confirmPassword":
        if (!value) msg = "Vui lòng xác nhận mật khẩu.";
        else if (value !== form.password) msg = "Mật khẩu xác nhận không khớp.";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  // ── Password strength indicator ──────────────────────────────
  const getStrength = (pw) => {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6)  score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: "Yếu",    color: "danger" };
    if (score <= 3) return { level: 2, label: "Trung bình", color: "warning" };
    return           { level: 3, label: "Mạnh",   color: "success" };
  };
  const strength = getStrength(form.password);

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate toàn bộ
    const fields = ["fullName", "email", "phone", "password", "confirmPassword"];
    const newErrors = {};
    fields.forEach((f) => {
      const msg = validateField(f, form[f]);
      if (msg) newErrors[f] = msg;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await register(form);
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setApiError(result.error);
      }
    } catch {
      setApiError("Không kết nối được server. Hãy chắc chắn json-server đang chạy.");
    } finally {
      setLoading(false);
    }
  };

  // ── Thành công ───────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f1f5f9" }}>
        <div className="text-center p-5">
          <div className="mb-3" style={{ fontSize: 64, color: "#22c55e" }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h4 className="fw-bold">Đăng ký thành công!</h4>
          <p className="text-muted">Đang chuyển đến trang đăng nhập...</p>
          <div className="spinner-border text-success mt-2" role="status"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ background: "#f1f5f9" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-8 col-lg-6">

            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body p-4 p-md-5">

                {/* Logo */}
                <div className="text-center mb-4">
                  <h4 className="fw-bold mb-0" style={{ color: "#1e293b" }}>
                    <span style={{ color: "#1e293b" }}>VLXD </span>
                    <span style={{ color: "#2563eb" }}>Đức Phiến</span>
                  </h4>
                  <h5 className="fw-bold mt-3 mb-1">Tạo tài khoản</h5>
                  <p className="text-muted small">Đăng ký để trải nghiệm mua sắm tốt hơn</p>
                </div>

                {/* API Error */}
                {apiError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    <span>{apiError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Họ tên */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Họ và tên</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-person text-muted"></i>
                      </span>
                      <input
                        type="text"
                        name="fullName"
                        className={`form-control ${errors.fullName ? "is-invalid" : form.fullName ? "is-valid" : ""}`}
                        placeholder="Nguyễn Văn A"
                        value={form.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                    </div>
                  </div>

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
                        className={`form-control ${errors.email ? "is-invalid" : form.email && !errors.email ? "is-valid" : ""}`}
                        placeholder="example@email.com"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="email"
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Số điện thoại</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-telephone text-muted"></i>
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        className={`form-control ${errors.phone ? "is-invalid" : form.phone && !errors.phone ? "is-valid" : ""}`}
                        placeholder="09xxxxxxxx hoặc +84xxxxxxxxx"
                        value={form.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="tel"
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>
                  </div>

                  {/* Mật khẩu */}
                  <div className="mb-1">
                    <label className="form-label fw-semibold">Mật khẩu</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type={showPass ? "text" : "password"}
                        name="password"
                        className={`form-control ${errors.password ? "is-invalid" : form.password && !errors.password ? "is-valid" : ""}`}
                        placeholder="Tối thiểu 6 ký tự, gồm chữ và số"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="new-password"
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

                  {/* Password strength bar */}
                  {form.password && (
                    <div className="mb-3 mt-2">
                      <div className="progress" style={{ height: 4 }}>
                        <div
                          className={`progress-bar bg-${strength.color}`}
                          style={{ width: `${(strength.level / 3) * 100}%`, transition: "width 0.3s" }}
                        ></div>
                      </div>
                      <small className={`text-${strength.color}`}>Độ mạnh: {strength.label}</small>
                    </div>
                  )}

                  {/* Xác nhận mật khẩu */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Xác nhận mật khẩu</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-lock-fill text-muted"></i>
                      </span>
                      <input
                        type={showPass ? "text" : "password"}
                        name="confirmPassword"
                        className={`form-control ${errors.confirmPassword ? "is-invalid" : form.confirmPassword && !errors.confirmPassword ? "is-valid" : ""}`}
                        placeholder="Nhập lại mật khẩu"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="new-password"
                      />
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                      )}
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
                      : <><i className="bi bi-person-plus me-2"></i>Đăng ký</>
                    }
                  </button>
                </form>

                <hr className="my-4" />
                <p className="text-center text-muted mb-0 small">
                  Đã có tài khoản?{" "}
                  <Link to="/login" className="fw-semibold text-decoration-none">Đăng nhập</Link>
                </p>
              </div>
            </div>

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
