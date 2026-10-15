import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../config/axios.js";

// Helper to compute derived cart summary
const calculateCartStats = (items) => {
  const count = (items || []).reduce((acc, item) => acc + (item.quantity || 0), 0);
  const total = (items || []).reduce((acc, item) => {
    const price = item.product?.price || 0;
    const qty = item.quantity || 0;
    return acc + price * qty;
  }, 0);
  return { count, total };
};

// 1. Async Thunk: Fetch Cart from Backend
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/cart");
      if (response.data && Array.isArray(response.data.cart)) {
        return response.data.cart;
      }
      return [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load cart items"
      );
    }
  }
);

// 2. Async Thunk: Add Item to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/cart/${productId}`);
      await dispatch(fetchCart());
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add product to cart"
      );
    }
  }
);

// 3. Async Thunk: Remove Item from Cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/cart/${productId}`);
      await dispatch(fetchCart());
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove item from cart"
      );
    }
  }
);

// 4. Async Thunk: Update Item Quantity
export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/cart/${productId}`, {
        quantity,
      });
      await dispatch(fetchCart());
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update item quantity"
      );
    }
  }
);

const initialState = {
  cartItems: [],
  loading: false,
  error: null,
  cartCount: 0,
  cartTotal: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
      state.loading = false;
      state.error = null;
      state.cartCount = 0;
      state.cartTotal = 0;
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload || [];
      const { count, total } = calculateCartStats(state.cartItems);
      state.cartCount = count;
      state.cartTotal = total;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
        const { count, total } = calculateCartStats(action.payload);
        state.cartCount = count;
        state.cartTotal = total;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load cart";
      })

      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
      })

      // removeFromCart
      .addCase(removeFromCart.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
      })

      // updateQuantity
      .addCase(updateQuantity.pending, (state) => {
        state.error = null;
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCart, setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
