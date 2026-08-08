"use client";

import { FridayThemeProvider } from "@/components/friday-theme-provider";
import { FridayChatShell } from "@/features/dx/components/friday/chat-shell";

export function FridayScreen({
  onModelPickerOpenChange,
}: { onModelPickerOpenChange?: (open: boolean) => void }) {
  return (
    <FridayThemeProvider>
      <div className="h-full w-full overflow-hidden bg-background">
        <FridayChatShell onModelPickerOpenChange={onModelPickerOpenChange} />
      </div>
    </FridayThemeProvider>
  );
}
