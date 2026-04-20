// hooks/useCountdown.js
// Kiến thức: custom hook, useState, useEffect, setInterval, cleanup
import { useState, useEffect } from "react";
import { secondsRemaining } from "../services/orderService";

/**
 * useCountdown — đếm ngược đến thời điểm hết hạn của đơn hàng
 *
 * @param {object|null} order - đơn hàng (có trường expireAt)
 * @param {function}    onExpire - callback khi hết giờ
 * @returns {{ minutes, seconds, total, isExpired }}
 */
export function useCountdown(order, onExpire) {
  const [total, setTotal] = useState(() =>
    order ? secondsRemaining(order) : 0
  );

  useEffect(() => {
    if (!order) return;

    // Cập nhật ngay lập tức khi order thay đổi
    setTotal(secondsRemaining(order));

    const timer = setInterval(() => {
      const remaining = secondsRemaining(order);
      setTotal(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    // Cleanup khi unmount hoặc order đổi
    return () => clearInterval(timer);
  }, [order?.expireAt]); // chỉ re-run khi expireAt thay đổi

  const minutes    = Math.floor(total / 60);
  const seconds    = total % 60;
  const isExpired  = total <= 0;

  return { minutes, seconds, total, isExpired };
}
