#[tauri::command]
pub fn check_update() -> String {
    "No updates available".into()
}
