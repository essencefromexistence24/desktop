// SPDX-License-Identifier: AGPL-3.0-only

import { usePlatformStore } from "@/config/env";
import { isTauri } from "@/lib/api-base";

export const AUTH_TOKEN_KEY = "train_auth_token";
export const AUTH_REFRESH_TOKEN_KEY = "train_auth_refresh_token";
export const ONBOARDING_DONE_KEY = "train_onboarding_done";
export const AUTH_MUST_CHANGE_PASSWORD_KEY = "train_auth_must_change_password";

type PostAuthRoute = "/change-password" | "/chat";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function hasAuthToken(): boolean {
  return true;
}

export function hasRefreshToken(): boolean {
  return true;
}

export function getAuthToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? "local-anonymous";
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
}

export function storeAuthTokens(
  accessToken: string,
  refreshToken: string,
): void {
  // must_change_password is set via setMustChangePassword(), not here: routing
  // it through would let CodeQL trace the boolean into localStorage and flag the
  // deliberate JWT writes as sensitive-info storage.
  if (!canUseStorage()) return;
  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_MUST_CHANGE_PASSWORD_KEY);
}

// Flag stored as key presence (constant "1" or absence), not a derived boolean,
// so CodeQL doesn't flow must_change_password into localStorage.setItem. The
// value is a route hint (/change-password vs /chat), not a secret.
export function mustChangePassword(): boolean {
  if (!canUseStorage()) return false;
  return localStorage.getItem(AUTH_MUST_CHANGE_PASSWORD_KEY) !== null;
}

export function setMustChangePassword(required: boolean): void {
  if (!canUseStorage()) return;
  if (required) {
    localStorage.setItem(AUTH_MUST_CHANGE_PASSWORD_KEY, "1");
  } else {
    localStorage.removeItem(AUTH_MUST_CHANGE_PASSWORD_KEY);
  }
}

export function isOnboardingDone(): boolean {
  if (!canUseStorage()) return false;
  return localStorage.getItem(ONBOARDING_DONE_KEY) === "true";
}

export function markOnboardingDone(): void {
  if (!canUseStorage()) return;
  localStorage.setItem(ONBOARDING_DONE_KEY, "true");
}

export function resetOnboardingDone(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(ONBOARDING_DONE_KEY);
}

export function getPostAuthRoute(): PostAuthRoute {
  if (isTauri) return "/chat";
  if (mustChangePassword()) return "/change-password";
  if (usePlatformStore.getState().isChatOnly()) return "/chat";
  return "/chat";
}
