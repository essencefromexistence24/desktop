/**
 * Account commands — §4.13 of the Command Spotlight master plan.
 *
 * Navigate to account settings sections. No sign-out command: Instatic is a
 * single-user tool with no auth wall and no sessions to end.
 */

import type { Command } from '../types'

export function getAccountCommands(): Command[] {
  return [
    {
      id: 'account.profile',
      title: 'Edit profile',
      subtitle: 'Update your name, email, and avatar',
      group: 'account',
      iconName: 'cursor-minimal-solid',
      keywords: ['account', 'profile', 'edit', 'name', 'email', 'avatar'],
      workspaces: ['any'],
      run: (ctx) => {
        ctx.closeSpotlight()
        ctx.navigate('/admin/account')
      },
    },
  ]
}
