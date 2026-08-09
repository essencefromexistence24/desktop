#[tauri::command]
pub fn send_message() -> String {
    "Chat command".into()
}
