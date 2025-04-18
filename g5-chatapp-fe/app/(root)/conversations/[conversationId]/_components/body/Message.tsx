import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import type { Message, MessageFile } from "@/types";
import { timeStamp } from "console";
import React, { useEffect, useState } from "react";
import {
  File,
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  FileAudio,
  FileVideo,
  FileImage,
  FileType,
  Download,
  Repeat,
  MessageSquareText,
  Forward,
  CheckCheck,
  Heart,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ImageGallery from "./ImageGallery";
import ForwardMessageDialog from "@/components/common/dialog/ForwardMessageDialog";
import { MessageOption } from "./MessageOption";
import { useAuthStore } from "@/store/useAuthStore";
import { useConversationStore } from "@/store/useConversationStore";

type Props = {
  message: Message | null;
  fromCurrentUser: boolean;
  senderImage: string;
  file?: MessageFile[];
  senderName: string;
  lastByUser: boolean;
  content: string;
  createdAt: string;
  type: string;
  isTemp?: boolean;
  isError?: boolean;
  isLastMessage?: boolean;
};

const Message = ({
  fromCurrentUser,
  senderImage,
  file,
  senderName,
  lastByUser,
  content,
  createdAt,
  type,
  isTemp,
  isError,
  message,
  isLastMessage,
}: Props) => {
  const formatTime = (timeStamp: number) => {
    const date = new Date(timeStamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "pdf":
        return <FileText className="size-10 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="size-10 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="size-10 text-green-500" />;
      case "zip":
      case "rar":
        return <FileArchive className="size-10 text-yellow-500" />;
      case "mp3":
      case "wav":
        return <FileAudio className="size-10 text-indigo-500" />;
      case "mp4":
      case "mov":
        return <FileVideo className="size-10 text-purple-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="size-10 text-pink-500" />;
      case "js":
      case "ts":
      case "json":
      case "html":
      case "css":
        return <FileCode className="size-10 text-cyan-500" />;
      default:
        return <File className="size-10 text-muted-foreground" />;
    }
  };

  const [imageSizes, setImageSizes] = useState<
    { width: number; height: number }[]
  >([]);

  useEffect(() => {
    if (type === "IMAGE" && file) {
      const promises = file.map(
        (img) =>
          new Promise<{ width: number; height: number }>((resolve) => {
            const i = new window.Image();
            i.src = img.url;
            i.onload = () => {
              resolve({ width: i.naturalWidth, height: i.naturalHeight });
            };
          })
      );

      Promise.all(promises).then((sizes) => {
        setImageSizes(sizes);
      });
    }
  }, [file, type]);

  const [isHovered, setIsHovered] = useState(false);

  // check message is deleted
  const { user } = useAuthStore();

  const checkDeletedMessage = (message: Message | null) => {
    if (!message) return false;
    if (message.deletedFor && message.deletedFor.length > 0) {
      return message.deletedFor.includes(user?._id);
    }
    return false;
  };

  const isDeleted = checkDeletedMessage(message);
  // const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    if (!isDropdownOpen) setIsHovered(false);
  };

  const { reactionMessage, unReactionMessage } = useConversationStore();

  return (
    <div
      className={cn("flex items-end gap-2", {
        "flex-row-reverse": fromCurrentUser,
      })}
    >
      <Avatar
        className={cn("relative w-8 h-8 flex-shrink-0", {
          // "order-2": fromCurrentUser,
          // "order-1": !fromCurrentUser,
          invisible: lastByUser,
        })}
      >
        <AvatarImage src={senderImage || "/avatar.png"} alt={senderName} />
        <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
      </Avatar>
      {/* chat content */}
      <div
        className="relative group"
        // onMouseEnter={() => setIsHovered(true)}
        // onMouseLeave={() => setIsHovered(false)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={cn("group", {
            // "order-1 items-end": fromCurrentUser,
            // "order-2 items-start": !fromCurrentUser,
          })}
        >
          {message && message.forwardFrom && (
            <div
              className={cn(
                "flex gap-2 z-10 text-foreground text-xs",
                fromCurrentUser ? "-top-8 right-1" : "-top-8 left-1"
              )}
            >
              <Forward className="size-4" /> Message is forwarded
            </div>
          )}

          <div
            className={cn("relative px-4 py-2 rounded-lg ", {
              "bg-secondary text-secondary-foreground": fromCurrentUser,
              "bg-muted text-mute-foreground": !fromCurrentUser,
              "rounded-br-none": !lastByUser && fromCurrentUser,
              "rounded-bl-none": !lastByUser && !fromCurrentUser,
            })}
          >
            {!message?.isRevoked && type === "TEXT" ? (
              <p className="text-wrap break-words whitespace-pre-wrap sm:max-w-[2200px] md:max-w-[550px] lg:max-w-[400px] xl:max-w-[600px]">
                {content}
              </p>
            ) : null}
            {!message?.isRevoked && type === "IMAGE" && file && (
              <ImageGallery
                images={file}
                sizes={imageSizes}
                content={content}
              />
            )}
            {!message?.isRevoked && type === "FILE" && file && (
              <div className="flex flex-col gap-2">
                {file.map((file, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {getFileIcon(file.fileName)}
                    <Button
                      key={index}
                      onClick={() => {
                        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
                          file.url
                        )}`;
                        window.open(viewerUrl, "_blank", "noopener,noreferrer");
                      }}
                      variant={"link"}
                      className="flex items-center gap-2 p-2 transition-all max-w-[440px] text-left"
                    >
                      <span className="text-sm break-words line-clamp-2 text-foreground font-semibold">
                        {file.fileName}
                      </span>
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const response = await axios.get(file.url, {
                            responseType: "blob",
                            headers: {},
                          });

                          if (response.status !== 200) {
                            console.error("Failed to download file");
                            return;
                          }

                          const blob = response.data; // Đã là Blob rồi
                          const url = window.URL.createObjectURL(blob);

                          const link = document.createElement("a");
                          link.href = url;
                          link.download = file.fileName;
                          document.body.appendChild(link);
                          link.click();
                          link.remove();

                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error("Download error", error);
                          toast.error(
                            "Tải xuống không thành công. Vui lòng thử lại."
                          );
                        }
                      }}
                      className="text-sm text-gray-600 hover:text-blue-600"
                      title="Tải xuống"
                      variant="link"
                    >
                      <Download className="size-10" />
                    </Button>
                  </div>
                ))}
                {content && (
                  <p className="text-wrap break-words whitespace-pre-wrap mt-2">
                    {content}
                  </p>
                )}
              </div>
            )}
            {!message?.isRevoked && type === "VIDEO" && file && (
              <div className="flex flex-col gap-2">
                {file.map((video, index) => (
                  <div key={index} className="">
                    <video
                      key={video.url}
                      controls
                      muted
                      className="rounded-lg max-w-full max-h-96 object-contain bg-black"
                    >
                      <source
                        src={video.url}
                        type={`video/${video.url.split(".").pop()}`}
                      />
                      Your browser does not support the video tag.
                    </video>

                    {/* Download button */}
                    {/* <div className="bottom-2 right-2 transition-opacity">
                    <Button
                      onClick={async () => {
                        try {
                          const response = await axios.get(video.url, {
                            responseType: "blob",
                          });

                          const blob = response.data;
                          const url = window.URL.createObjectURL(blob);

                          const link = document.createElement("a");
                          link.href = url;
                          link.download = video.fileName;
                          document.body.appendChild(link);
                          link.click();
                          link.remove();

                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error("Download error", error);
                          toast.error(
                            "Download not successful. Please try again."
                          );
                        }
                      }}
                      variant="secondary"
                      size="icon"
                      className="rounded-full shadow-lg"
                    >
                      <Download className="size-4" />
                    </Button>
                  </div> */}
                  </div>
                ))}
                {content && (
                  <p className="text-wrap break-words whitespace-pre-wrap mt-2">
                    {content}
                  </p>
                )}
              </div>
            )}
            {message && message?.isRevoked && (
              <div className="flex gap-2 text-gray-600">
                Message is recalled
              </div>
            )}
            <p
              className={cn("text-xs flex w-full my-1", {
                "text-secondary-foreground justify-end": fromCurrentUser,
                "text-muted-foreground justify-start": !fromCurrentUser,
              })}
            >
              {formatTime(new Date(createdAt).getTime())}
            </p>
            {isLastMessage && (
              <p className="absolute -bottom-4 right-1 text-muted-foreground flex w-full justify-end text-xs">
                <CheckCheck className="size-4" /> received
              </p>
            )}
          </div>
          {isTemp && !isError && (
            <p className="text-xs text-gray-500 italic">Sending...</p>
          )}
          {isTemp && isError && (
            <div className="flex items-center gap-2">
              <p className="text-xs text-red-500 italic">Error</p>
              <Button
                onClick={() => toast.error("Đã xảy ra lỗi")}
                variant="ghost"
                size="icon"
                className="rounded-full shadow-lg"
              >
                <Repeat className="size-2" />
              </Button>
            </div>
          )}
        </div>
        {message && message.reactions && message.reactions.length > 0 && (
          <div
            className={cn(
              "absolute -bottom-2 right-2 flex gap-1 z-20 bg-background rounded-full shadow-md p-1",
              {
                "right-auto left-2": fromCurrentUser, // Hiển thị bên trái nếu là user hiện tại
                "right-2": !fromCurrentUser, // Hiển thị bên phải nếu không phải user hiện tại
              }
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full size-4 bg-background shadow-sm hover:bg-muted"
              onClick={(e) => {
                unReactionMessage(message!._id);
              }}
            >
              {message.reactions.map((reaction, index) => {
                return (
                  <span key={index} className="text-sm text-foreground">
                    {reaction.reaction}
                  </span>
                );
              })}
            </Button>
          </div>
        )}

        {isHovered && message?.reactions?.length === 0 && (
          <div
            className={cn(
              "absolute -bottom-2 right-2 flex gap-1 z-20 bg-background rounded-full shadow-md p-1",
              {
                "right-auto left-2": fromCurrentUser, // Hiển thị bên trái nếu là user hiện tại
                "right-2": !fromCurrentUser, // Hiển thị bên phải nếu không phải user hiện tại
              }
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full size-4 bg-background shadow-sm hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                reactionMessage(message!._id, "❤️");
              }}
            >
              <Heart className="size-4" />
            </Button>
          </div>
        )}

        {isHovered && (
          <div
            className={cn(
              "absolute -right-[110px] bottom-0 flex gap-1 z-20 bg-background rounded-full shadow-md p-1",
              {
                "right-auto -left-[110px]": fromCurrentUser, // Hiển thị bên trái nếu là user hiện tại
              }
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full size-8 bg-background shadow-sm hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                // Handle reply logic
              }}
            >
              <MessageSquareText className="size-4" />
            </Button>
            <ForwardMessageDialog messageToForward={message} />
            <MessageOption
              message={message!}
              setIsDropdownOpen={setIsDropdownOpen}
              setIsHovered={setIsHovered}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
