"use client";

import { useEffect, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import {
  uploadImage,
  getUploadStatus,
  generateVideoFromImage,
} from "../lib/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HistoryPanel from "@/components/HistoryPanel";
import GenerationForm from "@/components/GenerationForm";
import { DownloadIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export type GenerationFormData = {
  model: "1.3B" | "14B";
  resolution: "480p" | "720p";
  aspect_ratio: "auto" | "16:9" | "9:16" | "1:1";
  frames: 17 | 33 | 49 | 65 | 81;
  lora_style: string;
  lora_strength_model: number; // 0.0 to 2.0
  lora_strength_clip: number; // 0.0 to 2.0
  sample_steps: number; // 1 to 60
  sample_guide_scale: number; // 0.0 to 10.0
  [key: string]: string | number | undefined;
};

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
  const [, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [, setUploadId] = useState("");
  const [status, setStatus] = useState<Status>("");
  const [userPrompt, setUserPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  // const [delayTime, setDelayTime] = useState<number>(0);
  const [formData, setFormData] = useState<GenerationFormData>({
    model: "1.3B",
    resolution: "720p",
    aspect_ratio: "auto",
    frames: 17,
    lora_style: "",
    lora_strength_model: 1.0,
    lora_strength_clip: 1.0,
    sample_steps: 30,
    sample_guide_scale: 5.0,
  });

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

  const handleImageSelected = async (file: File | null) => {
    if (!file) {
      setSelectedImage(null);
      setImageUrl("");
      setStatus("");
      return;
    }

    setSelectedImage(file);
    setError("");
    setStatus("uploading");
    setVideoUrl("");

    try {
      const res = await uploadImage(file, apiKey);

      if (res.error) {
        setStatus("error");
        setError(res.error);
      } else {
        setImageUrl(res.url);
        setStatus("uploaded");
      }
    } catch () {
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

      const result = await generateVideoFromImage(
        imageUrl,
        userPrompt,
        apiKey,
        formData
      );
      setUploadId(result.id);
      // setDelayTime(result.delayTime);
      pollStatus(result.id);
    } catch () {
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
    <div className="w-full min-h-screen">
      <section className="text-center px-4 pt-8 pb-4">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
          LoRA AI Video Generator
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Generate stylized AI videos from your images using LoRA-powered
          fine-tuning and prompts.
        </p>
      </section>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full">
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Input</h2>
          <ImageUploader onImageSelected={handleImageSelected} />
          {status && (
            <p className="text-blue-500 mt-4 text-center sm:text-left capitalize">
              Status: {status.replace(/_/g, " ")}
            </p>
          )}
          {status === "error" && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {["generating", "in_queue", "in_progress", "processing"].includes(
            status
          ) && (
            <div className="mt-2">
              <Progress className="h-2 animate-pulse" />
              <p className="text-xs text-muted-foreground text-center mt-1">
                Generating video…
              </p>
            </div>
          )}
          <GenerationForm
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            status={status}
            setFormData={setFormData}
            onGenerate={handleGenerateVideo}
          />

          {status === "failed" && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Output</h2>
          {videoUrl ? (
            <>
              <video
                controls
                className="w-full rounded border mb-4"
                playsInline
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {/* <p className="text-sm text-muted-foreground mb-2">
                Generated in {(delayTime / 1000).toFixed(1)} seconds
              </p> */}
              <Button
                // className="w-full"
                onClick={() => window.open(videoUrl, "_blank")}
              >
                Download <DownloadIcon />
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your output will appear here after generation.
            </p>
          )}

          <HistoryPanel />
        </div>
      </main>
    </div>
  );
}
