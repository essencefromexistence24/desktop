// SPDX-License-Identifier: AGPL-3.0-only

import { apiUrl, isTauri } from "@/lib/api-base";
import {
  clearAuthTokens,
  getAuthToken,
  getRefreshToken,
  mustChangePassword,
  setMustChangePassword,
  storeAuthTokens,
} from "./session";

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  must_change_password: boolean;
};

let refreshInflight: Promise<boolean> | null = null;
let refreshInflightToken: string | null = null;
let logoutGeneration = 0;
let loginInflight: Promise<boolean> | null = null;

const TAURI_FETCH_RETRY_DELAYS_MS = [250, 750, 1500] as const;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearAuthTokensIfCurrent(refreshToken: string | null): void {
  if (!refreshToken || getRefreshToken() === refreshToken) clearAuthTokens();
}

async function fetchWithTauriNetworkRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(input, init);
    } catch (error) {
      if (
        !isTauri ||
        !(error instanceof TypeError) ||
        attempt >= TAURI_FETCH_RETRY_DELAYS_MS.length
      ) {
        throw error;
      }
      await wait(TAURI_FETCH_RETRY_DELAYS_MS[attempt]);
    }
  }
}

export async function autoLogin(): Promise<boolean> {
  if (loginInflight) return loginInflight;
  loginInflight = (async () => {
    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "unsloth", password: "123456" }),
      });
      if (!response.ok) {
        const response2 = await fetch(apiUrl("/api/auth/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "train", password: "123456" }),
        });
        if (!response2.ok) return false;
        const payload = await response2.json();
        storeAuthTokens(payload.access_token, payload.refresh_token);
        setMustChangePassword(payload.must_change_password ?? false);
        return true;
      }
      const payload = await response.json();
      storeAuthTokens(payload.access_token, payload.refresh_token);
      setMustChangePassword(payload.must_change_password ?? false);
      return true;
    } catch {
      return false;
    }
  })();
  try {
    return await loginInflight;
  } finally {
    loginInflight = null;
  }
}

export async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return autoLogin();
  if (refreshInflight && refreshInflightToken === refreshToken) {
    return refreshInflight;
  }

  const startGeneration = logoutGeneration;
  const promise = (async () => {
    try {
      const response = await fetchWithTauriNetworkRetry(
        apiUrl("/api/auth/refresh"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        },
      );
      if (!response.ok) {
        clearAuthTokensIfCurrent(refreshToken);
        return autoLogin();
      }
      const payload = (await response.json()) as RefreshResponse;
      if (startGeneration !== logoutGeneration) return false;
      if (getRefreshToken() !== refreshToken) return false;
      storeAuthTokens(payload.access_token, payload.refresh_token);
      setMustChangePassword(payload.must_change_password ?? false);
      return true;
    } catch {
      return autoLogin();
    }
  })();
  refreshInflight = promise;
  refreshInflightToken = refreshToken;
  try {
    return await promise;
  } finally {
    if (refreshInflight === promise) {
      refreshInflight = null;
      refreshInflightToken = null;
    }
  }
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const resolvedInput = typeof input === 'string' ? apiUrl(input) : input;
  const headers = new Headers(init?.headers);
  const accessToken = getAuthToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetchWithTauriNetworkRetry(resolvedInput, {
      ...init,
      headers,
    });
  } catch (err) {
    if (err instanceof TypeError) {
      // In static web-preview (42xx port / file://) the backend is absent — don't spam
      // "Train isn't running" errors; let caller fallback to local storage.
      try {
        const port = typeof window !== 'undefined' ? Number(window.location.port || 0) : 0;
        const isPreview = (port >= 4200 && port <= 4300) || (typeof window !== 'undefined' && window.location.protocol === 'file:');
        if (isPreview) {
          throw new Error("Preview mode: backend unavailable (local fallback).");
        }
      } catch {}
      if (!isTauri && typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error(
          "You appear to be offline. Check your network connection and try again.",
        );
      }
      throw new Error("Train isn't running -- please relaunch it.");
    }
    throw err;
  }

  if (response.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      const retryHeaders = new Headers(init?.headers);
      const token = getAuthToken();
      if (token) retryHeaders.set("Authorization", `Bearer ${token}`);
      return fetchWithTauriNetworkRetry(resolvedInput, { ...init, headers: retryHeaders });
    }
    return response;
  }

  return response;
}

async function postLogout(accessToken: string | null): Promise<Response | null> {
  try {
    return await fetchWithTauriNetworkRetry(apiUrl("/api/auth/logout"), {
      method: "POST",
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    let response = await postLogout(getAuthToken());
    if (response && response.status === 401 && getRefreshToken()) {
      const refreshed = await refreshSession();
      if (refreshed) response = await postLogout(getAuthToken());
    }
  } finally {
    logoutGeneration += 1;
    clearAuthTokens();
  }
}
