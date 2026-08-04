use std::sync::Arc;
use std::time::Instant;

use gpui::{App, Global, ReadGlobal, SharedString};
use parking_lot::RwLock;

#[derive(Default)]
struct FontFamilyCacheState {
    loaded_at: Option<Instant>,
    font_families: Vec<SharedString>,
}

/// A cache for the list of font families.
///
/// Listing the available font families from the text system is expensive,
/// so we do it once and then use the cached values each render.
#[derive(Default)]
pub struct FontFamilyCache {
    state: Arc<RwLock<FontFamilyCacheState>>,
}

#[derive(Default)]
struct GlobalFontFamilyCache(Arc<FontFamilyCache>);

impl Global for GlobalFontFamilyCache {}

impl FontFamilyCache {
    /// Initializes the global font family cache.
    pub fn init_global(cx: &mut App) {
        cx.default_global::<GlobalFontFamilyCache>();
    }

    /// Returns the global font family cache.
    pub fn global(cx: &App) -> Arc<Self> {
        GlobalFontFamilyCache::global(cx).0.clone()
    }

    /// Returns the list of font families.
    pub fn list_font_families(&self, cx: &App) -> Vec<SharedString> {
        if self.state.read().loaded_at.is_some() {
            return self.state.read().font_families.clone();
        }

        let mut lock = self.state.write();
        lock.font_families = cx
            .text_system()
            .all_font_names()
            .into_iter()
            .map(SharedString::from)
            .collect();
        lock.loaded_at = Some(Instant::now());

        lock.font_families.clone()
    }

    /// Returns the list of font families if they have been loaded
    pub fn try_list_font_families(&self) -> Option<Vec<SharedString>> {
        self.state
            .try_read()
            .filter(|state| state.loaded_at.is_some())
            .map(|state| state.font_families.clone())
    }

    /// Prefetch all font names in the background
    pub async fn prefetch(&self, cx: &gpui::AsyncApp) {
        if self
            .state
            .try_read()
            .is_none_or(|state| state.loaded_at.is_some())
        {
            return;
        }

        let text_system = cx.update(|cx| App::text_system(cx).clone());

        let state = self.state.clone();

        cx.background_executor()
            .spawn(async move {
                // Enumerate fonts without holding the cache lock. Holding the write lock across
                // all_font_names() can block the UI thread for tens of seconds if Settings (or
                // another view) calls list_font_families during open/draw on Windows.
                let all_font_names = text_system
                    .all_font_names()
                    .into_iter()
                    .map(SharedString::from)
                    .collect();
                let mut lock = state.write();
                // Another caller may have filled the cache while we were enumerating.
                if lock.loaded_at.is_none() {
                    lock.font_families = all_font_names;
                    lock.loaded_at = Some(Instant::now());
                }
            })
            .await;
    }
}
