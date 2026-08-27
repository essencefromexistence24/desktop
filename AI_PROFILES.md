# AI Profiles — Dx Agent System

This is the canonical spec for the 5 Dx AI profiles. It replaces the legacy
`write`/`ask` + hidden `search|study|media` set. Every agent thread, sidebar
row, and AI screen pill must honor this file.

## Profile inventory

| # | ID (`AgentProfileId`) | Display | Kind (`DxAiProfileKind`) | Icon | Composer | Backend | Proof lane |
|---|---|---|---|---|---:|---|
| 1 | `plan` | **Plan** | `Plan` | `IconName::Search` (yellow) | `Plan` slots (`ASK_COMPOSER_SLOTS` + web-search) | `EvidenceBacked` | `plan-evidence-proof` |
| 2 | `build` | **Build** | `Build` | `IconName::ToolHammer` (green) | `Build` slots (`AGENTS_COMPOSER_SLOTS`) | `Wired` | — |
| 3 | `goal` | **Goal** | `Goal` | `IconName::Target` / `Sparkle` (purple) | `Goal` slots (Goal contract editor) | `ReceiptBacked` | `goal-completion-proof` |
| 4 | `automation` | **Automation** | `Automation` | `IconName::Clock` (blue) | `Automation` slots (schedule + goal template) | `ReceiptBacked` | `automation-schedule-proof` |
| 5 | `multi` | **Multi** | `Multi` | `IconName::Users` (orange) | `Multi` slots (fan-out, nesting) | `Wired` | `multi-orchestrator-proof` |

Legacy aliases still resolve: write -> build (when build exists), minimal -> ask. Unknown/custom ids are preserved verbatim. Hidden trio
`search|study|media` remain in metadata for compat but are forced to `Ask` in the composer
and never appear in `DX_PROFILE_ORDER`.

### Ordering

`builtin_profiles::DX_PROFILE_ORDER = [plan, build, goal, automation, multi]`
`is_builtin` = all 5 + `write`/`ask` (compat) ; `is_hidden` = `search|study|media` only.

---

## 1. Plan — Research & structured planning

* **Purpose:** Explore unknown code, clarify requirements, web-search, and produce a verifiable `PLAN.md` / task breakdown. **No writes, no terminal runs** without explicit user approval (Plan is read-only).
* **Allowed tools:** `read`, `grep`, `web-search`, `mcp-read`. Blocked: `write`, `run_command`, `edit`.
* **Composer slots:** `ASK_COMPOSER_SLOTS` (question-oriented, lightweight sources). Shows *Ask*-style prompt but filtered for planning.
* **Contract:** Must emit a checklist: `Outcome` + `Verification` + `Constraints` + `Boundaries` + `Iteration` + `Blocked`. Artifact `PLAN.md` or `research.md` is the stopping artifact.
* **Lifecycle:** One-shot planning turn; user must explicitly switch to `Build` or `Goal` to execute.
* **UI:** Picker pill `Plan` (yellow Search icon). In AI screen footer, shows plan template selector.
* **Example prompt:** `Plan a migration of auth from JWT to session cookies. Verify against tests/ and docs/migration.md. Do not edit files.`

### 2. Build — Autonomous execution (renamed `write`/`Agents`)

* **Purpose:** Take a `PLAN.md` or single-feature prompt and build it end-to-end (edit, run, lint, preview).
* **Tools:** All enabled (edit, terminal, browser, mcp, tools).
* **Composer slots:** `AGENTS_COMPOSER_SLOTS` (builder / worker lanes, full tool surface).
* **Verification:** `cargo test` / `bun run build` / `playwright` must pass before `achieved`.
* **Lifecycle:** Standard one-shot agent turn; can be resumed via queued prompts.
* **UI:** Green `ToolHammer` pill, default profile for new threads (`default_model` per profile).
* **Migration:** Legacy `write` threads automatically normalize to `build` on open.

### 3. Goal — Persistent completion contract (Codex `/goal` clone)

* **Purpose:** One long-running objective with a **stopping condition**, runs unattended for minutes → hours, survives across turns with budget accounting and evidence-based audit.
* **Config (per-thread persisted state):**
  ```json
  {
    "budgetTokens": 500000,
    "verificationSurface": "cargo test --workspace && bun run build",
    "constraints": "do not touch legacy auth; keep rollback branch",
    "boundaries": { "allowedFiles": ["src/auth/**"], "allowedTools": ["read","write","run"] },
    "blockedStop": "pause and report which checkpoint is blocked and what would unlock it"
  }
  ```
* **Composer slots:** Goal contract editor (objective, verification command, boundaries, blocked policy).
* **Lifecycle:** `pursuing` → `paused` (`/goal pause`) → `resumed` (`/goal resume`) → `achieved` (audit passed) | `unmet` (blocked) | `budget-limited` (soft-stop: summary + blockers, not abort). Persists in `ThreadId` state, survives window reload; only cleared via `/goal clear` / user or system.
* **Continuation:** Event-driven on idle thread, within budget, no queued user input.
* **Goal template (copy-paste):**
  ```
  /goal <desired end state> verified by <specific evidence> while preserving <constraints>. Use <allowed inputs/tools/boundaries>. Between iterations, <next-action policy>. If blocked, <report + unlock condition>.
  ```
* **UI:** Purple `Target`/`Sparkle`, shows budget bar, status pill (`pursuing`/`achieved` etc.), pause/resume/clear actions in header.
* **When not to use:** Brainstorming, one-line edits, ambiguous goals.

### 4. Automation — Scheduled / periodic runs (Cursor Automations / Cloud Agents)

* **Purpose:** Re-run the same prompt on a timer (hourly, nightly, weekly). Each tick spawns a fresh `Goal` thread from a template.
* **Config:**
  ```json
  {
    "schedule": { "kind": "interval", "intervalMs": 86400000 },
    "schedule": { "kind": "cron", "expr": "0 2 * * *" },
    "schedule": { "kind": "webhook", "url": "https://..." },
    "goalTemplate": "Run PLAN.md nightly, post report to #dx-bot",
    "maxConcurrency": 1,
    "catchUp": false
  }
  ```
  User sets **how often** in the profile's `automation` block in `agent_settings.json` or the `AutomationScreen` UI (`agent_panel.rs:7786`).
* **Composer slots:** `Automation` slots (schedule picker + goal template editor).
* **Lifecycle:** `armed` → due → `running (as Goal)` → `succeeded/failed` → re-armed. History in `route/open-sse` automations window; never overlaps (next tick waits if prior still `pursuing`).
* **UI:** Blue `Clock`, schedule badge in thread list, `AutomationScreen` for catalog + run history.
* **Example:** `Every night at 02:00 UTC, run docs audit; stop when report + screenshots are in /artifacts and push branch.`

### 5. Multi — Parallel multi-agent orchestration (Cursor subagents / multi-task)

* **Purpose:** Coordinator that fans out to **specialist subagents** (researcher / shell / browser + any custom `.cursor/agents/*.md` agents) instead of queuing.
* **Behaviors:**

  | Subagent mode | Blocks parent? | Use |
  |---|---|---|
  | Foreground | yes | sequential, need result |
  | Background | no (returns immediately) | long/parallel work, parent keeps working |

  * Parallel: multiple `Task` calls in one message → N subagents run concurrently at full throughput.
  * Tree: subagent can spawn its own child (depth 2: main → direct → child). Main + direct can launch; grandchildren cannot.
  * Resume: each run returns `agentId`; passing same id resumes with preserved context.

* **Composer slots:** `Multi` slots (fan-out slider, nesting limit, mode toggle).
* **UI:** Orange `Users` icon, fan-out count badge, tree in `Agents Window`.
* **Example:** `Refactor auth across 47 files. Fan out by package; run tests per package in parallel; keep dependent steps ordered.`

---

## How the 5 map in code

* **`crates/agent_settings/src/agent_profile.rs`** — `builtin_profiles` constants (`PLAN`, `BUILD`, `GOAL`, `AUTOMATION`, `MULTI`), `DxAiProfileKind` enum (5 variants), `is_builtin`/`is_hidden`/`DX_PROFILE_ORDER`, `dx_builtin_metadata_for_id` (display_name, summary, backend, proof lane, icon), `normalize_id` alias `write→build`, `legacy minimal→ask`.
* **`crates/agent_ui/src/conversation_view/composer_profile_options.rs`** — `ComposerProfileKind` enum + `From<DxAiProfileKind>` mapping; each of the 5 maps to a slot table (`PLAN_SLOTS`, `BUILD_SLOTS` etc.). Currently `Plan` reuses `ASK_COMPOSER_SLOTS`; `Build|Goal|Automation|Multi` reuse `AGENTS_COMPOSER_SLOTS` until dedicated slot tables are added.
* **`crates/sidebar/src/sidebar.rs`** — thread rows read `ThreadMetadata.profile_id` → icon via `AgentProfile::dx_builtin_metadata` → pill color. Threads panel shows 5 filter chips.
* **`crates/agent_ui/src/agent_panel.rs`** — toolbar profile picker iterates `AvailableProfiles` (= `DX_PROFILE_ORDER` + any custom profiles). No `is_hidden` filtering for the 5.

## Migration notes

* Existing `write` threads remain valid (`write` → `build` on load). Existing `ask` threads unchanged.
* Hidden legacy profiles (`search`, `study`, `media`) still resolve to `Ask` in composer — remove after 30-day deprecation window.
* Icons reuse existing `IconName`/`DxUiIcon` values to avoid new asset work; dedicated SVGs can be added later in `assets/icons/` and wired via `dx_icons.rs`.

## Verification checklist (for agents)

After changing profiles, verify:
- [ ] `cargo check -p agent_settings -p agent_ui -p sidebar` green
- [ ] New thread picker shows 5 pills in order Plan → Build → Goal → Automation → Multi
- [ ] Creating a thread with each profile persists the correct `AgentProfileId` and re-opens with the same icon
- [ ] Thread list rows show correct per-profile icon (blue Study / green Build etc.)
- [ ] Composer footer for each profile shows the expected slots (Plan=Ask slots, others=Agents slots)
