"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";

export default function TestUploadForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    setMessage("🔄 Đang tải...");

    try {
      const res = await fetch("/api/upload-test", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setImageUrl(data.url);
        setMessage("✅ Upload thành công");
      } else {
        setMessage("❌ Upload thất bại: " + (data.message || "Không rõ lỗi"));
      }
    } catch (err) {
      console.error("❌ Lỗi khi upload:", err);
      setMessage("❌ Upload thất bại");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded border bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold">📁 Test Upload Ảnh</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="mb-4 w-full border p-2"
      />

      {imageUrl && (
        <div className="relative h-40 w-40 overflow-hidden rounded border bg-gray-100">
          <Image
            src={imageUrl}
            alt="Uploaded"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
