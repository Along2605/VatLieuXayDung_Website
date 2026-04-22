// ============================================================
// client/src/context/AuthContext.jsx
//
// Thay đổi so với phiên bản json-server:
//   - Không còn gọi fetch('/api/users?email=...')
//   - Thay bằng api.auth.login() và api.auth.register()
//   - grantAdmin/revokeAdmin gọi api.users.grantAdmin/revokeAdmin
//   - Validate vẫn giữ nguyên ở frontend (UX tốt hơn)
//
// Luồng đăng nhập:
//   user nhập form → validate → api.auth.login() → server kiểm tra DB
//   → server trả { user } → lưu vào state + localStorage → redirect
// ============================================================

import { createContext, useState, useContext } from 'react';
import api from '../services/api'; // ← thay thế fetch trực tiếp

const AuthContext = createContext();

// ── Helpers validate (giữ ở frontend để báo lỗi nhanh, không cần chờ server) ─
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(pw) {
  return pw.length >= 6 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);
}
function validatePhone(phone) {
  const s = String(phone).replace(/\s+/g, '');
  return /^(\+84|84|0)(3|5|7|8|9)\d{8}$/.test(s);
}
function normalizePhone(phone) {
  let s = String(phone).replace(/\s+/g, '');
  if (s.startsWith('+84')) s = '0' + s.slice(3);
  else if (s.startsWith('84')) s = '0' + s.slice(2);
  return s;
}

// ── Helpers phân quyền (export để AdminRoute, useProducts dùng) ───────────────
export function getCurrentUser() {
  try {
    const saved = localStorage.getItem('vlxd_user');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}
export function isAdmin(user)     { return user?.role === 'admin'; }
export function isRootAdmin(user) { return user?.role === 'admin' && user?.is_root === true; }

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vlxd_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Lưu session (không lưu password)
  function saveSession(userData) {
    setUser(userData);
    localStorage.setItem('vlxd_user', JSON.stringify(userData));
  }

  // ── ĐĂNG KÝ ──────────────────────────────────────────────────────────────
  const register = async ({ fullName, email, phone, password, confirmPassword }) => {
    // Validate ở frontend trước
    if (!fullName.trim())       return { ok: false, error: 'Vui lòng nhập họ và tên.' };
    if (!validateEmail(email))  return { ok: false, error: 'Email không đúng định dạng.' };
    if (!validatePhone(phone))  return { ok: false, error: 'Số điện thoại không đúng (VD: 0901234567).' };
    if (!validatePassword(password)) return { ok: false, error: 'Mật khẩu tối thiểu 6 ký tự, có cả chữ và số.' };
    if (password !== confirmPassword) return { ok: false, error: 'Mật khẩu xác nhận không khớp.' };

    try {
      // Gọi API backend — backend sẽ kiểm tra email/phone trùng trong DB
      await api.auth.register({
        fullName: fullName.trim(),
        email:    email.toLowerCase().trim(),
        phone:    normalizePhone(phone),
        password,
      });
      return { ok: true };
    } catch (err) {
      // err.message đã được chuẩn hóa bởi interceptor trong api.js
      return { ok: false, error: err.message };
    }
  };

  // ── ĐĂNG NHẬP ────────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    if (!email.trim())         return { ok: false, error: 'Vui lòng nhập email.' };
    if (!password)             return { ok: false, error: 'Vui lòng nhập mật khẩu.' };
    if (!validateEmail(email)) return { ok: false, error: 'Email không đúng định dạng.' };

    try {
      // POST /api/auth/login → server trả { message, user }
      const res = await api.auth.login({ email: email.toLowerCase().trim(), password });

      // res.data là body response từ server
      // Backend đã loại bỏ password, trả về: { id, full_name, email, role, is_root, ... }
      saveSession(res.data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  // ── ĐĂNG XUẤT ────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem('vlxd_user');
  };

  // ── CẤP QUYỀN ADMIN ──────────────────────────────────────────────────────
  const grantAdmin = async (targetUserId) => {
    if (!isAdmin(user)) return { ok: false, error: 'Bạn không có quyền.' };
    try {
      await api.users.grantAdmin(targetUserId); // PATCH /api/users/:id/grant
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  // ── THU HỒI QUYỀN ADMIN ──────────────────────────────────────────────────
  const revokeAdmin = async (targetUserId) => {
    if (!isRootAdmin(user)) return { ok: false, error: 'Chỉ Root Admin mới được thu hồi.' };
    if (targetUserId === user.id) return { ok: false, error: 'Không thể thu hồi của chính mình.' };
    try {
      await api.users.revokeAdmin(targetUserId); // PATCH /api/users/:id/revoke
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      grantAdmin,
      revokeAdmin,
      isAdminUser:     isAdmin(user),
      isRootAdminUser: isRootAdmin(user),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
