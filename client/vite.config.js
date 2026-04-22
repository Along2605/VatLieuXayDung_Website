// ============================================================
// client/vite.config.js
//
// Cấu hình Vite cho frontend React.
//
// Quan trọng: phần "proxy" giúp:
//   - Khi frontend gọi axios.get('/api/products')
//   - Vite tự động forward sang http://localhost:5000/api/products
//   - Frontend không cần biết địa chỉ backend, chỉ cần biết /api
//   - Tránh lỗi CORS trong quá trình development
// ============================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // cổng frontend (mặc định của Vite)
    proxy: {
      // Tất cả request bắt đầu bằng /api → forward đến Express server
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // KHÔNG rewrite — giữ nguyên /api trong URL khi gửi đến backend
      },
    },
  },
});
