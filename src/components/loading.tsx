"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Loading() {
  const [visible, setVisible] = useState(true);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  // Load logo 1 lần và cache vào localStorage
  useEffect(() => {
    const cached = localStorage.getItem("loadingLogo");
    if (cached) {
      setLogoSrc(cached);
    } else {
      fetch("/images/logo.webp")
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            localStorage.setItem("loadingLogo", result);
            setLogoSrc(result);
          };
          reader.readAsDataURL(blob);
        });
    }
  }, []);

  // Ẩn overlay sau 1.5s
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!logoSrc) return null; // Chờ logo load xong

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Overlay chỉ fade out */}
          <motion.div
            className="fixed inset-0 z-40 bg-white/60 backdrop-blur-sm"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          {/* Content chỉ thu nhỏ */}
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <motion.div
              className="flex flex-row items-center gap-2 rounded-xl bg-white p-3 shadow-2xl"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Dùng base64 từ localStorage nhưng vẫn tận dụng next/image */}
              <Image
                src={logoSrc}
                alt="Logo"
                width={120}
                height={120}
                className="bg-white p-1"
                unoptimized // tránh Next.js request lại
                priority // preload luôn
              />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm text-gray-500 sm:text-base">
                  Thiết bị cảm ứng
                </span>
                <span className="text-3xl font-bold whitespace-nowrap text-gray-700 sm:text-4xl dark:text-white">
                  Quang Minh
                </span>
                <span className="text-xs text-gray-400 italic sm:text-sm">
                  Automate your house
                </span>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
