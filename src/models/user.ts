import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ["user", "admin"], default: "user" },
    phone:    { type: String, default: "" },
    address:  { type: String, default: "" },
  },
  { timestamps: true, versionKey: false },
);

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
