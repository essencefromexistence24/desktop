/**
 * AccountMenuButton — toolbar avatar dropdown.
 *
 * Verifies:
 *   - Renders nothing when there's no session user (defensive — admin shell
 *     may not have hydrated).
 *   - Trigger displays initials derived from displayName, falling back to
 *     email when displayName is empty.
 *   - Opening the menu shows the user's display name, email, and role label.
 *   - The menu links to the account page (no sign-out actions — Instatic is
 *     a single-user tool with no auth wall and no sessions).
 */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AccountMenuButton } from '@admin/shared/AccountMenuButton'
import { AdminSessionProvider } from '@admin/session'
import { MemoryRouter, Route, Routes, useLocation } from '@admin/lib/routing'
import type { CmsCurrentUser } from '@core/persistence'

const now = '2026-05-09T10:00:00.000Z'

function makeUser(overrides: Partial<CmsCurrentUser> = {}): CmsCurrentUser {
  return {
    id: 'owner_1',
    email: 'owner@example.com',
    displayName: 'Olivia Owner',
    status: 'active',
    role: {
      id: 'owner',
      slug: 'owner',
      name: 'Owner',
      description: '',
      isSystem: true,
      capabilities: ['site.read'],
    },
    capabilities: ['site.read'],
    lastLoginAt: null,
    failedLoginCount: 0,
    lockedUntil: null,
    passwordUpdatedAt: null,
    mfaEnabled: false,
    mfaEnabledAt: null,
    mfaRecoveryCodesRemaining: 0,
    stepUpAuthMode: 'required',
    stepUpWindowMinutes: 15,
    avatarMediaId: null,
    avatarUrl: null,
    // Empty hash → no Gravatar URL → initials fallback fires. Keeps the
    // toolbar trigger's textContent assertions stable; real sessions always
    // carry a non-empty hash from the server.
    gravatarHash: '',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/**
 * Render the menu inside the same provider stack as production: a router
 * (admin shell is always router-mounted) and a session provider (the menu
 * uses `useAuthenticatedAdminUser`, which throws outside it).
 */
function renderWithUser(user: CmsCurrentUser) {
  return render(
    <MemoryRouter initialEntries={['/admin/site']}>
      <AdminSessionProvider user={user}>
        <AccountMenuButton />
      </AdminSessionProvider>
    </MemoryRouter>,
  )
}

describe('AccountMenuButton', () => {
  beforeEach(() => {
    // Not needed for navigation tests (sign-out removal), kept for parity
    // with production's location.stub behavior.
  })

  afterEach(() => {
    cleanup()
  })

  it('uses the first letter of the display name for the initials', () => {
    renderWithUser(makeUser({ displayName: 'Alice Admin' }))
    const trigger = screen.getByTestId('account-menu-trigger')
    expect(trigger.textContent?.trim()).toBe('A')
    expect(trigger.getAttribute('aria-label')).toContain('Alice Admin')
  })

  it('falls back to the email when displayName is empty', () => {
    renderWithUser(makeUser({ displayName: '', email: 'me@example.com' }))
    const trigger = screen.getByTestId('account-menu-trigger')
    expect(trigger.textContent?.trim()).toBe('M')
  })

  it('opens a dropdown with the user header and the account action', () => {
    renderWithUser(makeUser())
    fireEvent.click(screen.getByTestId('account-menu-trigger'))

    expect(screen.getByText('Olivia Owner')).toBeTruthy()
    expect(screen.getByText('owner@example.com')).toBeTruthy()
    expect(screen.getByText('Owner')).toBeTruthy()
    expect(screen.getByTestId('account-menu-go-to-account')).toBeTruthy()
    expect(screen.queryByTestId('account-menu-sign-out')).toBeNull()
    expect(screen.queryByTestId('account-menu-sign-out-all')).toBeNull()
  })

  it('renders the display name once in the dropdown header', () => {
    renderWithUser(makeUser())
    fireEvent.click(screen.getByTestId('account-menu-trigger'))

    const menuText = screen.getByRole('menu', { name: 'Account menu' }).textContent ?? ''
    expect(menuText.match(/Olivia Owner/g)).toHaveLength(1)
  })

  it('"Account & security" navigates to /admin/account via the router', async () => {
    // Soft navigation keeps the editor store alive (so the toolbar's site
    // name persists) and runs the View Transitions fade.
    function PathProbe() {
      return <span data-testid="probe-pathname">{useLocation().pathname}</span>
    }

    render(
      <MemoryRouter initialEntries={['/admin/site']}>
        <AdminSessionProvider user={makeUser()}>
          <AccountMenuButton />
          <Routes>
            <Route path="/admin/site" element={<PathProbe />} />
            <Route path="/admin/account" element={<PathProbe />} />
          </Routes>
        </AdminSessionProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByTestId('account-menu-trigger'))
    fireEvent.click(screen.getByTestId('account-menu-go-to-account'))

    await waitFor(() => {
      expect(screen.getByTestId('probe-pathname').textContent).toBe('/admin/account')
    })
  })
})
