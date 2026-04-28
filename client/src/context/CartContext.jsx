// ============================================================
// context/CartContext.jsx — Quản lý giỏ hàng toàn ứng dụng
//
// Fix: Lưu cart vào localStorage để không mất khi reload trang
//   - Khởi tạo cart bằng cách đọc từ localStorage
//   - Mỗi khi cart thay đổi → tự động lưu vào localStorage
//   - Dùng useEffect để sync cart → localStorage sau mỗi dispatch
// ============================================================

import { createContext, useReducer, useContext, useMemo, useEffect } from "react";

const CartContext  = createContext();
const LS_CART_KEY = "vlxd_cart"; // key lưu trong localStorage

// ── REDUCER ──────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {

    case "ADD": {
      const existed = state.find((item) => item.id === action.payload.id);
      if (existed) {
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...state, { ...action.payload, qty: 1 }];
    }

    case "REMOVE":
      return state.filter((item) => item.id !== action.payload);

    case "INCREASE":
      return state.map((item) =>
        item.id === action.payload ? { ...item, qty: item.qty + 1 } : item
      );

    case "DECREASE":
      return state
        .map((item) =>
          item.id === action.payload ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0);

    case "UPDATE_QTY":
      return state
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, qty: action.payload.qty }
            : item
        )
        .filter((item) => item.qty > 0);

    case "CLEAR":
      return [];

    // Load cart từ localStorage (dùng khi khôi phục sau reload)
    case "LOAD":
      return action.payload;

    default:
      return state;
  }
}

// ── Đọc cart từ localStorage khi khởi tạo ────────────────────────────────────
function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(LS_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Kiểm tra dữ liệu hợp lệ (phải là mảng)
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ── PROVIDER ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  // Khởi tạo cart từ localStorage thay vì [] rỗng
  // Lazy initializer: hàm chỉ chạy 1 lần khi mount
  const [cart, dispatch] = useReducer(cartReducer, [], loadCartFromStorage);

  // Mỗi khi cart thay đổi → lưu vào localStorage
  // useEffect chạy sau mỗi render nếu cart thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(LS_CART_KEY, JSON.stringify(cart));
    } catch {
      // Bỏ qua lỗi nếu localStorage đầy
    }
  }, [cart]);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const addToCart   = (product) => dispatch({ type: "ADD",        payload: product });
  const removeItem  = (id)      => dispatch({ type: "REMOVE",     payload: id });
  const increaseQty = (id)      => dispatch({ type: "INCREASE",   payload: id });
  const decreaseQty = (id)      => dispatch({ type: "DECREASE",   payload: id });
  const updateQty   = (id, qty) => dispatch({ type: "UPDATE_QTY", payload: { id, qty } });
  const clearCart   = ()        => dispatch({ type: "CLEAR" });

  return (
    <CartContext.Provider value={{
      cart,
      totalItems,
      totalPrice,
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

export function useCart() {
  return useContext(CartContext);
}
