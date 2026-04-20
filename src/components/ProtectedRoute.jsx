// components/ProtectedRoute.jsx
// Kiến thức: useNavigate, Navigate component, conditional rendering
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Bọc các route cần đăng nhập.
 * Nếu chưa login → chuyển về /login và lưu lại trang muốn vào (state.from)
 * để sau khi login xong sẽ redirect về đúng trang.
 */
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
