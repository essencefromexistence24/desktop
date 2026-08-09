const fs = require("fs");
const content = fs.readFileSync("src/components/chat/ai-input-bar.tsx", "utf8");

let newContent = content.replace(
  /interface AIInputBarProps \{[\s\S]*?\}/,
  `interface AIInputBarProps {
  messages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
  isLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  // Merged props from dx-chat
  inputValue?: string;
  onInputChange?: (val: string) => void;
  onSubmit?: (e?: React.FormEvent) => void;
  onStop?: () => void;
  isGenerating?: boolean;
  isVoiceMode?: boolean;
  onVoiceModeChange?: (isVoice: boolean) => void;
  selectedModelId?: string;
  onModelChange?: (model: string) => void;
}`,
);

newContent = newContent.replace(
  /export function AIInputBar\(\{([^}]+)\}: AIInputBarProps\) \{/,
  `import { Paperclip, X, ArrowUp, Volume2 } from "lucide-react";
import { VoiceBar } from "@/features/dx/components/dx-chat-voice";
import { Input } from "@/components/ui/input";

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
  onModelChange
}: AIInputBarProps) {`,
);

newContent = newContent.replace(
  /const \[input, setInput\] = useState\(""\);/,
  `const [internalInput, setInternalInput] = useState("");
  const input = inputValue !== undefined ? inputValue : internalInput;
  const setInput = (val: string) => {
    if (onInputChange) onInputChange(val);
    else setInternalInput(val);
  };`,
);

newContent = newContent.replace(
  /const handleSubmit = async \(e: React\.FormEvent\) => \{/,
  `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
      return;
    }
`,
);

newContent = newContent.replace(
  / {14}<Button\n {16}type="submit"/,
  `              {onVoiceModeChange && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full px-0 text-muted-foreground mr-1"
                  onClick={() => onVoiceModeChange(true)}
                  title="Voice Input"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="submit"
                onClick={isGenerating ? (e) => { e.preventDefault(); onStop?.(); } : undefined}`,
);

newContent = newContent.replace(
  / {16}<span className="text-sm font-medium">\n {18}\{isLoading \? "Sending\.\.\." : "Send"\}\n {16}<\/span>\n {14}<\/Button>/,
  `                <span className="text-sm font-medium">
                  {isGenerating || isLoading ? (
                    <div className="h-3.5 w-3.5 rounded-sm bg-background animate-pulse" />
                  ) : (
                    "Send"
                  )}
                </span>
              </Button>`,
);

const formTagRegex = /(<form onSubmit=\{handleSubmit\}>)/;
newContent = newContent.replace(
  formTagRegex,
  `$1
        {/* Voice Mode Overlay */}
        {onVoiceModeChange && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-between rounded-2xl bg-background/95 backdrop-blur-xl border border-blue-200/50 pr-1.5 pl-2 shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 md:pr-2 md:pl-3",
              isVoiceMode
                ? "pointer-events-auto z-50 scale-100 opacity-100"
                : "pointer-events-none z-0 scale-95 opacity-0"
            )}
          >
            <div className="flex h-full flex-1 items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="rounded-full text-muted-foreground"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Speak now or type..."
                className="h-full flex-1 border-none bg-transparent px-2 text-[15px] font-medium text-foreground shadow-none outline-none placeholder:text-blue-400 md:px-3 focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) onSubmit?.();
                  }
                }}
              />
            </div>
            <div className="flex flex-shrink-0 items-center gap-1.5 md:gap-2">
              <div className="flex h-[38px] items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 pr-1 pl-3 md:h-[42px] md:gap-3 md:pr-1.5 md:pl-4 dark:border-blue-900/50 dark:bg-blue-950/80">
                <div className="flex h-4 items-center gap-[3px] md:h-5">
                  <VoiceBar delay="0.1s" height={40} />
                  <VoiceBar delay="0.3s" height={80} />
                  <VoiceBar delay="0.5s" height={60} />
                  <VoiceBar delay="0.2s" height={100} />
                  <VoiceBar delay="0.6s" height={50} />
                  <VoiceBar delay="0.4s" height={90} />
                  <VoiceBar delay="0.7s" height={30} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-full h-6 w-6 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 flex items-center justify-center p-0"
                  onClick={() => onVoiceModeChange(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Button 
                type="submit"
                className="size-10 rounded-full bg-foreground text-background shadow-sm hover:bg-blue-600 flex items-center justify-center"
                onClick={isGenerating ? (e) => { e.preventDefault(); onStop?.(); } : undefined}
              >
                {isGenerating ? <div className="h-3.5 w-3.5 rounded-sm bg-background" /> : (input.trim() ? <ArrowUp className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />)}
              </Button>
            </div>
          </div>
        )}
`,
);

newContent = newContent.replace(
  /onProviderChange=\{setSelectedProvider\}/,
  `onProviderChange={(provider) => {
                setSelectedProvider(provider);
              }}`,
);
newContent = newContent.replace(
  /onModelChange=\{setSelectedModel\}/,
  `onModelChange={(model) => {
                setSelectedModel(model);
                onModelChange?.(model);
              }}`,
);
newContent = newContent.replace(
  /selectedModel=\{selectedModel\}/,
  `selectedModel={selectedModelId || selectedModel}`,
);

fs.writeFileSync("src/components/chat/ai-input-bar.tsx", newContent);
console.log("Updated ai-input-bar.tsx");
