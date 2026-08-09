import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { IBM_Plex_Serif } from "next/font/google";

import { cn } from "@/lib/utils";

const fontSans = GeistSans;
const fontMono = GeistMono;

const fontSerif = IBM_Plex_Serif({
  weight: ["400"],
  display: "swap",
  fallback: ["serif"],
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
});

export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontSerif.variable,
  "[--font-sans:var(--font-geist-sans)]",
  "[--font-mono:var(--font-geist-mono)]",
);
