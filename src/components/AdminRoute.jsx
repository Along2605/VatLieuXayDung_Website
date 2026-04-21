// components/AdminRoute.jsx
// Kiến thức: Navigate, useAuth, isAdmin helper
// Bảo vệ các route chỉ dành cho admin.
// Nếu chưa login  → về /login
// Nếu không phải admin → về trang chủ (/)
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, isAdmin } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập nhưng không phải admin
  if (!isAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
