# Dx Desktop — Window / Dialog Hang Problems

**Date:** 2026-08-05  
**Platform:** Windows  
**Binary:** `dx-desktop.exe` (debug)  
**Symptom class:** App freezes → Windows **AppHangB1** → process killed

This document lists the **real problems** seen in this codebase (not guesses), where they live in code, and **how to fix them** in the editor.

---

## Executive summary

| # | Problem | User-visible effect | Root cause class |
|---|---------|---------------------|------------------|
| 1 | Second OS window via `cx.open_window` | Settings (old path), Audio Test, any centered **new GPUI window** freezes app | Windows + DirectX multi-window / re-entrancy |
| 2 | Native File Save / Open dialogs | Save As / Open may never appear; UI hangs | COM dialog on wrong thread / blocked UI |
| 3 | Invalid window handles on Drop | Log spam `0x80040102` / `0x80070578` near crash | HWND destroyed twice |
| 4 | Heavy work inside `open_window` effect flush | Long freezes even if window “creates” | `defer_in` / model build runs before first real frame |
| 5 | SVG parse spam | UI jank, can starve paint | Bad SVG paths re-parsed every frame |

**Rule of thumb for this app on Windows:**

> Prefer **tabs** and **in-window modals** (`toggle_modal`).  
> Avoid **new OS windows** (`cx.open_window`) and treat **system file dialogs** carefully.

---

## Problem 1 — Creating a centered second window freezes / crashes the app

### What happens

Anything that calls:

```rust
cx.open_window(WindowOptions {
    window_bounds: Some(WindowBounds::centered(...)),
    show: true,
    focus: true,
    kind: WindowKind::Normal, // or Dialog
    ...
}, |window, cx| { ... })
```

can **block the UI thread** for tens of seconds or forever. Logs stop at “entering open_window”; no further paint; Windows reports **AppHangB1**.

### Evidence (from production logs)

```text
OpenSettings: entering open_window
… (no “build_root begin”, no return) …
# or:
OpenSettings: creating Settings window
… ~51 seconds later …
OpenSettings: Settings window created
```

Then:

```text
Invalid window handle (0x80040102)   // RevokeDragDrop
Invalid window handle (0x80070578)   // DestroyWindow
Application Hang / AppHangB1
```

### Code locations

| File | What |
|------|------|
| `crates/gpui/src/app.rs` | `App::open_window` — creates platform window, builds root, **draws once** under an `App::update` lock |
| `crates/gpui_windows/src/window.rs` | `WindowsWindow::new` — `CreateWindowEx`, DirectX renderer, `SetWindowPlacement`, optional activate |
| `crates/gpui_windows/src/directx_renderer.rs` | Second swap chain / device use for a new HWND |
| Call sites e.g. | Old Settings path; `crates/settings_ui/src/pages/audio_test_window.rs` |

### Why it hangs (mechanism)

1. Main thread is inside `App::update` while `open_window` runs.
2. Creating/showing a second HWND can generate **WM_PAINT / activation** messages.
3. Those can re-enter GPUI while the first update stack is still active, or block on DirectX device work shared with the main window.
4. UI thread stops pumping messages → Windows marks the app hung.

Invalid-handle errors are often **aftermath** (window torn down while Drop still runs), not the first cause.

### How to solve (in the code editor)

**Preferred (product fix):** do **not** open a second OS window.

| Instead of | Do this |
|------------|---------|
| Settings as `open_window` | Settings as **workspace tab** (`Item` + `add_item_to_active_pane`) — **already done** in `settings_ui` |
| “Audio Test” / similar tools as new window | Embed as **tab**, **dock panel**, or **`workspace.toggle_modal`** |
| Centered “dialog window” | `workspace.toggle_modal(...)` (modal layer inside main window) |

**If a second window is truly required (platform fix):**

1. Create with `show: false`, `focus: false`.
2. Finish `open_window` and release the update stack.
3. Then `activate_window()` / show on a **later** turn (`on_next_frame` or short timer).
4. Never call `activate()` / `SetForegroundWindow` / `SendInput` **inside** `WindowsWindow::new` while still under `open_window`.
5. Keep first paint extremely light; load data **after** first frame (`on_next_frame`), never via `defer_in` that runs in the same `flush_effects` as `open_window`.
6. Audit every `cx.open_window` call site:

```text
rg -n "open_window" crates --glob "*.rs"
```

---

## Problem 2 — File Save (and Open) dialog not showing / hangs

### What happens

- **Save As** / save untitled buffer: dialog missing or app freezes.
- User may see a brief centered UI, then hang — or nothing at all.

### Two different “dialogs” in this codebase

| Kind | Implementation | Risk on Windows |
|------|----------------|-----------------|
| **In-app Save/Open picker** | `open_path_prompt` → `workspace.toggle_modal` + `Picker` | Low if main window is healthy |
| **Native Windows dialog** | `IFileSaveDialog` / `IFileOpenDialog` via `dialog.Show(hwnd)` | High if called wrong or UI thread stuck |

### Code locations

| File | Role |
|------|------|
| `crates/workspace/src/workspace.rs` | `prompt_for_new_path`, `prompt_for_open_path`, Save As action |
| `crates/open_path_prompt/src/open_path_prompt.rs` | In-app modal registration (`set_prompt_for_new_path`) |
| `crates/gpui_windows/src/platform.rs` | `prompt_for_new_path` / `prompt_for_paths` → `file_save_dialog` / `file_open_dialog` |
| Setting | `workspace.use_system_path_prompts` |

Native save:

```rust
// gpui_windows/src/platform.rs
self.foreground_executor().spawn(async move {
    let _ = tx.send(file_save_dialog(directory, suggested_name, window));
});
// ...
dialog.Show(window)  // COM modal; needs a live parent HWND and a pumping UI thread
```

### Why Save fails or hangs

1. **Native COM dialog on the foreground executor** while the main GPUI loop is already stressed or re-entered → dialog never paints or freezes the process.
2. **Invalid / missing parent HWND** (`find_current_active_window` returns none or a bad handle) → `Show` fails immediately (looks like “cancelled”) or misbehaves.
3. **`use_system_path_prompts: true`** forces native path when in-app path is not used (open path still gates on the setting in some branches).
4. If the app is **already hung** from Problem 1, **no** dialog (modal or native) can show.

There is already a comment in workspace code that native save can fail on some Windows/fork setups — that is why `on_prompt_for_new_path` exists.

### How to solve (in the code editor)

**A. Prefer in-app Save As (recommended for Dx on Windows)**

1. Ensure `open_path_prompt::OpenPathPrompt::register_new_path` runs for every workspace (check `zed` / workspace init).
2. Prefer in-app prompt always on Windows when registered:

```rust
// workspace.rs — prompt_for_new_path
// Keep: if on_prompt_for_new_path.is_some() → use modal picker
// Optionally force on Windows:
#[cfg(target_os = "windows")]
{
    // always use registered in-app prompt when present
}
```

3. Or set default settings:

```json
{
  "use_system_path_prompts": false
}
```

in default user/workspace settings for Windows builds.

**B. If native dialogs must stay**

1. Do **not** run `IFileSaveDialog::Show` on a path that blocks the same stack as heavy GPUI updates.
2. Ensure parent HWND is a valid app window (not null / not destroyed).
3. Log errors from `Show` instead of treating all failures as “user cancelled”.
4. After dialog returns, only then continue save on the main thread.

**C. Verify registration**

```text
rg -n "register_new_path|set_prompt_for_new_path" crates
```

If registration is missing, Save As falls through to native COM and hits Problem 2B.

---

## Problem 3 — Invalid window handle errors

### Log lines

```text
[crates/gpui_windows/src/window.rs] Invalid window handle (0x80040102)  // DRAGDROP_E_INVALIDHWND
[crates/gpui_windows/src/window.rs] Invalid window handle (0x80070578)  // ERROR_INVALID_WINDOW_HANDLE
```

### Cause

`WindowsWindow::Drop` calls `RevokeDragDrop` + `DestroyWindow` on an HWND that **WM_DESTROY already destroyed**.

### How to solve

In `crates/gpui_windows/src/window.rs` `Drop`:

1. If `!IsWindow(hwnd)` → return (already gone).
2. Else `RevokeDragDrop` / `DestroyWindow` and **log real failures** with `.log_err()` — do not hide real bugs by swallowing all errors.

Do **not** “fix” hangs only by silencing these logs.

---

## Problem 4 — Heavy work during first window construction

### Cause

`App::open_window` ends with `flush_effects()`.  
`cx.defer` / `cx.defer_in` scheduled in the root view constructor run **in that same flush**, so “deferred” work still blocks before the user sees a frame.

Building full Settings model (`page_data`, search index, font list) in that path → multi-second hang → AppHangB1.

### How to solve

| Bad | Good |
|-----|------|
| `cx.defer_in` inside `SettingsWindow::new` for heavy load | `cx.on_next_frame` after the view is in a live window/tab |
| `ListState::measure_all()` for huge lists | Virtualized list only |
| Font prefetch holding a write lock during `all_font_names()` | Enumerate fonts without holding the cache write lock |

Settings tab path already moves model load to after first paint; keep that pattern for any large UI.

---

## Problem 5 — SVG parse failures starving the UI

### Log

```text
SVG data parsing failed cause unknown token at 1:1
```

(and/or `currentColor` warnings)

### How to solve

1. Cache failed SVG paths after first failure (`SvgRenderer::invalid_paths`) — already partially done.
2. Fix or remove broken icon assets under `assets/icons/`.
3. Prefer icons that do not re-parse every frame.

---

## What is already fixed (do not regress)

| Item | Status |
|------|--------|
| Settings from topbar / sidebar cog | Opens as **workspace tab** (`OpenSettings`), not second window, not `settings.json` |
| Settings tab icon | Uses **DxCog** (same as sidebar cog) |
| Topbar height | `platform_title_bar_height` increased (Windows 48px) |
| Prefer not to use `OpenSettingsFile` for Settings UI | Use `OpenSettings` only for the graphical pane |

---

## Recommended fix order (for implementers)

1. **Ban / audit `cx.open_window` on Windows** for feature UI  
   - Convert remaining call sites to tab / modal / panel.
2. **File Save / Open**  
   - Force in-app `open_path_prompt` on Windows when registered.  
   - Only use native COM as explicit fallback with logging.
3. **Window Drop**  
   - `IsWindow` guard + log real destroy failures.
4. **Never heavy-init in `open_window` constructors**  
   - `on_next_frame` + chunked work.
5. **SVG**  
   - Keep invalid-path cache; fix bad assets.
6. **Verify**  
   - `just run`  
   - Save As on untitled file → modal appears, app stays responsive.  
   - Settings cog → tab opens.  
   - No AppHangB1 for 5+ minutes of normal use.

---

## Quick diagnostic checklist

When something “doesn’t show” and the app hangs:

```text
1. Open %LOCALAPPDATA%\Dx-Desktop\logs\Dx-Desktop.log
2. Search for: open_window | OpenSettings | prompt | Invalid window | hang
3. If last line is “entering open_window” / “creating … window” → Problem 1
4. If Save As and no modal and use_system_path_prompts true → Problem 2
5. If Invalid window handle only at exit after hang → Problem 3 (symptom)
```

### Code search commands

```text
rg -n "open_window" crates --glob "*.rs"
rg -n "prompt_for_new_path|file_save_dialog|IFileSaveDialog" crates --glob "*.rs"
rg -n "use_system_path_prompts" crates --glob "*.rs"
rg -n "WindowBounds::centered" crates --glob "*.rs"
```

---

## One-line rule for the code editor

**On Windows, feature UI = tab or in-window modal. Second OS windows and fragile native file dialogs are the hang/crash class of bugs this project keeps hitting.**
