// ============================================================
// hooks/useProducts.js — Hook CRUD sản phẩm & danh mục
//
// Tách toàn bộ logic gọi API ra khỏi AdminProductsPage
// để trang đó chỉ lo phần giao diện.
//
// Mỗi hàm đều kiểm tra quyền admin TRƯỚC khi gọi API
// → bảo vệ ở tầng logic (không chỉ ẩn nút trên UI)
//
// Cách dùng:
//   const { addProduct, updateProduct, deleteProduct } = useProducts(user)
// ============================================================

import { useState, useCallback } from "react";
import { isAdmin } from "../context/AuthContext";

// Endpoint json-server (proxy qua vite.config.js)
const PRODUCTS_API   = "/api/products";
const CATEGORIES_API = "/api/categories";

export function useProducts(user) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Kiểm tra quyền — dùng nội bộ trước mỗi thao tác
  function checkAdmin() {
    if (!isAdmin(user)) {
      setError("Bạn không có quyền thực hiện.");
      return false;
    }
    return true;
  }

  // ── PRODUCT: THÊM ────────────────────────────────────────────────────────

  // useCallback: tránh tạo lại hàm mỗi lần re-render (tối ưu nhỏ)
  const addProduct = useCallback(async (data) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true);
    setError("");
    try {
      const res = await fetch(PRODUCTS_API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...data, createdAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("Lỗi server khi thêm sản phẩm");
      return { ok: true, data: await res.json() };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false); // luôn chạy dù thành công hay lỗi
    }
  }, [user]);

  // ── PRODUCT: SỬA ─────────────────────────────────────────────────────────

  const updateProduct = useCallback(async (productId, updates) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true);
    setError("");
    try {
      // PATCH: chỉ cập nhật các trường được gửi (khác PUT là ghi đè toàn bộ)
      const res = await fetch(`${PRODUCTS_API}/${productId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Lỗi server khi sửa sản phẩm");
      return { ok: true, data: await res.json() };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── PRODUCT: XÓA ─────────────────────────────────────────────────────────

  const deleteProduct = useCallback(async (productId) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${PRODUCTS_API}/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Lỗi server khi xóa sản phẩm");
      return { ok: true };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── CATEGORY: THÊM ───────────────────────────────────────────────────────

  const addCategory = useCallback(async (data) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true);
    setError("");
    try {
      const res = await fetch(CATEGORIES_API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Lỗi server khi thêm danh mục");
      return { ok: true, data: await res.json() };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── CATEGORY: SỬA ────────────────────────────────────────────────────────

  const updateCategory = useCallback(async (catId, updates) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CATEGORIES_API}/${catId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Lỗi server khi sửa danh mục");
      return { ok: true, data: await res.json() };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── CATEGORY: XÓA ────────────────────────────────────────────────────────

  const deleteCategory = useCallback(async (catId) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CATEGORIES_API}/${catId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Lỗi server khi xóa danh mục");
      return { ok: true };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    // Products
    addProduct,
    updateProduct,
    deleteProduct,
    // Categories
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
