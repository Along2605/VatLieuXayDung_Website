// hooks/useFetch.js
// Custom hook — fetch dữ liệu từ thư mục public/data/
// Kiến thức: useState, useEffect, fetch API

import { useState, useEffect } from "react";

/**
 * useFetch — tải dữ liệu JSON từ một URL
 *
 * @param {string} url - đường dẫn đến file JSON (vd: "/data/products.json")
 * @returns {{ data, loading, error }}
 *
 * Cách dùng:
 *   const { data, loading, error } = useFetch("/data/products.json");
 */
export function useFetch(url) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    // Reset state mỗi khi url thay đổi
    setLoading(true);
    setError(null);
    setData(null);

    // AbortController để hủy fetch nếu component unmount
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // bỏ qua khi unmount
        setError(err.message);
        setLoading(false);
      });

    // Cleanup: hủy fetch khi component unmount hoặc url thay đổi
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}
