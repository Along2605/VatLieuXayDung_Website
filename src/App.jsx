// App.jsx
// Kiến thức: BrowserRouter, Routes, Route, Navigate, useNavigate
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { AboutPage, ContactPage } from "./pages/AboutContactPage";
import CheckoutPage from "./pages/CheckoutPage";
import WaitingPaymentPage from "./pages/WaitingPaymentPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

// Wrapper: nếu không có selectedProduct (user gõ URL thẳng) → redirect
function ProductDetailWrapper({ selectedProduct, setSelectedProduct }) {
  if (!selectedProduct) return <Navigate to="/products" replace />;
  return (
    <ProductDetailPage
      product={selectedProduct}
      onSelectRelated={setSelectedProduct}
    />
  );
}

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1">
              <Routes>
                {/* Public */}
                <Route path="/"         element={<HomePage setSelectedProduct={setSelectedProduct} />} />
                <Route path="/products" element={<ProductsPage setSelectedProduct={setSelectedProduct} />} />
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

                {/* Protected — cần login */}
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

                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
