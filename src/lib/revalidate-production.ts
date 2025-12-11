/**
 * Revalidate Production Helper
 * 
 * When running on localhost, this function triggers revalidation on the
 * production Vercel deployment so that new/updated products are immediately visible.
 * 
 * On Vercel itself, local revalidation is sufficient, so this is a no-op.
 */

const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.me";
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

/**
 * Triggers revalidation on production Vercel deployment.
 * Safe to call from any environment - it will only make the request when running locally.
 * 
 * @param slug - Optional product slug to revalidate specific product page
 */
export async function revalidateProduction(slug?: string): Promise<void> {
  // Only trigger production revalidation when running on localhost
  const isLocalhost = process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === undefined;

  if (!isLocalhost) {
    // Running on Vercel - local revalidation is sufficient
    return;
  }

  if (!REVALIDATION_SECRET) {
    console.warn("⚠️ REVALIDATION_SECRET not set - production revalidation skipped");
    return;
  }

  try {
    const url = `${PRODUCTION_URL}/api/revalidate`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidation-secret": REVALIDATION_SECRET,
      },
      body: JSON.stringify({ slug }),
    });

    if (response.ok) {
      console.log(`✅ Production revalidation triggered${slug ? ` for /products/${slug}` : ""}`);
    } else {
      console.warn(`⚠️ Production revalidation failed: ${response.status}`);
    }
  } catch (error) {
    console.warn("⚠️ Failed to trigger production revalidation:", error);
    // Don't throw - this is a best-effort operation
  }
}
