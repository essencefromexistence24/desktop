"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useFridayTheme } from "@/components/friday-theme-provider";
import {
  FolderIcon,
  GlobeIcon,
  LayoutIcon,
  MessageSquareIcon,
  MoonIcon,
  PenToolIcon,
  SunIcon,
  TerminalIcon,
} from "@/components/friday-icons";
import type { RightPaneTab } from "@/features/dx/components/friday/right-pane";
import { cn } from "@/lib/friday/utils";
import { ProfileMenu } from "@/features/dx/components/friday/profile-menu";

type TopBarProps = {
  title: string;
  rightPane: RightPaneTab;
  setRightPane: (t: RightPaneTab) => void;
};

export function TopBar({ title, rightPane, setRightPane }: TopBarProps) {
  const { resolvedTheme, toggle } = useFridayTheme();
  const [time, setTime] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="h-12 border-b border-border/60 flex items-center px-4 gap-3 bg-background/80 backdrop-blur-md sticky top-0 z-10 transition-colors shrink-0">
        <FolderIcon className="h-4 w-4 text-muted-foreground hidden sm:block" />
        <span className="font-medium text-sm text-foreground truncate">{title}</span>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <span className="text-muted-foreground text-xs font-mono hidden sm:inline-block">
            {time || "\u2014"}
          </span>

          <div className="flex items-center bg-surface-2 rounded-md p-0.5">
            <PaneToggle
              active={rightPane === "menu"}
              onClick={() => setRightPane("menu")}
              icon={<LayoutIcon className="h-3.5 w-3.5" />}
              label="Menu"
            />
            <PaneToggle
              active={rightPane === "files"}
              onClick={() => setRightPane("files")}
              icon={<FolderIcon className="h-3.5 w-3.5" />}
              label="Files"
            />
            <PaneToggle
              active={rightPane === "terminal"}
              onClick={() => setRightPane("terminal")}
              icon={<TerminalIcon className="h-3.5 w-3.5" />}
              label="Terminal"
            />
            <PaneToggle
              active={rightPane === "browser"}
              onClick={() => setRightPane("browser")}
              icon={<GlobeIcon className="h-3.5 w-3.5" />}
              label="Browser"
            />
            <PaneToggle
              active={rightPane === "chat"}
              onClick={() => setRightPane("chat")}
              icon={<MessageSquareIcon className="h-3.5 w-3.5" />}
              label="Chat"
            />
            <PaneToggle
              active={rightPane === "review"}
              onClick={() => setRightPane("review")}
              icon={<PenToolIcon className="h-3.5 w-3.5" />}
              label="Review"
            />
          </div>

          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={resolvedTheme}
                initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                className="grid place-items-center"
              >
                {resolvedTheme === "dark" ? (
                  <SunIcon className="h-4 w-4" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={() => setProfileOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background text-[11px] font-semibold shadow-sm"
            aria-label="Open profile"
          >
            Y
          </motion.button>
        </div>
      </div>

      <ProfileMenu open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}

function PaneToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      aria-label={label}
      className={cn(
        "p-1.5 rounded transition-colors",
        active
          ? "bg-surface text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
    </motion.button>
  );
}
