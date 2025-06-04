import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LORA_STYLE_MAP: Record<string, string> = {
  "Wan Flat Color v2":
    "https://dtu1vvf8tvi89.cloudfront.net/wan/i2v_lora/zen_50_epochs.safetensors",
  "360 Effect":
    "https://dtu1vvf8tvi89.cloudfront.net/wan/i2v_lora/360_epoch20.safetensors",
  "Aging Effect":
    "https://dtu1vvf8tvi89.cloudfront.net/wan/i2v_lora/aging_30_epochs.safetensors",
  "Baby Style":
    "https://dtu1vvf8tvi89.cloudfront.net/wan/i2v_lora/baby_epoch_50.safetensors",
};


export const SELECT_FIELDS = [
  {
    label: "Model",
    key: "model",
    options: ["1.3B", "14B"],
  },
  {
    label: "Resolution",
    key: "resolution",
    options: ["480p", "720p"],
  },
  {
    label: "Aspect Ratio",
    key: "aspect_ratio",
    options: ["auto", "16:9", "9:16", "1:1"],
  },
  {
    label: "Frames",
    key: "frames",
    options: [17, 33, 49, 65, 81],
  },
  {
    label: "LoRA Style",
    key: "lora_style",
    options: ["Wan Flat Color v2", "360 Effect", "Aging Effect", "Baby Style"],
  },
] as const;

export const SLIDER_FIELDS = [
  {
    label: "Sample Steps",
    key: "sample_steps",
    defaultValue: 30,
    max: 60,
    step: 1,
    desc: "More steps increase quality but slow down generation",
  },
  {
    label: "Guidance Scale",
    key: "sample_guide_scale",
    defaultValue: 5.0,
    max: 10,
    step: 0.1,
    desc: "Scale for classifier-free guidance. With LCM-LoRA, optimum is 0-5.",
  },
  {
    label: "LoRA Model Strength",
    key: "lora_strength_model",
    defaultValue: 1.0,
    max: 2.0,
    step: 0.1,
    desc: "Strength of LoRA applied to the model",
  },
  {
    label: "LoRA CLIP Strength",
    key: "lora_strength_clip",
    defaultValue: 1.0,
    max: 2.0,
    step: 0.1,
    desc: "Strength of LoRA on text encoding",
  },
] as const;