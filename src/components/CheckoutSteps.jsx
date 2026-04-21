// ============================================================
// components/CheckoutSteps.jsx — Thanh tiến trình mua hàng
//
// Hiển thị 4 bước: Giỏ hàng → Đặt hàng → Chờ TT → Hoàn tất
// Nhận prop "current" (1-4) để biết đang ở bước nào
//
// Bước đã qua (id < current) → màu xanh lá + dấu ✓
// Bước hiện tại (id = current) → màu xanh dương
// Bước chưa tới (id > current) → màu xám
// ============================================================

export default function CheckoutSteps({ current }) {
  // Định nghĩa 4 bước
  const steps = [
    { id: 1, label: "Giỏ hàng",        icon: "bi-cart3" },
    { id: 2, label: "Đặt hàng",        icon: "bi-credit-card" },
    { id: 3, label: "Chờ thanh toán",  icon: "bi-hourglass-split" },
    { id: 4, label: "Hoàn tất",        icon: "bi-check-circle" },
  ];

  return (
    <div className="d-flex align-items-center justify-content-center mb-4">
      {steps.map((step, idx) => {
        const done    = step.id < current;  // bước đã qua
        const active  = step.id === current; // bước hiện tại

        // Màu vòng tròn
        const circleColor = done ? "#16a34a" : active ? "#2563eb" : "#cbd5e1";
        // Màu chữ label
        const labelColor  = done ? "#16a34a" : active ? "#1e293b" : "#94a3b8";

        return (
          <div key={step.id} className="d-flex align-items-center">

            {/* Vòng tròn + icon */}
            <div className="d-flex flex-column align-items-center" style={{ minWidth: 72 }}>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle mb-1"
                style={{ width: 40, height: 40, background: circleColor, transition: "background .3s" }}
              >
                {done
                  // Bước đã qua → hiện dấu ✓
                  ? <i className="bi bi-check-lg"    style={{ color: "#fff", fontSize: 18 }}></i>
                  // Bước chưa qua → hiện icon của bước
                  : <i className={`bi ${step.icon}`} style={{ color: "#fff", fontSize: 16 }}></i>
                }
              </div>
              <span className="fw-semibold" style={{ fontSize: 12, color: labelColor }}>
                {step.label}
              </span>
            </div>

            {/* Đường kẻ nối giữa các bước (không hiện sau bước cuối) */}
            {idx < steps.length - 1 && (
              <div style={{
                height: 3, width: 60, marginBottom: 20, flexShrink: 0,
                background: done ? "#16a34a" : "#e2e8f0", // xanh nếu đã qua
                transition: "background .3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
