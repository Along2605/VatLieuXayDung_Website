// ============================================================
// pages/AboutContactPage.jsx — Giới thiệu + Liên hệ
//
// Export 2 component từ 1 file vì chúng nhỏ và liên quan nhau
// Import trong App.jsx: import { AboutPage, ContactPage } from "..."
// ============================================================

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import BrandIcon from "../components/BrandIcon";

// Webhook n8n — nhận form liên hệ → gửi Telegram/email cho admin
const CONTACT_WEBHOOK = "https://say-hi-jimmy.app.n8n.cloud/webhook/contact";

// ── TRANG GIỚI THIỆU ─────────────────────────────────────────────────────────
export function AboutPage() {
  return (
    <div className="container py-5">
      <div className="row align-items-center g-5">

        {/* Nội dung text */}
        <div className="col-md-6">
          <h2 className="fw-bold mb-3 d-flex align-items-center gap-3">
            <BrandIcon size={40} />
            Về VLXD Đức Phiến
          </h2>
          <p className="text-muted">
            VLXD Đức Phiến là nền tảng thương mại điện tử chuyên cung cấp vật liệu xây dựng
            chất lượng cao, hàng chính hãng từ các thương hiệu uy tín trong và ngoài nước.
          </p>
          <p className="text-muted">
            Với hơn 15 năm kinh nghiệm, chúng tôi cam kết mang đến sản phẩm tốt nhất
            với mức giá cạnh tranh nhất thị trường.
          </p>

          {/* Điểm mạnh — dùng .map() để tránh lặp code */}
          <div className="row g-3 mt-2">
            {[
              { icon: "bi-trophy",  title: "Chất lượng đảm bảo", desc: "100% hàng chính hãng" },
              { icon: "bi-truck",   title: "Giao hàng nhanh",    desc: "Toàn quốc trong 2–5 ngày" },
              { icon: "bi-headset", title: "Hỗ trợ 24/7",        desc: "Tư vấn chuyên nghiệp" },
            ].map((item) => (
              <div className="col-12" key={item.title}>
                <div className="d-flex align-items-start gap-3">
                  <i className={`bi ${item.icon}`} style={{ fontSize: 28, color: "#0f4c81", flexShrink: 0 }}></i>
                  <div>
                    <h6 className="fw-bold mb-0">{item.title}</h6>
                    <small className="text-muted">{item.desc}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ảnh placeholder */}
        <div className="col-md-6 text-center">
          <div className="rounded-4 d-flex align-items-center justify-content-center"
            style={{ background: "#f1f5f9", height: 350 }}>
            <i className="bi bi-building" style={{ fontSize: 120, color: "#cbd5e1" }}></i>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TRANG LIÊN HỆ ────────────────────────────────────────────────────────────
export function ContactPage() {
  const { user } = useAuth(); // lấy thông tin user để prefill form

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading,  setLoading]  = useState(false);
  // feedback: thông báo sau khi gửi (thành công hoặc lỗi)
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  // Prefill tên, email, phone từ user đang đăng nhập
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name:  prev.name  || user.fullName || "",
      email: prev.email || user.email    || "",
      phone: prev.phone || user.phone    || "",
    }));
  }, [user]); // chạy lại khi user thay đổi

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (feedback.text) setFeedback({ type: "", text: "" }); // xóa feedback khi nhập lại
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate email nếu có nhập
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFeedback({ type: "danger", text: "Email không đúng định dạng." });
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setFeedback({ type: "danger", text: "Vui lòng điền họ tên, số điện thoại và nội dung." });
      return;
    }

    setLoading(true);
    setFeedback({ type: "", text: "" });
    try {
      // Gửi form đến n8n webhook
      const res = await fetch(CONTACT_WEBHOOK, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    form.name.trim(),
          email:   form.email.trim() || undefined, // không gửi nếu rỗng
          phone:   form.phone.replace(/\s+/g, ""),
          message: form.message.trim(),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFeedback({ type: "success", text: "Gửi thành công! Chúng tôi sẽ liên hệ lại sớm." });
      setForm((prev) => ({ ...prev, message: "" })); // xóa nội dung sau khi gửi
    } catch {
      setFeedback({ type: "danger", text: "Không gửi được. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-center mb-5">Liên hệ với chúng tôi</h2>

      <div className="row g-5 justify-content-center">

        {/* Thông tin liên hệ */}
        <div className="col-md-5">
          <h5 className="fw-bold mb-4">Thông tin liên hệ</h5>
          {[
            { icon: "bi-geo-alt",   label: "Địa chỉ",       value: "123 Nguyễn Văn Linh, Q7, TP.HCM" },
            { icon: "bi-telephone", label: "Điện thoại",     value: "0909 123 456" },
            { icon: "bi-envelope",  label: "Email",          value: "info@vlxshop.vn" },
            { icon: "bi-clock",     label: "Giờ làm việc",   value: "Thứ 2 – 7: 7:30 – 17:30" },
          ].map((c) => (
            <div className="d-flex align-items-start gap-3 mb-3" key={c.label}>
              <i className={`bi ${c.icon}`} style={{ fontSize: 22, color: "#0f4c81", flexShrink: 0 }}></i>
              <div>
                <small className="text-muted d-block">{c.label}</small>
                <span className="fw-bold">{c.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Form gửi tin nhắn */}
        <div className="col-md-5">
          <h5 className="fw-bold mb-4">Gửi tin nhắn</h5>

          {/* Thông báo kết quả */}
          {feedback.text && (
            <div className={`alert alert-${feedback.type === "success" ? "success" : "danger"} py-2`}>
              {feedback.text}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Họ và tên</label>
              <input name="name" className="form-control" placeholder="Nguyễn Văn A"
                value={form.name} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email (tuỳ chọn)</label>
              <input name="email" type="email" className="form-control" placeholder="email@example.com"
                value={form.email} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Số điện thoại</label>
              <input name="phone" type="tel" className="form-control" placeholder="0901234567"
                value={form.phone} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Nội dung</label>
              <textarea name="message" className="form-control" rows={4}
                placeholder="Nội dung tin nhắn..."
                value={form.message} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang gửi...</>
                : <><i className="bi bi-send me-2"></i>Gửi tin nhắn</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
