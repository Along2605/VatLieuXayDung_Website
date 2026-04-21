// ============================================================
// components/ProtectedRoute.jsx — Bảo vệ route cần đăng nhập
//
// Bao bọc các trang cần login (cart, checkout, order...).
// Nếu chưa login → chuyển về /login và ghi nhớ trang muốn vào
// để sau khi login xong sẽ redirect đúng trang.
// ============================================================

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user }   = useAuth();
  const location   = useLocation(); // lấy URL hiện tại

  if (!user) {
    // Chưa đăng nhập → về /login
    // state.from: lưu URL đang cố vào để sau khi login redirect về đó
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập → render trang bình thường
  return children;
}
