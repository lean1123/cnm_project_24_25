import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { MessageFile } from "@/types";
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
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ImageGallery from "./ImageGallery";

type Props = {
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
  return (
    <div className={cn("flex items-end", { "justify-end": fromCurrentUser })}>
      <div
        className={cn("flex flex-col w-full mx-2", {
          "order-1 items-end": fromCurrentUser,
          "order-2 items-start": !fromCurrentUser,
        })}
      >
        <div
          className={cn("px-4 py-2 rounded-lg max-w-[70%]", {
            "bg-secondary text-secondary-foreground": fromCurrentUser,
            "bg-muted text-mute-foreground": !fromCurrentUser,
            "rounded-br-none": !lastByUser && fromCurrentUser,
            "rounded-bl-none": !lastByUser && !fromCurrentUser,
          })}
        >
          {type === "TEXT" ? (
            <p className="text-wrap break-words whitespace-pre-wrap">
              {content}
            </p>
          ) : null}
          {type === "IMAGE" && file && (
            <ImageGallery images={file} sizes={imageSizes} content={content} />
          )}
          {type === "FILE" && file && (
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
          {type === "VIDEO" && file && (
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

          <p
            className={cn("text-xs flex w-full my-1", {
              "text-secondary-foreground justify-end": fromCurrentUser,
              "text-muted-foreground justify-start": !fromCurrentUser,
            })}
          >
            {formatTime(new Date(createdAt).getTime())}
          </p>
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

      <Avatar
        className={cn("relative w-8 h-8", {
          "order-2": fromCurrentUser,
          "order-1": !fromCurrentUser,
          invisible: lastByUser,
        })}
      >
        <AvatarImage src={senderImage} alt={senderName} />
        <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default Message;
