// components/CheckoutSteps.jsx
// Kiến thức: props, conditional styling, reusable component

/**
 * Thanh tiến trình mua hàng: Giỏ hàng → Thanh toán → Hoàn tất
 *
 * @param {number} current - bước hiện tại: 1 = Giỏ hàng, 2 = Đặt hàng, 3 = Chờ thanh toán, 4 = Hoàn tất
 */
export default function CheckoutSteps({ current }) {
  const steps = [
    { id: 1, label: "Giỏ hàng",       icon: "bi-cart3" },
    { id: 2, label: "Đặt hàng",       icon: "bi-credit-card" },
    { id: 3, label: "Chờ thanh toán", icon: "bi-hourglass-split" },
    { id: 4, label: "Hoàn tất",       icon: "bi-check-circle" },
  ];

  return (
    <div className="d-flex align-items-center justify-content-center mb-4 gap-0">
      {steps.map((step, idx) => {
        const done    = step.id < current;
        const active  = step.id === current;
        const pending = step.id > current;

        const circleColor = done
          ? "#16a34a"
          : active
          ? "#2563eb"
          : "#cbd5e1";

        const labelColor = done
          ? "#16a34a"
          : active
          ? "#1e293b"
          : "#94a3b8";

        return (
          <div key={step.id} className="d-flex align-items-center">
            {/* Bước */}
            <div className="d-flex flex-column align-items-center" style={{ minWidth: 72 }}>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle mb-1"
                style={{
                  width: 40,
                  height: 40,
                  background: circleColor,
                  transition: "background .3s",
                }}
              >
                {done ? (
                  <i className="bi bi-check-lg" style={{ color: "#fff", fontSize: 18 }}></i>
                ) : (
                  <i className={`bi ${step.icon}`} style={{ color: "#fff", fontSize: 16 }}></i>
                )}
              </div>
              <span
                className="fw-semibold"
                style={{ fontSize: 12, color: labelColor, transition: "color .3s" }}
              >
                {step.label}
              </span>
            </div>

            {/* Đường nối (bỏ qua sau bước cuối) */}
            {idx < steps.length - 1 && (
              <div
                style={{
                  height: 3,
                  width: 60,
                  marginBottom: 20,
                  background: done ? "#16a34a" : "#e2e8f0",
                  transition: "background .3s",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
