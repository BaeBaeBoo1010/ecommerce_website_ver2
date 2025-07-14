import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Category } from "@/models/category";
import { slugify } from "@/lib/slugify";

const ERROR = {
  MISSING_NAME: "MISSING_NAME",
  DUP_NAME: "DUP_NAME",
  CREATE_FAILED: "CREATE_FAILED",
} as const;

/* ───────── GET /api/categories ───────── */
export async function GET() {
  await connectMongoDB();
  const categories = await Category.find().sort({ name: 1 });
  return NextResponse.json({ categories });
}

/* ───────── POST /api/categories ─────────
   Body JSON: { name: string }
────────────────────────────────────────── */
export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const cleaned = (name as string | undefined)?.trim();

    /* validate */
    if (!cleaned) {
      return NextResponse.json(
        { success: false, code: ERROR.MISSING_NAME, field: "name" },
        { status: 400 },
      );
    }

    await connectMongoDB();

    /* duplicate check (case‑insensitive) */
    const dup = await Category.findOne(
      { name: { $regex: new RegExp(`^${cleaned}$`, "i") } },
      { _id: 1 },
    ).lean();

    if (dup) {
      return NextResponse.json(
        { success: false, code: ERROR.DUP_NAME, field: "name" },
        { status: 409 },
      );
    }

    /* create */
    const category = await Category.create({ name: cleaned, slug: slugify(cleaned) });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    console.error("POST category error:", err);
    return NextResponse.json(
      { success: false, code: ERROR.CREATE_FAILED },
      { status: 500 },
    );
  }
}
