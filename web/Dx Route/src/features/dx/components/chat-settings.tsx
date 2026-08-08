"use client";

import {
  Check,
  CircleSlash,
  Eye,
  EyeOff,
  Info,
  Key,
  Languages,
  Plus,
  Search,
  X,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  type AuthType,
  GENERATED_PROVIDER_LIST,
  type GeneratedProviderConfig,
} from "@/lib/ai/providers.generated";

export const DORA_COLORS = ["#f59e0b", "#ef4444", "#fbbf24", "#84cc16", "#22c55e", "#ea580c"];

export const JARVIS_COLORS = ["#3b82f6", "#0ea5e9", "#8b5cf6", "#06b6d4", "#10b981", "#1d4ed8"];

function PixelCanvas({ palette }: { palette: string[] }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const size = 32;
    const pixelSize = 4;
    const cols = size / pixelSize;
    const rows = size / pixelSize;

    let active = true;
    let prevTime = 0;
    const grid = Array.from({ length: cols * rows }, () => ({
      color: palette[Math.floor(Math.random() * palette.length)],
      speed: 1 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    }));

    function drawFrame(time: number) {
      if (!active) return;

      if (prevTime === 0) {
        prevTime = time;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            ctx.fillStyle = grid[idx].color;
            ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
          }
        }

        requestAnimationFrame(drawFrame);
        return;
      }

      const _dt = (time - prevTime) / 1000;
      prevTime = time;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const cell = grid[idx];
          const brightness = 0.6 + 0.4 * Math.sin(time * cell.speed * 0.003 + cell.phase);
          ctx.globalAlpha = brightness;
          ctx.fillStyle = cell.color;
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(drawFrame);
    }

    requestAnimationFrame(drawFrame);

    return () => {
      active = false;
    };
  }, [palette]);

  return <canvas ref={canvasRef} width={32} height={32} className="size-full" />;
}

export function SettingsAccount() {
  return (
    <>
      <h2 className="mb-4 text-lg font-bold text-foreground md:mb-6 md:text-xl">Account</h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-border py-3 md:py-4">
          <div className="flex items-center gap-3 overflow-hidden md:gap-4">
            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
              EF
            </div>
            <div className="truncate">
              <div className="truncate text-[14px] font-medium text-foreground md:text-[15px]">
                Essence From Existence
              </div>
              <div className="truncate text-[12px] text-muted-foreground md:text-[13px]">
                essencefromexistence@gmail.com
              </div>
            </div>
          </div>
          <Button variant="outline" className="ml-2 flex-shrink-0 rounded-full text-xs md:text-sm">
            Manage
          </Button>
        </div>

        <div className="flex items-center justify-between border-b border-border py-3 md:py-4">
          <div className="flex items-center gap-3">
            <CircleSlash className="size-5 text-foreground/80 md:size-[22px]" />
            <span className="text-[14px] text-foreground md:text-[15px]">SuperGrok</span>
          </div>
          <Button variant="outline" className="rounded-full text-xs md:text-sm">
            Manage
          </Button>
        </div>

        <div className="flex items-center justify-between border-b border-border py-3 md:py-4">
          <div className="flex items-center gap-3">
            <X className="size-5 text-foreground/80 md:size-[22px]" />
            <span className="text-[14px] text-foreground md:text-[15px]">X Account</span>
          </div>
          <Button variant="outline" className="rounded-full text-xs md:text-sm">
            Connect
          </Button>
        </div>

        <div className="flex items-center justify-between pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-foreground md:text-[15px]">Language</span>
            <Languages className="size-4 text-muted-foreground" />
          </div>
          <Button variant="outline" className="rounded-full text-xs md:text-sm">
            Change
          </Button>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <span className="text-[14px] text-foreground md:text-[15px]">Birth Year</span>
          <span className="ml-2 text-[14px] text-muted-foreground md:text-[15px]">2000</span>
        </div>
      </div>
    </>
  );
}

export function SettingsAppearance({
  darkMode,
  onToggleDarkMode,
}: {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}) {
  return (
    <>
      <h2 className="mb-4 text-lg font-bold text-foreground md:mb-6 md:text-xl">Appearance</h2>
      <div className="flex items-center justify-between border-b border-border py-3">
        <div>
          <div className="font-medium text-foreground">Dark mode</div>
          <div className="text-sm text-muted-foreground">Use dark theme across DX</div>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={onToggleDarkMode}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-muted-foreground/20 peer-checked:bg-foreground peer-focus:ring-2 peer-focus:ring-ring peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
        </label>
      </div>
    </>
  );
}

export function SettingsCustomize() {
  return (
    <>
      <h2 className="mb-4 text-lg font-bold text-foreground md:mb-6 md:text-xl">Customize</h2>
      <div className="space-y-6 md:space-y-8">
        <div>
          <div className="mb-3 flex items-center gap-2 md:mb-4">
            <span className="text-[14px] font-medium text-foreground/80 md:text-[15px]">
              Customize Grok&apos;s Response
            </span>
            <Info className="size-4 text-muted-foreground" />
          </div>
          <div className="mb-3 flex flex-wrap gap-2 md:mb-4">
            <span className="flex cursor-pointer items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-[12px] font-medium text-foreground shadow-xs md:text-[13px]">
              Custom <Check className="size-2.5" />
            </span>
            <span className="cursor-pointer rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground transition-all hover:bg-muted md:text-[13px]">
              Concise
            </span>
            <span className="cursor-pointer rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground transition-all hover:bg-muted md:text-[13px]">
              Formal
            </span>
            <span className="cursor-pointer rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground transition-all hover:bg-muted md:text-[13px]">
              Tutor
            </span>
          </div>
          <Textarea
            className="h-28 w-full resize-none rounded-xl border border-border p-3 text-[14px] md:h-32 md:rounded-2xl md:p-4 md:text-[15px]"
            placeholder="Instructions..."
            defaultValue="You are friday - I am essencefromexistence(essence/sumon) your creator and you are my ai friday so please act like more friend like Jarvis - main like Doraemon!!!"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between md:mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-foreground/80 md:text-[15px]">
                Agent Library
              </span>
              <Info className="size-4 text-muted-foreground" />
            </div>
            <Button variant="outline" className="rounded-full text-[13px] md:text-[14px]">
              <Plus className="mr-1.5 size-3" />
              Create
            </Button>
          </div>
          <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-3 md:gap-4">
            <div className="flex w-[200px] flex-shrink-0 cursor-pointer snap-start items-center gap-3 rounded-xl border border-border p-3 transition-all hover:shadow-md md:w-[220px]">
              <div className="size-8 flex-shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted shadow-inner">
                <PixelCanvas palette={DORA_COLORS} />
              </div>
              <div className="overflow-hidden">
                <div className="truncate text-[13px] font-semibold text-foreground md:text-[14px]">
                  doraemon
                </div>
                <div className="truncate text-[11px] text-muted-foreground md:text-[12px]">
                  act like the famous Jap...
                </div>
              </div>
            </div>
            <div className="flex w-[200px] flex-shrink-0 cursor-pointer snap-start items-center gap-3 rounded-xl border border-border p-3 transition-all hover:shadow-md md:w-[220px]">
              <div className="size-8 flex-shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted shadow-inner">
                <PixelCanvas palette={JARVIS_COLORS} />
              </div>
              <div className="overflow-hidden">
                <div className="truncate text-[13px] font-semibold text-foreground md:text-[14px]">
                  jarvis
                </div>
                <div className="truncate text-[11px] text-muted-foreground md:text-[12px]">
                  Act like the A.I. that the...
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 text-[12px] leading-relaxed text-muted-foreground md:mt-4 md:text-[13px]">
            Changes will only apply to new conversations, not existing ones.
          </div>
        </div>
      </div>
    </>
  );
}

function ApiKeyInput({
  label,
  description,
  storageKey,
}: {
  label: string;
  description: string;
  storageKey: string;
}) {
  const [showKey, setShowKey] = React.useState(false);
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (typeof localStorage !== "undefined") {
      setValue(localStorage.getItem(storageKey) || "");
    }
  }, [storageKey]);

  const handleChange = (val: string) => {
    setValue(val);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(storageKey, val);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[14px] font-medium text-foreground md:text-[15px]">{label}</label>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setShowKey(!showKey)}
          className="h-6 w-6 text-muted-foreground"
        >
          {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <p className="text-[12px] text-muted-foreground md:text-[13px]">{description}</p>
      <Input
        type={showKey ? "text" : "password"}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`Enter your ${label}`}
        className="h-9 text-sm"
      />
    </div>
  );
}

const PROVIDER_AUTH_TYPES: { key: AuthType; label: string; color: string }[] = [
  { key: "apikey", label: "API Key", color: "text-blue-500" },
  { key: "oauth", label: "OAuth", color: "text-purple-500" },
  { key: "noauth", label: "No Auth", color: "text-green-500" },
  { key: "web-cookie", label: "Web Cookie", color: "text-orange-500" },
  { key: "local", label: "Local", color: "text-cyan-500" },
  { key: "proxy", label: "Proxy", color: "text-yellow-500" },
  { key: "system", label: "System", color: "text-gray-500" },
];

const AUTH_TYPE_BADGE: Record<AuthType, string> = {
  apikey: "API Key",
  oauth: "OAuth",
  noauth: "Free",
  "web-cookie": "Cookie",
  local: "Local",
  proxy: "Proxy",
  system: "System",
};

function ApiKeyRow({ provider }: { provider: GeneratedProviderConfig }) {
  const [showKey, setShowKey] = React.useState(false);
  const storageKey = `dx-key-${provider.id}`;
  const [value, setValue] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (typeof localStorage !== "undefined") {
      setValue(localStorage.getItem(storageKey) || "");
    }
  }, [storageKey]);

  const handleChange = (val: string) => {
    setValue(val);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(storageKey, val);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const handleClear = () => {
    setValue("");
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(storageKey);
    }
  };

  if (provider.authType === "noauth" || provider.authType === "local") return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3 transition-all hover:border-foreground/20 md:p-4">
      <div className="mt-0.5 flex-shrink-0">
        <provider.icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{provider.name}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-1.5 py-0.5 rounded-full bg-muted border border-border">
            {AUTH_TYPE_BADGE[provider.authType] || provider.authType}
          </span>
        </div>
        {provider.authHint && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">{provider.authHint}</p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Input
              type={showKey ? "text" : "password"}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={`Enter ${provider.name} API key...`}
              className="h-8 pr-8 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {value && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleClear}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          {saved && <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />}
        </div>
      </div>
    </div>
  );
}

export function SettingsApiKeys() {
  const [filter, setFilter] = React.useState("");
  const [authFilter, setAuthFilter] = React.useState<AuthType | "all">("all");

  const filtered = GENERATED_PROVIDER_LIST.filter((p) => {
    if (authFilter !== "all" && p.authType !== authFilter) return false;
    if (filter) {
      const q = filter.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      <h2 className="mb-4 text-lg font-bold text-foreground md:mb-6 md:text-xl">API Keys</h2>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search providers..."
            className="h-9 pl-9 text-sm"
          />
        </div>
        <select
          value={authFilter}
          onChange={(e) => setAuthFilter(e.target.value as AuthType | "all")}
          className="h-9 rounded-lg border border-border bg-background px-2 text-xs text-foreground"
        >
          <option value="all">All</option>
          {PROVIDER_AUTH_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <ScrollArea className="h-[400px] md:h-[450px] pr-2">
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No providers match your search.
            </p>
          ) : (
            filtered.map((provider) => <ApiKeyRow key={provider.id} provider={provider} />)
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        API keys are stored locally in your browser. They are never sent to our servers — only
        directly to the respective service.
      </div>
    </>
  );
}

export function SettingsPlaceholder({ title }: { title: string }) {
  return (
    <>
      <h2 className="mb-6 text-lg font-bold text-foreground md:text-xl">{title}</h2>
      <p className="text-sm text-muted-foreground">{title} settings...</p>
    </>
  );
}
