# WWW — WebPreview / Web-Tool Button Problem

Status: **FIX IMPLEMENTED — BUILD NOT YET VERIFIED** (last build was aborted by user at 17:xx, 2026-08-06).

## 1. The Problem

Two symptoms, same underlying cause:

1. **Web-tool icons in the status bar center** (9 icons: video, shader, 3d, design, whiteboard, presentations, spreadsheets, graphics, music) **do nothing when clicked from the agent (AI) screen**. They work from the code-editor screen.
2. **Dock WebPreview icon**: the FIRST click goes to the code-editor screen instead of the browser screen; the SECOND click works.

History: the same "can't leave the agent screen" family of bugs was already solved once via direct `activate_screen_kind` calls (sidebar 12-cell grid fix). This one was the WebPreview (browser screen) path, which used focus-based `window.dispatch_action` and kept failing.

## 2. Root Cause (PROVEN via gpui instrumentation)

The status bar dispatched `workspace::OpenWebPreview` with `window.dispatch_action(...)`, which is **focus-anchored**:

```
Window::dispatch_action → focus_id = self.focused(cx) → focus_node_id_in_rendered_frame(focus_id)
                       → DispatchTree::focusable_node_id(focus_id) → fallback: root node (DispatchNodeId(0))
                       → dispatch path = [root] only
```

Evidence from instrumented logs (`%LOCALAPPDATA%\Dx-Desktop\logs\Dx-Desktop.log`):

```
statusbar active_pane entity=EntityId(286v1) focus_handle=FocusHandle(FocusId(24v1))
Window::dispatch_action focus_id=Some(FocusId(24v1)) action=workspace::OpenWebPreview
DispatchTree::focusable_node_id target=FocusId(24v1) -> None
dispatch_action(deferred) node_id=DispatchNodeId(0) focus=Some(FocusId(24v1))
dispatch_action_on_node node_id=DispatchNodeId(0) path_len=1 path=[DispatchNodeId(0)] action=workspace::OpenWebPreview
(no listener fired → action silently dropped)
```

Why the anchor is unmapped on the AI screen (full-frame dumps):

```
focusable ids in rendered frame: [FocusId(9v1), FocusId(49v1), FocusId(45v1), FocusId(47v1), FocusId(3v1), FocusId(7v3), FocusId(4v1)]
   → the active pane handle FocusId(24v1) is NOT registered
view ids in rendered frame: [ ... 36 views ... ] → EntityId(286v1) (the active pane) is NOT present
```

- On the AI screen the center shows the agent screen in a layout where **the active pane (and its `track_focus` element, pane.rs:4628) is not part of the rendered dispatch tree** — `set_focus_handle` (window.rs) only registers focusable nodes from prepainted/reused elements, and the pane subtree is absent (the agent screen renders via its own screen path; the pane is not prepainted).
- Even `window.focus(&pane.focus_handle(cx), cx)` before dispatching did NOT help — the pre-focused handle is simply not in the rendered frame's tree either.
- `FocusId(24v1)` is the agent thread editor's delegated handle (`AgentPanel::focus_handle → ConversationView → ThreadView → active_editor`) — it is never the handle of a prepainted `track_focus` element, so it can never be found by focus-based dispatch.
- The `OpenWebPreview` listener lives on the workspace `actions()` div (`Workspace::actions`, workspace.rs), which is a **child** of the window root node (node 0). A dispatch path of `[root]` walks from root upward and can never reach a child node → listener never fires → click does nothing.

Failed attempts that were built and user-tested (all useless for this bug):
- `.track_focus(&self.focus_handle(cx))` on AgentScreen render root (agent_screen.rs) — the tracked handle is the delegated editor handle, never mapped. REMOVED.
- `window.focus(&active_pane.focus_handle(cx), cx)` pre-focus in status_bar on_click — pane not in rendered tree, no effect. REMOVED.

## 3. The Fix (implemented, unverified)

Stop anchoring dispatch on focus. Anchor it on a view that is ALWAYS rendered: **the StatusBar** (it is on screen even when the agent screen is shown). The StatusBar's dispatch node is a descendant of the workspace `actions()` div, so its bubble path includes the div that holds the `OpenWebPreview`/`NewWebPreview` listeners.

### Changes

1. **crates/gpui/src/key_dispatch.rs**
   - Added `pub fn view_node_id(&self, view_id: EntityId) -> Option<DispatchNodeId>` (reads `view_node_ids`).

2. **crates/gpui/src/window.rs**
   - Added `pub fn dispatch_action_on_view(&mut self, view_id: EntityId, action: Box<dyn Action>, cx: &mut App)`:
     resolves the view's dispatch node via `view_node_id` and runs `dispatch_action_on_node` on it (bubble path includes that node and all ancestors).
   - All `[DX-DBG]` instrumentation removed (dispatch_action, dispatch_action_on_node_inner capture/bubble logs).

3. **crates/workspace/src/status_bar.rs** (~line 193, web-tool icon `on_click`)
   - Replaced `window.focus(...)` + `window.dispatch_action(OpenWebPreview)` with:
     `window.dispatch_action_on_view(status_bar_entity_id /* = cx.entity().entity_id() */, Box::new(OpenWebPreview { project: id }), cx)`.
   - Removed the now-unused `Focusable` import and all debug logs.

4. **crates/workspace/src/workspace.rs** — `activate_screen_kind` (~line 6131)
   - `WorkspaceScreenKind::Browser`: `window.dispatch_action(NewWebPreview)` → `window.dispatch_action_on_view(self.status_bar.entity_id(), NewWebPreview, cx)`.
   - Other kinds (Agent/Automations/Connections/Tools/Editor/Terminal) inside the deferred branch: same switch to `dispatch_action_on_view` with the status bar entity id (captured before the `move` closure as `status_bar_entity_id`).
   - Kept the **retry loop** (up to 10 × 100 ms, `cx.spawn_in` + `background_executor` timer, `anyhow::Result<()>` + `.detach_and_log_err`) that rescans the target pane for the Browser item and `activate_item`s it — this is what fixes the **dock WebPreview first-click** symptom (the NewWebPreview tab is created by a deferred handler; a single-shot rescan ran too early). Debug logs inside removed.
   - `self.status_bar` field: `status_bar: Entity<StatusBar>` (workspace.rs:1400).

5. **crates/web_preview/src/web_preview.rs** — `OpenWebPreview` action handler (~line 66)
   - Logic unchanged: build url via `server::local_preview_url(&action.project)` (fallback `http://127.0.0.1:{port}/{project}` from `WebPreviewServerPort` global), call `workspace.activate_screen_kind(WorkspaceScreenKind::Browser, window, cx)`, then `cx.defer_in(...)` → `WebPreviewView::open_url_in_active_pane(workspace, &url, window, cx)`.
   - All `[DX-DBG]` logs removed.

6. **crates/web_preview/src/web_preview_view.rs** — `open_url_in_active_pane` (~line 959): `[DX-DBG]` log removed, logic unchanged.

7. **crates/agent_ui/src/agent_screen.rs** — removed the failed `.track_focus(&self.focus_handle(cx))` from AgentScreen render.

All `[DX-DBG]` strings removed from the whole `crates/` tree (verified with `rg "DX-DBG" crates`).

### Verification plan

```powershell
# 1. Build (last attempt was aborted — run to completion)
cargo build --locked -p zed --bin dx-desktop -j 2

# 2. Launch
Get-Process dx-desktop -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Process -FilePath "G:\Dx\desktop\target\debug\dx-desktop.exe" -ArgumentList "G:\Dx\desktop" -WorkingDirectory "G:\Dx\desktop"

# 3. Test
#  a) Code screen: click a web-tool icon → browser screen with that tool.
#  b) AI screen: click a web-tool icon → browser screen with that tool (was: nothing).
#  c) Dock WebPreview icon FIRST click → browser screen (was: code editor).
#     Second click → works as before.
#  d) Dock AI icon etc. still switch screens correctly.
```

Log location: `%LOCALAPPDATA%\Dx-Desktop\logs\Dx-Desktop.log` (app name "Dx-Desktop").
Note: the justfile launches with an older log path (`%LOCALAPPDATA%\Dx\logs\Dx.log`, stale) — prefer starting the exe directly.

## 4. Key code references

| Location | Role |
|---|---|
| crates/gpui/src/window.rs `dispatch_action` (~2061) | focus-anchored dispatch (kept as-is for keyboard/shortcut flows) |
| crates/gpui/src/window.rs `dispatch_action_on_view` (new) | view-anchored dispatch — the fix |
| crates/gpui/src/window.rs `focus_node_id_in_rendered_frame` (~5229) | falls back to root node when focus handle unmapped (the drop point) |
| crates/gpui/src/window.rs `set_focus_handle` (~4499) | only registers focusable nodes from prepainted/reused elements |
| crates/gpui/src/key_dispatch.rs `view_node_ids` (~77), `view_node_id` (new) | view → dispatch node map |
| crates/workspace/src/status_bar.rs (~193) | web-tool icon on_click (now view-anchored dispatch) |
| crates/workspace/src/workspace.rs `activate_screen_kind` (~6131) | screen switching; Browser branch dispatches NewWebPreview + retry rescan |
| crates/workspace/src/workspace.rs `actions()` / `add_workspace_actions_listeners` | where OpenWebPreview/NewWebPreview listeners live |
| crates/workspace/src/workspace.rs `render_center_screen` (~8597) | center render; agent screen replaces/none-in-dispatch-tree layout |
| crates/web_preview/src/web_preview.rs (~66) | OpenWebPreview handler: url → activate_screen_kind(Browser) → deferred open_url_in_active_pane |
| crates/web_preview/src/web_preview_view.rs `open_url_in_active_pane` (~959) | navigates the WebPreviewView tab to the tool url |
| crates/agent_ui/src/agent_screen.rs | AgentScreen item; track_focus removed |

## 5. What NOT to do again

- Do not try to fix this via focus (`window.focus`, `track_focus`, `FocusHandle::dispatch_action`): on the agent screen the focused handle is never part of the rendered dispatch tree, so focus-based dispatch always degrades to `[root]` and drops the action. This was proven empirically after 3 build-test cycles.
- Do not use global action listeners for this: the global capture phase listener signature is `(&dyn Any, DispatchPhase, &mut App)` — no `Window` — cannot open tabs/screens.
- If a screen-switch action still fails from the AI screen, check that its dispatch uses `dispatch_action_on_view` (status bar or another always-rendered view), not `dispatch_action`.
