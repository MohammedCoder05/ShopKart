import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  addToCart as addToCartThunk,
  removeFromCart as removeFromCartThunk,
  updateQuantity as updateQuantityThunk,
  clearCart as clearCartAction,
  setCartItems as setCartItemsAction,
} from "./cartSlice.js";

export const useCart = () => {
  const dispatch = useDispatch();
  const { cartItems, loading, error, cartCount, cartTotal } = useSelector(
    (state) => state.cart
  );

  const addToCart = async (productId) => {
    try {
      const resultAction = await dispatch(addToCartThunk(productId));
      if (addToCartThunk.fulfilled.match(resultAction)) {
        return { success: true, data: resultAction.payload };
      } else {
        return {
          success: false,
          message: resultAction.payload || "Failed to add to cart",
        };
      }
    } catch (err) {
      return { success: false, message: "Failed to add to cart" };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const resultAction = await dispatch(removeFromCartThunk(productId));
      if (removeFromCartThunk.fulfilled.match(resultAction)) {
        return { success: true, data: resultAction.payload };
      } else {
        return {
          success: false,
          message: resultAction.payload || "Failed to remove from cart",
        };
      }
    } catch (err) {
      return { success: false, message: "Failed to remove from cart" };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const resultAction = await dispatch(
        updateQuantityThunk({ productId, quantity })
      );
      if (updateQuantityThunk.fulfilled.match(resultAction)) {
        return { success: true, data: resultAction.payload };
      } else {
        return {
          success: false,
          message: resultAction.payload || "Failed to update quantity",
        };
      }
    } catch (err) {
      return { success: false, message: "Failed to update quantity" };
    }
  };

  const refreshCart = () => {
    return dispatch(fetchCart());
  };

  const clearCart = () => {
    dispatch(clearCartAction());
  };

  const setCartItems = (items) => {
    dispatch(setCartItemsAction(items));
  };

  return {
    cartItems,
    loading,
    error,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    refreshCart,
    fetchCart: refreshCart,
    clearCart,
    setCartItems,
  };
};

export default useCart;
