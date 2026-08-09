"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useHotkeys } from "react-hotkeys-hook";
import { META_THEME_COLORS } from "@/config/site";
import { useMetaColor } from "@/hooks/use-meta-color";
import { useClickSound } from "@/lib/soundcn/hooks/use-click-sound";
import { Tooltip, TooltipContent, TooltipTrigger } from "./base/ui/tooltip";
import { Button } from "./ui/button";
import { Kbd } from "./ui/kbd";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const { setMetaColor } = useMetaColor();

  const [click] = useClickSound();

  const switchTheme = () => {
    click();
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    setMetaColor(resolvedTheme === "dark" ? META_THEME_COLORS.light : META_THEME_COLORS.dark);
  };

  useHotkeys("d", () => switchTheme());

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="relative touch-manipulation border-none"
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle mode"
            onClick={() => switchTheme()}
          >
            <span className="absolute size-12 pointer-fine:hidden" aria-hidden />
            <Sun className="hidden size-[1.2rem] text-neutral-800 dark:block dark:text-neutral-200" />
            <Moon className="block size-[1.2rem] text-neutral-800 dark:hidden dark:text-neutral-200" />
          </Button>
        }
      />
      <TooltipContent className="pr-2 pl-3">
        <div className="flex items-center gap-3">
          Toggle mode
          <Kbd>D</Kbd>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
