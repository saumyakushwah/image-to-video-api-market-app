"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { GenerationFormData } from "@/app/page";
import { ChevronDown } from "lucide-react";
import { LORA_STYLE_MAP, SELECT_FIELDS, SLIDER_FIELDS } from "@/lib/utils";

type Props = {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  status: string;
  formData: GenerationFormData;
  setFormData: Dispatch<SetStateAction<GenerationFormData>>;
  onGenerate: () => void;
};

export default function GenerationForm({
  userPrompt,
  setUserPrompt,
  status,
  formData,
  setFormData,
  onGenerate,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [sliderValues, setSliderValues] = useState(() => {
    const initial: Record<string, number> = {};
    SLIDER_FIELDS.forEach(({ key, defaultValue }) => {
      initial[key] = defaultValue;
    });
    return initial;
  });

  const handleSliderChange = (key: string, val: number) => {
    setSliderValues((prev) => ({ ...prev, [key]: val }));
    setFormData((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-1">Prompt</Label>
        <Textarea
          rows={4}
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="e.g. A cat flying through space"
          disabled={status === "generating"}
        />
      </div>
      <div>
        <Label className="mb-1">Negative Prompt</Label>
        <Textarea
          rows={2}
          value={formData.negative_prompt}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              negative_prompt: e.target.value,
            }))
          }
          placeholder="e.g. blurry, distorted"
          disabled={status === "generating"}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SELECT_FIELDS.map(({ label, key, options }) => (
          <div
            key={key}
            className={`w-full ${label === "LoRA Style" ? "col-span-2" : ""}`}
          >
            <Label className="mb-1">{label}</Label>
            <Select
              onValueChange={(value) => {
                const numberKeys = ["frames"];
                const parsedValue = numberKeys.includes(key)
                  ? Number(value)
                  : value;

                setFormData((prev) => {
                  if (key === "lora_url") {
                    if (value === "no_lora") {
                      return {
                        ...prev,
                        lora_url: null,
                      };
                    }
                    return {
                      ...prev,
                      lora_url: LORA_STYLE_MAP[value] ?? null,
                    };
                  }
                  return {
                    ...prev,
                    [key]: parsedValue,
                  };
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={label === "LoRA Style" ? "No LoRA" : options[0]}
                />
              </SelectTrigger>
              <SelectContent>
                <>
                  {label === "LoRA Style" && (
                    <SelectItem value="no_lora">No LoRA</SelectItem>
                  )}
                  {options.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full flex justify-between">
            Advanced Settings
            <ChevronDown
              className={`stroke-gray-400 transition-transform duration-300 ${
                showAdvanced ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="grid grid-cols-2 gap-4 mt-4">
          {SLIDER_FIELDS.map(
            ({ label, key, defaultValue, max, step, desc }) => (
              <div key={key}>
                <Label className="mb-4">
                  {label}: {sliderValues[key].toFixed(step < 1 ? 1 : 0)}
                </Label>
                <Slider
                  defaultValue={[defaultValue]}
                  max={max}
                  step={step}
                  onValueChange={([val]) => handleSliderChange(key, val)}
                />
                <p className="text-xs text-muted-foreground mt-3">{desc}</p>
              </div>
            )
          )}
        </CollapsibleContent>
      </Collapsible>

      <Button
        className="w-full mt-4"
        onClick={onGenerate}
        disabled={["generating", "in_queue", "in_progress"].includes(status)}
      >
        Generate Video
      </Button>
    </div>
  );
}
