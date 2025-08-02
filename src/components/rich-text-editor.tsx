"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ImageIcon,
  YoutubeIcon,
  LinkIcon,
  Check,
} from "lucide-react";
import { FontSize } from "@/lib/extensions/font-size";
import { TextStyle } from "@tiptap/extension-text-style";
import { useState, useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Bắt đầu viết...",
}: RichTextEditorProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
    const [showImageUrlDialog, setShowImageUrlDialog] = useState(false);
    const [showImageUploader, setShowImageUploader] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, // ✅ Thêm dòng này
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "rounded bg-muted p-4 font-mono text-sm",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 pl-4 italic text-muted-foreground border-muted",
          },
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextStyle,
      FontSize.configure({
        types: ["textStyle", "paragraph", "heading"],
      }),
      ImageResize,

      Youtube.configure({
        width: 640,
        height: 480,
        HTMLAttributes: {
          class: "rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
    ],

    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral prose-sm !max-w-none text-left " +
          "prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl " +
          "prose-p:my-2 prose-li:my-1 prose-h1:my-4 prose-h2:my-3 prose-h3:my-2 prose-blockquote:my-3 " +
          "prose-img:rounded-lg " +
          "prose-code:bg-muted prose-code:px-1.5 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none " +
          "prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 " +
          "focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  const currentSize = editor?.getAttributes("textStyle")?.fontSize || "16px";

  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!editor) return;

    const update = () => forceUpdate({});
    editor.on("transaction", update);
    return () => {
      editor.off("transaction", update);
    };
  }, [editor]);


  if (!editor) {
    return null;
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
    }
  };

  const addYoutube = () => {
    if (youtubeUrl) {
      editor.commands.setYoutubeVideo({
        src: youtubeUrl,
        width: 640,
        height: 480,
      });
      setYoutubeUrl("");
    }
  };

  const addLink = () => {
    if (linkUrl) {
      if (linkText) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${linkUrl}">${linkText}</a>`)
          .run();
      } else {
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }
      setLinkUrl("");
      setLinkText("");
    }
  };

function isMarkActive(editor: Editor, markType: string): boolean {
  return editor.isActive(markType);
}


  function isHeadingLevelActive(editor: Editor, level: number): boolean {
    return editor.isActive("heading", { level });
  }

  const FONT_SIZES = ["12px", "14px", "16px", "18px", "24px", "32px"];
  
  return (
    <div className="border-muted bg-background overflow-hidden rounded-lg border shadow-sm">
      {/* Toolbar */}
      <div className="border-muted bg-muted/50 flex flex-wrap items-center gap-1 rounded-t-lg border-b p-2">
        {/* Text Formatting */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="min-w-[80px] justify-between rounded-md bg-gray-100 px-3 hover:bg-gray-200"
            >
              <span className="text-sm font-medium">
                {currentSize || "16px"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1 h-4 w-4 opacity-60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-[140px]">
            {FONT_SIZES.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => {
                  editor.chain().setFontSize(size).run();
                  setTimeout(() => {
                    editor.commands.focus();
                  }, 300);
                }}
                className="flex cursor-pointer items-center justify-between text-sm"
              >
                <span>{size}</span>
                {currentSize === size && (
                  <Check className="text-primary h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          variant={isMarkActive(editor, "bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={isMarkActive(editor, "italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={isMarkActive(editor, "underline") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={isMarkActive(editor, "strike") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        {/* Headings */}
        <Button
          type="button"
          variant={isHeadingLevelActive(editor, 1) ? "default" : "ghost"}
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={isHeadingLevelActive(editor, 2) ? "default" : "ghost"}
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={isHeadingLevelActive(editor, 3) ? "default" : "ghost"}
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        {/* Lists */}
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        {/* Alignment */}
        <Button
          type="button"
          variant={
            ((editor.isActive("paragraph") || editor.isActive("heading")) &&
              !editor.getAttributes("paragraph").textAlign &&
              !editor.getAttributes("heading").textAlign) ||
            editor.isActive({ textAlign: "left" })
              ? "default"
              : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        {/* Media */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowImageUrlDialog(true)}>
              Thêm bằng URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowImageUploader(true)}>
              Tải ảnh lên
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <YoutubeIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm video YouTube</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="youtube-url" className="mb-2">
                  URL YouTube
                </Label>
                <Input
                  id="youtube-url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <Button onClick={addYoutube} className="w-full">
                Thêm video
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm liên kết</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="link-url" className="mb-2">
                  URL
                </Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="link-text" className="mb-2">
                  Văn bản hiển thị (tùy chọn)
                </Label>
                <Input
                  id="link-text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Nhấp vào đây"
                />
              </div>
              <Button onClick={addLink} className="w-full">
                Thêm liên kết
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      {showImageUrlDialog && (
        <Dialog open={showImageUrlDialog} onOpenChange={setShowImageUrlDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm hình ảnh bằng URL</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-url">URL hình ảnh</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <Button
                onClick={() => {
                  addImage();
                  setShowImageUrlDialog(false);
                }}
                className="w-full"
              >
                Thêm hình ảnh
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="h-[400px] w-full overflow-y-auto sm:h-[600px]"
      />
      {showImageUploader && (
        <div className="border-muted bg-muted/30 mt-4 rounded-md border border-dashed p-4">
          <Label className="mb-2 block text-sm font-medium">
            Chọn ảnh từ máy
          </Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                editor.chain().focus().setImage({ src: result }).run();
                setShowImageUploader(false);
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>
      )}
    </div>
  );
}
