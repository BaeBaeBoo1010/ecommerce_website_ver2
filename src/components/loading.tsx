"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Loading() {
  const [visible, setVisible] = useState(true);

  // Khi Suspense unmount, animation fade-out sẽ chạy
  useEffect(() => {
    // Dự phòng nếu loading nhanh, animation vẫn chạy mượt
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
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
            <Image
              src="/images/logo.webp"
              alt="Logo"
              width={120}
              height={120}
              className="bg-white p-1"
              priority
              unoptimized
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
      )}
    </AnimatePresence>
  );
}