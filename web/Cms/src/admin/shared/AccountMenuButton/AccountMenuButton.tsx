/**
 * AccountMenuButton — toolbar avatar trigger + account dropdown.
 *
 * Sits next to `SettingsButton` in `Toolbar.tsx`. Renders a 28×28 circular
 * button showing the user's initials. Clicking opens a compact dropdown:
 *
 *   ┌──────────────────────────────┐
 *   │ Display Name                 │
 *   │ email@example.com            │
 *   │ [OWNER]                      │
 *   ├──────────────────────────────┤
 *   │ Account & security           │  → /admin/account (soft nav)
 *   └──────────────────────────────┘
 *
 * Instatic is a single-user tool with no auth wall — there are no sessions
 * to sign out of, so the menu only links to the account page.
 *
 * The button stays signed-out-safe: when there is no current user (admin
 * shell hasn't hydrated yet), the component returns null.
 */
import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@ui/components/Button'
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@ui/components/ContextMenu'
import { SettingsCogSolidIcon } from 'pixel-art-icons/icons/settings-cog-solid'
import { useAuthenticatedAdminUser } from '@admin/sessionContext'
import { useAdminNavigate } from '@admin/lib/useAdminNavigate'
import { UserAvatar } from '@admin/shared/UserAvatar'
import styles from './AccountMenuButton.module.css'

const ACCOUNT_ROUTE = '/admin/account'

export function AccountMenuButton(): ReactNode {
  const user = useAuthenticatedAdminUser()
  const navigate = useAdminNavigate()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const displayName = user.displayName.trim() || user.email
  const roleLabel = user.role.name

  function close(): void {
    setOpen(false)
  }

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="xs"
        type="button"
        active={open}
        aria-label={`Account menu for ${displayName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={styles.trigger}
        data-testid="account-menu-trigger"
        data-active={open ? 'true' : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <UserAvatar user={user} size={26} alt={null} className={styles.triggerAvatar} />
      </Button>
      {open && typeof document !== 'undefined' && createPortal(
        <ContextMenu
          ariaLabel="Account menu"
          onClose={close}
          anchorRef={triggerRef}
          side="bottom"
          align="end"
          width={240}
          zIndex={10000}
        >
          <header className={styles.header}>
            <span className={styles.headerName}>{displayName}</span>
            <span className={styles.headerEmail}>{user.email}</span>
            <span className={styles.headerRoleRow}>
              <span className={styles.roleBadge}>{roleLabel}</span>
            </span>
          </header>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => {
              close()
              navigate(ACCOUNT_ROUTE)
            }}
            data-testid="account-menu-go-to-account"
          >
            <SettingsCogSolidIcon size={12} aria-hidden="true" />
            <span>Account &amp; security</span>
          </ContextMenuItem>
        </ContextMenu>,
        document.body,
      )}
    </>
  )
}
