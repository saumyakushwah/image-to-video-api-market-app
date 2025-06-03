"use client";

import { useEffect, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import {
  uploadImage,
  getUploadStatus,
  generateVideoFromImage,
} from "../lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HistoryPanel from "@/components/HistoryPanel";

type Status =
  | ""
  | "uploading"
  | "uploaded"
  | "failed"
  | "timeout"
  | "error"
  | "generating"
  | "done"
  | "processing"
  | "in_queue"
  | "in_progress"
  | "completed";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [, setUploadId] = useState("");
  const [status, setStatus] = useState<Status>("");
  const [userPrompt, setUserPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedKey = localStorage.getItem("magic_api_key");
    if (!storedKey) {
      const inputKey = window.prompt("Enter your MagicAPI Key");
      if (inputKey) {
        localStorage.setItem("magic_api_key", inputKey);
        setApiKey(inputKey);
      }
    } else {
      setApiKey(storedKey);
    }
  }, []);

  // useEffect(() => {
  //   if (selectedImage && apiKey) {
  //     setError("");
  //     setStatus("uploading");
  //     setVideoUrl("");

  //     uploadImage(selectedImage, apiKey)
  //       .then((res) => {
  //         setImageUrl(res.url);
  //         setStatus("uploaded");
  //       })
  //       .catch(() => {
  //         setError("Upload failed.");
  //         setStatus("error");
  //       });
  //   }
  // }, [selectedImage, apiKey]);

  const handleImageSelected = async (file: File) => {
    setSelectedImage(file);
    setError("");
    setStatus("uploading");
    setVideoUrl("");

    try {
      const res = await uploadImage(file, apiKey);
      setImageUrl(res.url);
      setStatus("uploaded");
    } catch {
      setError("Upload failed.");
      setStatus("error");
    }
  };

  const handleGenerateVideo = async () => {
    if (!userPrompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    try {
      setError("");
      setStatus("generating");

      const result = await generateVideoFromImage(imageUrl, userPrompt, apiKey);
      setUploadId(result.id);
      pollStatus(result.id);
    } catch {
      setError("Video generation failed to start");
      setStatus("error");
    }
  };

  const pollStatus = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 40;

    const interval = setInterval(async () => {
      try {
        const res = await getUploadStatus(id, apiKey);

        setStatus(res.status.toLowerCase() as Status);

        if (res.status === "IN_QUEUE" || res.status === "IN_PROGRESS") {
          // Just wait and show current status
          return;
        }

        if (res.status === "COMPLETED") {
          const outputUrl = res.output?.output?.[0]; // video URL

          if (outputUrl) {
            clearInterval(interval);
            setVideoUrl(outputUrl);
            saveToHistory(imageUrl, outputUrl, userPrompt);
            setStatus("done");
          } else {
            clearInterval(interval);
            setStatus("failed");
            setError("Completed but no video URL found.");
          }
          return;
        }

        if (res.status === "FAILED") {
          clearInterval(interval);
          setStatus("failed");
          setError("Video generation failed.");
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setStatus("timeout");
          setError("Video generation timed out.");
        }
      } catch (err: unknown) {
        clearInterval(interval);

        if (err instanceof Error) {
          setError("Status check failed");
          setStatus(err.message.toLowerCase() as Status);
        } else {
          setError("Status check failed");
          setStatus("error");
        }
      }
    }, 15000); // 15 sec poll
  };

  const saveToHistory = (image: string, video: string, prompt: string) => {
    const prev = JSON.parse(localStorage.getItem("history") || "[]");
    const updated = [...prev, { image, video, prompt, timestamp: Date.now() }];
    localStorage.setItem("history", JSON.stringify(updated));
  };

  return (
    <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <Card>
        <CardContent className="py-6 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center sm:text-left">
            Image to Video Generator
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 text-center sm:text-left">
            Upload an image, provide a prompt, and generate a short video using
            MagicAPI.
          </p>

          <ImageUploader
            // onImageSelected={setSelectedImage}
            onImageSelected={handleImageSelected}
          />

          {selectedImage && (
            <p className="text-sm text-muted-foreground mt-2 text-center sm:text-left">
              Selected: {selectedImage.name}
            </p>
          )}

          {(status === "uploading" || status === "processing") && (
            <p className="text-blue-500 mt-4 text-center sm:text-left">
              Uploading image...
            </p>
          )}

          {status === "uploaded" && (
            <div className="space-y-3 mt-6 sm:flex sm:items-end sm:space-y-0 sm:space-x-4">
              <Label htmlFor="prompt">Prompt</Label>
              <Input
                id="prompt"
                className="w-full sm:flex-1"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g. A cat flying through space"
                disabled={(status as Status) === "generating"}
              />
              <Button
                className="w-full sm:w-auto"
                onClick={handleGenerateVideo}
                disabled={
                  (status as Status) === "generating" || !userPrompt.trim()
                }
              >
                {(status as Status) === "generating"
                  ? "Generating..."
                  : "Generate Video"}
              </Button>
            </div>
          )}

          {status === "generating" && !videoUrl && (
            <p className="text-blue-500 mt-4 text-center sm:text-left">
              Generating video...
            </p>
          )}

          {videoUrl && (
            <video controls className="w-full rounded border mt-6" playsInline>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {status && (
            <p className="text-blue-500 mt-4 text-center sm:text-left capitalize">
              Status: {status.replace(/_/g, " ")}
            </p>
          )}
          {status === "failed" && (
            <Alert variant="destructive" className="mt-4 text-sm sm:text-base">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <HistoryPanel />
    </main>
  );
}
