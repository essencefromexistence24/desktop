import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { JotaiProvider } from "./jotai-provider";
import { NuqsProvider } from "./nuqs-provider";
import { PosthogProvider } from "./posthog-provider";

type Props = {
  children: ReactNode;
};

export function AppProvider({ children }: Props) {
  return (
    <PosthogProvider>
      <ThemeProvider>
        <JotaiProvider>
          <NuqsProvider>{children}</NuqsProvider>
        </JotaiProvider>
      </ThemeProvider>
    </PosthogProvider>
  );
}
