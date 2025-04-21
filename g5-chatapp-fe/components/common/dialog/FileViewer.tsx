"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useConversationStore } from "@/store/useConversationStore";
import { useMessageStore } from "@/store/useMessageStore";
import { Eye } from "lucide-react";
import mammoth from "mammoth";
import { useEffect, useState } from "react";

interface FileViewerDialogProps {
  fileUrl: string | null;
  fileName: string | null;
}

export function FileViewerDialog({
  fileUrl, // URL của file
  fileName, // Tên file
}: FileViewerDialogProps) {
  // const { fileView } = useMessageStore();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Xác định loại file từ URL
  const isPdf = fileUrl?.toLowerCase().endsWith(".pdf");
  const isDocx = fileUrl?.toLowerCase().endsWith(".docx");

  // Xử lý file DOCX bằng mammoth.js
  useEffect(() => {
    if (isDocx && fileUrl) {
      setIsLoading(true);
      async function loadDocx() {
        try {
          const response = await fetch(fileUrl || "");
          if (!response.ok) throw new Error("Failed to fetch DOCX file");
          const arrayBuffer = await response.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setContent(result.value);
        } finally {
          setIsLoading(false);
        }
      }
      loadDocx();
    }
  }, [isDocx, fileUrl]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" className="text-sm text-gray-600 hover:text-blue-600"
                      title="Xem trước"
                      variant="link">
          <Eye className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[80vw] max-w-none h-[100vh] p-0 overflow-hidden">
        {" "}
        {/* Adjusted width */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <DialogTitle className="text-base font-semibold">
              File view
            </DialogTitle>
          </div>

          {/* File Content */}
          <div className="flex-1 overflow-auto p-4">
            {isLoading && <p>Loading...</p>}
            {!fileUrl && !isLoading && <p>No file selected.</p>}
            {isPdf && fileUrl && (
              <iframe
                src={fileUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="PDF Viewer"
              />
            )}
            {isDocx && !isLoading && content && (
              <div
                className="prose max-w-none overflow-auto h-full"
                dangerouslySetInnerHTML={{ __html: content }}
                style={{ maxHeight: "calc(100vh - 150px)" }} // Adjust height for scroll
              />
            )}

            {!isPdf && !isDocx && fileUrl && (
              <p className="text-red-500">Unsupported file format.</p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="bg-gray-50 px-4 py-3 border-t flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={() => {}}>Save</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
