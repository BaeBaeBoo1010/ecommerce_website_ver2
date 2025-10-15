"use client";

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function AppToaster() {
  const [position, setPosition] = useState<"top-right" | "bottom-right">(
    "top-right",
  );

  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth >= 768)
        setPosition("bottom-right"); // laptop, tablet
      else setPosition("top-right"); // điện thoại
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <Toaster
      richColors
      closeButton
      theme="light"
      position={position}
      className={`${
        position === "top-right"
          ? "!top-18 sm:!top-26"
          : "!bottom-8 sm:!bottom-10"
      } !z-[9999] !w-80`}
      toastOptions={{ duration: 2000 }}
    />
  );
}
