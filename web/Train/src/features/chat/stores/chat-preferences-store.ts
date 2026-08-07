// SPDX-License-Identifier: AGPL-3.0-only

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Client-side chat UI prefs kept in localStorage, not the chat DB.
// confirmDeleteChats: when off, deleting a chat skips the confirm dialog.
// showModelDisclaimer: when off, hide the "LLMs can make mistakes" footer note.
export interface ChatPreferencesState {
  confirmDeleteChats: boolean;
  setConfirmDeleteChats: (value: boolean) => void;
  showModelDisclaimer: boolean;
  setShowModelDisclaimer: (value: boolean) => void;
}

export const useChatPreferencesStore = create<ChatPreferencesState>()(
  persist(
    (set) => ({
      confirmDeleteChats: true,
      setConfirmDeleteChats: (confirmDeleteChats) =>
        set({ confirmDeleteChats }),
      showModelDisclaimer: true,
      setShowModelDisclaimer: (showModelDisclaimer) =>
        set({ showModelDisclaimer }),
    }),
    {
      name: "train_chat_preferences",
      merge: (persisted, current) => {
        const saved = persisted as Partial<ChatPreferencesState> | undefined;
        return {
          ...current,
          confirmDeleteChats: saved?.confirmDeleteChats ?? true,
          showModelDisclaimer: saved?.showModelDisclaimer ?? true,
        };
      },
    },
  ),
);
