"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VoiceBar } from "@/features/dx/components/chat-voice";
import { AiProvider } from "@/features/dx/components/chat/ai-provider";
import { DynamicIslandPreview } from "@/features/dx/components/chat/dynamic-status";
import { OverflowActionsPreview } from "@/features/dx/components/chat/media-control";
import { MediaSwitcher } from "@/features/dx/components/chat/media-switcher";
import { providers } from "@/lib/ai/providers";
import { cn } from "@/lib/utils";
import { PdfIcon } from "@hugeicons/core-free-icons";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Box,
  ChartAreaIcon,
  File,
  FileText,
  Image,
  Mic,
  MoreHorizontal,
  Music,
  Paperclip,
  Radio,
  Send,
  Text,
  Video,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ImageControls, LiveControls } from "./media-controls";

interface MediaType {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface Message {
  role: string;
  content: string;
  id: string;
}

interface AIInputBarProps {
  messages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
  isLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  inputValue?: string;
  onInputChange?: (val: string) => void;
  onSubmit?: (e?: React.FormEvent) => void;
  onStop?: () => void;
  isGenerating?: boolean;
  isVoiceMode?: boolean;
  onVoiceModeChange?: (isVoice: boolean) => void;
  selectedModelId?: string;
  onModelChange?: (model: string) => void;
  onMediaSubmit?: (params: { prompt: string; mediaType: string }) => void;
  isLiveConnected?: boolean;
  isLiveSpeaking?: boolean;
  onLiveConnect?: () => void;
  onLiveDisconnect?: () => void;
}

const MEDIA_TYPES: MediaType[] = [
  { id: "text", label: "Text", icon: Text },
  { id: "image", label: "Image", icon: Image },
  { id: "video", label: "Video", icon: Video },
  { id: "audio", label: "Audio", icon: Music },
];

const MORE_MEDIA_TYPES: MediaType[] = [
  { id: "live", label: "Live", icon: Radio },
  { id: "3d", label: "3D", icon: Box },
  { id: "charts", label: "Charts", icon: ChartAreaIcon },
  { id: "documents", label: "Documents", icon: File },
];

function base64FromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AIInputBar({
  messages = [],
  onMessagesChange,
  isLoading = false,
  onLoadingChange,
  inputValue,
  onInputChange,
  onSubmit,
  onStop,
  isGenerating,
  isVoiceMode,
  onVoiceModeChange,
  selectedModelId,
  onModelChange,
  onMediaSubmit,
  isLiveConnected,
  isLiveSpeaking,
  onLiveConnect,
  onLiveDisconnect,
}: AIInputBarProps) {
  const [selectedMedia, setSelectedMedia] = useState<string>("text");
  const [selectedProvider, setSelectedProvider] = useState<string>("opencode");
  const [selectedModel, setSelectedModel] = useState<string>("mimo-v2.5-free");
  const [internalInput, setInternalInput] = useState("");
  const input = inputValue !== undefined ? inputValue : internalInput;
  const setInput = (val: string) => {
    if (onInputChange) onInputChange(val);
    else setInternalInput(val);
  };
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedModelId) {
      setSelectedModel(selectedModelId);
      for (const [providerId, providerConfig] of Object.entries(providers)) {
        if (providerConfig.models.some((m) => m.id === selectedModelId)) {
          setSelectedProvider(providerId);
          break;
        }
      }
    }
  }, [selectedModelId]);

  const handleProviderSelect = (providerId: string) => {
    const providerConfig = providers[providerId];
    if (!providerConfig) return;
    setSelectedProvider(providerId);
    setSelectedModel(providerConfig.defaultModel);
  };

  const handleAttachFile = async () => {
    const input_ = document.createElement("input");
    input_.type = "file";
    input_.accept = "image/*,video/*,audio/*,.pdf,.txt,.md";
    input_.multiple = false;

    input_.onchange = async () => {
      const file = input_.files?.[0];
      if (!file) return;

      try {
        const base64 = await base64FromFile(file);
        const mimeType = file.type || "application/octet-stream";

        const googleApiKey =
          typeof localStorage !== "undefined" ? localStorage.getItem("google_api_key") || "" : "";

        const userMessage = {
          role: "user",
          content: `Please analyze this attached file: ${file.name}`,
          id: Date.now().toString(),
          experimental_attachments: [
            {
              name: file.name,
              contentType: mimeType,
              url: `data:${mimeType};base64,${base64}`,
            },
          ],
        };

        if (onMessagesChange) {
          onMessagesChange([...messages, userMessage]);
          onLoadingChange?.(true);

          try {
            const response = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [...messages, userMessage],
                modelId: selectedModel,
                apiKey: googleApiKey || undefined,
              }),
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = "";

            const assistantId = Date.now().toString();
            onMessagesChange([
              ...messages,
              userMessage,
              { role: "assistant", content: "", id: assistantId },
            ]);

            while (reader) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.trim() === "" || line === "data: [DONE]") continue;

                if (line.startsWith("data: ")) {
                  try {
                    const jsonStr = line.slice(6);
                    const parsed = JSON.parse(jsonStr) as any;
                    if (parsed.type === "text-delta" && parsed.delta) {
                      assistantContent += parsed.delta;
                      onMessagesChange([
                        ...messages,
                        userMessage,
                        {
                          role: "assistant",
                          content: assistantContent,
                          id: assistantId,
                        },
                      ]);
                    }
                  } catch {
                    // ignore parse errors
                  }
                }
              }
            }
          } catch (error) {
            console.error("Chat error:", error);
          } finally {
            onLoadingChange?.(false);
          }
        }
      } catch (error) {
        console.error("Failed to attach file:", error);
      }
    };

    input_.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isGenerating) return;

    if (selectedMedia !== "text" && onMediaSubmit) {
      const prompt = input.trim();
      setInput("");
      onMediaSubmit({ prompt, mediaType: selectedMedia });
      return;
    }

    if (onSubmit) {
      onSubmit(e);
      return;
    }

    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      id: Date.now().toString(),
    };

    onMessagesChange?.([...messages, userMessage]);
    setInput("");
    onLoadingChange?.(true);

    try {
      const googleApiKey =
        typeof localStorage !== "undefined" ? localStorage.getItem("google_api_key") || "" : "";
      const openaiApiKey =
        typeof localStorage !== "undefined" ? localStorage.getItem("openai_api_key") || "" : "";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          providerId: selectedProvider,
          modelId: selectedModel,
          apiKey: googleApiKey || undefined,
          providerKey: (!googleApiKey ? openaiApiKey : undefined) || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      const assistantId = Date.now().toString();
      onMessagesChange?.([
        ...messages,
        userMessage,
        { role: "assistant", content: "", id: assistantId },
      ]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim() === "" || line === "data: [DONE]") continue;

          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.slice(6);
              const parsed = JSON.parse(jsonStr) as any;

              if (parsed.type === "text-delta" && parsed.delta) {
                assistantMessage += parsed.delta;
                onMessagesChange?.([
                  ...messages,
                  userMessage,
                  {
                    role: "assistant",
                    content: assistantMessage,
                    id: assistantId,
                  },
                ]);
              }
            } catch (_parseError) {
              console.log("Failed to parse SSE data:", line);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border rounded-md border mx-auto lg:max-w-[60%]"
    >
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={
          selectedMedia === "image"
            ? "Describe the image you want to generate..."
            : selectedMedia === "video"
              ? "Describe the video you want to create..."
              : selectedMedia === "live"
                ? isLiveConnected
                  ? "Connected to Gemini Live. Speak naturally..."
                  : "Click 'Start Live' to begin a voice call..."
                : "Ask me anything or describe what you need help with..."
        }
        disabled={isLoading || isLiveConnected}
        className="text-foreground placeholder:text-muted-foreground/50 min-h-full resize-none border-0 px-4 py-2 text-sm leading-tight focus-visible:ring-0 rounded-none bg-transparent!"
      />
      <div className="flex items-center">
        <div className="flex items-center justify-start p-3 gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-dashed rounded-full max-h-8 max-w-8"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full px-0 text-muted-foreground"
              onClick={handleAttachFile}
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </motion.div>
          <AiProvider selectedProvider={selectedProvider} onSelect={handleProviderSelect} />
        </div>

        <div className="relative h-8 w-48 flex-1">
          <MediaSwitcher />
        </div>
      </div>
    </motion.div>
  );
}
