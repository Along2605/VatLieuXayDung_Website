// ============================================================
// context/CartContext.jsx — Quản lý giỏ hàng toàn ứng dụng
//
// Dùng useReducer thay vì nhiều useState vì giỏ hàng có nhiều
// loại thao tác (thêm, xóa, tăng, giảm, xóa tất cả).
//
// useReducer hoạt động như sau:
//   - state: mảng các sản phẩm trong giỏ [{ id, name, price, qty, ... }]
//   - dispatch({ type: "ADD", payload: product }): gửi lệnh thay đổi
//   - reducer: hàm xử lý từng loại lệnh, trả về state mới
// ============================================================

import { createContext, useReducer, useContext, useMemo } from "react";

const CartContext = createContext();

// ── REDUCER — xử lý từng hành động lên giỏ hàng ─────────────────────────────
// state = mảng sản phẩm hiện tại
// action = { type: "TÊN_LỆNH", payload: dữ_liệu }
function cartReducer(state, action) {
  switch (action.type) {

    case "ADD": {
      // Kiểm tra sản phẩm đã có trong giỏ chưa (so sánh theo id)
      const existed = state.find((item) => item.id === action.payload.id);
      if (existed) {
        // Đã có → tăng số lượng thêm 1
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      // Chưa có → thêm mới với qty = 1
      return [...state, { ...action.payload, qty: 1 }];
    }

    case "REMOVE":
      // Xóa sản phẩm có id khớp với payload
      return state.filter((item) => item.id !== action.payload);

    case "INCREASE":
      // Tăng qty của sản phẩm lên 1
      return state.map((item) =>
        item.id === action.payload ? { ...item, qty: item.qty + 1 } : item
      );

    case "DECREASE":
      // Giảm qty xuống 1, nếu qty về 0 thì tự động xóa khỏi giỏ
      return state
        .map((item) =>
          item.id === action.payload ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0); // lọc bỏ item qty = 0

    case "UPDATE_QTY":
      // Đặt qty thành một số cụ thể (dùng khi nhập trực tiếp)
      return state
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, qty: action.payload.qty }
            : item
        )
        .filter((item) => item.qty > 0);

    case "CLEAR":
      // Xóa toàn bộ giỏ hàng (sau khi đặt hàng)
      return [];

    default:
      return state;
  }
}

// ── PROVIDER ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  // cart = [] ban đầu (giỏ trống)
  const [cart, dispatch] = useReducer(cartReducer, []);

  // useMemo: chỉ tính lại khi cart thay đổi (tránh tính lại khi re-render vô lý)
  // Tổng số lượng (VD: 3 sp × 2 cái = 5 items)
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  // Tổng tiền
  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  // Các hàm dùng trong component — gọi dispatch với đúng action
  const addToCart   = (product)      => dispatch({ type: "ADD",        payload: product });
  const removeItem  = (id)           => dispatch({ type: "REMOVE",     payload: id });
  const increaseQty = (id)           => dispatch({ type: "INCREASE",   payload: id });
  const decreaseQty = (id)           => dispatch({ type: "DECREASE",   payload: id });
  const updateQty   = (id, qty)      => dispatch({ type: "UPDATE_QTY", payload: { id, qty } });
  const clearCart   = ()             => dispatch({ type: "CLEAR" });

  return (
    <CartContext.Provider value={{
      cart,         // mảng sản phẩm
      totalItems,   // tổng số lượng
      totalPrice,   // tổng tiền
      addToCart,
      removeItem,
      increaseQty,
      decreaseQty,
      updateQty,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook tùy chỉnh: const { cart, addToCart } = useCart()
export function useCart() {
  return useContext(CartContext);
}
