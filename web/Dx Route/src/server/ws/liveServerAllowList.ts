/**
 * liveServerAllowList — extract of the host/origin allow-list logic from
 * `src/server/ws/liveServer.ts`.
 *
 * Lives in its own module so unit tests can exercise it without booting the
 * full WebSocket server. The behaviour here MUST match the one used by the
 * connection handler exactly.
 *
 * Bug #1 (plans/2026-06-23-omniroute-v3.8.34-deep-audit.md) added the
 * `LIVE_WS_ALLOWED_HOSTS` opt-in for LAN/Tailscale deployments.
 */

const DEFAULT_HOST = "127.0.0.1";

/**
 * Default origins allowed to open a WebSocket against the local dashboard.
 * These match the loopback HTTP listener at port 20128.
 */
export const DEFAULT_ALLOWED_ORIGINS: readonly string[] = Object.freeze([
  "http://127.0.0.1:20128",
  "http://localhost:20128",
  "http://[::1]:20128",
]);

/**
 * Parse a comma-separated env value into a set of trimmed, non-empty entries.
 * Centralized so tests can exercise empty / whitespace / dup behaviour.
 */
export function parseCsvEnv(value: string | undefined | null): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/**
 * Build the static origin allow-list from defaults + LIVE_WS_ALLOWED_ORIGINS.
 */
export function buildAllowedOrigins(env: NodeJS.ProcessEnv = process.env): Set<string> {
  const extra = parseCsvEnv(env.LIVE_WS_ALLOWED_ORIGINS);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...extra]);
}

/**
 * Build the host-based allow-list (LAN/Tailscale extension).
 */
export function buildAllowedHosts(env: NodeJS.ProcessEnv = process.env): Set<string> {
  return parseCsvEnv(env.LIVE_WS_ALLOWED_HOSTS);
}

/**
 * Parse the host portion of an Origin URL.
 *
 * Returns `null` when the input is not a well-formed absolute URL — callers
 * should treat `null` as "not a match".
 */
export function originHost(origin: string): { host: string; hostname: string } | null {
  try {
    const url = new URL(origin);
    return { host: url.host, hostname: url.hostname };
  } catch {
    return null;
  }
}

const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

/**
 * Whether the Origin's hostname is a loopback address (localhost / 127.0.0.1 /
 * ::1), on any port. Used to trust any local page when the WS listener itself
 * is bound to loopback, so dev servers on arbitrary HTTP ports (e.g. the
 * default `next dev` port 3000) can open the dashboard socket without adding
 * an env allow-list entry.
 */
export function isLoopbackOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  const parsed = originHost(origin);
  if (!parsed) return false;
  const hostname = parsed.hostname
    .replace(/^\[(.*)\]$/, "$1")
    .replace(/^::ffff:/i, "")
    .toLowerCase();
  return LOOPBACK_HOSTNAMES.has(hostname);
}

/**
 * Whether the given Origin's host (or `host:port`) is in the host
 * allow-list. Returns false when the list is empty.
 */
export function originHostMatches(origin: string, allowedHosts: Set<string>): boolean {
  if (allowedHosts.size === 0) return false;
  const parsed = originHost(origin);
  if (!parsed) return false;
  return allowedHosts.has(parsed.host) || allowedHosts.has(parsed.hostname);
}

/**
 * Top-level Origin allow decision.
 *
 * Always allows: the server can be reached from any URL / port / host, so
 * the Origin allow-list is disabled. The listener host is still a local
 * deployment decision (`LIVE_WS_HOST`); this policy only governs whether a
 * browser Origin may open the socket.
 */
export function isOriginAllowed(
  _origin: string | undefined,
  _env: NodeJS.ProcessEnv = process.env,
  _options: { allowedOrigins?: Set<string>; allowedHosts?: Set<string> } = {},
): boolean {
  return true;
}
