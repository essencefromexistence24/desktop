"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { providers } from "@/lib/ai/providers";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  NoAuth: "Free (No Auth)",
  OAuth: "OAuth Providers",
  WebCookie: "Web / Cookie",
  APIKey: "API Key Providers",
  Local: "Local / Self-Hosted",
  Search: "Search Providers",
  Audio: "Audio Providers",
  Proxy: "Upstream Proxy",
  CloudAgent: "Cloud Agents",
  System: "System",
};

const CATEGORY_ORDER = [
  "NoAuth",
  "OAuth",
  "WebCookie",
  "APIKey",
  "Local",
  "Search",
  "Audio",
  "Proxy",
  "CloudAgent",
  "System",
];

interface ModelPickerProps {
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (providerId: string) => void;
  onModelChange: (modelId: string) => void;
}

export function ModelPicker({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
}: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const currentProvider = providers[selectedProvider];
  const currentModel = currentProvider?.models.find((m) => m.id === selectedModel);

  const handleProviderChange = (providerId: string) => {
    onProviderChange(providerId);
    const newProvider = providers[providerId];
    if (newProvider) {
      onModelChange(newProvider.defaultModel);
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<string, (typeof providers)[keyof typeof providers][]> = {};

    const providerValues = Object.values(providers);
    const filtered = search
      ? providerValues.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toLowerCase().includes(search.toLowerCase()) ||
            p.models.some(
              (m) =>
                m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.id.toLowerCase().includes(search.toLowerCase()),
            ),
        )
      : providerValues;

    for (const provider of filtered) {
      const cat = provider.category || "APIKey";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(provider);
    }

    return Object.entries(groups)
      .sort(([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
      .map(([cat, provs]) => [cat, provs] as const);
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 px-3">
          {currentProvider && <currentProvider.icon className="h-3.5 w-3.5" />}
          <span className="text-xs max-w-[120px] truncate">
            {currentModel?.name || currentProvider?.name || "Select Model"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-[90vw] max-w-[500px] p-0">
        <div className="border-border border-b p-3 space-y-2">
          <h3 className="text-foreground text-sm font-semibold">Select AI Model</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search providers or models..."
              className="h-8 pl-8 pr-8 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px] max-h-[60vh]">
          {grouped.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
              No providers found
            </div>
          ) : (
            <div className="space-y-4 p-3">
              {grouped.map(([cat, provs]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 px-2 pb-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground/50">{provs.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    {provs.map((provider) => {
                      const isProviderSelected = selectedProvider === provider.id;
                      return (
                        <div key={provider.id}>
                          <button
                            onClick={() => {
                              handleProviderChange(provider.id);
                              setOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all",
                              isProviderSelected
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent hover:text-accent-foreground",
                            )}
                          >
                            <provider.icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1 truncate text-sm font-medium">
                              {provider.name}
                            </span>
                            <span className="text-[10px] opacity-60 shrink-0">
                              {provider.models.length} models
                            </span>
                          </button>
                          {isProviderSelected && (
                            <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-primary/30 pl-2">
                              {provider.models.slice(0, 8).map((model) => (
                                <button
                                  key={model.id}
                                  onClick={() => {
                                    onProviderChange(provider.id);
                                    onModelChange(model.id);
                                    setOpen(false);
                                  }}
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-all",
                                    selectedModel === model.id
                                      ? "bg-primary/20 text-primary font-medium"
                                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                  )}
                                >
                                  <div className="flex-1 truncate">{model.name}</div>
                                  {model.contextLength && (
                                    <span className="text-[10px] opacity-50 shrink-0">
                                      {(model.contextLength / 1000).toFixed(0)}k
                                    </span>
                                  )}
                                </button>
                              ))}
                              {provider.models.length > 8 && (
                                <div className="px-2.5 py-1 text-[10px] text-muted-foreground/50">
                                  +{provider.models.length - 8} more models
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
