"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  DragEvent,
  ChangeEvent,
} from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
}

export default function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageSelected = useCallback(
    (file: File) => {
      onImageSelected(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    },
    [onImageSelected]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleImageSelected(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
      }
    },
    [handleImageSelected]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelected(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pt-4 px-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 rounded-md p-6 w-full min-h-[180px] flex flex-col items-center justify-center cursor-pointer transition-colors text-center ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onClick={() => document.getElementById("fileInput")?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            document.getElementById("fileInput")?.click();
          }
        }}
      >
        <Label className="mb-2 text-sm sm:text-base">Upload Image</Label>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
          Drag and drop an image here, or click to select a file
        </p>
        <Button
          variant="outline"
          className="hover:bg-blue-100"
        >
          Select Image
        </Button>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {previewUrl && (
        <div
          className="relative w-full h-64 mt-4 rounded-md overflow-hidden border border-gray-300 sm:h-72 md:h-80"
        >
          <Image
            src={previewUrl}
            alt="Image preview"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      )}
    </div>
  );
}
