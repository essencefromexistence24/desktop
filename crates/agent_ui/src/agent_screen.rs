use editor::Editor;
use gpui::{
    App, AppContext as _, Context, Entity, EventEmitter, FocusHandle, Focusable, Render,
    SharedString, Window,
};
use ui::{Icon, prelude::*};
use workspace::{
    Item, Workspace,
    item::{ItemEvent, WorkspaceScreenKind},
    pane_group::SplitDirection,
};

use crate::AgentPanel;

pub struct AgentScreen {
    panel: Entity<AgentPanel>,
}

impl AgentScreen {
    fn ensure_code_screen_on_right(
        workspace: &mut Workspace,
        ai_pane: &Entity<workspace::Pane>,
        window: &mut Window,
        cx: &mut Context<Workspace>,
    ) {
        let editor_pane = workspace.panes().iter().find(|pane| {
            *pane != ai_pane
                && pane
                    .read(cx)
                    .items()
                    .any(|item| item.screen_kind(cx) == WorkspaceScreenKind::Editor)
        });
        if editor_pane.is_some() {
            return;
        }

        if ai_pane
            .read(cx)
            .active_item()
            .is_some_and(|item| item.screen_kind(cx) == WorkspaceScreenKind::Editor)
        {
            workspace.split_and_move(ai_pane.clone(), SplitDirection::Right, window, cx);
            return;
        }

        let code_pane = workspace
            .panes()
            .iter()
            .find(|pane| *pane != ai_pane && pane.read(cx).items_len() == 0)
            .cloned()
            .unwrap_or_else(|| {
                workspace.split_pane(ai_pane.clone(), SplitDirection::Right, window, cx)
            });
        let project = workspace.project().clone();
        let create_buffer = project.update(cx, |project, cx| project.create_buffer(None, true, cx));

        cx.spawn_in(window, async move |workspace, cx| {
            let buffer = create_buffer.await?;
            workspace.update_in(cx, |workspace, window, cx| {
                let editor = cx.new(|cx| Editor::for_buffer(buffer, Some(project), window, cx));
                workspace.add_item(code_pane, Box::new(editor), None, true, false, window, cx);
            })
        })
        .detach_and_log_err(cx);
    }

    pub(crate) fn new(workspace: &Workspace, window: &mut Window, cx: &mut Context<Self>) -> Self {
        let panel = cx.new(|cx| AgentPanel::new_builder_workspace(workspace, window, cx));
        Self { panel }
    }

    pub(crate) fn open_or_focus(
        workspace: &mut Workspace,
        window: &mut Window,
        cx: &mut Context<Workspace>,
    ) {
        workspace.dismiss_zoomed_agent_panel(window, cx);

        let existing_item = workspace
            .pane_for_screen_kind(WorkspaceScreenKind::Agent, cx)
            .and_then(|pane| {
                pane.read(cx).items().find_map(|item| {
                    (item.screen_kind(cx) == WorkspaceScreenKind::Agent).then(|| item.boxed_clone())
                })
            });
        if let Some(item) = existing_item {
            if let Some(ai_pane) = workspace.pane_for(&*item) {
                Self::ensure_code_screen_on_right(workspace, &ai_pane, window, cx);
            }
            if let Some(agent_screen) = item.downcast::<AgentScreen>() {
                agent_screen.update(cx, |agent_screen, cx| {
                    agent_screen.panel.update(cx, |panel, cx| {
                        panel.ensure_builder_workspace_chrome();
                        cx.notify();
                    });
                });
            }
            workspace.activate_item(&*item, true, true, window, cx);
            return;
        }

        let target_pane = workspace.screen_host_pane();
        Self::ensure_code_screen_on_right(workspace, &target_pane, window, cx);
        let item = cx.new(|cx| Self::new(workspace, window, cx));
        workspace.add_item(target_pane, Box::new(item), None, true, true, window, cx);
    }
}

impl EventEmitter<ItemEvent> for AgentScreen {}

impl Focusable for AgentScreen {
    fn focus_handle(&self, cx: &App) -> FocusHandle {
        self.panel.read(cx).focus_handle(cx)
    }
}

impl Item for AgentScreen {
    type Event = ItemEvent;

    fn tab_content_text(&self, _detail: usize, _cx: &App) -> SharedString {
        "AI".into()
    }

    fn tab_icon(&self, _window: &Window, _cx: &App) -> Option<Icon> {
        Some(Icon::new(dx_icon(DxUiIcon::Agent)))
    }

    fn telemetry_event_text(&self) -> Option<&'static str> {
        Some("Agent Screen Opened")
    }

    fn screen_kind(&self) -> WorkspaceScreenKind {
        WorkspaceScreenKind::Agent
    }

    fn show_toolbar(&self) -> bool {
        true
    }

    fn can_split(&self) -> bool {
        true
    }

    fn clone_on_split(
        &self,
        _workspace_id: Option<workspace::WorkspaceId>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> gpui::Task<std::option::Option<gpui::Entity<Self>>> {
        let cloned_panel = self.panel.clone();
        window.spawn(cx, async move |cx| {
            cx.update(|_, cx| {
                cx.new(|_| AgentScreen {
                    panel: cloned_panel,
                })
            })
            .ok()
        })
    }
}

impl Render for AgentScreen {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        div()
            .size_full()
            .child(self.panel.clone())
    }
}
