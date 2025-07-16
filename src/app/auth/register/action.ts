"use server";

import { hash } from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/user";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function register(_: any, form: FormData) {
  const name     = String(form.get("name"));
  const email    = String(form.get("email"));
  const password = String(form.get("password"));

  if (!name || !email || !password) {
    return { error: "Thiếu thông tin bắt buộc" };
  }

  await connectMongoDB();

  const existing = await User.findOne({ email });
  if (existing) {
    return { error: "Email đã tồn tại", email };;
  }

  await User.create({ name, email, password: await hash(password, 10) });

  return { success: true, credentials: { email, password } };
  
}
