import pkg from "../../../package.json" with { type: "json" };

export const APP_CONFIG = {
  name: "Router",
  description: "Unified AI Gateway",
  version: pkg.version,
  displayVersion: "1.0.0",
};

export const THEME_CONFIG = {
  storageKey: "theme",
  defaultTheme: "dark",
};
