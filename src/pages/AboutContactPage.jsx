// pages/AboutContactPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/** Webhook n8n — nhận JSON { name, email?, phone, message } */
const CONTACT_WEBHOOK = "https://say-hi-jimmy.app.n8n.cloud/webhook/contact";

export function AboutPage() {
  return (
    <div className="container py-5">
      <div className="row align-items-center g-5">
        <div className="col-md-6">
          <h2 className="fw-bold mb-3">Về VLXD Đức Phiến</h2>
          <p className="text-muted">
            VLXD Đức Phiến là nền tảng thương mại điện tử chuyên cung cấp vật
            liệu xây dựng chất lượng cao, hàng chính hãng từ các thương hiệu uy
            tín trong và ngoài nước.
          </p>
          <p className="text-muted">
            Với hơn 15 năm kinh nghiệm trong ngành, chúng tôi cam kết mang đến
            sản phẩm tốt nhất với mức giá cạnh tranh nhất thị trường.
          </p>
          <div className="row g-3 mt-2">
            {[
              {
                icon: "bi-trophy",
                title: "Chất lượng đảm bảo",
                desc: "100% hàng chính hãng",
              },
              {
                icon: "bi-truck",
                title: "Giao hàng nhanh",
                desc: "Toàn quốc trong 2–5 ngày",
              },
              {
                icon: "bi-headset",
                title: "Hỗ trợ 24/7",
                desc: "Đội ngũ tư vấn chuyên nghiệp",
              },
            ].map((item, i) => (
              <div className="col-12" key={i}>
                <div className="d-flex align-items-start gap-3">
                  <i
                    className={`bi ${item.icon}`}
                    style={{ fontSize: 28, color: "#0f4c81", flexShrink: 0 }}
                  ></i>
                  <div>
                    <h6 className="fw-bold mb-0">{item.title}</h6>
                    <small className="text-muted">{item.desc}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <div
            className="rounded-4 d-flex align-items-center justify-content-center"
            style={{ background: "#f1f5f9", height: 350 }}
          >
            <i
              className="bi bi-building"
              style={{ fontSize: 120, color: "#cbd5e1" }}
            ></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.fullName || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (feedback.text) setFeedback({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailTrim = form.email.trim();
    if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setFeedback({ type: "danger", text: "Email không đúng định dạng." });
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setFeedback({
        type: "danger",
        text: "Vui lòng điền họ tên, số điện thoại và nội dung tin nhắn.",
      });
      return;
    }

    setLoading(true);
    setFeedback({ type: "", text: "" });
    try {
      const res = await fetch(CONTACT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: emailTrim || undefined,
          phone: form.phone.replace(/\s+/g, ""),
          message: form.message.trim(),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFeedback({
        type: "success",
        text: "Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại sớm.",
      });
      setForm((prev) => ({ ...prev, message: "" }));
    } catch {
      setFeedback({
        type: "danger",
        text: "Không gửi được tin nhắn. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-center mb-5">Liên hệ với chúng tôi</h2>
      <div className="row g-5 justify-content-center">
        <div className="col-md-5">
          <h5 className="fw-bold mb-4">Thông tin liên hệ</h5>
          {[
            {
              icon: "bi-geo-alt",
              label: "Địa chỉ",
              value: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
            },
            {
              icon: "bi-telephone",
              label: "Điện thoại",
              value: "0909 123 456",
            },
            { icon: "bi-envelope", label: "Email", value: "info@vlxshop.vn" },
            {
              icon: "bi-clock",
              label: "Giờ làm việc",
              value: "Thứ 2 – Thứ 7: 7:30 – 17:30",
            },
          ].map((c, i) => (
            <div className="d-flex align-items-start gap-3 mb-3" key={i}>
              <i
                className={`bi ${c.icon}`}
                style={{ fontSize: 22, color: "#0f4c81", flexShrink: 0 }}
              ></i>
              <div>
                <small className="text-muted d-block">{c.label}</small>
                <span className="fw-bold">{c.value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="col-md-5">
          <h5 className="fw-bold mb-4">Gửi tin nhắn</h5>
          {feedback.text ? (
            <div
              className={`alert alert-${feedback.type === "success" ? "success" : "danger"} py-2`}
              role="alert"
            >
              {feedback.text}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Họ và tên</label>
              <input
                name="name"
                className="form-control"
                placeholder="Họ và tên"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Email (tuỳ chọn)
              </label>
              <input
                name="email"
                type="email"
                className="form-control"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Số điện thoại
              </label>
              <input
                name="phone"
                type="tel"
                className="form-control"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Nội dung</label>
              <textarea
                name="message"
                className="form-control"
                rows={4}
                placeholder="Nội dung tin nhắn..."
                value={form.message}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Đang gửi...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>Gửi tin nhắn
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
