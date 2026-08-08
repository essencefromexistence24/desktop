import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SITE_INFO } from "@/config/site";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${SITE_INFO.url}${path}`;
}
