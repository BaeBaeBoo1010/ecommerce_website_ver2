import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI không được để trống. Hãy thêm vào .env.local");
}

let isConnected = false;

export const connectMongoDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });

    isConnected = true;
    console.log("✅ Đã kết nối MongoDB thành công");
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:");
    if (error instanceof Error) {
      console.error("Lỗi:", error.message);
    } else {
      console.error("Không rõ lỗi:", error);
    }
    throw error;
  }
};
