// ============================================================
// src/app/store.js — Redux Store (nơi chứa toàn bộ global state)
//
// Kiến thức (theo bài học):
//   configureStore: thay cho createStore của Redux thuần
//   Khai báo các slice vào reducer object
//
// Global state của app có dạng:
//   {
//     cart: {
//       items: [...]   ← do cartReducer quản lý
//     }
//   }
//
// Nếu sau này thêm slice mới (VD: userSlice, productSlice):
//   reducer: {
//     cart: cartReducer,
//     user: userReducer,   ← thêm vào đây
//   }
// ============================================================

import { configureStore } from "@reduxjs/toolkit";

// Import reducer của cart (được export default từ cartSlice)
import cartReducer from "../features/cart/cartSlice";

// Tạo store và export để dùng toàn app
export const store = configureStore({
  reducer: {
    // "cart" là tên key trong global state
    // cartReducer là logic xử lý state của giỏ hàng
    cart: cartReducer,
  },
});
