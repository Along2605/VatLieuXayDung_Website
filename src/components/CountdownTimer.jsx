// ============================================================
// components/CountdownTimer.jsx — Đồng hồ đếm ngược
//
// Hiển thị thời gian còn lại để thanh toán (định dạng MM:SS)
// Màu sắc thay đổi theo mức khẩn cấp:
//   Xanh lá  → còn nhiều thời gian (> 5 phút)
//   Vàng     → sắp hết (1–5 phút)
//   Đỏ       → gần hết / đã hết (< 1 phút)
//
// Props:
//   order    — đơn hàng (cần trường expireAt)
//   onExpire — hàm gọi khi hết giờ
// ============================================================

import { useCountdown } from "../hooks/useCountdown";

export default function CountdownTimer({ order, onExpire }) {
  // Lấy dữ liệu đếm ngược từ custom hook
  const { minutes, seconds, total, isExpired } = useCountdown(order, onExpire);

  // Xác định mức độ khẩn cấp
  const isUrgent  = total > 0 && total <= 60;   // dưới 1 phút
  const isWarning = total > 0 && total <= 300;  // dưới 5 phút

  // Chọn màu dựa trên mức độ
  const color =
    isExpired || isUrgent ? "#dc2626"  // đỏ
    : isWarning           ? "#d97706"  // vàng
    : "#16a34a";                       // xanh lá

  const bgColor =
    isExpired || isUrgent ? "#fef2f2"
    : isWarning           ? "#fffbeb"
    : "#f0fdf4";

  const borderColor =
    isExpired || isUrgent ? "#fca5a5"
    : isWarning           ? "#fcd34d"
    : "#86efac";

  // Thêm số 0 phía trước nếu < 10 (VD: 7 → "07")
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div
      className="text-center rounded-3 p-3"
      style={{ background: bgColor, border: `2px solid ${borderColor}`, transition: "all .5s" }}
    >
      {/* Tiêu đề */}
      <div className="small fw-semibold mb-1" style={{ color }}>
        <i className="bi bi-clock me-1"></i>
        {isExpired ? "Đơn hàng đã hết hạn" : "Thời gian còn lại để thanh toán"}
      </div>

      {/* Đồng hồ MM:SS */}
      {!isExpired && (
        <div
          className="fw-bold"
          style={{ fontSize: 42, color, letterSpacing: 2, lineHeight: 1 }}
        >
          {pad(minutes)}
          {/* Dấu : nhấp nháy mỗi giây */}
          <span style={{ animation: "blink 1s step-start infinite", display: "inline-block", marginInline: 2 }}>
            :
          </span>
          {pad(seconds)}
        </div>
      )}

      {/* Thông báo phụ */}
      <div className="small mt-1" style={{ color, opacity: 0.85 }}>
        {isExpired
          ? "Vui lòng đặt lại đơn hàng"
          : isUrgent
          ? "⚠️ Sắp hết hạn! Thanh toán ngay"
          : isWarning
          ? "Còn ít thời gian, hãy thanh toán sớm"
          : "Vui lòng hoàn tất trước khi hết hạn"
        }
      </div>

      {/* CSS animation cho dấu : nhấp nháy */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
