// SPDX-License-Identifier: AGPL-3.0-only

import { redirect } from "@tanstack/react-router";

export async function requireAuth(): Promise<void> {
  return;
}

export async function requireGuest(): Promise<void> {
  throw redirect({ to: "/chat" });
}

export async function requirePasswordChangeFlow(): Promise<void> {
  throw redirect({ to: "/chat" });
}
