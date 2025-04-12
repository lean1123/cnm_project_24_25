"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

type ImageInfo = {
  url: string;
  fileName: string;
};

type Size = {
  width: number;
  height: number;
};

type ImageGalleryProps = {
  images: ImageInfo[];
  sizes?: Size[];
  content?: string;
};

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  sizes = [],
  content,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);

  const handleClick = (img: ImageInfo) => {
    setSelectedImage(img);
  };

  const renderImages = () => {
    const count = images.length;

    const ImageItem = (img: ImageInfo, i: number) => (
      <img
        key={i}
        src={img.url}
        alt={img.fileName}
        onClick={() => handleClick(img)}
        className="rounded-lg object-cover border w-full h-36 cursor-pointer hover:brightness-90 transition"
      />
    );

    if (count === 1) {
      return (
        <img
          src={images[0].url}
          alt={images[0].fileName}
          onClick={() => handleClick(images[0])}
          className="rounded-lg object-cover border w-full max-w-md cursor-pointer hover:brightness-90 transition"
        />
      );
    }

    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img, i) => ImageItem(img, i))}
        </div>
      );
    }

    if (count === 3) {
      return (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            {images.slice(0, 2).map((img, i) => ImageItem(img, i))}
          </div>
          {ImageItem(images[2], 2)}
        </div>
      );
    }

    // 4 ảnh trở lên
    return (
      <div className="grid grid-cols-2 gap-2">
        {images.map((img, i) => ImageItem(img, i))}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {renderImages()}
        {content && (
          <p className="text-wrap break-words whitespace-pre-wrap mt-2">
            {content}
          </p>
        )}
      </div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none [&>button[data-dialog-close]]:hidden">
          <DialogTitle>
            {/* <VisuallyHidden>Image preview</VisuallyHidden> */}
          </DialogTitle>
          <DialogClose className="absolute top-2 right-2 text-white bg-black hover:bg-black/80 rounded-full p-1 transition">
            <X className="w-5 h-5" />
          </DialogClose>
          {selectedImage && (
            <img
              src={selectedImage.url}
              alt={selectedImage.fileName}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
