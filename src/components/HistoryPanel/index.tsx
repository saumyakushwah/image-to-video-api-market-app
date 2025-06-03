'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

type HistoryItem = {
  image: string
  video: string
  prompt: string
  timestamp: number
}

export default function HistoryPanel() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('history') || '[]'
    setHistory(JSON.parse(raw))
  }, [])

  if (history.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent>No history yet.</CardContent>
      </Card>
    )
  }

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`
    if (diff < 3_600_000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(ts).toLocaleDateString()
  }

  return (
    <Card className="mt-6 max-h-[480px] overflow-y-auto">
      <CardContent>
        <h2 className="text-2xl font-semibold mb-4">History</h2>
        <ul className="space-y-6">
          {[...history].reverse().map(({ image, video, prompt, timestamp }, i) => (
            <li
              key={timestamp + i}
              className="flex flex-col sm:flex-row sm:items-center gap-4 border rounded p-4"
            >
              <Image
                src={image}
                alt="Uploaded"
                className="w-full sm:w-28 h-28 object-cover rounded"
                width={300}
                height={300}
              />
              <div className="flex-1 space-y-1">
                <p className="font-medium truncate max-w-full">{prompt}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(timestamp)}</p>
                <video
                  src={video}
                  controls
                  className="w-full sm:w-64 rounded border mt-2"
                  preload="none"
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
