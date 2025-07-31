"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

export default function EditProductArticlePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Youtube.configure({
        width: 640,
        height: 360,
      }),
    ],
    content: "",
  });

  useEffect(() => {
    if (!editor || !id) return;

    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        editor.commands.setContent(data.article || "");
      })
      .finally(() => setLoading(false));
  }, [editor, id]);

  const handleSave = async () => {
    if (!editor) return;
    const html = editor.getHTML();

    const res = await fetch(`/api/products/${id}/article`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article: html }),
    });

    if (res.ok) {
      toast.success("Bài viết đã lưu");
    } else {
      toast.error("Lỗi khi lưu bài viết");
    }
  };

  if (loading || !editor) return <p>Đang tải...</p>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        Chỉnh sửa bài viết sản phẩm
      </h1>
      <div className="mb-4 rounded border bg-white p-4 shadow">
        <EditorContent editor={editor} />
      </div>
      <Button onClick={handleSave}>Lưu</Button>
    </div>
  );
}
