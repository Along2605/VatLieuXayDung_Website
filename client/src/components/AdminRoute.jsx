// ============================================================
// components/AdminRoute.jsx — Bảo vệ route chỉ dành cho admin
//
// Kiểm tra 2 lớp:
//   1. Chưa đăng nhập → về /login
//   2. Đã đăng nhập nhưng không phải admin → về trang chủ
// ============================================================

import { Navigate, useLocation } from "react-router-dom";
import { useAuth, isAdmin } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập nhưng không phải admin → về trang chủ
  if (!isAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  // Là admin → cho vào
  return children;
}
