import { Suspense } from 'react'
import type { CmsCurrentUser } from '@core/persistence'
import { AppLoadingScreen } from './AppLoadingScreen'
import type { AdminWorkspace } from './workspace'
import { useAdminBoot } from './preauth/useAdminBoot'
import { prewarmedLazy } from './lib/prewarmedLazy'
import styles from './AdminEntry.module.css'

// AuthenticatedAdmin lives in its own chunk so the cold /admin shell never
// downloads / evaluates SpotlightRoot, AdminSessionProvider,
// StepUpProvider, installPluginRuntime, or any of the per-workspace page
// chunks. The chunk only fires when the boot probe has resolved (the shell
// is single-user with no auth wall — boot never lands on a login screen).
// Cold-load JS execution gap drops by ~50–100 ms because the browser
// doesn't compile + execute the authenticated provider tree during the
// boot probe.
//
// `prewarmedLazy` (vs React.lazy) gives us two properties React.lazy lacks:
//   1. Synchronous-render fast path once the chunk has loaded — eliminates
//      the one-tick Suspense flash that React.lazy produces even when the
//      module is fully cached.
//   2. Explicit `.preload()` trigger so we can kick off the chunk fetch
//      as soon as the shell loads (see below) instead of waiting for the
//      boot probe to resolve. The chunk downloads IN PARALLEL with the
//      /me request instead of sequentially after it.
const AuthenticatedAdmin = prewarmedLazy<{ section: AdminWorkspace; currentUser: CmsCurrentUser }>(
  () => import('./AuthenticatedAdmin'),
  { displayName: 'AuthenticatedAdmin' },
)

// Speculative preload at module-evaluation time.
//
// `window.__instaticAuthed` is set by `server/static.ts` for every admin
// shell request (the session cookie is HttpOnly, so the server is the only
// party that can assert the visitor is authenticated).
//
// In numbers: this moves AuthenticatedAdmin's chunk download from "after
// /me resolves (~150-250 ms post-mount)" to "in parallel with /me (~5 ms
// post-mount)". On the cached-chunk path the preload returns the cached
// promise instantly — no penalty. main.tsx ALSO `await`s the import for
// the same flag, which forces the post-Suspense render to be flushSync-able
// and eliminates the concurrent-mode commit delay.
if (typeof window !== 'undefined' && (window as unknown as { __instaticAuthed?: number }).__instaticAuthed === 1) {
  void AuthenticatedAdmin.preload().catch(() => {
    // Best-effort. If the preload fails the cold-path render will retry
    // when React actually requests AuthenticatedAdmin via Suspense.
  })
}

type AdminSection = AdminWorkspace

interface AdminEntryProps {
  section?: AdminSection
}

export default function AdminEntry({ section = 'dashboard' }: AdminEntryProps) {
  const boot = useAdminBoot()

  if (boot.status === 'loading') return <AppLoadingScreen />

  if (boot.initialError) {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <h1 className={styles.title}>CMS is unavailable</h1>
          <p className={styles.error}>{boot.initialError}</p>
        </div>
      </div>
    )
  }

  if (!boot.currentUser) return <AppLoadingScreen />

  return (
    <Suspense fallback={<AppLoadingScreen />}>
      <AuthenticatedAdmin section={section} currentUser={boot.currentUser} />
    </Suspense>
  )
}
