import { NextResponse } from "next/server";
import { getHomeData } from "@/lib/home-service";

export const revalidate = 60;    // ISR 60 s cho CDN

export async function GET() {
  try {
    const categories = await getHomeData();
    return NextResponse.json({ categories }, { status: 200 });
  } catch (err) {
    console.error("[API] /home", err);
    return NextResponse.json({ categories: [] }, { status: 200 }); // 👈 fallback rỗng
  }
}

