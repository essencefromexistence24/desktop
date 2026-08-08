"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ChevronRight,
  Copy,
  Database,
  DollarSign,
  Download,
  FileText,
  Folder,
  FolderKanban,
  FolderOpen,
  Key,
  Lightbulb,
  Menu,
  MoreHorizontal,
  Paintbrush,
  Pencil,
  RotateCcw,
  Share2,
  Sliders,
  Sparkles,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useBrowserState } from "@/features/dx/components/browser/use-browser-state";
import { AIInputBar } from "@/features/dx/components/chat/ai-input-bar";
import { getRandomDockIconName } from "@/features/dx/components/screens/dock-icons";
import { MacOSDock } from "@/features/dx/components/screens/macos-dock";
import { ScreenCarousel } from "@/features/dx/components/screens/screen-carousel";
import { ScreenGridDialog } from "@/features/dx/components/screens/screen-grid-dialog";
import type { Screen } from "@/features/dx/components/screens/types";
import { useChat } from "@/features/dx/hooks/use-chat";
import { useGeminiLive } from "@/features/dx/hooks/use-gemini-live";
import Strands from "@/features/dx/components/chat/strands";
import type { Message, ModelId } from "@/features/dx/types";
import { generateImage, generateVideo } from "@/lib/muapi";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "./chat-hooks";
import { ChatMessage } from "./chat-message";
import { SourceItem } from "./chat-right-panel";
import {
  SettingsAccount,
  SettingsApiKeys,
  SettingsAppearance,
  SettingsCustomize,
  SettingsPlaceholder,
} from "./chat-settings";
import { Sidebar } from "./sidebar";

type RightPanel = "thoughts" | "sources" | "files" | null;

function _LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M5 19L19 5" />
    </svg>
  );
}

export function Chat({ swapped }: { swapped?: boolean }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage("dx-sidebar-collapsed", true);
  const [_mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(true);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const [rightPanel, setRightPanel] = useLocalStorage<RightPanel>("dx-right-panel", null);
  const [inputValue, setInputValue] = React.useState("");
  const [isVoiceMode, setIsVoiceMode] = React.useState(false);
  const [_projectsOpen, _setProjectsOpen] = useLocalStorage("dx-projects-open", true);
  const [_historyOpen, _setHistoryOpen] = useLocalStorage("dx-history-open", true);
  const [darkMode, setDarkMode] = useLocalStorage("dx-dark-mode", false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settingsTab, setSettingsTab] = React.useState("account");
  const [googleApiKey] = useLocalStorage("google_api_key", "");
  const [_openaiApiKey] = useLocalStorage("openai_api_key", "");
  const [modelPickerOpen, setModelPickerOpen] = React.useState(false);

  const [activeScreenId, setActiveScreenId] = React.useState<string>("friday");
  const [screens, setScreens] = React.useState<Screen[]>([
    { id: "friday", type: "friday", title: "Friday", width: 0, height: 0 },
    { id: "welcome", type: "welcome", title: "Welcome", width: 0, height: 0 },
    {
      id: "terminal",
      type: "terminal",
      title: "Terminal",
      width: 0,
      height: 0,
    },
    { id: "code", type: "code", title: "Code Editor", width: 0, height: 0 },
    { id: "browser", type: "browser", title: "Browser", width: 0, height: 0 },
  ]);
  const [gridOpen, setGridOpen] = React.useState(false);

  const handleScreenResize = (id: string, width: number, height: number) => {
    setScreens((prev) =>
      prev.map((screen) => (screen.id === id ? { ...screen, width, height } : screen)),
    );
  };

  const handleAddScreen = () => {
    const number = screens.length + 1;
    const newScreen = {
      id: `screen-${Date.now()}`,
      type: "custom",
      title: `Screen ${number}`,
      width: 0,
      height: 0,
      dockIcon: getRandomDockIconName(),
    };
    setScreens((prev) => [...prev, newScreen as Screen]);
    setActiveScreenId(newScreen.id);
  };

  const {
    messages,
    isGenerating,
    selectedModel,
    setSelectedModel,
    conversations,
    currentConversationId,
    sendMessage,
    stopGeneration,
    createNewConversation,
    switchConversation,
    deleteConversation,
    clearMessages,
    updateConversation,
    modelReady,
    modelLoading,
    modelProgress,
    modelError,
    isMock,
  } = useChat();

  const { activeWorkspace, setLooseTabs, setFolders } = useBrowserState();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentConversationId) {
        window.history.replaceState(null, "", `/chat/${activeWorkspace}/${currentConversationId}`);
      } else {
        window.history.replaceState(null, "", `/chat/${activeWorkspace}`);
      }
    }
  }, [currentConversationId, activeWorkspace]);

  const toggleDarkMode = React.useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

  // handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // scroll helpers
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = React.useState(false);

  const handleScroll = React.useCallback(() => {
    if (!scrollViewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollViewportRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
  }, []);

  const scrollToBottom = React.useCallback(() => {
    if (!scrollViewportRef.current) return;
    scrollViewportRef.current.scrollTo({
      top: scrollViewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const handleSend = React.useCallback(() => {
    if (!inputValue.trim()) return;
    const content = inputValue.trim();
    setInputValue("");
    sendMessage(content);
  }, [inputValue, sendMessage]);

  const handleMediaSubmit = React.useCallback(
    async ({ prompt, mediaType }: { prompt: string; mediaType: string }) => {
      const apiKey =
        typeof localStorage !== "undefined" ? localStorage.getItem("muapi_key") || "" : "";

      if (!apiKey) {
        const errMsg = "Please set your MuAPI API key (localStorage key: muapi_key)";
        sendMessage(errMsg);
        return;
      }

      let convId = currentConversationId;
      if (!convId) {
        const conv = createNewConversation();
        convId = conv.id;
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
        createdAt: Date.now(),
      };

      const assistMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      updateConversation(convId, (conv) => ({
        ...conv,
        title: conv.title === "New chat" ? `${mediaType} generation` : conv.title,
        messages: [...conv.messages, userMsg, assistMsg],
        updatedAt: Date.now(),
      }));

      try {
        let result: { url?: string; outputs?: string[] };
        if (mediaType === "image") {
          result = await generateImage(apiKey, {
            model: "nano-banana-pro",
            prompt,
            aspect_ratio: "1:1",
          });
        } else if (mediaType === "video") {
          result = await generateVideo(apiKey, {
            model: "wan2.2-text-to-video",
            prompt,
            aspect_ratio: "16:9",
            duration: 5,
          });
        } else {
          throw new Error(`Media type "${mediaType}" not yet supported`);
        }

        const url = result.url || result.outputs?.[0] || "";
        const content = url
          ? `${mediaType === "image" ? "![Generated Image]" : "![Generated Video]"}\n${url}`
          : "Generation completed but no URL was returned.";

        updateConversation(convId, (conv) => ({
          ...conv,
          messages: conv.messages.map((m) =>
            m.id === assistMsg.id ? { ...m, content, createdAt: Date.now() } : m,
          ),
          updatedAt: Date.now(),
        }));
      } catch (error) {
        updateConversation(convId, (conv) => ({
          ...conv,
          messages: conv.messages.map((m) =>
            m.id === assistMsg.id
              ? {
                  ...m,
                  content: `Generation failed: ${(error as Error).message}`,
                  createdAt: Date.now(),
                }
              : m,
          ),
          updatedAt: Date.now(),
        }));
      }
    },
    [currentConversationId, createNewConversation, updateConversation, sendMessage],
  );

  const {
    isConnected: isLiveConnected,
    isSpeaking: isLiveSpeaking,
    connect: connectLive,
    disconnect: disconnectLive,
  } = useGeminiLive(googleApiKey);

  const openRightPanel = React.useCallback(
    (panel: RightPanel) => {
      setRightPanel(panel);
      if (!isDesktop) {
        setSidebarCollapsed(true);
      }
    },
    [isDesktop, setSidebarCollapsed, setRightPanel],
  );

  const closeRightPanel = React.useCallback(() => {
    setRightPanel(null);
  }, [setRightPanel]);

  React.useEffect(() => {
    if (rightPanel && !isDesktop) {
      setSidebarCollapsed(true);
    }
  }, [rightPanel, isDesktop, setSidebarCollapsed]);

  // Sync state between browser state and chat conversations when workspace changes
  React.useEffect(() => {
    if (currentConversationId) {
      // Find the tab and rename it if needed
    }
  }, [currentConversationId]);

  return (
    <Sidebar
      onNewChat={() => createNewConversation(activeWorkspace)}
      onTabSelect={switchConversation}
      onRenameTab={(id, title) => {
        updateConversation(id, (c) => ({ ...c, title }));
        setLooseTabs((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
        setFolders((prev) =>
          prev.map((f) => ({
            ...f,
            tabs: f.tabs.map((t) => (t.id === id ? { ...t, title } : t)),
          })),
        );
      }}
      onArchiveTab={(id) => {
        updateConversation(id, (c) => ({ ...c, archived: true }));
        setLooseTabs((prev) => prev.filter((t) => t.id !== id));
        setFolders((prev) =>
          prev.map((f) => ({
            ...f,
            tabs: f.tabs.filter((t) => t.id !== id),
          })),
        );
      }}
      onOpenSettings={() => setSettingsOpen(true)}
    >
      {/* MAIN CONTENT */}
      <main
        className="relative z-10 flex h-full flex-1 flex-col overflow-hidden bg-background"
        style={
          swapped
            ? ({
                "--color-background": "var(--color-sidebar)",
                "--color-foreground": "var(--color-sidebar-foreground)",
                "--color-border": "var(--color-sidebar-border)",
                "--color-muted": "var(--color-sidebar-accent)",
                "--color-muted-foreground": "var(--color-sidebar-accent-foreground)",
                "--color-accent": "var(--color-sidebar-accent)",
                "--color-accent-foreground": "var(--color-sidebar-accent-foreground)",
                "--color-card": "var(--color-sidebar)",
                "--color-card-foreground": "var(--color-sidebar-foreground)",
                "--color-popover": "var(--color-sidebar)",
                "--color-popover-foreground": "var(--color-sidebar-foreground)",
                "--color-primary": "var(--color-sidebar-primary)",
                "--color-primary-foreground": "var(--color-sidebar-primary-foreground)",
                "--color-ring": "var(--color-sidebar-ring)",
                "--color-input": "var(--color-sidebar-accent)",
              } as React.CSSProperties)
            : undefined
        }
      >
        {/* Top Centered Dock */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 hidden md:flex">
          <MacOSDock
            screens={screens}
            activeScreenId={activeScreenId}
            onScreenChange={setActiveScreenId}
            onAddScreen={handleAddScreen}
            onToggleViewMode={() => setGridOpen(true)}
            sidebarExpanded={!sidebarCollapsed}
          />
        </div>

        <ScreenCarousel
          activeScreenId={activeScreenId}
          screens={screens}
          onScreenChange={setActiveScreenId}
          onScreenResize={handleScreenResize}
          onScreensUpdate={setScreens}
          sidebarExpanded={!sidebarCollapsed}
          disableDrag={modelPickerOpen}
          onModelPickerOpenChange={setModelPickerOpen}
        >
          {/* Mobile Header */}
          <div className="absolute top-0 right-0 left-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-2 backdrop-blur-md md:hidden">
            <Button variant="ghost" size="icon-sm" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="size-5" />
            </Button>
            <span className="font-bold text-foreground">SuperGrok</span>
            <div className="w-10" />
          </div>

          {/* Top Left Actions */}
          <div className="absolute top-2 left-1 z-40 hidden items-center gap-0.5 rounded-xl bg-background/50 p-1 text-muted-foreground backdrop-blur-md md:top-3 md:left-2 md:flex md:bg-transparent md:p-0 md:backdrop-blur-none">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="text-muted-foreground">
                  <Download className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Export chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="text-muted-foreground">
                  <Share2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Share link</TooltipContent>
            </Tooltip>
          </div>

          {/* Top Right Actions */}
          <div className="absolute top-2 right-1 z-40 flex items-center gap-0.5 rounded-xl bg-background/50 p-1 text-muted-foreground backdrop-blur-md md:top-3 md:right-2 md:bg-transparent md:p-0 md:backdrop-blur-none">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className={cn(
                    "text-muted-foreground",
                    rightPanel === "files" && "bg-muted text-foreground",
                  )}
                  onClick={() =>
                    rightPanel === "files" ? closeRightPanel() : openRightPanel("files")
                  }
                >
                  <FolderKanban className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Files</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="text-muted-foreground">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={clearMessages}>
                  <RotateCcw className="mr-2 size-4" />
                  Clear chat
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const text = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");
                    navigator.clipboard.writeText(text);
                  }}
                >
                  <Copy className="mr-2 size-4" />
                  Copy conversation
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const text = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");
                    const blob = new Blob([text], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "conversation.txt";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <FileText className="mr-2 size-4" />
                  Export as text
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (currentConversationId) {
                      deleteConversation(currentConversationId);
                    }
                  }}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Chat Scroll Area */}
          <div className="min-h-0 flex-1">
            <ScrollArea
              viewportRef={scrollViewportRef}
              onScroll={handleScroll}
              className="h-full px-4 md:px-6"
            >
              <div className="flex flex-col items-center pb-40 md:pb-44">
                <div className="w-full max-w-3xl text-[15px] leading-relaxed text-foreground/80">
                  {messages.length === 0
                    ? null
                    : messages.map((message, i) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          isGenerating={
                            isGenerating &&
                            i === messages.length - 1 &&
                            message.role === "assistant"
                          }
                        />
                      ))}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Scroll to Bottom Button */}
          <div className="absolute bottom-36 left-1/2 z-30 -translate-x-1/2 md:bottom-40">
            <motion.button
              onClick={scrollToBottom}
              className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md hover:bg-muted hover:text-foreground md:size-9"
              animate={{
                y: showScrollBtn ? 0 : 20,
                opacity: showScrollBtn ? 1 : 0,
                scale: showScrollBtn ? 1 : 0.8,
                pointerEvents: showScrollBtn ? ("auto" as const) : ("none" as const),
              }}
              transition={{
                y: { type: "spring", stiffness: 400, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { type: "spring", stiffness: 400, damping: 30 },
              }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowDown className="size-4" />
            </motion.button>
          </div>

          {/* Fallback Mode Banner */}
          {isMock &&
            !selectedModel.includes("opencode") &&
            !selectedModel.includes("bigpickle") && (
              <div className="absolute right-0 bottom-0 left-0 z-30 px-3 md:px-6">
                <div className="mx-auto mb-2 w-full max-w-3xl">
                  <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    <Zap className="size-3.5 shrink-0" />
                    <span>
                      Running in fallback mode. The AI model requires more memory. Switch to the
                      basic model or use Chrome/Edge with ample RAM.
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Chat Input */}
          <motion.div
            layout
            initial={false}
            animate={{
              bottom: messages.length === 0 ? "50%" : "0%",
              y: messages.length === 0 ? "50%" : "0%",
            }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(
              "pointer-events-none absolute right-0 left-0 z-20 flex flex-col items-center px-3 md:px-6",
              messages.length > 0 &&
                "bg-gradient-to-t from-background via-background/95 to-transparent pt-20 pb-4 md:pb-6",
            )}
          >
            {/* <div className="hello">hello</div> */}

            <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] pointer-events-auto min-w-full mx-auto">
              <div className="relative flex items-center justify-center mb-10 w-[300px] h-[300px] border rounded-full overflow-hidden mx-auto bg-background/90 hover:bg-background/80">
                <Strands
                  style={{}}
                  colors={["#f76500", "#5e00ff", "#00daff"]}
                  count={10}
                  speed={0.5}
                  amplitude={1}
                  waviness={1}
                  thickness={0.6}
                  glow={3}
                  taper={2.5}
                  spread={1}
                  intensity={0.5}
                  saturation={2}
                  opacity={1}
                  scale={1}
                  glass={false}
                  refraction={1}
                  dispersion={1}
                  glassSize={1}
                  hueShift={1}
                />
              </div>
              <AIInputBar
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSubmit={handleSend}
                onMediaSubmit={handleMediaSubmit}
                onStop={stopGeneration}
                isGenerating={isGenerating}
                isLoading={!modelReady || modelLoading}
                isVoiceMode={isVoiceMode}
                onVoiceModeChange={setIsVoiceMode}
                selectedModelId={selectedModel}
                onModelChange={(model) => setSelectedModel(model as ModelId)}
                isLiveConnected={isLiveConnected}
                isLiveSpeaking={isLiveSpeaking}
                onLiveConnect={connectLive}
                onLiveDisconnect={disconnectLive}
              />
            </div>
          </motion.div>
        </ScreenCarousel>

        <ScreenGridDialog
          open={gridOpen}
          onOpenChange={setGridOpen}
          screens={screens}
          activeScreenId={activeScreenId}
          onSelectScreen={setActiveScreenId}
        />
      </main>

      {/* RIGHT SIDEBAR */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-shrink-0 flex-col overflow-hidden border-l bg-sidebar shadow-[-4px_0_20px_rgba(0,0,0,0.08)] md:relative",
          swapped ? "border-sidebar-border" : "border-border",
        )}
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: rightPanel ? 340 : 0,
          opacity: rightPanel ? 1 : 0,
        }}
        transition={{
          width: { type: "spring", stiffness: 350, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        style={
          swapped
            ? ({
                "--color-sidebar": "var(--color-background)",
                "--color-background": "var(--color-sidebar)",
                "--color-foreground": "var(--color-sidebar-foreground)",
                "--color-muted": "var(--color-sidebar-accent)",
                "--color-muted-foreground": "var(--color-sidebar-accent-foreground)",
                "--color-accent": "var(--color-sidebar-accent)",
                "--color-accent-foreground": "var(--color-sidebar-accent-foreground)",
                "--color-card": "var(--color-sidebar)",
                "--color-card-foreground": "var(--color-sidebar-foreground)",
                "--color-popover": "var(--color-sidebar)",
                "--color-popover-foreground": "var(--color-sidebar-foreground)",
                "--color-primary": "var(--color-sidebar-primary)",
                "--color-primary-foreground": "var(--color-sidebar-primary-foreground)",
                "--color-ring": "var(--color-sidebar-ring)",
                "--color-input": "var(--color-sidebar-accent)",
              } as React.CSSProperties)
            : undefined
        }
      >
        <div className="flex h-full w-[85vw] min-w-[280px] flex-col md:w-[340px] md:min-w-[340px]">
          <div className="z-10 flex items-center justify-between border-b border-border/50 bg-background px-4 py-3 shadow-sm md:px-5 md:py-4">
            <h2 className="text-[15px] font-bold text-foreground">
              {rightPanel === "thoughts" && "Thoughts"}
              {rightPanel === "sources" && "Sources"}
              {rightPanel === "files" && "Files"}
            </h2>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground"
              onClick={closeRightPanel}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Thoughts */}
          <ScrollArea className={cn("flex-1 p-4 md:p-5", rightPanel !== "thoughts" && "hidden")}>
            <div className="space-y-5 md:space-y-6">
              <div className="flex items-start gap-3 text-[13px] text-foreground/80">
                <Lightbulb className="mt-0.5 size-4 text-muted-foreground" />
                <span className="leading-snug font-medium">Thinking about your request</span>
              </div>
              <div className="flex items-start gap-3 text-[13px] text-foreground/80">
                <Lightbulb className="mt-0.5 size-4 text-muted-foreground" />
                <span className="leading-snug font-medium">Searching global AI news databases</span>
              </div>
              <div className="flex items-start gap-3 text-[13px] text-foreground/80">
                <Lightbulb className="mt-0.5 size-4 text-muted-foreground" />
                <span className="leading-snug font-medium">
                  Synthesizing top 10 articles into final response
                </span>
              </div>
            </div>
          </ScrollArea>

          {/* Sources */}
          <ScrollArea className={cn("flex-1 p-4 md:p-5", rightPanel !== "sources" && "hidden")}>
            <div className="space-y-5 md:space-y-6">
              <SourceItem
                searched="Searched web"
                title="Anthropic claims Alibaba stole Claude data in massive..."
                score="10"
              />
              <SourceItem
                searched="Searched web"
                title="SK Hynix $29B Nasdaq listing details and chip boom..."
                score="10"
              />
              <SourceItem
                searched="Searched web"
                title="OpenAI GPT-5.5 patch notes June 2026 - better logical..."
                score="10"
              />
            </div>
          </ScrollArea>

          {/* Files */}
          <ScrollArea className={cn("flex-1", rightPanel !== "files" && "hidden")}>
            <div className="py-2">
              <button className="flex w-full items-center justify-between px-4 py-3 text-[14px] text-foreground/80 transition-colors hover:bg-muted md:px-5">
                <div className="flex items-center gap-3">
                  <FolderOpen className="size-[18px]" />
                  Home
                </div>
                <Download className="size-4 text-muted-foreground" />
              </button>
              <Separator className="mx-4 my-0.5 w-auto" />
              <button className="flex w-full items-center justify-between px-4 py-3 text-[14px] text-foreground/80 transition-colors hover:bg-muted md:px-5">
                <div className="flex items-center gap-3">
                  <Folder className="size-[18px] text-muted-foreground/40" />
                  dx-cpp
                </div>
                <ChevronRight className="size-3 text-muted-foreground" />
              </button>
              <button className="flex w-full items-center justify-between px-4 py-3 text-left text-[14px] text-foreground/80 transition-colors hover:bg-muted md:px-5">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-[18px] text-muted-foreground/40" />
                  <div>
                    <div className="font-medium text-foreground">dx-cpp.zip</div>
                    <div className="text-[12px] text-muted-foreground">
                      21.8 KB &middot; Updated 1d ago
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </ScrollArea>
        </div>
      </motion.aside>

      {/* SETTINGS DIALOG */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="flex h-full max-h-[90vh] w-full max-w-[100vw] flex-col gap-0 overflow-hidden rounded-2xl border-border bg-muted p-0 md:h-[700px] md:w-[1100px] md:max-w-[95vw] md:flex-row"
        >
          <DialogTitle className="sr-only">Settings</DialogTitle>
          {/* Settings Sidebar */}
          <div className="z-10 flex w-full flex-shrink-0 flex-col overflow-y-auto border-b border-border bg-background shadow-sm md:w-[240px] md:border-r md:border-b-0 md:shadow-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="flex w-max flex-row gap-1 p-2 md:w-full md:flex-col md:p-3 md:py-4">
              {[
                { id: "account", label: "Account", icon: User },
                { id: "appearance", label: "Appearance", icon: Paintbrush },
                { id: "apikeys", label: "API Keys", icon: Key },
                { id: "behavior", label: "Behavior", icon: Sparkles },
                { id: "customize", label: "Customize", icon: Sliders },
                {
                  id: "datacontrols",
                  label: "Data Controls",
                  icon: Database,
                },
                {
                  id: "subscription",
                  label: "Subscription",
                  icon: DollarSign,
                },
                { id: "usage", label: "Usage", icon: Zap },
              ].map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => setSettingsTab(id)}
                  className={cn(
                    "flex flex-shrink-0 items-center justify-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium transition-colors md:justify-start md:gap-3 md:rounded-lg md:px-3 md:text-[14px]",
                    settingsTab === id
                      ? "bg-muted-foreground/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted-foreground/5",
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon className="hidden size-[18px] md:inline-block" />
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-muted">
            <AnimatePresence mode="wait">
              <motion.div
                key={settingsTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="flex h-full flex-1 flex-col overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
              >
                <div className="p-4 pt-6 md:p-8">
                  {settingsTab === "account" && <SettingsAccount />}
                  {settingsTab === "apikeys" && <SettingsApiKeys />}
                  {settingsTab === "appearance" && (
                    <SettingsAppearance darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
                  )}
                  {settingsTab === "customize" && <SettingsCustomize />}
                  {settingsTab === "behavior" && <SettingsPlaceholder title="Behavior" />}
                  {settingsTab === "datacontrols" && <SettingsPlaceholder title="Data Controls" />}
                  {settingsTab === "subscription" && <SettingsPlaceholder title="Subscription" />}
                  {settingsTab === "usage" && <SettingsPlaceholder title="Usage" />}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
