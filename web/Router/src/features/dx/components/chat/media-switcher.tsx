"use client";

import {
  AudioLines,
  Captions,
  ChevronRight,
  Clapperboard,
  Code2,
  FileText,
  Film,
  Image as ImageIcon,
  Languages,
  Layers,
  type LucideIcon,
  Maximize2,
  MessageCircle,
  Mic,
  Music,
  Paintbrush,
  Phone,
  Radio,
  Scissors,
  ShieldAlert,
  Shuffle,
  Sparkles,
  Text,
  Timer,
  Video,
  Volume2,
  Wand2,
} from "lucide-react";
import { ExpandableTabs } from "@/components/motion/expandable-tabs";

function Row({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function Menu({ rows }: { rows: { icon: LucideIcon; label: string }[] }) {
  return (
    <div className="flex w-[17.125rem] flex-col gap-0.5">
      {rows.map((r) => (
        <Row key={r.label} icon={r.icon} label={r.label} />
      ))}
    </div>
  );
}

export function MediaSwitcher() {
  return (
    <div className="absolute left-0 top-0">
      <ExpandableTabs
        items={[
          {
            id: "text",
            label: "Text",
            icon: <Text className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  { icon: MessageCircle, label: "Chat Assistant" },
                  { icon: FileText, label: "Document Summary" },
                  { icon: Code2, label: "Code Generation" },
                  { icon: Sparkles, label: "Prompt Templates" },
                  { icon: Wand2, label: "Text Refiner" },
                ]}
              />
            ),
          },
          {
            id: "image",
            label: "Image",
            icon: <ImageIcon className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  { icon: Wand2, label: "Text to Image" },
                  { icon: Layers, label: "Image to Image" },
                  { icon: Paintbrush, label: "Inpainting / Outpainting" },
                  { icon: Maximize2, label: "Upscaler" },
                  { icon: Scissors, label: "Background Remover" },
                ]}
              />
            ),
          },
          {
            id: "video",
            label: "Video",
            icon: <Video className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  { icon: Clapperboard, label: "Text to Video" },
                  { icon: Film, label: "Image to Video" },
                  { icon: AudioLines, label: "Lip Sync" },
                  { icon: Shuffle, label: "Video Remix" },
                  { icon: Timer, label: "Frame Interpolation" },
                ]}
              />
            ),
          },
          {
            id: "audio",
            label: "Audio",
            icon: <AudioLines className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  { icon: Mic, label: "Voice Cloning" },
                  { icon: Volume2, label: "Text to Speech" },
                  { icon: Music, label: "Music Generation" },
                  { icon: Captions, label: "Audio Transcription" },
                  { icon: Wand2, label: "Audio Enhancer" },
                ]}
              />
            ),
          },
          {
            id: "live",
            label: "Live",
            icon: <Radio className="h-4 w-4" />,
            content: (
              <Menu
                rows={[
                  { icon: Phone, label: "Real-time Voice Chat" },
                  { icon: Video, label: "Live Avatars" },
                  { icon: Languages, label: "Live Translation" },
                  { icon: Captions, label: "Live Captions" },
                  { icon: ShieldAlert, label: "Stream Moderation" },
                ]}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
