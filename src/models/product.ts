import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  productCode: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  imageUrls: {
  type: [String],
  required: true,
  },
}, {
  timestamps: true,
});

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
