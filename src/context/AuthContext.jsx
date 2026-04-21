// ============================================================
// context/AuthContext.jsx — Quản lý xác thực và phân quyền
//
// Context là cách React chia sẻ dữ liệu cho mọi component con
// mà không cần truyền props qua từng tầng.
//
// File này cung cấp:
//   - user: thông tin người dùng đang đăng nhập (hoặc null)
//   - login(form): đăng nhập
//   - register(form): đăng ký
//   - logout(): đăng xuất
//   - grantAdmin(id): cấp quyền admin
//   - revokeAdmin(id): thu hồi quyền admin
//
// Phân quyền:
//   - "customer": chỉ mua hàng
//   - "admin": quản lý sản phẩm, category, cấp quyền
//   - "admin" + isRoot: thu hồi quyền admin của người khác
// ============================================================

import { createContext, useState, useContext } from "react";

// Tạo context rỗng — sẽ được điền giá trị bởi AuthProvider bên dưới
const AuthContext = createContext();

// URL gốc của json-server (proxy qua vite.config.js → localhost:3001)
const API = "/api/users";

// ── HÀM VALIDATE (kiểm tra dữ liệu nhập vào) ──────────────────────────────

// Kiểm tra email có đúng định dạng không (phải có @ và dấu chấm)
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Kiểm tra mật khẩu: ít nhất 6 ký tự, có cả chữ và số
function validatePassword(pw) {
  return pw.length >= 6 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);
}

// Kiểm tra số điện thoại Việt Nam (0[35789]xxxxxxxx)
function validatePhone(phone) {
  const s = String(phone).replace(/\s+/g, ""); // bỏ khoảng trắng
  return /^(\+84|84|0)(3|5|7|8|9)\d{8}$/.test(s);
}

// Chuyển +84xxx hoặc 84xxx về dạng 0xxx
function normalizePhone(phone) {
  let s = String(phone).replace(/\s+/g, "");
  if (s.startsWith("+84")) s = "0" + s.slice(3);
  else if (s.startsWith("84")) s = "0" + s.slice(2);
  return s;
}

// ── HÀM PHÂN QUYỀN (export để dùng ở AdminRoute, useProducts...) ──────────

/** Lấy user đang đăng nhập từ localStorage */
export function getCurrentUser() {
  try {
    const saved = localStorage.getItem("vlxd_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/** Trả về true nếu user là admin (kể cả root admin) */
export function isAdmin(user) {
  return user?.role === "admin";
}

/** Trả về true nếu user là root admin (admin gốc, không thể bị thu hồi) */
export function isRootAdmin(user) {
  return user?.role === "admin" && user?.isRoot === true;
}

// ── PROVIDER ────────────────────────────────────────────────────────────────
// AuthProvider bao bọc toàn bộ app (xem App.jsx)
// Mọi component con gọi useAuth() đều nhận được các giá trị bên dưới

export function AuthProvider({ children }) {
  // Khi app load lại: đọc user từ localStorage để không bị đăng xuất
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("vlxd_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Lưu phiên đăng nhập vào state + localStorage
  // Không lưu password để bảo mật
  function saveSession(found) {
    const sessionUser = {
      id:       found.id,
      fullName: found.fullName,
      email:    found.email,
      phone:    found.phone  || "",
      role:     found.role   || "customer", // mặc định là customer nếu thiếu
      isRoot:   found.isRoot || false,
    };
    setUser(sessionUser);
    localStorage.setItem("vlxd_user", JSON.stringify(sessionUser));
  }

  // ── ĐĂNG KÝ ──────────────────────────────────────────────────────────────
  // Trả về { ok: true } nếu thành công, { ok: false, error: "..." } nếu lỗi
  const register = async ({ fullName, email, phone, password, confirmPassword }) => {
    // Validate lần lượt từng field
    if (!fullName.trim())
      return { ok: false, error: "Vui lòng nhập họ và tên." };
    if (!validateEmail(email))
      return { ok: false, error: "Email không đúng định dạng." };
    if (!validatePhone(phone))
      return { ok: false, error: "Số điện thoại không đúng (VD: 0901234567)." };
    if (!validatePassword(password))
      return { ok: false, error: "Mật khẩu tối thiểu 6 ký tự, gồm cả chữ và số." };
    if (password !== confirmPassword)
      return { ok: false, error: "Mật khẩu xác nhận không khớp." };

    // Kiểm tra email đã tồn tại chưa (hỏi json-server)
    const emailCheck = await fetch(`${API}?email=${encodeURIComponent(email)}`);
    const existing   = await emailCheck.json();
    if (existing.length > 0)
      return { ok: false, error: "Email này đã được đăng ký." };

    // Kiểm tra số điện thoại đã tồn tại chưa
    const phoneNorm  = normalizePhone(phone);
    const phoneCheck = await fetch(`${API}?phone=${encodeURIComponent(phoneNorm)}`);
    const phoneTaken = await phoneCheck.json();
    if (phoneTaken.length > 0)
      return { ok: false, error: "Số điện thoại đã được đăng ký." };

    // Tạo user mới — mặc định role là "customer", không phải root
    const newUser = {
      fullName:  fullName.trim(),
      email:     email.toLowerCase().trim(),
      phone:     phoneNorm,
      password,                        // lưu tạm thời (project học tập)
      role:      "customer",           // user mới luôn là customer
      isRoot:    false,
      createdAt: new Date().toISOString(),
    };

    // POST lên json-server để lưu vào db.json
    const res = await fetch(API, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(newUser),
    });

    if (!res.ok) return { ok: false, error: "Lỗi server, vui lòng thử lại." };
    return { ok: true };
  };

  // ── ĐĂNG NHẬP ─────────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    if (!email.trim())    return { ok: false, error: "Vui lòng nhập email." };
    if (!password)        return { ok: false, error: "Vui lòng nhập mật khẩu." };
    if (!validateEmail(email)) return { ok: false, error: "Email không đúng định dạng." };

    // Tìm user theo email trong json-server
    const res   = await fetch(`${API}?email=${encodeURIComponent(email.toLowerCase().trim())}`);
    const users = await res.json();

    if (users.length === 0) return { ok: false, error: "Email chưa được đăng ký." };

    const found = users[0];
    if (found.password !== password) return { ok: false, error: "Mật khẩu không đúng." };

    // Lưu session (có role và isRoot) → dùng để phân quyền sau
    saveSession(found);
    return { ok: true };
  };

  // ── ĐĂNG XUẤT ─────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem("vlxd_user"); // xóa khỏi bộ nhớ trình duyệt
  };

  // ── CẤP QUYỀN ADMIN ───────────────────────────────────────────────────────
  // Điều kiện: người thực hiện phải là admin
  const grantAdmin = async (targetUserId) => {
    if (!isAdmin(user))
      return { ok: false, error: "Bạn không có quyền thực hiện." };

    // Lấy thông tin user cần cấp quyền
    const res    = await fetch(`${API}/${targetUserId}`);
    const target = await res.json();
    if (!target?.id)         return { ok: false, error: "Không tìm thấy user." };
    if (target.role === "admin") return { ok: false, error: "User này đã là admin." };

    // Cập nhật role lên json-server
    const patch = await fetch(`${API}/${targetUserId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ role: "admin", isRoot: false }),
    });
    if (!patch.ok) return { ok: false, error: "Lỗi server." };
    return { ok: true };
  };

  // ── THU HỒI QUYỀN ADMIN ────────────────────────────────────────────────────
  // Quy tắc bảo vệ hệ thống:
  //   1. Chỉ root admin mới được thu hồi
  //   2. Không thể thu hồi root admin khác
  //   3. Không thể tự thu hồi của chính mình
  const revokeAdmin = async (targetUserId) => {
    if (!isRootAdmin(user))
      return { ok: false, error: "Chỉ Root Admin mới có thể thu hồi." };
    if (targetUserId === user.id)
      return { ok: false, error: "Không thể thu hồi quyền của chính mình." };

    const res    = await fetch(`${API}/${targetUserId}`);
    const target = await res.json();
    if (!target?.id)    return { ok: false, error: "Không tìm thấy user." };
    if (target.isRoot)  return { ok: false, error: "Không thể thu hồi Root Admin." };
    if (target.role !== "admin") return { ok: false, error: "User này không phải admin." };

    const patch = await fetch(`${API}/${targetUserId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ role: "customer" }),
    });
    if (!patch.ok) return { ok: false, error: "Lỗi server." };
    return { ok: true };
  };

  // Giá trị được chia sẻ cho mọi component con qua useAuth()
  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      grantAdmin,
      revokeAdmin,
      // Hai biến tiện lợi để dùng trực tiếp trong JSX
      isAdminUser:     isAdmin(user),     // true/false
      isRootAdminUser: isRootAdmin(user), // true/false
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook tùy chỉnh — thay vì viết useContext(AuthContext) ở mọi nơi
// chỉ cần: const { user, login } = useAuth()
export function useAuth() {
  return useContext(AuthContext);
}
