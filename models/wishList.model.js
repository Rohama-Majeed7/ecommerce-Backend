import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: [String], required: true }, // Allow array of strings
  price: { type: Number },
});
const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [itemSchema],
  },
  { timestamps: true }
);

const wishListModel = mongoose.model("wishlist", wishlistSchema);

export default wishListModel;
