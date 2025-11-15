"use server";

import { hash } from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/user";

// ✅ Security: Input length limits
const MAX_FIELD_LENGTHS = {
  name: 100,
  email: 255,
  password: 500,
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function register(_: any, form: FormData) {
  const name = String(form.get("name")).trim();
  const email = String(form.get("email")).toLowerCase().trim();
  const password = String(form.get("password"));

  if (!name || !email || !password) {
    return { error: "MISSING_FIELDS", name, email };
  }

  // ✅ Security: Validate input lengths to prevent DoS
  if (
    name.length > MAX_FIELD_LENGTHS.name ||
    email.length > MAX_FIELD_LENGTHS.email ||
    password.length > MAX_FIELD_LENGTHS.password
  ) {
    return { error: "INVALID_INPUT", name, email };
  }

  // ✅ Security: Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "INVALID_EMAIL", name, email };
  }

  // ✅ Security: Password strength requirements
  if (password.length < 6) {
    return { error: "WEAK_PASSWORD", name, email };
  }

  // ✅ Security: Validate name format (no numbers, reasonable characters)
  const nameRegex = /^[a-zA-ZÀ-ỹ\s'-]+$/;
  if (!nameRegex.test(name) || name.length < 2) {
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
