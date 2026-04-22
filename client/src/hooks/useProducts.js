// ============================================================
// client/src/hooks/useProducts.js — Hook CRUD sản phẩm & danh mục
//
// Thay đổi so với phiên bản json-server:
//   - Thay fetch('/api/products') → api.products.create(data)
//   - Thay fetch('/api/categories') → api.categories.update(id, data)
//   - Logic phân quyền vẫn giữ nguyên (kiểm tra isAdmin trước)
// ============================================================

import { useState, useCallback } from 'react';
import { isAdmin } from '../context/AuthContext';
import api from '../services/api'; // ← dùng service layer

export function useProducts(user) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Kiểm tra quyền admin trước mỗi thao tác
  function checkAdmin() {
    if (!isAdmin(user)) {
      setError('Bạn không có quyền thực hiện.');
      return false;
    }
    return true;
  }

  // ── PRODUCTS ──────────────────────────────────────────────

  const addProduct = useCallback(async (data) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true); setError('');
    try {
      // api.products.create(data) → POST /api/products
      const res = await api.products.create(data);
      return { ok: true, data: res.data };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProduct = useCallback(async (id, data) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true); setError('');
    try {
      // api.products.update(id, data) → PUT /api/products/:id
      const res = await api.products.update(id, data);
      return { ok: true, data: res.data };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteProduct = useCallback(async (id) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true); setError('');
    try {
      // api.products.remove(id) → DELETE /api/products/:id
      await api.products.remove(id);
      return { ok: true };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── CATEGORIES ────────────────────────────────────────────

  const addCategory = useCallback(async (data) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true); setError('');
    try {
      const res = await api.categories.create(data);
      return { ok: true, data: res.data };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateCategory = useCallback(async (id, data) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true); setError('');
    try {
      const res = await api.categories.update(id, data);
      return { ok: true, data: res.data };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteCategory = useCallback(async (id) => {
    if (!checkAdmin()) return { ok: false };
    setLoading(true); setError('');
    try {
      await api.categories.remove(id);
      return { ok: true };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading, error,
    addProduct, updateProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
  };
}
