#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) enum ClipboardOperationMode {
    Copy,
    Move,
}

impl ClipboardOperationMode {
    pub(crate) fn paste_tooltip(self) -> &'static str {
        match self {
            Self::Copy => "Copy Here",
            Self::Move => "Move Here",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) struct ClipboardOperationSummary {
    pub mode: ClipboardOperationMode,
}

impl ClipboardOperationSummary {
    pub(crate) fn new(mode: ClipboardOperationMode, item_count: usize) -> Option<Self> {
        (item_count > 0).then_some(Self { mode })
    }
}
