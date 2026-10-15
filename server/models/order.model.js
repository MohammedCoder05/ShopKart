import mongoose from "mongoose";
import Customer from "./customer.model.js";

// Ensure 'User' model alias exists so populate works with either 'Customer' or 'User'
if (!mongoose.models.User && mongoose.models.Customer) {
  mongoose.model("User", Customer.schema);
}

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    name: {
      type: String,
      required: [true, "Product name snapshot is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price snapshot is required"],
      min: [0, "Product price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity cannot be less than 1"],
      default: 1,
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

// Virtual & alias for productId
orderItemSchema.pre("validate", function () {
  if (!this.product && this.productId) {
    this.product = this.productId;
  }
});

orderItemSchema.virtual("productId").get(function () {
  return this.product;
}).set(function (val) {
  this.product = val;
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "User reference is required"],
      alias: "customer",
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],
      alias: "orderItems",
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Shipping address is required"],
      alias: "address",
      validate: {
        validator: function (val) {
          if (val === undefined || val === null) return false;
          if (typeof val === "string") return val.trim().length > 0;
          if (typeof val === "object") return Object.keys(val).length > 0;
          return true;
        },
        message: "Shipping address cannot be empty",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
      alias: "total",
    },
    status: {
      type: String,
      default: "pending",
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure compatibility when passing orderItems or customer or total in constructors
orderSchema.pre("validate", function () {
  if ((!this.items || this.items.length === 0) && this.get("orderItems")) {
    this.items = this.get("orderItems");
  }
  if (!this.user && this.get("customer")) {
    this.user = this.get("customer");
  }
  if (this.totalAmount === undefined && this.get("total") !== undefined) {
    this.totalAmount = this.get("total");
  }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export { Order };
export default Order;
