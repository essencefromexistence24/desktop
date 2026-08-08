"use client";

import {
  Activity,
  Copy,
  Lightbulb,
  RefreshCw,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  Zap,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Message } from "@/features/dx/types";
import { cn } from "@/lib/utils";

export function ThoughtProcess({
  label,
  onOpenThoughts,
}: {
  label: string;
  onOpenThoughts: () => void;
}) {
  return (
    <button
      className="mb-1 -ml-2 flex w-max cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted active:scale-[0.98]"
      onClick={onOpenThoughts}
    >
      <Lightbulb className="size-3.5" />
      <span>Thought for {label}</span>
    </button>
  );
}

export function SourceBadge({
  label,
  domain,
}: {
  label: string;
  domain: string;
}) {
  return (
    <button className="ml-1 inline-flex items-center gap-1 rounded-md border border-border bg-white px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-xs transition-colors hover:bg-muted active:scale-[0.98] dark:bg-card">
      <div className="flex h-3 w-3 items-center justify-center rounded-sm bg-muted text-[6px] font-bold">
        {domain[0]}
      </div>
      {label}
    </button>
  );
}

function generateMockData(baseSpeed: number, seed: number) {
  const data = [];
  // Pseudo-random generator based on seed (message.createdAt)
  let currentSeed = seed;
  const random = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };

  let cpu = 70 + random() * 20;
  let ram = 4.0 + random() * 0.5;
  for (let i = 0; i < 20; i++) {
    cpu = Math.min(100, Math.max(0, cpu + (random() - 0.5) * 15));
    ram = Math.min(16, Math.max(0, ram + (random() - 0.5) * 0.2));
    const fluctuatingSpeed = Math.max(1, baseSpeed + (random() - 0.5) * (baseSpeed * 0.4));

    data.push({
      time: i,
      cpu: Math.round(cpu),
      ram: Number(ram.toFixed(1)),
      speed: Math.round(fluctuatingSpeed),
    });
  }
  return data;
}

import * as React from "react";
import { toast } from "sonner";

export function BotMessageActions({ message }: { message?: Message }) {
  const metrics = message?.metrics;
  const chartData = metrics ? generateMockData(metrics.speed, message.createdAt) : [];
  const [feedback, setFeedback] = React.useState<"up" | "down" | null>(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const handleCopy = () => {
    if (!message?.content) return;
    navigator.clipboard.writeText(message.content);
    toast.success("Copied to clipboard");
  };

  const handleShare = () => {
    if (!message?.content) return;
    if (navigator.share) {
      navigator.share({ text: message.content }).catch(() => {});
    } else {
      navigator.clipboard.writeText(message.content);
      toast.success("Content copied to clipboard");
    }
  };

  const handleReadAloud = () => {
    if (!message?.content) return;
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.onend = () => setIsSpeaking(false);
      synth.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    toast.success("Thanks for your feedback!");
  };

  const handleRegenerate = () => {
    toast.info("Regeneration is currently handled by sending a new prompt.");
  };

  return (
    <div className="relative mt-2 flex w-full flex-wrap items-center gap-1 pb-2 md:gap-2">
      {metrics && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Activity className="size-3.5 text-primary" />
              <span>{metrics.speed} t/s</span>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent side="top" align="start" className="w-[340px] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-foreground" />
                <span className="text-sm font-semibold">Generation Stats</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Started:{" "}
                {new Date(message!.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex flex-col rounded-md bg-muted/50 p-2">
                  <span className="text-muted-foreground">Avg Speed</span>
                  <span className="font-semibold text-foreground">{metrics.speed} t/s</span>
                </div>
                <div className="flex flex-col rounded-md bg-muted/50 p-2">
                  <span className="text-muted-foreground">Tokens</span>
                  <span className="font-semibold text-foreground">{metrics.tokenCount}</span>
                </div>
                <div className="flex flex-col rounded-md bg-muted/50 p-2">
                  <span className="text-muted-foreground">Time Took</span>
                  <span className="font-semibold text-foreground">
                    {(metrics.durationMs / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
              <div className="h-[120px] w-full">
                <ChartContainer
                  config={{
                    cpu: {
                      label: "Est. CPU (%)",
                      color: "var(--color-primary)",
                    },
                    speed: {
                      label: "Speed (t/s)",
                      color: "var(--color-accent)",
                    },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <XAxis dataKey="time" hide />
                      <YAxis yAxisId="left" hide />
                      <YAxis yAxisId="right" orientation="right" hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="cpu"
                        stroke="var(--color-cpu)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="speed"
                        stroke="var(--color-speed)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}

      {metrics && <div className="h-3 w-px bg-border mx-1" />}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            onClick={handleCopy}
          >
            <Copy className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Copy</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            onClick={handleShare}
          >
            <Share2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Share</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn("text-muted-foreground", isSpeaking && "text-primary")}
            onClick={handleReadAloud}
          >
            <Volume2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{isSpeaking ? "Stop reading" : "Read aloud"}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn("text-muted-foreground", feedback === "up" && "text-primary")}
            onClick={() => handleFeedback("up")}
          >
            <ThumbsUp className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Good response</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn("text-muted-foreground", feedback === "down" && "text-destructive")}
            onClick={() => handleFeedback("down")}
          >
            <ThumbsDown className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Bad response</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            onClick={handleRegenerate}
          >
            <RefreshCw className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Regenerate</TooltipContent>
      </Tooltip>
    </div>
  );
}
