use std::path::PathBuf;

pub struct CodeDxConfig {
    pub sr_dir: PathBuf,
    pub receipts_dir: PathBuf,
}

impl CodeDxConfig {
    pub fn load() -> Self {
        let ws = find_root().unwrap_or_else(|| std::env::current_dir().unwrap_or_default());
        let sr = ws.join(".dx").join("serializer");
        let receipts = ws.join(".dx").join("receipts").join("code");
        Self {
            sr_dir: sr,
            receipts_dir: receipts,
        }
    }
}

fn find_root() -> Option<PathBuf> {
    let cwd = std::env::current_dir().ok()?;
    for ancestor in cwd.ancestors() {
        let candidate = ancestor.join("dx");
        if candidate.is_file() {
            let source = std::fs::read_to_string(&candidate).ok()?;
            let first = source.lines().find(|l| {
                let t = l.trim().trim_start_matches('\u{feff}');
                !t.is_empty() && !t.starts_with('#')
            })?;
            if !first.starts_with("project(")
                && !first.starts_with("contract(")
                && !first.starts_with("runtime(")
                && !first.starts_with("www(")
                && !(first.contains('[') && first.contains('('))
            {
                return Some(ancestor.to_path_buf());
            }
        }
    }
    None
}
