import mongoose from "mongoose";

// Sub-schema for individual product in the order
const ProductDetailSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: [String],
  },
  { _id: false }
);

// Sub-schema for payment details
const PaymentDetailSchema = new mongoose.Schema(
  {
    paymentId: { type: String, default: "" },
    payment_method_type: { type: [String], default: [] },
    payment_status: { type: String, default: "" },
  },
  { _id: false }
);

// Sub-schema for shipping options
const ShippingOptionSchema = new mongoose.Schema(
  {
    shipping_rate: { type: String, default: "" },
    shipping_amount: { type: Number, default: 0 },
  },
  { _id: false }
);

// Main Order Schema
const orderSchema = new mongoose.Schema(
  {
    productDetails: { type: [ProductDetailSchema], default: [] },
    email: { type: String, default: "" },
    userId: { type: String, default: "" },
    paymentDetails: { type: PaymentDetailSchema, default: () => ({}) },
    shipping_options: { type: [ShippingOptionSchema], default: [] },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("order", orderSchema);
export default orderModel;
