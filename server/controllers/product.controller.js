import mongoose from "mongoose";
import Product from "../models/product.model.js";

// POST /products - Create product
export async function createProduct(req, res) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /products - Get all products (supports ?search= & ?category=)
export async function getAllProducts(req, res) {
  try {
    const { search, category } = req.query;
    const filter = {};

    // Case-insensitive search on product name
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // Category filter (case-insensitive exact match)
    if (category && category.trim()) {
      filter.category = { $regex: `^${category.trim()}$`, $options: "i" };
    }

    const products = await Product.find(filter).select("name price category image stock");

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /products/:id - Get single product
export async function getProductById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id).select("-__v");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
