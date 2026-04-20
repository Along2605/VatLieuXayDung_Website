// components/CountdownTimer.jsx
// Kiến thức: props, conditional styling, component tái sử dụng
import { useCountdown } from "../hooks/useCountdown";

/**
 * CountdownTimer — hiển thị đồng hồ đếm ngược đến hết hạn đơn hàng
 *
 * @param {object}   order     - đơn hàng có trường expireAt
 * @param {function} onExpire  - callback khi hết giờ
 */
export default function CountdownTimer({ order, onExpire }) {
  const { minutes, seconds, total, isExpired } = useCountdown(order, onExpire);

  // Màu thay đổi theo thời gian còn lại
  const isUrgent   = total <= 60;   // dưới 1 phút → đỏ
  const isWarning  = total <= 300;  // dưới 5 phút → vàng

  const bgColor = isExpired || isUrgent
    ? "#fef2f2"
    : isWarning
    ? "#fffbeb"
    : "#f0fdf4";

  const borderColor = isExpired || isUrgent
    ? "#fca5a5"
    : isWarning
    ? "#fcd34d"
    : "#86efac";

  const textColor = isExpired || isUrgent
    ? "#dc2626"
    : isWarning
    ? "#d97706"
    : "#16a34a";

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div
      className="text-center rounded-3 p-3"
      style={{
        background:   bgColor,
        border:       `2px solid ${borderColor}`,
        transition:   "all .5s",
      }}
    >
      <div className="small fw-semibold mb-1" style={{ color: textColor }}>
        <i className="bi bi-clock me-1"></i>
        {isExpired ? "Đơn hàng đã hết hạn" : "Thời gian còn lại để thanh toán"}
      </div>

      {!isExpired && (
        <div
          className="fw-bold"
          style={{
            fontSize:       42,
            color:          textColor,
            fontVariantNumeric: "tabular-nums",
            letterSpacing:  2,
            lineHeight:     1,
          }}
        >
          {pad(minutes)}
          <span
            style={{
              animation: "blink 1s step-start infinite",
              display: "inline-block",
              marginInline: 2,
            }}
          >:</span>
          {pad(seconds)}
        </div>
      )}

      <div className="small mt-1" style={{ color: textColor, opacity: 0.8 }}>
        {isExpired
          ? "Vui lòng đặt lại đơn hàng"
          : isUrgent
          ? "⚠️ Sắp hết hạn! Vui lòng thanh toán ngay"
          : isWarning
          ? "Còn ít thời gian, hãy thanh toán sớm"
          : "Vui lòng hoàn tất thanh toán trước khi hết hạn"
        }
      </div>

      {/* CSS animation cho dấu hai chấm nhấp nháy */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
