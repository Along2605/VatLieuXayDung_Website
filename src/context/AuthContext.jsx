// context/AuthContext.jsx
// Kiến thức: createContext, useState, useContext, localStorage, fetch API
import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

const API = "/api/users"; // proxy → json-server :3001/users

// ── Helpers ─────────────────────────────────────────────────
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  // Tối thiểu 6 ký tự, có chữ và số
  return password.length >= 6 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
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

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Khôi phục user từ localStorage khi load lại trang
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("vlxd_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── ĐĂNG KÝ ────────────────────────────────────────────────
  const register = async ({ fullName, email, phone, password, confirmPassword }) => {
    // Validation phía client
    if (!fullName.trim())
      return { ok: false, error: "Vui lòng nhập họ và tên." };

    if (!validateEmail(email))
      return { ok: false, error: "Email không đúng định dạng." };

    if (!validatePhone(phone))
      return { ok: false, error: "Số điện thoại không đúng định dạng (VD: 09xxxxxxxx)." };

    if (!validatePassword(password))
      return { ok: false, error: "Mật khẩu tối thiểu 6 ký tự, gồm cả chữ và số." };

    if (password !== confirmPassword)
      return { ok: false, error: "Mật khẩu xác nhận không khớp." };

    // Kiểm tra email đã tồn tại chưa
    const checkRes = await fetch(`${API}?email=${encodeURIComponent(email)}`);
    const existing = await checkRes.json();
    if (existing.length > 0)
      return { ok: false, error: "Email này đã được đăng ký." };

    const phoneNorm = normalizePhone(phone);
    const phoneRes = await fetch(`${API}?phone=${encodeURIComponent(phoneNorm)}`);
    const phoneTaken = await phoneRes.json();
    if (phoneTaken.length > 0)
      return { ok: false, error: "Số điện thoại này đã được đăng ký." };

    // Lưu user mới vào json-server
    const newUser = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phoneNorm,
      password, // Thực tế nên hash — ở đây để đơn giản cho học tập
      createdAt: new Date().toISOString(),
    };

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!res.ok)
      return { ok: false, error: "Lỗi server, vui lòng thử lại." };

    return { ok: true };
  };

  // ── ĐĂNG NHẬP ──────────────────────────────────────────────
  const login = async ({ email, password }) => {
    if (!email.trim())
      return { ok: false, error: "Vui lòng nhập email." };

    if (!password)
      return { ok: false, error: "Vui lòng nhập mật khẩu." };

    if (!validateEmail(email))
      return { ok: false, error: "Email không đúng định dạng." };

    // Tìm user theo email
    const res = await fetch(`${API}?email=${encodeURIComponent(email.toLowerCase().trim())}`);
    const users = await res.json();

    if (users.length === 0)
      return { ok: false, error: "Email chưa được đăng ký." };

    const found = users[0];

    if (found.password !== password)
      return { ok: false, error: "Mật khẩu không đúng." };

    // Lưu vào state & localStorage (không lưu password)
    const sessionUser = {
      id: found.id,
      fullName: found.fullName,
      email: found.email,
      phone: found.phone || "",
    };

    setUser(sessionUser);
    localStorage.setItem("vlxd_user", JSON.stringify(sessionUser));

    return { ok: true };
  };

  // ── ĐĂNG XUẤT ──────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem("vlxd_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Custom hook ──────────────────────────────────────────────
export function useAuth() {
  return useContext(AuthContext);
}
