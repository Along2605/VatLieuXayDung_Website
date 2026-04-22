// ============================================================
// App.jsx — Cấu hình route (điều hướng) toàn bộ ứng dụng
//
// Cách hoạt động:
//   - BrowserRouter: bao bọc toàn bộ app, giúp URL thay đổi khi navigate
//   - Routes + Route: khai báo "đường dẫn nào → hiện component nào"
//   - AuthProvider: chia sẻ thông tin đăng nhập cho mọi component
//   - CartProvider: chia sẻ giỏ hàng cho mọi component
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

// Context providers — bao bọc app để mọi component con đều dùng được
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Route guards — kiểm tra quyền truy cập trước khi render trang
import ProtectedRoute from "./components/ProtectedRoute"; // cần đăng nhập
import AdminRoute from "./components/AdminRoute";         // cần là admin

// Layout chung — hiển thị trên mọi trang
import Header from "./components/Header";
import Footer from "./components/Footer";

// Các trang (pages)
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { AboutPage, ContactPage } from "./pages/AboutContactPage";

// Trang mua hàng (cần đăng nhập)
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import WaitingPaymentPage from "./pages/WaitingPaymentPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

// Trang quản trị (cần là admin)
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminUsersPage from "./pages/AdminUsersPage";

// ── Wrapper cho trang chi tiết sản phẩm ─────────────────────
// Vì ProductDetailPage nhận dữ liệu qua props (không tự fetch theo URL),
// nếu user gõ thẳng URL /products/123 mà không có selectedProduct
// → redirect về /products thay vì bị lỗi trắng trang
function ProductDetailWrapper({ selectedProduct, setSelectedProduct }) {
  if (!selectedProduct) {
    // Không có sản phẩm được chọn → về danh sách
    return <Navigate to="/products" replace />;
  }
  return (
    <ProductDetailPage
      product={selectedProduct}
      onSelectRelated={setSelectedProduct} // dùng khi click sản phẩm liên quan
    />
  );
}

// ── Component chính ──────────────────────────────────────────
export default function App() {
  // selectedProduct: sản phẩm đang xem chi tiết
  // Lưu ở App vì cần truyền xuống 2 component khác nhau
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <BrowserRouter>
      {/* AuthProvider: cung cấp user, login, logout, grantAdmin... */}
      <AuthProvider>
        {/* CartProvider: cung cấp cart, addToCart, removeItem... */}
        <CartProvider>
          {/* Layout: flex column chiếm toàn chiều cao màn hình */}
          <div className="d-flex flex-column min-vh-100">

            {/* Header luôn hiện ở trên cùng */}
            <Header />

            {/* main flex-grow-1: đẩy footer xuống đáy */}
            <main className="flex-grow-1">
              <Routes>

                {/* ── TRANG CÔNG KHAI (ai cũng vào được) ── */}
                <Route path="/" element={
                  <HomePage setSelectedProduct={setSelectedProduct} />
                } />
                <Route path="/products" element={
                  <ProductsPage setSelectedProduct={setSelectedProduct} />
                } />
                {/* :id trong URL → dùng useParams để lấy, nhưng ở đây ta dùng props */}
                <Route path="/products/:id" element={
                  <ProductDetailWrapper
                    selectedProduct={selectedProduct}
                    setSelectedProduct={setSelectedProduct}
                  />
                } />
                <Route path="/about"    element={<AboutPage />} />
                <Route path="/contact"  element={<ContactPage />} />
                <Route path="/login"    element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* ── TRANG CẦN ĐĂNG NHẬP ── */}
                {/* ProtectedRoute kiểm tra: chưa login → chuyển về /login */}
                <Route path="/cart" element={
                  <ProtectedRoute><CartPage /></ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                } />
                <Route path="/waiting-payment" element={
                  <ProtectedRoute><WaitingPaymentPage /></ProtectedRoute>
                } />
                <Route path="/order-success" element={
                  <ProtectedRoute><OrderSuccessPage /></ProtectedRoute>
                } />

                {/* ── TRANG ADMIN (cần là admin) ── */}
                {/* AdminRoute kiểm tra: không phải admin → về trang chủ */}
                <Route path="/admin/products" element={
                  <AdminRoute><AdminProductsPage /></AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute><AdminUsersPage /></AdminRoute>
                } />

                {/* ── FALLBACK: URL không khớp → về trang chủ ── */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </main>

            {/* Footer luôn hiện ở dưới cùng */}
            <Footer />

          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
