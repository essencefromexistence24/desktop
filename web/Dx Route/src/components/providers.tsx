"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "next-themes";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider as RadixTooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider
        enableSystem
        disableTransitionOnChange
        enableColorScheme
        storageKey="theme"
        defaultTheme="dark"
        attribute="class"
      >
        <ProgressProvider
          color="var(--foreground)"
          height="2px"
          delay={500}
          options={{ showSpinner: false }}
        >
          <RadixTooltipProvider>{children}</RadixTooltipProvider>

          <KeyboardShortcuts />
        </ProgressProvider>

        <Toaster position="top-center" />
      </ThemeProvider>
    </JotaiProvider>
  );
}
