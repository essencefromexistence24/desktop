#[tauri::command]
pub fn get_system_info() -> String {
    format!("{}", std::env::consts::OS)
}
