"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";

export default function AddImageUploadForm() {
  const [productID, setProductID] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "loading" | ""
  >("");

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!productID.trim()) {
      setMessage("❌ Vui lòng nhập mã sản phẩm trước khi tải ảnh");
      setMessageType("error");
      return;
    }

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("productID", productID);

    setMessage("Đang tải ảnh...");
    setMessageType("loading");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setImageUrl(data.url);
        setMessage("✅ Tải ảnh thành công");
        setMessageType("success");
      } else {
        throw new Error(data.message || "Upload ảnh thất bại");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload ảnh thất bại");
      setMessageType("error");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">📤 Upload ảnh sản phẩm</h2>

      <input
        type="text"
        placeholder="Nhập mã sản phẩm (VD: DB658)"
        className="mb-4 w-full rounded border p-2"
        value={productID}
        onChange={(e) => setProductID(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4 w-full rounded border p-2"
      />

      {imageUrl && (
        <div className="relative mx-auto h-40 w-40 overflow-hidden rounded border bg-gray-100">
          <Image
            src={imageUrl}
            alt="Ảnh sản phẩm"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      {message && (
        <p
          className={`mt-4 text-center text-sm ${
            messageType === "success"
              ? "text-green-600"
              : messageType === "error"
                ? "text-red-600"
                : "text-gray-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
