import dns from "dns/promises";
import { headers } from "next/headers";
import type { IncomingHttpHeaders } from "http";

// Danh sách regex cho các bot phổ biến
const BOT_REGEX =
  /(googlebot|bingbot|facebookexternalhit|facebookcatalog|twitterbot|linkedinbot|pinterest|slackbot|discordbot|applebot|yandex|zalo|zbot|tiktokbot|coccocbot)/i;

// ✅ Hàm check Googlebot nâng cao
async function isVerifiedGooglebot(ip: string, userAgent: string): Promise<boolean> {
  if (!/googlebot/i.test(userAgent)) return false;

  try {
    // Reverse DNS lookup (IP -> Hostname)
    const hostnames = await dns.reverse(ip);
    if (!hostnames.some((h) => h.endsWith("googlebot.com") || h.endsWith("google.com"))) {
      return false;
    }

    // Forward DNS lookup (Hostname -> IP, so khớp IP gốc)
    const lookups = await Promise.all(hostnames.map((h) => dns.lookup(h)));
    return lookups.some((res) => res.address === ip);
  } catch {
    return false;
  }
}

// ✅ Hàm check bot tổng quát
export async function isCrawler(reqHeaders?: IncomingHttpHeaders): Promise<boolean> {
  let userAgent = "";
  let ip = "";

  if (reqHeaders) {
    // Nếu chạy ở middleware / API route
    userAgent = reqHeaders["user-agent"] || "";
    ip =
      (reqHeaders["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (reqHeaders["x-real-ip"] as string) ||
      "";
  } else {
    // Nếu gọi trong Server Component
    userAgent = (await headers()).get("user-agent") || "";
    ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  }

  if (!userAgent) return false;

  // Nếu là Googlebot → check nâng cao
  if (/googlebot/i.test(userAgent) && ip) {
    return await isVerifiedGooglebot(ip, userAgent);
  }

  // Các bot khác → check user-agent
  return BOT_REGEX.test(userAgent);
}
