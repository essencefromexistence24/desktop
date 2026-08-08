"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<Theme>("light");

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value="light">{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
