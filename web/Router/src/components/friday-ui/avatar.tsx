"use client";

import * as React from "react";
import { cn } from "@/lib/friday/utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }
>(({ className, size = "sm", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative shrink-0 overflow-hidden rounded-full bg-surface-2 border border-border grid place-items-center font-semibold text-muted-foreground select-none",
      size === "sm" && "h-6 w-6 text-[10px]",
      size === "md" && "h-8 w-8 text-xs",
      size === "lg" && "h-10 w-10 text-sm",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={cn("h-full w-full rounded-full object-cover", className)}
      {...props}
    />
  ),
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("grid place-items-center h-full w-full", className)} {...props} />
  ),
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
