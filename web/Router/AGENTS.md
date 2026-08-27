# AGENTS.md — AI agent guidelines for Router

AI agent workflow and project knowledge for anyone (human or LLM) working in this repo.
**Read this file fully before making any change.**

## Mandatory agent workflow (TODO → code → CHANGELOG → README)

Every agent session **must** follow this loop. Skipping any step is a bug.

### 1. Before you start — claim work in `TODO.md`

1. Read [`TODO.md`](./TODO.md).
2. If your task exists there, mark it `[~]` (in progress) with the date.
3. If it does not exist, add it under **Todo** as `[ ]`, then flip to `[~]`.
4. One line per task, actionable, with file paths where relevant.

### 2. While working

- Keep edits surgical; do not reformat unrelated code.
- If you discover new work, add it to `TODO.md` immediately (do not rely on memory).
- If a task becomes obsolete, mark it `[-]` with a one-line reason.

### 3. When done — record everything

Update **all three** files in the same change:

1. **`TODO.md`**
   - Flip your item(s) `[~]`/`[ ]` → `[x]` and move them under **Done** with the date.
2. **[`CHANGELOG.md`](./CHANGELOG.md)**
   - Add entries under `[Unreleased]` using [Keep a Changelog](https://keepachangelog.com) sections:
     `Added` / `Changed` / `Fixed` / `Removed` / `Verified` / `Known issues`.
   - One bullet per user-visible change; include counts, file paths, and verification results.
3. **[`README.md`](./README.md)**
   - Update it whenever your change alters facts stated there: provider/model counts,
     commands, setup steps, verified endpoints, architecture notes.
   - If nothing in the README is now wrong, leave it untouched — but you must check.

**Rule of thumb**: TODO = what is being/was done · CHANGELOG = what changed and when ·
README = what is true right now.

## Project structure

| Directory | Purpose |
| --------- | ------- |
| `src/app/` | Next.js App Router pages, layouts, API routes |
| `src/components/` | Shared UI components |
| `src/features/` | Feature modules |
| `src/lib/ai/` | Provider catalog: `providers.tsx` (clients), `providers.generated.ts` (generated), `models-config.ts` |
| `src/shared/constants/providers/` | **Source of truth** for provider definitions (15 files, 362 providers) |
| `route/open-sse/` | SSE routing engine; per-provider executors + `config/providers/registry/` model catalogs |
| `public/providers/` | Provider icons (461 png/svg) |
| `scripts/generate-providers.ts` | Generates the UI catalog from constants |

## AI provider catalog — how it fits together

1. Definitions live in `src/shared/constants/providers/*.ts`
   (`noauth`, `oauth`, `web-cookie`, `apikey/{gateways,frontier-labs,inference-hosts,
   enterprise-cloud,regional,specialty-media}`, `local`, `search`, `audio`,
   `upstream-proxy`, `cloud-agent`, `system`) → **362 unique providers**.
2. Model catalogs live in `route/open-sse/config/providers/registry/<id>/index.ts` (167 providers).
3. `scripts/generate-providers.ts` merges both into `src/lib/ai/providers.generated.ts`
   (**currently stale at 347 — see TODO.md**). Never hand-edit the generated file.
4. Runtime client wiring lives in `src/lib/ai/providers.tsx`.

When adding a provider:
1. Add the definition to the correct category file.
2. Add a model registry folder if it has a fixed catalog.
3. Add an icon to `public/providers/` (png or svg, kebab-case id).
4. Regenerate the catalog.
5. Update counts in `README.md` and log the addition in `CHANGELOG.md`.

## Coding guidelines

- TypeScript strict mode; explicit types when necessary
- kebab-case file naming
- Descriptive names; comments only for "why", not "what"
- No emojis in code, comments, or commit messages
- Tailwind CSS v4 syntax; support dark/light modes
- Follow SOLID principles
- Headings in sentence-case (capitalize only the first word and proper nouns)
  in Markdown/MDX docs and prose

## Commands

```bash
bun install                        # Install dependencies
bun run dev                        # Dev server
bun run build                      # Production build
bun run test                       # Vitest (watch)
bun run lint                       # ESLint
bun run lint:fix                   # ESLint with --fix
bun run format:write               # Biome/Prettier format
bun run scripts/generate-providers.ts  # Regenerate provider catalog
```

## Verification expectations

Agents must verify claims before recording them:

- API claims: reproduce with `curl` and paste the observed status/body summary into CHANGELOG.
- Counts (providers/models): recount from source files, not memory; state the method used.
- Build/type changes: run the relevant command above and report pass/fail.

## External endpoints worth knowing

- OpenCode Zen free tier: `https://opencode.ai/zen/v1` with `Authorization: Bearer public`
  — 64 models; free ids end in `-free` plus alpha previews such as `x-preview-f-free`.
  See README "OpenCode Zen free tier" for verified examples.
