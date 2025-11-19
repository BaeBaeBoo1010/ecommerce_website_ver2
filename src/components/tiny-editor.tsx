/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";

import { useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false },
);

const MAX_IMAGE_WIDTH = 1024;
const MAX_IMAGE_SIZE = 1024 * 1024;

export default function TinyEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const tempImagesRef = useRef<{ blobUrl: string; file: File }[]>([]);

  // Sử dụng browser-image-compression (dùng Web Worker, không block UI)
  const resizeAndCompressImage = async (file: File): Promise<File> => {
    const options = {
      maxWidthOrHeight: MAX_IMAGE_WIDTH,
      maxSizeMB: MAX_IMAGE_SIZE / 1024 / 1024,
      useWebWorker: true,
      initialQuality: 0.8,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch {
      // fallback: trả về file gốc nếu lỗi
      return file;
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup tất cả blob URL
      tempImagesRef.current.forEach((img) => URL.revokeObjectURL(img.blobUrl));
      tempImagesRef.current = [];
      (TinyEditor as any).clearTempImages?.();
    };
  }, []);

  const handleImageUpload = (
    blobInfo: any,
    progress: (percent: number) => void,
  ): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const file = blobInfo.blob();
        if (!file) return reject("No file");

        // 🔥 Nén + resize trước khi lưu
        const compressedFile = await resizeAndCompressImage(file);
        const url = URL.createObjectURL(compressedFile);

        tempImagesRef.current.push({
          blobUrl: url,
          file: compressedFile,
        });

        progress(100);
        resolve(url);
      } catch (err) {
        reject(err);
      }
    });
  };

  (TinyEditor as any).getTempImages = () => {
    return tempImagesRef.current;
  };
  (TinyEditor as any).clearTempImages = () => {
    tempImagesRef.current.forEach((img) => URL.revokeObjectURL(img.blobUrl));
    tempImagesRef.current = [];
  };

  return (
    <div className="overflow-hidden rounded-xl border">
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        value={value}
        licenseKey="gpl"
        init={{
          height: 400,
          menubar: "file edit insert table format view tools",
          placeholder,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks fontsizeinput | " +
            " bold italic underline forecolor backcolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | fullscreen",
          image_caption: true,
          font_size_input_default_unit: "px",
          content_style:
            "body { font-family:Inter,Roboto,sans-serif; font-size:16px; line-height:1.75; } img { border-radius: 8px; display: block; margin-left: auto; margin-right: auto;}",
          table_default_attributes: {
            border: "1",
          },
          table_default_styles: {
            "border-collapse": "collapse",
            width: "100%",
          },
          images_upload_handler: handleImageUpload,
          automatic_uploads: true,
          file_picker_types: "image",
          paste_data_images: true,
        }}
        onEditorChange={onChange}
      />
    </div>
  );
}
