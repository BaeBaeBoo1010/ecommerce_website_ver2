import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quang Minh - Thiết bị cảm ứng thông minh",
    short_name: "Quang Minh SmartHome",
    description:
      "Chuyên cung cấp thiết bị cảm ứng, thiết bị thông minh cho gia đình và công nghiệp.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563EB",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/images/logo.webp",
        sizes: "192x192",
        type: "image/webp",
      },
      {
        src: "/images/logo.webp",
        sizes: "512x512",
        type: "image/webp",
      },
    ],
  };
}
