"use server";

import { hash } from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/user";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function register(_: any, form: FormData) {
  const name = String(form.get("name")).trim();
  const email = String(form.get("email")).toLowerCase().trim();
  const password = String(form.get("password"));

  if (!name || !email || !password) {
    return { error: "MISSING_FIELDS", name, email };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "INVALID_EMAIL", name, email };
  }

  if (password.length < 6) {
    return { error: "WEAK_PASSWORD", name, email };
  }

  const nameRegex = /^[^\d]+$/;
  if (!nameRegex.test(name)) {
    return { error: "INVALID_NAME", name, email };
  }

  await connectMongoDB();

  const existing = await User.findOne({ email });
  if (existing) {
    return { error: "EMAIL_EXISTS", name, email };
  }

  await User.create({
    name,
    email,
    password: await hash(password, 10),
    role: "user",
  });

  // ✅ Không trả password
  return { success: true, email };
}
