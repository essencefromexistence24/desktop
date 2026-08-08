import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  getCmsPublicSite,
  getCmsSetupStatus,
  getCurrentCmsUser,
  setupCms,
  type CmsCurrentUser,
  type CmsPublicSite,
  type CmsSetupStatus,
} from '@core/persistence/auth'
import { getErrorMessage } from '@core/utils/errorMessage'

/**
 * Pre-flighted boot probes (see server/static.ts `BOOT_API_KICKOFF`).
 *
 * The admin shell ships an inline `<script>` that fires the boot fetches at
 * HTML-parse time and exposes the result promises on
 * `window.__instaticBootPromises`. When present, this hook consumes them instead
 * of issuing its own fetches — net effect: ~300 ms shaved off cold load
 * because React 19's `useEffect` would otherwise be deferred behind the
 * scheduler + first-paint cycle.
 *
 * Window typing kept loose (`unknown`) so we don't grow a public ambient
 * declaration; this consumer narrows once and validates the result shape.
 */
interface PreflightedBootPromises {
  setupStatus: Promise<CmsSetupStatus>
  me: Promise<{ ok: true; user: CmsCurrentUser } | { ok: false }>
  publicSite: Promise<CmsPublicSite | null>
}

function readPreflightedBootPromises(): PreflightedBootPromises | null {
  if (typeof window === 'undefined') return null
  const candidate = (window as unknown as { __instaticBootPromises?: unknown }).__instaticBootPromises
  if (!candidate || typeof candidate !== 'object') return null
  const c = candidate as Record<string, unknown>
  if (!('setupStatus' in c) || !('me' in c) || !('publicSite' in c)) return null
  return c as unknown as PreflightedBootPromises
}

interface AdminBootResult {
  status: 'loading' | 'ready'
  currentUser: CmsCurrentUser | null
  publicSite: CmsPublicSite
  initialError: string | null
}

const DEFAULT_PUBLIC_SITE: CmsPublicSite = { name: null, faviconUrl: null }

/**
 * Default install identity used when the client has to complete first-run
 * setup itself. Mirrors the server's boot-time auto-setup
 * (server/index.ts) so the admin shell NEVER blocks on a setup or login
 * screen — Instatic is a single-user tool and has no auth wall.
 */
const DEFAULT_SETUP_INPUT = {
  siteName: 'my-site',
  email: 'admin@instatic.local',
} as const

/**
 * Resolves the initial admin shell state on mount:
 *  1. Site identity (logo + name) is fetched in parallel so the brand row
 *     can hydrate independently of the user probe.
 *  2. Setup status decides whether the install needs first-run setup; if so
 *     it is completed automatically with the default install identity.
 *  3. The current-user probe decides the shell's user. `/me` falls back to
 *     the first owner server-side (no session needed), so a direct retry
 *     only fails when the server itself is unavailable — in which case the
 *     shell surfaces an error state instead of a login form.
 *
 * The hook never re-runs — once 'ready', the current user is stable for the
 * lifetime of the admin shell.
 */
export function useAdminBoot(): AdminBootResult {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')
  const [currentUser, setCurrentUser] = useState<CmsCurrentUser | null>(null)
  const [publicSite, setPublicSite] = useState<CmsPublicSite>(DEFAULT_PUBLIC_SITE)
  const [initialError, setInitialError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    // Preferred path: consume the promises the SSR shell fired at HTML
    // parse time. They started at ~5 ms and are almost certainly already
    // resolved by the time React's `useEffect` runs (~300 ms post-mount).
    // Falls back to firing the fetches from here if the inline script is
    // missing (dev server, custom SSR setups, or pre-SSR builds).
    const preflighted = readPreflightedBootPromises()

    const publicSitePromise = preflighted?.publicSite ?? getCmsPublicSite().catch(() => null)
    void publicSitePromise.then((next) => {
      if (cancelled || next === null) return
      setPublicSite(next)
    })

    async function resolveAdminShell(): Promise<void> {
      try {
        const setupStatusPromise = preflighted?.setupStatus ?? getCmsSetupStatus()
        const currentUserPromise: Promise<{ ok: true; user: CmsCurrentUser } | { ok: false }> =
          preflighted?.me
            ?? getCurrentCmsUser().then(
              (u) => ({ ok: true as const, user: u }),
              () => ({ ok: false as const }),
            )
        const setupStatus = await setupStatusPromise
        if (cancelled) return

        if (setupStatus.needsSetup) {
          // Defensive: the server auto-setup at boot normally makes this
          // unreachable. Complete setup with the default install identity
          // so a fresh DB never strands the user on a setup form.
          const password = randomInstallPassword()
          await setupCms({ ...DEFAULT_SETUP_INPUT, password })
          if (cancelled) return
        }

        const currentUserResult = await currentUserPromise
        if (cancelled) return
        if (!currentUserResult.ok) {
          // No session and no owner row surfaced by the preflight. Retry
          // with a direct fetch — `/me` resolves to the first owner without
          // any session, so this only fails when the server is down.
          const user = await getCurrentCmsUser()
          if (cancelled) return
          // flushSync — by default React 19 schedules the state transition
          // (loading → ready) under the concurrent scheduler, and the
          // commit can sit in the work queue for 200–300 ms behind layout
          // / paint / prefetch work before it actually renders. On our
          // resource-timeline trace this gap was the bulk of the perceived
          // "cold load". Forcing the boot-resolved transition synchronous
          // means the moment the user probe resolves, React paints the next
          // frame with the dashboard instead of stalling the loading screen
          // for an extra ~280 ms. Subsequent state transitions still flow
          // through the concurrent scheduler.
          flushSync(() => {
            setCurrentUser(user)
            setStatus('ready')
          })
          return
        }

        flushSync(() => {
          setCurrentUser(currentUserResult.user)
          setStatus('ready')
        })
      } catch (err) {
        if (cancelled) return
        flushSync(() => {
          setInitialError(getErrorMessage(err, 'CMS is unavailable'))
          setStatus('ready')
        })
      }
    }

    void resolveAdminShell()
    return () => { cancelled = true }
  }, [])

  return { status, currentUser, publicSite, initialError }
}

/**
 * Random 24+ char install password. Irrelevant in practice (no one can log
 * in through the UI — there is none), but it satisfies the server's
 * setup-password minimum while avoiding a predictable literal.
 */
function randomInstallPassword(): string {
  const buffer = new Uint32Array(4)
  crypto.getRandomValues(buffer)
  return Array.from(buffer, (n) => n.toString(36)).join('')
}
