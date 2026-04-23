// hooks/useCountdown.js
import { useState, useEffect, useRef } from "react";
import { secondsRemaining } from "../services/orderService";

/**
 * useCountdown — đếm ngược đến thời điểm hết hạn của đơn hàng
 *
 * @param {object|null} order    - đơn hàng (có trường expireAt)
 * @param {function}    onExpire - callback khi hết giờ
 * @returns {{ minutes, seconds, total, isExpired }}
 *
 * ── Các lỗi đã fix ────────────────────────────────────────────────────────
 * Bug cũ 1: onExpire được truyền vào dependency array [order?.expireAt]
 *   nhưng WaitingPaymentPage tạo handleExpire mới mỗi lần render
 *   → useEffect chạy lại liên tục → timer bị reset → countdown giật/sai
 *   Fix: dùng useRef lưu onExpire, không cho vào dependency
 *
 * Bug cũ 2: khi order prop thay đổi (polling cập nhật), nếu expireAt string
 *   format khác (MySQL vs ISO) → secondsRemaining() trả về âm → total = 0
 *   → isExpired = true ngay lập tức
 *   Fix: luôn dùng expireAt từ localStorage gốc (ISO string chuẩn)
 *        không tin expireAt từ server polling (có thể bị lỗi timezone)
 */
export function useCountdown(order, onExpire) {
  // Dùng useRef để lưu callback mà không trigger re-run useEffect
  // (onExpire là function mới mỗi render → không được đặt vào dependency)
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  // Tính số giây ban đầu — chỉ tính 1 lần khi mount
  const [total, setTotal] = useState(() =>
    order ? secondsRemaining(order) : 0
  );

  useEffect(() => {
    if (!order?.expireAt) return;

    // Cập nhật ngay khi hook mount (tránh bị lệch 1 giây)
    const initial = secondsRemaining(order);
    setTotal(initial);

    // Nếu ngay từ đầu đã hết hạn → gọi callback và dừng
    if (initial <= 0) {
      onExpireRef.current?.();
      return;
    }

    // Tạo interval đếm ngược mỗi giây
    const timer = setInterval(() => {
      // Tính lại từ expireAt thật mỗi tick
      // (không dùng total - 1 vì có thể bị drift nếu tab bị ẩn)
      const remaining = secondsRemaining(order);
      setTotal(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onExpireRef.current?.(); // gọi qua ref, không qua closure cũ
      }
    }, 1000);

    // Cleanup: dừng timer khi component unmount hoặc expireAt thay đổi
    return () => clearInterval(timer);

    // Chỉ phụ thuộc vào expireAt — KHÔNG phụ thuộc onExpire
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.expireAt]);

  return {
    minutes:   Math.floor(total / 60),
    seconds:   total % 60,
    total,
    isExpired: total <= 0,
  };
}
