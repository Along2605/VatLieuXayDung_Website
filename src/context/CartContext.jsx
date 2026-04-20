// context/CartContext.jsx
// Kiến thức: createContext, useReducer, useContext, useMemo
import { createContext, useReducer, useContext, useMemo } from "react";

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {

    case "ADD": {
      const existing = state.find((item) => item.id === action.payload.id);
      if (existing) {
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

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

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
    <CartContext.Provider
      value={{ cart, totalItems, totalPrice, addToCart, removeItem, increaseQty, decreaseQty, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
