"use client";
import React, { useState } from "react";

export default function FilePage() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
      setFileName(selectedFile.name);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Xem tài liệu từ máy</h1>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="block"
      />

      {fileUrl && fileName?.endsWith(".pdf") && (
        <div className="mt-4 space-y-2">
          <p className="font-medium">Đang xem: {fileName}</p>
          <iframe
            src={fileUrl}
            width="100%"
            height="800"
            className="rounded border"
          ></iframe>
        </div>
      )}

      {fileUrl && !fileName?.endsWith(".pdf") && (
        <div className="mt-4 space-y-2">
          <p className="font-medium">Đang xem: {fileName}</p>
          {/* Sử dụng Google Docs Viewer cho file DOCX */}
          <iframe
            src={fileUrl}
            width="100%"
            height="800"
            className="rounded border"
          ></iframe>
        </div>
      )}
    </div>
  );
}
