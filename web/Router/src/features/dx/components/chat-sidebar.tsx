"use client";

import { motion } from "framer-motion";
import type * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function SidebarItem({
  icon: Icon,
  label,
  collapsed,
  active,
  badge,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "group flex items-center gap-3 rounded-lg py-2.5 text-left text-[15px] font-medium transition-colors md:py-2 md:text-sm",
            collapsed ? "w-auto justify-center px-3" : "w-full px-3",
            active
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <motion.span
            className="flex"
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          >
            <Icon className="size-[18px] flex-shrink-0 text-muted-foreground md:size-4" />
          </motion.span>
          {!collapsed && (
            <>
              <span className="truncate">{label}</span>
              {badge && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 28,
                    delay: 0.1,
                  }}
                  className="flex-shrink-0 rounded-full border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600 dark:border-orange-800 dark:bg-orange-950"
                >
                  {badge}
                </motion.span>
              )}
            </>
          )}
        </button>
      </TooltipTrigger>
    </Tooltip>
  );
}

export function SidebarSubItem({
  icon: Icon,
  label,
  collapsed,
}: {
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[15px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:py-1.5 md:text-sm",
            collapsed && "justify-center px-0",
          )}
        >
          <motion.span
            className="flex"
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          >
            <Icon className="size-[18px] flex-shrink-0 text-muted-foreground md:size-4" />
          </motion.span>
          {!collapsed && <span className="truncate">{label}</span>}
        </button>
      </TooltipTrigger>
      {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  );
}

export function HistoryItem({
  icon: Icon,
  label,
  collapsed,
  active,
  onClick,
}: {
  icon?: React.ElementType;
  label: string;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 truncate rounded-lg px-3 py-2 text-left text-[15px] transition-colors md:py-1.5 md:text-sm",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {Icon && (
        <motion.span
          className="flex"
          whileHover={{ scale: 1.15, rotate: -4 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Icon className="size-[18px] flex-shrink-0 text-muted-foreground md:size-4" />
        </motion.span>
      )}
      {!Icon && collapsed === false && <span className="pl-7" />}
      <span className="truncate">{label}</span>
    </button>
  );
}
