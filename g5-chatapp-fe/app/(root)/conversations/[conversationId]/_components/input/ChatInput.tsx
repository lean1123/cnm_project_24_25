"use client";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CirclePlus,
  // File,
  FileArchive,
  FileAudio,
  FileUp,
  FileVideo,
  FormInput,
  Image,
  SendHorizonal,
  Smile,
  ThumbsUp,
  Video,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/store/useConversationStore";
import EmojiPicker from "emoji-picker-react";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {};

const chatMessageSchema = z.object({
  content: z.string(),
  files: z
    .array(z.instanceof(File))
    .max(5) // Giới hạn số lượng file
    .optional(),
});

const ChatInput = (props: Props) => {
  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  const [filePreviews, setFilePreviews] = useState<
    { file: File; preview?: string }[]
  >([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const { user } = useAuthStore();
  const { selectedConversation, addTempMessage, sendMessage } =
    useConversationStore();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const generateMessageTemp = (type: string, url: string, fileName: string) => {
    return {
      _id: "temp",
      sender: {
        _id: user?.id || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        avatar: user?.avatar || "",
        id: user?.id || "",
        email: user?.email || "",
      },
      conversation: selectedConversation?._id || "",
      content: form.getValues("content") || "",
      createdAt: new Date().toISOString(),
      type: type,
      files: [
        {
          fileName: fileName || "",
          url: url || "",
        },
      ],
      isTemp: true,
      deletedFor: [],
      isRevoked: false,
      forwardFrom: null,
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSubmit = (data: z.infer<typeof chatMessageSchema>) => {
    const files = data.files || []; // Lấy files từ form
    const hasText = data.content.trim() !== "";
    const hasFiles = files.length > 0;

    if (!hasText && !hasFiles) return;

    const mediaFiles = files.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    const otherFiles = files.filter(
      (file) =>
        !file.type.startsWith("image/") && !file.type.startsWith("video/")
    );

    if (hasText || mediaFiles.length > 0 || otherFiles.length <= 1) {
      sendMessage({ ...data, files });

      let preview = "";
      let fileName = "";

      if (mediaFiles.length > 0) {
        const firstMedia = mediaFiles[0];
        const previewInfo = filePreviews.find((fp) => fp.file === firstMedia);
        preview = previewInfo?.preview || "";
        fileName = firstMedia.name || "";
      }

      const tempMessage = generateMessageTemp(
        mediaFiles.length > 0 ? "IMAGE" : "TEXT",
        preview,
        fileName
      );

      addTempMessage(tempMessage);
      console.log("Sent message:", tempMessage);
    } else {
      otherFiles.forEach((file, index) => {
        sendMessage({ content: "", files: [file] });
        const tempMessage = generateMessageTemp(
          "FILE",
          filePreviews[index].preview || "",
          file.name
        );
        addTempMessage(tempMessage);
      });
    }
    form.reset({ content: "", files: [] });
    setFilePreviews([]);
  };

  const handleInputChange = (event: any) => {
    const { value, selectionStart } = event.target;
    if (selectionStart !== null) {
      form.setValue("content", value);
    }
  };

  const readFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) return resolve(undefined);
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const addFilesWithPreview = async (files: File[]) => {
    const newPreviews = await Promise.all(
      files.map(async (file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? await readFilePreview(file)
          : file.type.startsWith("video/")
          ? URL.createObjectURL(file)
          : undefined,
      }))
    );

    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      addFilesWithPreview(Array.from(files));
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();

    const items = e.clipboardData.items;
    const files: File[] = [];
    let pasteText = "";

    for (const item of items) {
      // Xử lý ảnh từ Snip & Sketch
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          // Tạo file với tên và type chính xác
          const file = new File([blob], `screenshot-${Date.now()}.png`, {
            type: "image/png",
          });
          files.push(file);
        }
      }
      // Xử lý trường hợp copy từ ứng dụng khác
      else if (item.kind === "string" && item.type === "text/html") {
        const html = await new Promise<string>((resolve) =>
          item.getAsString(resolve)
        );
        const imgSrc = html.match(/<img[^>]+src="([^">]+)"/)?.[1];
        if (imgSrc?.startsWith("data:image")) {
          const file = dataURLtoFile(imgSrc, `screenshot-${Date.now()}.png`);
          files.push(file);
        }
      }
      else if (item.kind === "string" && item.type === "text/plain") {
        pasteText = await new Promise<string>((resolve) =>
          item.getAsString(resolve)
        );
      }
    }

    if (files.length > 0) {
      await addFilesWithPreview(files);
    }
    if (pasteText) {
      form.setValue("content", pasteText);
    }
  };

  // Hàm chuyển data URL thành File
  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  useEffect(() => {
    form.setValue(
      "files",
      filePreviews.map((fp) => fp.file)
    );
  }, [filePreviews, form]);

  useEffect(() => {
    return () => {
      // Dọn dẹp object URLs
      filePreviews.forEach((preview) => {
        if (preview.preview) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, [filePreviews]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFilePreviews((prev) => [
        ...prev,
        ...newFiles.map((file) => ({ file, preview: undefined })),
      ]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      addFilesWithPreview(Array.from(files));
    }
  };

  const watchedContent = form.watch("content");
  const watchedFiles = form.watch("files");
  const hasText = watchedContent?.trim().length > 0;
  const hasFiles = watchedFiles && watchedFiles.length > 0;

  const handleLike = () => {
    // Xử lý sự kiện khi nhấn nút "Like"
    sendMessage({
      content: "👍",
    });
    console.log("Liked!");
  };

  const [isOpenOptions, setIsOpenOptions] = React.useState(false);
  return (
    <Card className="w-full p-2 rounded-lg relative flex flex-col gap-2">
      <div
        className={cn(
          "flex justify-between border-b pb-1",
          isOpenOptions ? "" : "hidden"
        )}
      >
        <div className="flex gap-2">
          <Button
            disabled={false}
            size={"icon"}
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          >
            <FileUp />
          </Button>
          <Button
            disabled={false}
            size={"icon"}
            type="button"
            onClick={() => {
              if (imageInputRef.current) {
                imageInputRef.current.click();
              }
            }}
          >
            <Image />
          </Button>
          <Button
            disabled={false}
            size={"icon"}
            type="button"
            onClick={() => {
              if (videoInputRef.current) {
                videoInputRef.current.click();
              }
            }}
          >
            <FileVideo />
          </Button>
        </div>
        <div>
          <Button
            disabled={false}
            size={"icon"}
            type="button"
            variant={"outline"}
            onClick={() => setIsOpenOptions(false)}
          >
            <X />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex gap-2 items-end w-full"
          >
            {/* tạo dialog cho chọn option như file, hình ảnh */}
            <Button
              disabled={isOpenOptions}
              size={"icon"}
              type="button"
              onClick={() => setIsOpenOptions(!isOpenOptions)}
              className={cn("", isOpenOptions ? "hidden" : "")}
            >
              <CirclePlus />
            </Button>
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              multiple
            />
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={handleVideoChange}
              multiple
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => {
                return (
                  <FormItem className="w-full">
                    <FormControl>
                      <TextareaAutosize
                        onKeyDown={async (e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            await form.handleSubmit(handleSubmit)();
                          }
                        }}
                        onPaste={(e) => handlePaste(e)}
                        rows={1}
                        maxRows={3}
                        {...field}
                        onChange={handleInputChange}
                        onClick={handleInputChange}
                        placeholder="Type a message..."
                        className="min-h-[36px] w-full resize-none border-0 outline-0 placeholder:text-muted-foreground p-1.5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <Button
              type="button"
              variant={"ghost"}
              size={"icon"}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="size-4" />
            </Button>

            {hasText || hasFiles ? (
              <Button disabled={false} size={"icon"} type="submit">
                <SendHorizonal />
              </Button>
            ) : (
              <Button
                type="button"
                size={"icon"}
                variant={"ghost"}
                onClick={() => handleLike()}
              >
                <ThumbsUp className="size-4" />
              </Button>
            )}
          </form>
        </Form>
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 right-0 z-50">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                const current = form.getValues("content");
                form.setValue("content", current + emojiData.emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}

        {filePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2 w-full absolute -top-24 left-0 p-2 bg-white rounded-lg shadow-lg ">
            {filePreviews.map((file, index) => {
              const isImage = file.file.type.startsWith("image/");
              const isVideo = file.file.type.startsWith("video/");
              const fileName = file.file.name;
              const fileSizeKB = (file.file.size / 1024).toFixed(1); // KB
              const fileExtension = file.file.name
                .split(".")
                .pop()
                ?.toUpperCase();

              return (
                <div key={index} className="relative">
                  {isImage ? (
                    <img
                      src={file.preview}
                      alt={`preview-${index}`}
                      className="size-20 object-cover rounded-lg border"
                    />
                  ) : isVideo ? (
                    <video
                      src={file.preview}
                      className="size-20 object-cover rounded-lg border"
                      controls={false}
                      muted
                    >
                      <track kind="captions" />
                    </video>
                  ) : (
                    <div
                      title={fileName}
                      className="w-36 p-2 border rounded-lg bg-muted text-sm text-left flex flex-col gap-1 justify-between overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <FileUp className="w-6 h-6 text-primary shrink-0" />
                        <span className="text-xs font-medium truncate w-full">
                          {fileName}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{fileExtension}</span>
                        <span>{fileSizeKB} KB</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="absolute -top-1.5 -right-1.5 size-5 bg-white rounded-full flex items-center justify-center text-red-500 shadow"
                    onClick={() => {
                      setFilePreviews((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChatInput;
