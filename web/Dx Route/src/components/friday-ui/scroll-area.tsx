"use client";

import * as React from "react";
import { cn } from "@/lib/friday/utils";

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "vertical" | "horizontal";
  }
>(({ className, children, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      orientation === "vertical"
        ? "overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
        : "overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
