import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Liệt kê tất cả các path ISR cần revalidate
    const paths = [
      "/",
      "/products",
    ];

    for (const path of paths) {
      await revalidatePath(path);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
