import { atom } from "jotai";

export const messagesAtom = atom<{ role: string; content: string }[]>([]);
export const isStreamingAtom = atom(false);
