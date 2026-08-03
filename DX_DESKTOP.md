# DX Desktop — UI & Merge Analysis

## Repo Overview

| Aspect | `G:\Dx\desktop` | `G:\Dx\hexxed\desktop` |
|--------|---------------|----------------------|
| Remote | `dx` → `essence-dx/checkpoint-desktop.git`<br>`upstream` → `zed-industries/zed.git` | `origin` → `essence-dx/code.git` |
| Git history | Independent (no shared ancestor with hexxed) | Independent (no shared ancestor with desktop) |
| Local branches | `main` (3 commits), `zed` (~25 commits), `codex/pre-unrelated-merge-*` (2 commits) | `main` (31 commits) |
| Remote branches | `dx/main`, `upstream/*` (1600+) | `origin/main`, `origin/fix-ai-providers-*`, `origin/summary-*` |

---

## Upstream Zed llama.cpp Connection

Upstream commit `4b119fc547` *"Add llama.cpp as a language model provider (#59964)"* exists as a remote ref in `g:dx/desktop` (`upstream/main`) but is **not merged** into any local branch. Neither `main`, `zed`, nor `codex/*` includes it. `g:dx/hexxed/desktop` has no upstream remote at all. However, both repos independently have `crates/language_models/src/provider/llama_cpp.rs` (identical 75,670 bytes) — the file was added directly, not cherry-picked from upstream.

---

## Desktop Branches in Detail

### `desktop/main` (3 commits)
```
a2c2521e66 feat: icons          ← UI polish (54 files changed)
7d38235bde chore: update justfile
8dc3418ec1 feat: initial commit
```
- Shallow branch, fresh start after rebase
- Has the "feat: icons" commit with UI improvements
- Does NOT have upstream zed merges

### `desktop/zed` (~25 commits)
```
88c17e78d6 Restore Dx UI integrations and web preview   ← only restored 6 files
900bf15df6 Merge upstream backend changes with Dx UI     ← MASSIVE destructive merge
a3ac036eb6 ... (20 upstream zed cherry-picks)
```
- Attempted to merge upstream zed commits into Dx
- The merge **destroyed** thousands of lines of Dx code:
  - Deleted `web_preview/src/dx_studio*` (~3,000 lines)
  - Deleted `agent_ui/src/agent_configuration.rs` (3,265 lines)
  - Deleted `agent_ui/src/agent_thread_www_preview.rs`
  - Deleted `agent/src/dx_catalog_agent_bridge.rs` (1,837 lines)
  - Deleted `agent/src/dx_forge_backup_*` (~2,000 lines)
- The "Restore Dx UI" commit only fixed 6 files (thread_view.rs, editor/items.rs, web_preview/3 files, justfile)

### `desktop/codex/pre-unrelated-merge-20260725-215631` (2 commits)
```
7d38235bde chore: update build_target_dir
8dc3418ec1 feat: initial commit
```
- Stale branch, same as early main

---

## Hexxed Branches in Detail

### `hexxed/main` (31 commits)
```
73e3d95a feat: initialize cli crate
3a1f8236 feat: add .sr wiring
...
beb3cb40 feat: implement OpenCode language model provider
5ba1d5d6 feat: implement cross-platform web preview    ← web preview added
cd474c5e feat: add DxCatalogAgentBridge
ee37b64d feat: implement Nara Router + web preview server
855dcd29 feat: status bar with web tool previews
94e6c93c chore: rename binary to dx-code
cc06dce7 feat: model selection UI
66cf82b6 feat: agent architecture + panel UI
   9a9bf8fd Merge pull request #2 from fix-ai-providers-and-web-preview-*
   │ a3dc9ec1 fix: close active screen before web preview, fix AI provider dropdown
b2ba7708 feat: status bar with web tool shortcuts
   295a16fc Merge pull request #1 from summary-*
   │ e7f8c77a fix: activate browser screen before opening web preview
b163eb63 feat: initial commit
```
- Features built incrementally
- Two small surgical merges that fixed specific issues without breaking existing code
- All Dx features intact (web preview, studio, forge, catalog agent bridge, etc.)

### `hexxed/fix-ai-providers-and-web-preview-7028853222951016295` (1 commit)
```
a3dc9ec1 fix: explicitly close active screen before web preview, fix AI provider dropdown
```
- Changed 3 files: `.cargo/config.toml`, `language_model_selector.rs`, `status_bar.rs`
- Only 18 insertions — minimal, targeted fix

### `hexxed/summary-3926837957308865754` (3 commits)
```
e7f8c77a fix: activate browser screen before opening web preview
20dd1384 docs: report on remote commit
30477f23 docs: explore and summarize codebase
```

---

## File Structure Comparison

### Unique files (same file list across both repos, content differs)

| File | Only in desktop | Only in hexxed |
|------|----------------|----------------|
| `crates/shadcn_ui/src/registry.rs` | ✓ (662 lines) | — |
| `.cargo/config.toml` | — | ✓ |
| `.zed/settings.json` | — | ✓ |
| `docs/` | ✓ (documentation) | — |

**All other ~50,000+ files exist in both repos but with differing content.**

---

## Deep UI Difference Analysis

The "feat: icons" commit (`a2c2521e6`) in `desktop/main` touched **54 files**. The actual visible UI differences are concentrated in 3 files:

### 1. `agent_ui/src/agent_ui.rs` — Missing Icon Functions

**Desktop** has these public functions that hexxed lacks:

```rust
pub fn default_agent_icon(id: &str) -> Option<IconName> {
    match id {
        "claude-acp" => Some(IconName::AiClaude),
        "codex-acp" => Some(IconName::AiOpenAi),
        "github-copilot-acp" => Some(IconName::Copilot),
        "cursor-acp" => Some(IconName::EditorCursor),
        "opencode-acp" => Some(IconName::Sparkle),
        _ => None,
    }
}

pub fn default_agent_icon_path(id: &str, is_light: bool) -> Option<SharedString> {
    match id {
        "zai-acp" if is_light => Some("icons/zai-light.svg".into()),
        "zai-acp" => Some("icons/zai-dark.svg".into()),
        _ => None,
    }
}
```

**Hexxed** has neither — their logic is inlined inside `agent_panel.rs` as closures.

**`Agent::icon()` method** also differs:

| Desktop | Hexxed |
|--------|--------|
| `Self::Custom { id } => Some(default_agent_icon(id.as_ref()).unwrap_or(IconName::Sparkle))` | `Self::Custom { .. } => Some(IconName::Sparkle)` |

**Impact**: Hexxed shows `Sparkle` for ALL custom agents instead of their brand icon (AiClaude, Copilot, etc.)

### 2. `sidebar/src/sidebar.rs` — Agent Icon Resolution

The `resolve_agent_icon` closure (around line 2064):

| Desktop | Hexxed |
|--------|--------|
| `let icon = agent.icon().unwrap_or(dx_icon(DxUiIcon::Agent))` | `let icon = match agent { NativeAgent => Agent, Custom => Terminal, _ => Agent }` |
| Falls back through `default_agent_icon_path()` → `default_agent_icon()` → `agent_server_store` | Only queries `agent_server_store` |

**Impact**: Hexxed sidebar shows `Terminal` icon for all custom agents (Claude, Copilot, Cursor, etc.)

| Agent Type | Desktop Icon | Hexxed Icon |
|-----------|-------------|-------------|
| Native Agent | `DxUiIcon::Agent` | `DxUiIcon::Agent` |
| claude-acp | **AiClaude** | Sparkle / Terminal |
| codex-acp | **AiOpenAi** | Sparkle / Terminal |
| github-copilot-acp | **Copilot** | Sparkle / Terminal |
| cursor-acp | **EditorCursor** | Sparkle / Terminal |
| opencode-acp | **Sparkle** | Sparkle / Terminal |
| zai-acp | **Theme-aware SVG** | Terminal / Sparkle |

### 3. `agent_ui/src/agent_screen.rs` — Missing Layout Function

**Desktop** has `ensure_code_screen_on_right()` (lines 18-58) that auto-creates a code editor pane on the right when the AI screen opens.

**Hexxed** lacks this entire function — opening the AI screen shows only the AI panel with no code editor.

### 4. `agent_ui/src/agent_panel.rs` — Toolbar Icon Resolution

Desktop uses imported `default_agent_icon_path()` and `default_agent_icon()` for a 3-tier icon resolution when rendering the toolbar agent selector for custom agents:

1. `default_agent_icon_path(id, is_light)` → theme-aware SVG path
2. `default_agent_icon(id)` → built-in IconName
3. `store.agent_icon(&id)` → server-provided icon

Hexxed skips tiers 1-2 and goes directly to tier 3.

### 5. `agent_ui/src/agent_panel.rs` — Label Text

| Desktop | Hexxed |
|--------|--------|
| "Zed Agent" (line 6610) | "Dx Agent" (line 6596) |

### Files That Are IDENTICAL in Render Output

Despite having different file hashes, these files produce the same visual output — differences are purely formatting:

- `tools_screen.rs` — Only import order and line breaks
- `title_bar.rs` — Only line wrapping
- `dx_skill_panel.rs` — Only line wrapping
- `message_editor.rs` — Only line wrapping
- `composer_profile_options.rs` — Only line wrapping
- `status_bar.rs` — Only line differences (504 vs 501 lines)
- `model_selector.rs` — Only formatting

---

## Merge Strategy

### Background
- The two repos have **no shared git history** — they are independent forks of Dx
- `--allow-unrelated-histories` is required for any cross-repo merge
- The "feat: icons" commit touches 54 files, but only ~100 lines across 3 files produce visible UI differences

### Recommended Approach: New Branch in Hexxed + Cross-Repo Merge

```
cd G:\Dx\hexxed\desktop
git checkout main
git checkout -b merge-desktop-ui
git remote add desktop G:\Dx\desktop
git fetch desktop
git merge desktop/main --allow-unrelated-histories
```

### Conflict Resolution Rules

| File/Directory | Accept From | Reason |
|---------------|-------------|--------|
| `crates/web_preview/*` | **Hexxed** | Desktop's merge broke DX Studio, server, browser contracts |
| `crates/agent/src/dx_catalog_agent_bridge.rs` | **Hexxed** | Desktop's zed merge deleted this |
| `crates/agent/src/dx_forge_backup_*.rs` | **Hexxed** | Desktop's zed merge deleted these |
| `crates/agent_ui/src/agent_configuration.rs` | **Hexxed** | Desktop's zed merge deleted this (3,265 lines) |
| `crates/agent_ui/src/agent_thread_www_preview.rs` | **Hexxed** | Desktop's zed merge deleted this |
| `crates/agent_ui/src/automation_screen.rs` | **Hexxed** | Desktop doesn't have this file |
| `crates/agent_ui/src/connections_screen.rs` | **Hexxed** | Desktop doesn't have this file |
| `crates/workspace/src/status_bar.rs` | **Hexxed** | Has hexxed's web preview fixes |
| `crates/agent_ui/src/language_model_selector.rs` | **Hexxed** | Has hexxed's opencode filter fix |
| `crates/editor/src/items.rs` | **Hexxed** | Desktop's restore commit had 1587-line change |
| `crates/agent_ui/src/conversation_view/thread_view.rs` | **Hexxed** | Major file (542-554KB) with divergent changes |
| `crates/agent_ui/src/agent_ui.rs` | **Desktop** | Has `default_agent_icon()`, `default_agent_icon_path()`, fixed `Agent::icon()` |
| `crates/sidebar/src/sidebar.rs` | **Desktop** (icon closure) | Brand icons per agent instead of Terminal |
| `crates/agent_ui/src/agent_screen.rs` | **Desktop** | Has `ensure_code_screen_on_right()` layout |
| `crates/agent_ui/src/agent_panel.rs` | **Desktop** (icon resolution + "Zed Agent" label) | 3-tier icon lookup, correct branding |
| `crates/agent_ui/src/agent_model_selector.rs` | **Desktop** | Icon fixes |
| `crates/shadcn_ui/*` | **Desktop** | Desktop added this crate |
| `crates/zed/src/dx_config.rs` | **Desktop** | Icon config updates |
| `assets/settings/default.json` | **Hexxed** (base) + merge | Both have divergent settings |
| `Cargo.lock` | Regenerate | Too divergent to merge manually |
| `justfile` | **Tricky** | Both have build changes |
| `crates/opencode/src/opencode.rs` | **Tricky** | Both have changes |
| `crates/web_preview/src/server.rs` | **Hexxed** | Desktop's restore rewrote it |
| `crates/web_preview/src/web_preview_view.rs` | **Hexxed** | Desktop's restore rewrote it |

### Manual Fixes After Merge

After the merge, these files will need manual reconciliation where both sides have meaningful (non-formatting) changes:

1. **`agent_panel.rs`** (616KB desktop vs 632KB hexxed)
   - Base: hexxed version (has more code)
   - Cherry-pick: the `default_agent_icon`/`default_agent_icon_path` imports (line 26), icon resolution in `render_toolbar()` (~lines 6527-6558), and "Zed Agent" label (line 6610)

2. **`thread_view.rs`** (542KB desktop vs 554KB hexxed)
   - Base: hexxed version (larger, more features)
   - Desktop's restore commit only touched 17 lines here — minor

3. **`web_preview_view.rs`** (40,698 lines desktop vs 40,684 lines hexxed)
   - Base: hexxed version (has dx_studio integration intact)
   - Desktop's restore commit touched this file too

4. **`web_preview/src/server.rs`**
   - Base: hexxed version
   - Desktop's restore added some changes here

### Alternative: Surgical Patch (No Merge)

If the cross-repo merge is too messy, apply only these 3 patches directly on hexxed/main:

1. **`agent_ui/src/agent_ui.rs`** (+25 lines)
   - Add `default_agent_icon()` function
   - Add `default_agent_icon_path()` function
   - Fix `Agent::icon()` to call `default_agent_icon()`

2. **`agent_ui/src/agent_screen.rs`** (+60 lines)
   - Add `ensure_code_screen_on_right()` function
   - Add `use editor::Editor` and `use workspace::pane_group::SplitDirection` imports
   - Call `ensure_code_screen_on_right()` in `open_or_focus()`

3. **`sidebar/src/sidebar.rs`** (+15 lines)
   - Import `default_agent_icon` and `default_agent_icon_path` from `agent_ui`
   - Update `resolve_agent_icon()` closure to use `agent.icon()` + fallback chain

**Total: ~100 lines across 3 files.**

---

## Verification Checklist

After the chosen approach, verify:

- [ ] Build succeeds (`cargo build`)
- [ ] Sidebar shows brand-specific icons per agent (not Terminal)
- [ ] AI screen auto-creates code editor pane on right
- [ ] Toolbar agent selector shows proper icons
- [ ] Web preview works (hexxed's version)
- [ ] DX Studio integration intact
- [ ] DX Forge backup/restore works
- [ ] DX Catalog Agent Bridge works
- [ ] AI provider dropdown has correct options (opencode filtered properly)
- [ ] "Zed Agent" label visible (not "Dx Agent")
- [ ] Theme-aware zai-acp SVG icons render correctly
