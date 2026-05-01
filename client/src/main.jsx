// ============================================================
// main.jsx — Điểm khởi chạy của toàn bộ ứng dụng React
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

import App from "./App";

// Import Provider từ react-redux và store từ app/store.js
// Provider: bao bọc toàn bộ app để mọi component đều dùng được Redux store
// (giống AuthProvider, CartProvider nhưng là của Redux)
import { Provider } from "react-redux";
import { store } from "./app/store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Provider truyền store xuống toàn bộ component tree */}
    {/* Bất kỳ component nào cũng có thể dùng useSelector/useDispatch */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
