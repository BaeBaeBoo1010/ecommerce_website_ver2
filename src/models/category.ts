import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: false, unique: true }, // ❗ Cho phép null/undefined lúc đầu
});

export const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
