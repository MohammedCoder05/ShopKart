import React, { createContext, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "./AuthContext.jsx";
import { fetchCart, clearCart } from "../redux/cartSlice.js";
import { useCart as useReduxCart } from "../redux/useCart.js";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { customer } = useAuth();
  const dispatch = useDispatch();
  const cartState = useReduxCart();

  // Synchronize Redux cart with customer auth status
  useEffect(() => {
    if (customer) {
      dispatch(fetchCart());
    } else {
      dispatch(clearCart());
    }
  }, [customer, dispatch]);

  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useReduxCart();
};
