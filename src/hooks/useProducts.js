// hooks/useProducts.js
// Kiến thức: custom hook, useState, useCallback, fetch API, isAdmin
// Tách biệt logic CRUD sản phẩm & category ra khỏi component.
// Mọi thao tác thêm/sửa/xóa đều kiểm tra quyền admin trước.

import { useState, useCallback } from "react";
import { isAdmin } from "../context/AuthContext";

const PRODUCTS_API  = "/api/products";
const CATEGORIES_API = "/api/categories";

export function useProducts(user) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // ── Kiểm tra quyền (dùng nội bộ) ────────────────────────────────────────
  function checkAdmin() {
    if (!isAdmin(user)) {
      const msg = "Bạn không có quyền thực hiện thao tác này.";
      setError(msg);
      return false;
    }
    return true;
  }

  // ── PRODUCT: THÊM ────────────────────────────────────────────────────────
  /**
   * Thêm sản phẩm mới.
   * @param {object} productData - dữ liệu sản phẩm (name, price, category, ...)
   */
  const addProduct = useCallback(async (productData) => {
    if (!checkAdmin()) return { ok: false, error: "Không có quyền." };
    setLoading(true);
    setError("");
    try {
      const res = await fetch(PRODUCTS_API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...productData, createdAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("Lỗi server");
      const created = await res.json();
      return { ok: true, data: created };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── PRODUCT: SỬA ────────────────────────────────────────────────────────
  /**
   * Cập nhật sản phẩm.
   * @param {number} productId
   * @param {object} updates - các trường cần cập nhật
   */
  const updateProduct = useCallback(async (productId, updates) => {
    if (!checkAdmin()) return { ok: false, error: "Không có quyền." };
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${PRODUCTS_API}/${productId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Lỗi server");
      const updated = await res.json();
      return { ok: true, data: updated };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── PRODUCT: XÓA ────────────────────────────────────────────────────────
  /**
   * Xóa sản phẩm.
   * @param {number} productId
   */
  const deleteProduct = useCallback(async (productId) => {
    if (!checkAdmin()) return { ok: false, error: "Không có quyền." };
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${PRODUCTS_API}/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Lỗi server");
      return { ok: true };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── CATEGORY: THÊM ──────────────────────────────────────────────────────
  const addCategory = useCallback(async (categoryData) => {
    if (!checkAdmin()) return { ok: false, error: "Không có quyền." };
    setLoading(true);
    setError("");
    try {
      const res = await fetch(CATEGORIES_API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(categoryData),
      });
      if (!res.ok) throw new Error("Lỗi server");
      const created = await res.json();
      return { ok: true, data: created };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── CATEGORY: SỬA ──────────────────────────────────────────────────────
  const updateCategory = useCallback(async (categoryId, updates) => {
    if (!checkAdmin()) return { ok: false, error: "Không có quyền." };
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CATEGORIES_API}/${categoryId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Lỗi server");
      const updated = await res.json();
      return { ok: true, data: updated };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── CATEGORY: XÓA ──────────────────────────────────────────────────────
  const deleteCategory = useCallback(async (categoryId) => {
    if (!checkAdmin()) return { ok: false, error: "Không có quyền." };
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${CATEGORIES_API}/${categoryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Lỗi server");
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
