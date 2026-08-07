// SPDX-License-Identifier: AGPL-3.0-only

// Re-export of sonner. Swipe blocking lives on the Toaster via
// `swipeDirections={[]}`, so no per-toast dismissible override.

export { toast } from "sonner";
export type { ExternalToast } from "sonner";
