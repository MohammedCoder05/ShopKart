import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItemQuantity,
} from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middlewares/authmiddleware.js";

const cartRoutes = express.Router();

cartRoutes.get("/", isAuthenticated, getCart);
cartRoutes.post("/:productId", isAuthenticated, addToCart);
cartRoutes.patch("/:productId", isAuthenticated, updateCartItemQuantity);
cartRoutes.delete("/:productId", isAuthenticated, removeFromCart);

export default cartRoutes;
