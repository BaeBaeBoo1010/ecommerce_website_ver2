"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-49 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
      <div
        aria-label="Trang chủ"
        className="flex animate-[breathe_0.8s_linear_infinite] flex-row items-center gap-2 bg-white rounded-xl p-2 shadow-2xl"
      >
        <Image
          src="/images/logo.webp"
          alt="Logo"
          width={120}
          height={120}
          className="bg-white p-1"
          priority
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
      </div>

      <style jsx>{`
        @keyframes breathe {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
