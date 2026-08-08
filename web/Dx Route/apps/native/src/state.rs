use std::sync::Mutex;

pub struct AppState {
    pub is_online: Mutex<bool>,
}
