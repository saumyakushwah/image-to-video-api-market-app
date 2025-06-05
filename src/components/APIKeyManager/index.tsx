"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { KeyRound, Copy, ExternalLink } from "lucide-react";

export default function APIKeyManager({
  onKeyAvailable,
}: {
  onKeyAvailable: (key: string) => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("magic_api_key");
    if (storedKey) {
      setApiKey(storedKey);
      onKeyAvailable(storedKey);
    } else {
      // Prompt user if no API key present
      setShowDialog(true);
    }
  }, [onKeyAvailable]);

  const handleSave = () => {
    if (!inputKey.trim()) {
      toast.error("API Key cannot be empty");
      return;
    }
    localStorage.setItem("magic_api_key", inputKey.trim());
    setApiKey(inputKey.trim());
    onKeyAvailable(inputKey.trim());
    toast.success("API Key saved!");
    setShowDialog(false);
  };

  const handleClear = () => {
    localStorage.removeItem("magic_api_key");
    setApiKey("");
    setInputKey("");
    toast.success("API Key cleared");
  };

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    toast.success("Copied API key to clipboard");
  };

  return (
    <>
      <div
        className="flex items-center gap-2 cursor-pointer text-sm text-gray-800 hover:text-primary transition"
        onClick={() => {
          setInputKey(apiKey);
          setShowDialog(true);
        }}
      >
        <KeyRound className="w-4 h-4" />
        <span className="font-medium">API Key</span>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="mt-3 flex flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              <DialogTitle>API Key</DialogTitle>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => window.open("https://api.market", "_blank")}
              className="text-xs"
            >
              Get an API Key <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </DialogHeader>

          <p className="text-xs text-muted-foreground mb-2">
            Your API key is securely stored in your browser
          </p>

          <div className="flex items-center gap-2">
            <Input
              placeholder={
                inputKey
                  ? "•••••••••••••••••••••••••"
                  : "Enter your API key here"
              }
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              type={inputKey ? "password" : "text"}
              className="flex-1"
            />
            <Button size="icon" variant="ghost" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="destructive" size="sm" onClick={handleClear}>
              Clear API Key
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save API Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
