import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const uri = process.env.uri;

const products = [
  {
    name: "Wireless Headphones",
    description: "High-quality noise-canceling wireless headphones.",
    price: 150.00,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    stock: 25
  },
  {
    name: "Smart Watch",
    description: "Feature-rich smart watch with health tracking.",
    price: 199.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    stock: 50
  },
  {
    name: "Running Shoes",
    description: "Comfortable and durable running shoes.",
    price: 85.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    stock: 100
  },
  {
    name: "Coffee Maker",
    description: "Programmable coffee maker with timer.",
    price: 65.50,
    category: "Home",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80",
    stock: 15
  }
];

mongoose
  .connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB for seeding");
    await Product.insertMany(products);
    console.log("Products seeded successfully!");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  });
