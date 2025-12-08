import { MongoClient } from "mongodb";
import { supabase } from "./supabase.ts";

// ---------- CONFIG ----------
const MONGO_URI = "mongodb+srv://khanhle:uGJoG8344rdoe81v@cluster0.83zre6z.mongodb.net/quangminhshop_db";
const MONGO_COLLECTION = "products";

const SUPABASE_TABLE = "products";

// ---------- MONGODB TEST ----------
async function testMongoDB() {
  const client = new MongoClient(MONGO_URI);

  console.log("\n🔵 Testing MongoDB...");

  const start = performance.now();
  await client.connect();

  const db = client.db();
  const collection = db.collection(MONGO_COLLECTION);

  const data = await collection.find({}).toArray();

  const end = performance.now();
  console.log(`MongoDB: Loaded ${data.length} rows in ${(end - start).toFixed(2)} ms`);
  console.log("MongoDB data:");
  console.log(data);

  await client.close();
}

// ---------- SUPABASE TEST ----------
async function testSupabase() {
  console.log("\n🟣 Testing Supabase...");
  const start = performance.now();

  const { data, error } = await supabase.from(SUPABASE_TABLE).select("*, category(name, slug)");

  const end = performance.now();

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  console.log(`Supabase: Loaded ${data?.length} rows in ${(end - start).toFixed(2)} ms`);
  console.log("Supabase data:");
  console.log(data);
}

// ---------- MAIN ----------
(async () => {
  await testSupabase();
  await testMongoDB();
})();
