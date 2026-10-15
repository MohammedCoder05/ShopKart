import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
} from "../controllers/order.controller.js";
import { isAuthenticated } from "../middlewares/authmiddleware.js";

const orderRoutes = express.Router();

// POST /orders/create-payment-order
orderRoutes.post("/create-payment-order", isAuthenticated, createPaymentOrder);

// POST /orders/verify-payment & /orders/verify
orderRoutes.post("/verify-payment", isAuthenticated, verifyPayment);
orderRoutes.post("/verify", isAuthenticated, verifyPayment);

// Also support POST /orders directly
orderRoutes.post("/", isAuthenticated, createPaymentOrder);

// GET /orders
orderRoutes.get("/", isAuthenticated, getUserOrders);

// GET /orders/:orderId
orderRoutes.get("/:orderId", isAuthenticated, getOrderById);

export default orderRoutes;
