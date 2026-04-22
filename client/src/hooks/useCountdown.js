// ============================================================
// hooks/useCountdown.js — Hook đếm ngược thời gian
//
// Custom hook: hàm bắt đầu bằng "use", dùng được các hook React bên trong
// Tách logic đếm ngược ra khỏi component để dễ tái sử dụng
//
// Cách dùng:
//   const { minutes, seconds, total, isExpired } = useCountdown(order, onExpire)
// ============================================================

import { useState, useEffect } from "react";
import { secondsRemaining } from "../services/orderService";

/**
 * @param {object|null} order    - đơn hàng có trường expireAt
 * @param {function}    onExpire - gọi khi hết giờ (không bắt buộc)
 * @returns {{ minutes, seconds, total, isExpired }}
 */
export function useCountdown(order, onExpire) {
  // Khởi tạo state với số giây còn lại ngay từ đầu
  const [total, setTotal] = useState(() =>
    order ? secondsRemaining(order) : 0
  );

  useEffect(() => {
    if (!order) return;

    // Cập nhật ngay khi order thay đổi (không cần chờ 1 giây)
    setTotal(secondsRemaining(order));

    // setInterval: cứ 1000ms (1 giây) chạy hàm bên trong 1 lần
    const timerId = setInterval(() => {
      const remaining = secondsRemaining(order);
      setTotal(remaining);

      if (remaining <= 0) {
        clearInterval(timerId); // dừng đồng hồ
        onExpire?.();           // ?. = gọi nếu onExpire không phải undefined
      }
    }, 1000);

    // Cleanup function: React tự gọi khi component unmount hoặc order thay đổi
    // Mục đích: tránh memory leak (đồng hồ chạy ngầm khi không cần nữa)
    return () => clearInterval(timerId);

  }, [order?.expireAt]); // chỉ chạy lại khi expireAt thay đổi

  return {
    minutes:   Math.floor(total / 60), // phần nguyên của tổng/60
    seconds:   total % 60,             // phần dư
    total,                             // tổng giây còn lại
    isExpired: total <= 0,
  };
}
