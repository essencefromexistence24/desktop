# Graphics

Create and collaborate on graphics, layouts, and visual assets with files, canvas editing, sharing, and reusable components.

## Local Operation

```bash
bun install
bun run typecheck
bun run seed:admin
bun run dev
```

Open `http://localhost:3000` and sign in with the seeded administrator account when local environment variables are configured.

## Accounts

- Admin email: `admin@mail.com`
- Seed password: `password`
- Email verification is required for normal sign-in and sign-up.
- Verification codes are delivered through the configured transactional email sender.

## Workspace Areas

- `/` opens the editor workspace.
- `/dashboard` opens the administrator dashboard.
- `/share/[token]` opens public website-style share views.

Keep product text focused on the workspace itself. Avoid framework boilerplate, scaffold notes, and implementation chatter in user-facing copy.
