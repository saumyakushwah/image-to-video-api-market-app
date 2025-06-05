"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
// import { cn } from '@/lib/utils'

type HistoryItem = {
  image: string;
  video: string;
  prompt: string;
  timestamp: number;
};

export default function HistoryPanel() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  useEffect(() => {
    const raw = localStorage.getItem("history") || "[]";
    setHistory(JSON.parse(raw));
  }, []);

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3_600_000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const togglePlayback = async (index: number) => {
    const current = videoRefs.current[index];
    if (!current) return;

    if (playingIndex === index) {
      current.pause();
      setPlayingIndex(null);
    } else {
      // Pause all others first
      Object.entries(videoRefs.current).forEach(([i, video]) => {
        if (video && parseInt(i) !== index) video.pause();
      });

      try {
        await current.play();
        setPlayingIndex(index);
      } catch (e) {
        console.error("Playback error:", e);
      }
    }
  };

  if (history.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent>No history yet.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 overflow-hidden">
      <CardContent>
        <h2 className="text-2xl font-semibold mb-4">History</h2>
        <div className="relative">
          <Carousel className="w-full max-w-3xl mx-auto">
            <CarouselContent>
              {[...history]
                .reverse()
                .map(({ video, prompt, timestamp }, index) => (
                  <CarouselItem
                    key={timestamp + index}
                    className="basis-full sm:basis-[calc(100%/1.5)]"
                  >
                    <div className="relative bg-muted rounded-lg p-4 shadow-sm flex flex-col justify-between">
                      <span className="absolute top-2 right-2 text-xs text-muted-foreground mt-4 mb-4 pr-4">
                        {timeAgo(timestamp)}
                      </span>
                      <div className="relative w-full aspect-video mt-8 mb-2">
                        <video
                          ref={(el) => {
                            videoRefs.current[index] = el;
                          }}
                          className="w-full h-full object-cover rounded-md border"
                          src={video}
                          muted
                          controls={false}
                        />
                      </div>

                      <div
                        className={`text-sm text-muted-foreground mb-2 ${
                          expanded[index] ? "" : "line-clamp-2"
                        }`}
                      >
                        {prompt}
                        {prompt.length > 120 && (
                          <Button
                            variant="link"
                            className="text-xs p-0 ml-1"
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [index]: !prev[index],
                              }))
                            }
                          >
                            {expanded[index] ? "Show less" : "Show more"}
                          </Button>
                        )}
                      </div>

                      <Button
                        onClick={() => togglePlayback(index)}
                        className="w-full mt-auto"
                      >
                        {playingIndex === index ? "Pause" : "Watch now"}
                      </Button>
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
              <CarouselPrevious />
            </div>
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <CarouselNext />
            </div>
          </Carousel>
        </div>
      </CardContent>
    </Card>
  );
}
