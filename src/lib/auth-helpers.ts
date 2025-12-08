import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

/**
 * Checks if the current user is authenticated and has admin role.
 * Returns null if authorized, or a NextResponse with 401/403 if not.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { success: false, code: "UNAUTHORIZED", message: "Authentication required" },
      { status: 401 }
    );
  }

  if ((session.user as any)?.role !== "admin") {
    return NextResponse.json(
      { success: false, code: "FORBIDDEN", message: "Admin access required" },
      { status: 403 }
    );
  }

  return null; // Authorized
}

/**
 * Checks if the current user is authenticated.
 * Returns null if authorized, or a NextResponse with 401 if not.
 */
export async function requireAuth() {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { success: false, code: "UNAUTHORIZED", message: "Authentication required" },
      { status: 401 }
    );
  }

  return null; // Authorized
}

