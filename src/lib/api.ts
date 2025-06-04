import { GenerationFormData } from "@/app/page";

export async function uploadImage(file: File, apiKey: string) {
  const formdata = new FormData();
  formdata.append("filename", file, file.name);

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      accept: "application/json",
      "x-magicapi-key": apiKey,
    },
    body: formdata,
  };

  const res = await fetch(
    "https://api.magicapi.dev/api/v1/magicapi/image-upload/upload",
    requestOptions
  ).then((response) => response.json());

  if (!res.url) throw new Error("Upload failed");

  return res; // { url: string }
}

export async function getUploadStatus(uploadId: string, apiKey: string) {
  const res = await fetch(
    `https://prod.api.market/api/v1/magicapi/wan-text-to-image/image-to-video/status/${uploadId}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "x-magicapi-key": apiKey,
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Status check failed: ${err}`);
  }

  return res.json(); // { status: "in_progress" | "succeeded" | "failed" }
}

export async function generateVideoFromImage(
  imageUrl: string,
  prompt: string,
  apiKey: string,
  formData: GenerationFormData
) {
  const defaultInput = {
    model: "14b",
    frames: 33,
    prompt,
    image_url: imageUrl,
    lora_url:
      "https://dtu1vvf8tvi89.cloudfront.net/wan/i2v_lora/zen_50_epochs.safetensors",
    lora_strength_model: 1,
    lora_strength_clip: 1,
    aspect_ratio: "16:9",
    resolution: "480p",
    sample_steps: 30,
  };

  const input = { ...defaultInput, ...formData };

  const res = await fetch(
    "https://prod.api.market/api/v1/magicapi/wan-text-to-image/image-to-video/run",

    {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "x-magicapi-key": apiKey,
      },
      body: JSON.stringify({ input }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Video generation failed: ${err}`);
  }

  return res.json();
}
