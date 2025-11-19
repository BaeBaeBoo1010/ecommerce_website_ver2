import mongoose from "mongoose";
import "./category";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
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
  articleHtml: {
    type: String,
    default: "",
  },
  isArticleEnabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

ProductSchema.index({ category: 1 });
ProductSchema.index({ createdAt: -1 });

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
