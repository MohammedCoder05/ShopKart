import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export async function addToWishlist(req, res) {
  try {
    const { productId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Fetch the authenticated customer
    const user = await Customer.findById(req.customer._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Ensure wishlist array is initialized
    if (!user.wishlist) {
      user.wishlist = [];
    }

    // Check if product is already in wishlist
    const alreadyInWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyInWishlist) {
      return res.status(409).json({
        success: false,
        message: "Already in wishlist",
      });
    }

    // Add product to wishlist and save
    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}

export async function getWishlist(req, res) {
  try {
    const userId = req.customer._id;

    // Fetch user and populate wishlist product details
    const user = await Customer.findById(userId).populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const wishlistItems = (user.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: wishlistItems.length,
      wishlist: wishlistItems,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}

export async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Fetch current user
    const user = await Customer.findById(req.customer._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Ensure wishlist array exists
    if (!user.wishlist) {
      user.wishlist = [];
    }

    // Check if product is in wishlist
    const exists = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    // Use Mongoose .pull() array operator to remove product reference
    user.wishlist.pull(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}
