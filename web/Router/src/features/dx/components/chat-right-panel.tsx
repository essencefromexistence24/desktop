"use client";

import { Search } from "lucide-react";

export function SourceItem({
  searched,
  title,
  score,
}: {
  searched: string;
  title: string;
  score: string;
}) {
  return (
    <div className="group flex cursor-pointer flex-col gap-1.5 transition-opacity active:opacity-70">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <Search className="size-3" />
        <span>{searched}</span>
      </div>
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] leading-snug font-medium text-foreground group-hover:underline">
          {title}
        </span>
        <span className="flex-shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {score}
        </span>
      </div>
    </div>
  );
}
