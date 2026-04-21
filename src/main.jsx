// ============================================================
// main.jsx — Điểm khởi chạy của toàn bộ ứng dụng React
// Vite sẽ đọc file này đầu tiên khi bạn chạy "npm run dev"
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// CSS của Bootstrap — cung cấp các class như btn, card, container...
import "bootstrap/dist/css/bootstrap.min.css";
// JS của Bootstrap — cần thiết để navbar mobile (hamburger) hoạt động
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// Icon của Bootstrap — dùng class như bi-cart3, bi-person...
import "bootstrap-icons/font/bootstrap-icons.css";

// CSS tùy chỉnh của dự án (đặt sau Bootstrap để có thể ghi đè)
import "./index.css";

// Component gốc chứa toàn bộ ứng dụng
import App from "./App";

// Tìm thẻ <div id="root"> trong index.html rồi render App vào đó
createRoot(document.getElementById("root")).render(
  // StrictMode giúp phát hiện lỗi tiềm ẩn trong quá trình phát triển
  <StrictMode>
    <App />
  </StrictMode>
);
