// context/AuthContext.jsx
// Kiến thức: createContext, useState, useContext, localStorage, fetch API
// Mở rộng: role-based authorization (admin / customer / isRoot)
import { createContext, useState, useContext } from "react";

const AuthContext = createContext();
const API = "/api/users";

// ── Helpers validate ────────────────────────────────────────
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(pw) {
  return pw.length >= 6 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);
}
function validatePhone(phone) {
  const s = String(phone).replace(/\s+/g, "");
  if (!s) return false;
  return /^(\+84|84|0)(3|5|7|8|9)\d{8}$/.test(s);
}
function normalizePhone(phone) {
  let s = String(phone).replace(/\s+/g, "");
  if (s.startsWith("+84")) s = "0" + s.slice(3);
  else if (s.startsWith("84")) s = "0" + s.slice(2);
  return s;
}

// ── Helper phân quyền (export để dùng ngoài component) ──────

/** Lấy user hiện tại từ localStorage */
export function getCurrentUser() {
  try {
    const saved = localStorage.getItem("vlxd_user");
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

/** Kiểm tra có phải admin không (kể cả root) */
export function isAdmin(user) {
  return user?.role === "admin";
}

/** Kiểm tra có phải root admin không */
export function isRootAdmin(user) {
  return user?.role === "admin" && user?.isRoot === true;
}

// ── Provider ────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("vlxd_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Lưu session (không lưu password)
  function saveSession(found) {
    const sessionUser = {
      id:       found.id,
      fullName: found.fullName,
      email:    found.email,
      phone:    found.phone || "",
      role:     found.role  || "customer",
      isRoot:   found.isRoot || false,
    };
    setUser(sessionUser);
    localStorage.setItem("vlxd_user", JSON.stringify(sessionUser));
    return sessionUser;
  }

  // ── ĐĂNG KÝ ─────────────────────────────────────────────
  const register = async ({ fullName, email, phone, password, confirmPassword }) => {
    if (!fullName.trim()) return { ok: false, error: "Vui lòng nhập họ và tên." };
    if (!validateEmail(email)) return { ok: false, error: "Email không đúng định dạng." };
    if (!validatePhone(phone)) return { ok: false, error: "Số điện thoại không đúng định dạng (VD: 09xxxxxxxx)." };
    if (!validatePassword(password)) return { ok: false, error: "Mật khẩu tối thiểu 6 ký tự, gồm cả chữ và số." };
    if (password !== confirmPassword) return { ok: false, error: "Mật khẩu xác nhận không khớp." };

    const checkRes   = await fetch(`${API}?email=${encodeURIComponent(email)}`);
    const existing   = await checkRes.json();
    if (existing.length > 0) return { ok: false, error: "Email này đã được đăng ký." };

    const phoneNorm  = normalizePhone(phone);
    const phoneRes   = await fetch(`${API}?phone=${encodeURIComponent(phoneNorm)}`);
    const phoneTaken = await phoneRes.json();
    if (phoneTaken.length > 0) return { ok: false, error: "Số điện thoại này đã được đăng ký." };

    // User mới luôn là "customer"
    const newUser = {
      fullName:  fullName.trim(),
      email:     email.toLowerCase().trim(),
      phone:     phoneNorm,
      password,
      role:      "customer",
      isRoot:    false,
      createdAt: new Date().toISOString(),
    };

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (!res.ok) return { ok: false, error: "Lỗi server, vui lòng thử lại." };
    return { ok: true };
  };

  // ── ĐĂNG NHẬP ───────────────────────────────────────────
  const login = async ({ email, password }) => {
    if (!email.trim()) return { ok: false, error: "Vui lòng nhập email." };
    if (!password) return { ok: false, error: "Vui lòng nhập mật khẩu." };
    if (!validateEmail(email)) return { ok: false, error: "Email không đúng định dạng." };

    const res   = await fetch(`${API}?email=${encodeURIComponent(email.toLowerCase().trim())}`);
    const users = await res.json();

    if (users.length === 0) return { ok: false, error: "Email chưa được đăng ký." };
    const found = users[0];
    if (found.password !== password) return { ok: false, error: "Mật khẩu không đúng." };

    saveSession(found); // lưu role + isRoot vào session
    return { ok: true };
  };

  // ── ĐĂNG XUẤT ───────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem("vlxd_user");
  };

  // ── CẤP QUYỀN ADMIN ─────────────────────────────────────
  /**
   * Admin cấp quyền admin cho một customer.
   * Quy tắc: người gọi phải là admin.
   */
  const grantAdmin = async (targetUserId) => {
    if (!isAdmin(user))
      return { ok: false, error: "Bạn không có quyền thực hiện thao tác này." };

    const res    = await fetch(`${API}/${targetUserId}`);
    const target = await res.json();
    if (!target?.id) return { ok: false, error: "Không tìm thấy user." };
    if (target.role === "admin") return { ok: false, error: "User này đã là admin." };

    const patch = await fetch(`${API}/${targetUserId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ role: "admin", isRoot: false }),
    });
    if (!patch.ok) return { ok: false, error: "Lỗi server khi cập nhật quyền." };
    return { ok: true };
  };

  // ── THU HỒI QUYỀN ADMIN ─────────────────────────────────
  /**
   * Root admin thu hồi quyền admin.
   * Quy tắc bảo vệ:
   *   - Chỉ root admin được thu hồi
   *   - Không thu hồi root admin khác
   *   - Không tự thu hồi bản thân
   */
  const revokeAdmin = async (targetUserId) => {
    if (!isRootAdmin(user))
      return { ok: false, error: "Chỉ Root Admin mới có thể thu hồi quyền." };
    if (targetUserId === user.id)
      return { ok: false, error: "Bạn không thể thu hồi quyền của chính mình." };

    const res    = await fetch(`${API}/${targetUserId}`);
    const target = await res.json();
    if (!target?.id) return { ok: false, error: "Không tìm thấy user." };
    if (target.isRoot) return { ok: false, error: "Không thể thu hồi quyền Root Admin." };
    if (target.role !== "admin") return { ok: false, error: "User này không phải admin." };

    const patch = await fetch(`${API}/${targetUserId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ role: "customer" }),
    });
    if (!patch.ok) return { ok: false, error: "Lỗi server khi thu hồi quyền." };
    return { ok: true };
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      grantAdmin,
      revokeAdmin,
      // Shorthand tiện dùng trong JSX
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
