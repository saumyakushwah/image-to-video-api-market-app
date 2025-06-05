"use client";

import { useMemo, useState } from "react";
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
import { Code, DownloadIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import APIKeyManager from "@/components/APIKeyManager";
import { buildCurlCommand } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type GenerationFormData = {
  model: "1.3B" | "14B";
  resolution: "480p" | "720p";
  aspect_ratio: "auto" | "16:9" | "9:16" | "1:1";
  frames: 17 | 33 | 49 | 65 | 81;
  lora_url: string | null;
  lora_strength_model: number; // 0.0 to 2.0
  lora_strength_clip: number; // 0.0 to 2.0
  sample_steps: number; // 1 to 60
  sample_guide_scale: number; // 0.0 to 10.0
  sample_shift: number;
  negative_prompt: string;
  [key: string]: string | number | null | undefined;
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
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  // const [delayTime, setDelayTime] = useState<number>(0);
  const [formData, setFormData] = useState<GenerationFormData>({
    model: "1.3B",
    resolution: "720p",
    aspect_ratio: "auto",
    frames: 17,
    lora_url: null,
    lora_strength_model: 1.0,
    lora_strength_clip: 1.0,
    sample_steps: 30,
    sample_guide_scale: 5.0,
    sample_shift: 8,
    negative_prompt: "",
  });
  const [showUploadRes, setShowUploadRes] = useState(false);
  const [showGenerateRes, setShowGenerateRes] = useState(false);
  const [showStatusRes, setShowStatusRes] = useState(false);

  const [uploadJson, setUploadJson] = useState<Record<string, unknown> | null>(
    null
  );
  const [generateJson, setGenerateJson] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [statusJson, setStatusJson] = useState<Record<string, unknown> | null>(
    null
  );

  const curlPreview = useMemo(() => {
    if (!imageUrl || !userPrompt || !apiKey) return "";
    return buildCurlCommand(imageUrl, userPrompt, apiKey, formData);
  }, [imageUrl, userPrompt, apiKey, formData]);

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
      setUploadJson(res);

      if (res.error) {
        setStatus("error");
        setError(res.error);
      } else {
        setImageUrl(res.url);
        setStatus("uploaded");
      }
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
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
      setGenerateJson(result);
      setUploadId(result.id);
      // setDelayTime(result.delayTime);
      pollStatus(result.id);
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      setStatus("error");
    }
  };

  const pollStatus = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 40;

    const interval = setInterval(async () => {
      try {
        const res = await getUploadStatus(id, apiKey);
        setStatusJson(res);
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
      {" "}
      <div className="flex justify-end my-4 px-4">
        <APIKeyManager onKeyAvailable={setApiKey} />
      </div>
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
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsApiDialogOpen(true)}
              disabled={!curlPreview}
              className="cursor-pointer"
            >
              <Code className="mr-2 h-4 w-4" /> View API Request
            </Button>
          </div>
          <GenerationForm
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            status={status}
            formData={formData}
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
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowUploadRes(true)}
              disabled={!uploadJson}
              className="w-full sm:flex-1"
            >
              <Code className="mr-2 h-4 w-4" />
              View Upload Response
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowGenerateRes(true)}
              disabled={!generateJson}
              className="w-full sm:flex-1"
            >
              <Code className="mr-2 h-4 w-4" />
              View Generate Response
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowStatusRes(true)}
              disabled={!statusJson}
              className="w-full sm:flex-1"
            >
              <Code className="mr-2 h-4 w-4" />
              View Status Response
            </Button>
          </div>
          <HistoryPanel />
        </div>
      </main>
      <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
        <DialogContent className="sm:max-w-4xl sm:w-full">
          <DialogHeader>
            <DialogTitle>API Request</DialogTitle>
            <p className="text-sm text-muted-foreground">
              The cURL command and JSON payload that will be sent to the API
            </p>
          </DialogHeader>
          <Tabs defaultValue="curl" className="mt-4">
            <TabsList>
              <TabsTrigger value="curl">cURL Command</TabsTrigger>
              <TabsTrigger value="json">JSON Payload</TabsTrigger>
            </TabsList>
            <TabsContent value="curl">
              <pre className="min-h-[300px] font-mono whitespace-pre-wrap bg-muted p-4 rounded overflow-x-auto text-sm">
                {curlPreview}
              </pre>
            </TabsContent>
            <TabsContent value="json">
              <pre className="min-h-[300px] font-mono whitespace-pre-wrap bg-muted p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(
                  {
                    input: {
                      ...formData,
                      prompt: userPrompt,
                      image_url: imageUrl,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <Dialog open={showUploadRes} onOpenChange={setShowUploadRes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Response</DialogTitle>
          </DialogHeader>
          <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap">
            {JSON.stringify(uploadJson, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
      <Dialog open={showGenerateRes} onOpenChange={setShowGenerateRes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Response</DialogTitle>
          </DialogHeader>
          <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap">
            {JSON.stringify(generateJson, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
      <Dialog open={showStatusRes} onOpenChange={setShowStatusRes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Status Poll Response</DialogTitle>
          </DialogHeader>
          <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap">
            {JSON.stringify(statusJson, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
