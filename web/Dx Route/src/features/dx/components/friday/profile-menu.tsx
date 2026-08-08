"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  CreditCardIcon,
  HelpIcon,
  KeyboardIcon,
  LogOutIcon,
  MoonIcon,
  SettingsIcon,
  SparkleIcon,
  SunIcon,
  UserIcon,
} from "@/components/friday-icons";
import { useFridayTheme } from "@/components/friday-theme-provider";
import { cn } from "@/lib/friday/utils";

export function ProfileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { resolvedTheme, setTheme } = useFridayTheme();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-[480px] max-w-[94vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr]">
              <div className="bg-foreground/5 p-5 flex flex-col gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-background text-xl font-semibold shadow-lg">
                  Y
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-foreground">You</div>
                  <div className="text-[12px] text-muted-foreground">you@vercel.com</div>
                </div>
                <div className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-foreground/5 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-foreground">
                  <SparkleIcon className="h-2.5 w-2.5" /> Pro
                </div>
              </div>

              <div className="p-2">
                <Row icon={<UserIcon className="h-4 w-4" />} label="Account" />
                <Row
                  icon={
                    resolvedTheme === "dark" ? (
                      <SunIcon className="h-4 w-4" />
                    ) : (
                      <MoonIcon className="h-4 w-4" />
                    )
                  }
                  label="Appearance"
                  right={
                    <div className="flex items-center gap-1 rounded-md border border-border bg-surface-2 p-0.5">
                      <ThemeBtn
                        active={resolvedTheme === "light"}
                        onClick={() => setTheme("light")}
                        label="Light"
                      />
                      <ThemeBtn
                        active={resolvedTheme === "dark"}
                        onClick={() => setTheme("dark")}
                        label="Dark"
                      />
                      <ThemeBtn active={false} onClick={() => setTheme("system")} label="Auto" />
                    </div>
                  }
                />
                <Row
                  icon={<KeyboardIcon className="h-4 w-4" />}
                  label="Keyboard shortcuts"
                  right={
                    <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {navigator.platform.includes("Mac") ? "\u2318/" : "Ctrl+/"}
                    </kbd>
                  }
                />
                <Row
                  icon={<CreditCardIcon className="h-4 w-4" />}
                  label="Billing"
                  right={
                    <span className="text-[10.5px] text-muted-foreground">Pro \u00B7 $20/mo</span>
                  }
                />
                <Row icon={<SettingsIcon className="h-4 w-4" />} label="Settings" />
                <Row icon={<HelpIcon className="h-4 w-4" />} label="Help & support" />
                <div className="my-1 h-px bg-border" />
                <Row icon={<LogOutIcon className="h-4 w-4" />} label="Sign out" danger />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({
  icon,
  label,
  right,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ x: 1 }}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
        danger ? "text-red-500 hover:bg-red-500/10" : "text-foreground hover:bg-surface-2",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </div>
      {right}
    </motion.button>
  );
}

function ThemeBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "rounded px-1.5 py-0.5 text-[10.5px] font-medium transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </motion.button>
  );
}
