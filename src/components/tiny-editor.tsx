/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect } from "react";

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

  const resizeAndCompressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const scale =
          img.width > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH / img.width : 1;

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Không lấy được context"));

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compress = (quality: number): Promise<File> => {
          return new Promise((res) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) return res(file); // fallback
                res(new File([blob], file.name, { type: "image/jpeg" }));
              },
              "image/jpeg",
              quality,
            );
          });
        };

        // ✅ Nén lần đầu với chất lượng 0.8
        let compressedFile = await compress(0.8);

        // Nếu vẫn > 1MB thì giảm dần chất lượng
        let quality = 0.7;
        while (compressedFile.size > MAX_IMAGE_SIZE && quality >= 0.3) {
          compressedFile = await compress(quality);
          quality -= 0.1;
        }

        URL.revokeObjectURL(img.src); // dọn URL tạm
        resolve(compressedFile);
      };

      img.onerror = () => reject(new Error("Không thể load ảnh"));
    });
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
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_KEY}
        value={value}
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
