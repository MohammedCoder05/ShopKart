import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { isAuthenticated } from "../middlewares/authmiddleware.js";

const wishlistRoutes = express.Router();

wishlistRoutes.get("/", isAuthenticated, getWishlist);
wishlistRoutes.post("/:productId", isAuthenticated, addToWishlist);
wishlistRoutes.delete("/:productId", isAuthenticated, removeFromWishlist);

export default wishlistRoutes;
