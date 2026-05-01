// ============================================================
// src/features/cart/cartSlice.js
//
// Kiến thức (theo bài học):
//   createSlice = tạo state + reducer + action cùng lúc
//   Không cần viết switch-case như Redux thuần
//
// Slice "cart" quản lý:
//   - items: danh sách sản phẩm trong giỏ
//   - Các action: addToCart, removeItem, increaseQty, decreaseQty, updateQty, clearCart
//
// Global state sau khi gắn vào store sẽ có dạng:
//   {
//     cart: {
//       items: [{ id, name, price, qty, ... }]
//     }
//   }
// ============================================================

import { createSlice } from "@reduxjs/toolkit";

// ── Key lưu trong localStorage ────────────────────────────────────────────────
const LS_CART_KEY = "vlxd_cart";

// ── Đọc cart từ localStorage khi khởi tạo ────────────────────────────────────
// Giúp giỏ hàng không bị mất khi user reload trang
function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(LS_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ── Lưu cart vào localStorage ─────────────────────────────────────────────────
// Gọi sau mỗi lần state thay đổi (trong reducer)
function saveCartToStorage(items) {
  try {
    localStorage.setItem(LS_CART_KEY, JSON.stringify(items));
  } catch {
    // Bỏ qua nếu localStorage đầy
  }
}

// ── State ban đầu ─────────────────────────────────────────────────────────────
// Đọc từ localStorage để khôi phục giỏ hàng sau khi reload
const initialState = {
  items: loadCartFromStorage(),
};

// ── Tạo slice ─────────────────────────────────────────────────────────────────
// createSlice kết hợp: state + reducer + action vào 1 chỗ
const cartSlice = createSlice({
  // "cart" là tên slice → dùng làm prefix cho action
  // VD: action type sẽ là "cart/addToCart", "cart/removeItem"...
  name: "cart",

  initialState,

  reducers: {

    // Action 1: Thêm sản phẩm vào giỏ
    // payload = object sản phẩm { id, name, price, ... }
    addToCart: (state, action) => {
      const product = action.payload;

      // Tìm xem sản phẩm đã có trong giỏ chưa (so sánh id)
      const existed = state.items.find((item) => item.id === product.id);

      if (existed) {
        // Đã có → tăng số lượng lên 1
        existed.qty += 1;
      } else {
        // Chưa có → thêm mới vào giỏ với qty = 1
        state.items.push({ ...product, qty: 1 });
      }

      // Lưu vào localStorage sau mỗi lần thay đổi
      saveCartToStorage(state.items);
    },

    // Action 2: Xóa một sản phẩm khỏi giỏ
    // payload = id của sản phẩm cần xóa
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveCartToStorage(state.items);
    },

    // Action 3: Tăng số lượng sản phẩm lên 1
    // payload = id của sản phẩm
    increaseQty: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.qty += 1;
      saveCartToStorage(state.items);
    },

    // Action 4: Giảm số lượng xuống 1
    // Nếu qty về 0 → tự động xóa khỏi giỏ
    // payload = id của sản phẩm
    decreaseQty: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.qty -= 1;
        // Lọc bỏ các item có qty = 0
        state.items = state.items.filter((i) => i.qty > 0);
      }
      saveCartToStorage(state.items);
    },

    // Action 5: Đặt số lượng cụ thể
    // payload = { id, qty }
    updateQty: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) item.qty = qty;
      // Lọc bỏ item qty <= 0
      state.items = state.items.filter((i) => i.qty > 0);
      saveCartToStorage(state.items);
    },

    // Action 6: Xóa toàn bộ giỏ hàng (sau khi đặt hàng)
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },
  },
});

// Export các action để dùng trong component với dispatch()
export const {
  addToCart,
  removeItem,
  increaseQty,
  decreaseQty,
  updateQty,
  clearCart,
} = cartSlice.actions;

// Export các selector — hàm lấy dữ liệu từ global state
// Dùng trong component: const cart = useSelector(selectCartItems)

// Lấy danh sách sản phẩm trong giỏ
export const selectCartItems = (state) => state.cart.items;

// Tính tổng số lượng (VD: 3 sp × 2 cái = 5 items)
export const selectTotalItems = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.qty, 0);

// Tính tổng tiền
export const selectTotalPrice = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

// Export reducer để đưa vào store
export default cartSlice.reducer;
