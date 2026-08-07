// SPDX-License-Identifier: AGPL-3.0-only

export { SettingsDialog } from "./settings-dialog";
export {
  loadPersonalization,
  savePersonalization,
} from "./api/personalization";
export { setTheme, useTheme } from "./stores/theme-store";
export type {
  Personalization,
  PersonalizationAppearance,
  PersonalizationProfile,
} from "./api/personalization";
export { useSettingsDialogStore } from "./stores/settings-dialog-store";
export type { SettingsTab } from "./stores/settings-dialog-store";
export type { ResolvedTheme, Theme } from "./stores/theme-store";
