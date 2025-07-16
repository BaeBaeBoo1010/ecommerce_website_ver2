import mongoose from "mongoose";
import { MongoClient } from "mongodb";

/* ---------- ENV ---------- */
const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI không được để trống (.env.local)");
}

/* ================= 1. KẾT NỐI MONGOOSE (cho model) ================ */

/**
 * Dùng cache toàn cục để:
 *  • Tránh tạo nhiều kết nối khi hot‑reload (dev)
 *  • Tránh race‑condition Lambda (prod)
 */
declare global {
  var _mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null };
}
if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null };
}

export async function connectMongoDB(): Promise<mongoose.Connection> {
  const cached = global._mongoose;

  // Đã có connection
  if (cached.conn) return cached.conn;

  // Nếu đang kết nối → đợi cùng Promise
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => {
        console.log("✅ MongoDB connected (Mongoose)");
        return m.connection;
      })
      .catch((err) => {
        cached.promise = null; // Cho phép thử lại lần sau
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/* =============== 2. MongoClient (cho NextAuth adapter) ============== */

/**
 * Tương tự, cache Promise MongoClient để @auth/mongodb‑adapter
 * không mở pool mới cho mỗi request.
 */
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(MONGODB_URI).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(MONGODB_URI).connect();
}

export default clientPromise;
