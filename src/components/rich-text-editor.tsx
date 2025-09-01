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
  Maximize,
  Minimize,
} from "lucide-react";
import { FontSize } from "@/lib/extensions/font-size";
import { TextStyle } from "@tiptap/extension-text-style";
import { useState, useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

function getCurrentFontSize(editor: Editor | null): string {
  if (!editor) return "16px";

  // Ưu tiên textStyle mark
  const textStyleSize = editor.getAttributes("textStyle")?.fontSize;
  if (textStyleSize) return textStyleSize;

  // Nếu selection là heading
  if (editor.isActive("heading")) {
    const headingSize = editor.getAttributes("heading")?.fontSize;
    if (headingSize) return headingSize;
  }

  // Nếu selection là paragraph
  if (editor.isActive("paragraph")) {
    const paraSize = editor.getAttributes("paragraph")?.fontSize;
    if (paraSize) return paraSize;
  }

  // fallback mặc định
  return "16px";
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
  const MAX_IMAGE_WIDTH = 1024;

  const resizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (file.size <= MAX_IMAGE_SIZE) {
        resolve(file);
        return;
      }

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = MAX_IMAGE_WIDTH / img.width;
        canvas.width = MAX_IMAGE_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress and check size
        canvas.toBlob(
          async function process(blob) {
            if (!blob) return resolve(file);

            if (blob.size <= MAX_IMAGE_SIZE) {
              const resizedFile = new File([blob], file.name, {
                type: "image/jpeg",
              });
              return resolve(resizedFile);
            }

            // If still larger than 1MB, reduce quality
            let quality = 0.7;
            const tryCompress = () => {
              canvas.toBlob(
                (compressedBlob) => {
                  if (compressedBlob && compressedBlob.size <= MAX_IMAGE_SIZE) {
                    const finalFile = new File([compressedBlob], file.name, {
                      type: "image/jpeg",
                    });
                    resolve(finalFile);
                  } else if (quality > 0.3) {
                    quality -= 0.1;
                    tryCompress();
                  } else {
                    // Can't compress further, use final version
                    const finalFile = new File([compressedBlob!], file.name, {
                      type: "image/jpeg",
                    });
                    resolve(finalFile);
                  }
                },
                "image/jpeg",
                quality,
              );
            };

            tryCompress();
          },
          "image/jpeg",
          0.8,
        );
      };
    });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

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
        style: "font-size: 18px;",
      },
    },
  });

  const currentSize = getCurrentFontSize(editor);

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

  function toggleHeadingLevel(level: number) {
    if (!editor) return;
    const isActive = editor.isActive("heading", { level });
    if (isActive) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().setNode("heading", { level }).run();
    }
  }

  const FONT_SIZES = ["12px", "14px", "16px", "18px", "24px", "32px"];

  return (
    <>
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      <div
        className={`border-muted bg-background overflow-visible rounded-xl border ${isFullscreen ? "fixed inset-4 z-50 flex flex-col shadow-2xl" : ""} `}
      >
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
                <span className="text-sm font-medium">{currentSize}</span>
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
            onClick={() => toggleHeadingLevel(1)}
          >
            <Heading1 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={isHeadingLevelActive(editor, 2) ? "default" : "ghost"}
            size="sm"
            onClick={() => toggleHeadingLevel(2)}
          >
            <Heading2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={isHeadingLevelActive(editor, 3) ? "default" : "ghost"}
            size="sm"
            onClick={() => toggleHeadingLevel(3)}
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

          <Button
            type="button"
            variant={isFullscreen ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="ml-auto"
            title={
              isFullscreen
                ? "Thoát chế độ toàn màn hình (Esc)"
                : "Chế độ toàn màn hình"
            }
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>

        {showImageUrlDialog && (
          <Dialog
            open={showImageUrlDialog}
            onOpenChange={setShowImageUrlDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm hình ảnh bằng URL</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-url" className="mb-2">
                    URL hình ảnh
                  </Label>
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
        <div
          className={`editor-wrapper focus-within:border-black-500 focus-within:ring-black-400 cursor-text rounded-b-lg border border-gray-300 transition focus-within:ring-1 ${isFullscreen ? "flex-1 overflow-y-scroll rounded-none border-0" : "min-h-[200px]"} `}
          onClick={() => editor.chain().focus().run()}
        >
          <EditorContent
            editor={editor}
            className={`w-full overflow-y-auto ${isFullscreen ? "h-full" : "h-[400px] sm:h-[600px]"} `}
          />
          {showImageUploader && (
            <div className="border-muted bg-muted/30 mt-4 rounded-md border border-dashed p-4">
              <Label className="mb-2 block text-sm font-medium">
                Chọn ảnh từ máy
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    const resizedFile = await resizeImage(file);

                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const result = reader.result as string;
                      editor.chain().focus().setImage({ src: result }).run();
                      setShowImageUploader(false);
                    };
                    reader.readAsDataURL(resizedFile);
                  } catch (error) {
                    console.error("Error resizing image:", error);
                    // Fallback to original file if resize fails
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const result = reader.result as string;
                      editor.chain().focus().setImage({ src: result }).run();
                      setShowImageUploader(false);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <p className="text-muted-foreground mt-2 text-xs">
                Ảnh sẽ được tự động nén nếu lớn hơn 1MB và thu nhỏ về tối đa{" "}
                {MAX_IMAGE_WIDTH}px chiều rộng
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
