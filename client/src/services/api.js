// ============================================================
// client/src/services/api.js — Service layer giao tiếp với backend
//
// Tại sao cần file này?
//   - Tập trung tất cả lời gọi API vào một chỗ
//   - Component chỉ cần gọi: api.products.getAll()
//   - Khi đổi URL backend chỉ sửa ở đây, không phải sửa từng component
//   - Dễ thêm header (Authorization token) cho mọi request
//
// Cấu trúc:
//   api.products.getAll()
//   api.products.create(data)
//   api.categories.getAll()
//   api.auth.login(form)
//   api.users.grantAdmin(id)
//   ...
// ============================================================

import axios from 'axios';

// Tạo axios instance với cấu hình chung
// baseURL: /api → kết hợp với proxy trong vite.config.js → localhost:5000/api
const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 giây — nếu server không trả lời → báo lỗi
});

// ── INTERCEPTOR: xử lý lỗi toàn cục ─────────────────────────────────────────
// Interceptor chạy trước khi response đến component
http.interceptors.response.use(
  // Thành công: trả về response bình thường
  (response) => response,

  // Lỗi: chuẩn hóa message lỗi để component dễ dùng
  (error) => {
    const msg =
      error.response?.data?.error ||   // lỗi từ backend (VD: "Email đã tồn tại")
      error.message ||                  // lỗi axios (VD: "Network Error")
      'Lỗi không xác định';
    return Promise.reject(new Error(msg)); // ném lỗi đã chuẩn hóa
  }
);

// ============================================================
// PRODUCTS API
// ============================================================
const products = {
  // GET /api/products?category=xi-mang&sale=true&search=hà tiên
  getAll: (params = {}) => http.get('/products', { params }),

  // GET /api/products/:id
  getById: (id) => http.get(`/products/${id}`),

  // POST /api/products   body: { name, price, unit, category, ... }
  create: (data) => http.post('/products', data),

  // PUT /api/products/:id   body: các field cần cập nhật
  update: (id, data) => http.put(`/products/${id}`, data),

  // DELETE /api/products/:id
  remove: (id) => http.delete(`/products/${id}`),
};

// ============================================================
// CATEGORIES API
// ============================================================
const categories = {
  getAll:  ()           => http.get('/categories'),
  getById: (id)         => http.get(`/categories/${id}`),
  create:  (data)       => http.post('/categories', data),
  update:  (id, data)   => http.put(`/categories/${id}`, data),
  remove:  (id)         => http.delete(`/categories/${id}`),
};

// ============================================================
// AUTH API
// ============================================================
const auth = {
  // POST /api/auth/login   body: { email, password }
  login: (form) => http.post('/auth/login', form),

  // POST /api/auth/register   body: { fullName, email, phone, password }
  register: (form) => http.post('/auth/register', form),
};

// ============================================================
// USERS API (chỉ admin dùng)
// ============================================================
const users = {
  // GET /api/users — danh sách tất cả user
  getAll: () => http.get('/users'),

  // GET /api/users/:id
  getById: (id) => http.get(`/users/${id}`),

  // PATCH /api/users/:id/grant — cấp quyền admin
  grantAdmin: (id) => http.patch(`/users/${id}/grant`),

  // PATCH /api/users/:id/revoke — thu hồi quyền admin
  revokeAdmin: (id) => http.patch(`/users/${id}/revoke`),
};

// Export gộp — dùng: import api from '../services/api'
const api = { products, categories, auth, users };
export default api;
