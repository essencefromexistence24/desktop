use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    process::{Command, Stdio},
    sync::atomic::{AtomicU16, AtomicU64, Ordering},
    sync::{Arc, OnceLock},
    thread,
};

use assets::Assets;
use axum::{
    Router,
    body::Body,
    extract::{
        Path as AxumPath,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    http::{
        StatusCode,
        header::{ACCEPT, CACHE_CONTROL, CONTENT_TYPE},
    },
    response::IntoResponse,
    routing::get,
};
use futures::SinkExt;
use futures::stream::StreamExt;
use gpui::AssetSource;
use tiny_http::{Header, Response, Server};
use tokio::runtime::Runtime;
use tokio::sync::broadcast;
use tracing::{error, info, warn};

const DX_PREVIEW_PORT: u16 = 3737;

/// Maximum concurrent WebSocket connections for the agent cursor relay.
const MAX_WS_CONNECTIONS: usize = 16;

/// Maximum size of a single WebSocket message in bytes (1 MB).
const MAX_WS_MESSAGE_BYTES: usize = 1 << 20;

/// Actual port in use (fixed or fallback). Updated by the server starter.
static DX_PREVIEW_ACTUAL_PORT: AtomicU16 = AtomicU16::new(0);

/// Get or create a shared multi-threaded Tokio runtime for all async tasks
/// in this module (static file servers, WS relay, etc.).
fn shared_tokio_runtime() -> &'static Runtime {
    static RT: OnceLock<Runtime> = OnceLock::new();
    RT.get_or_init(|| Runtime::new().expect("failed to create shared tokio runtime"))
}

/// Maps a DX web tool id (as used by the chat-input logo strip and the
/// `OpenWebPreview` action) to the on-disk project directory name under the
/// DX web root. The directory names are matched case-insensitively, so this
/// table only needs to exist for ids whose folder name differs from the id.
fn project_dir_name(tool_id: &str) -> &str {
    match tool_id {
        "3d" => "3d",
        "design" => "Design",
        "graphics" => "Graphics",
        "presentations" => "Presentations",
        "spreadsheets" => "Spreadsheets",
        "video" => "Video",
        "whiteboard" => "whiteboard",
        "shader" => "shader",
        "dx-web" => "Metasearch",
        // The tool id is `route` but the checked-out folder is `Router`. Without
        // this entry the case-insensitive scans compare "route" against "Router"
        // and never match, so the tool resolves to nothing.
        "route" => "Router",
        other => other,
    }
}

/// Resolve a project folder under `root` whose name matches `wanted`
/// case-insensitively. Windows is case-insensitive anyway, but the checkout
/// names differ in more than case for some tools (`route` -> `Router`), so a
/// plain `join` is not enough.
fn resolve_dir_case_insensitive(root: &Path, wanted: &str) -> Option<PathBuf> {
    let direct = root.join(wanted);
    if direct.is_dir() {
        return Some(direct);
    }

    std::fs::read_dir(root)
        .ok()?
        .flatten()
        .map(|entry| entry.path())
        .find(|path| {
            path.is_dir()
                && path
                    .file_name()
                    .and_then(|name| name.to_str())
                    .is_some_and(|name| name.eq_ignore_ascii_case(wanted))
        })
}

/// Stable per-tool preview ports. Fixed ports keep the tool on the same
/// origin across desktop restarts, so the page's localStorage/sessionStorage
/// (e.g. Graph access token, Train settings) survives.
fn stable_port_for_tool(tool_id: &str) -> Option<u16> {
    let base: u16 = 4200;
    let index = match tool_id {
        "design" => 1,
        "graphics" => 2,
        "presentations" => 3,
        "spreadsheets" => 4,
        "video" => 5,
        "whiteboard" => 6,
        "cms" => 7,
        "graph" => 8,
        "media" => 9,
        "train" => 10,
        "metasearch" => 11,
        "3d" => 12,
        "shader" => 13,
        "dx-web" => 14,
        "route" => 15,
        _ => return None,
    };
    Some(base + index)
}

/// Backend ports for tools that ship a real server component. Kept distinct
/// from the agent cursor WS relay (3001) and the preview port range (42xx).
const CMS_BACKEND_PORT: u16 = 3002;
const METASEARCH_BACKEND_PORT: u16 = 8888;
const TRAIN_BACKEND_PORT: u16 = 8890;
const ROUTE_BACKEND_PORT: u16 = 3004;

/// Spawn the real backend for a tool that has one and return its origin.
/// Returns `None` when the backend is unavailable (missing runtime/binary),
/// in which case the caller falls back to the static preview server.
fn spawn_backend_for_tool(tool_id: &str) -> Option<String> {
    match tool_id {
        "cms" => spawn_cms_backend(),
        "metasearch" => spawn_metasearch_backend(),
        "route" => spawn_route_backend(),
        "train" => spawn_train_backend(),
        _ => None,
    }
}

/// The CMS admin SPA is mounted under `/admin`. The site root is reserved for
/// published pages and answers 404 until a site is actually published, so the
/// preview has to open `/admin` directly.
fn cms_origin() -> String {
    format!("http://127.0.0.1:{}/admin/", CMS_BACKEND_PORT)
}

fn spawn_cms_backend() -> Option<String> {
    let root = web_root()?;
    let cms_dir = root.join("Cms");
    if !cms_dir.join("dist").join("index.html").is_file() || !cms_dir.join("server").is_dir() {
        return None;
    }

    // Check the port is free first — if something already answers on 3002
    // with our API, reuse it instead of starting a second server.
    if std::net::TcpListener::bind(("127.0.0.1", CMS_BACKEND_PORT)).is_err() {
        info!(
            port = CMS_BACKEND_PORT,
            "CMS backend port already in use, reusing"
        );
        return Some(cms_origin());
    }

    let bun = find_executable("bun")?;
    let db_path = cms_dir.join(".tmp").join("dev.db");
    let db_url = format!("sqlite:{}", db_path.to_string_lossy().replace('\\', "/"));

    match Command::new(&bun)
        .args(["run", "server/index.ts"])
        .current_dir(&cms_dir)
        .env("PORT", CMS_BACKEND_PORT.to_string())
        .env("DATABASE_URL", &db_url)
        .env("STATIC_DIR", "./dist")
        .env("HOST", "127.0.0.1")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
    {
        Ok(_) => {
            info!(port = CMS_BACKEND_PORT, "CMS backend spawned");
            Some(cms_origin())
        }
        Err(e) => {
            warn!(%e, "failed to spawn CMS backend");
            None
        }
    }
}

fn spawn_metasearch_backend() -> Option<String> {
    let metasearch_root = resolve_metasearch_root()?;

    if std::net::TcpListener::bind(("127.0.0.1", METASEARCH_BACKEND_PORT)).is_err() {
        info!(
            port = METASEARCH_BACKEND_PORT,
            "Metasearch backend port already in use, reusing"
        );
        return Some(format!("http://127.0.0.1:{}/", METASEARCH_BACKEND_PORT));
    }

    let binary = find_metasearch_binary(&metasearch_root)?;

    match Command::new(&binary)
        .current_dir(&metasearch_root)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
    {
        Ok(_) => {
            info!(port = METASEARCH_BACKEND_PORT, "Metasearch backend spawned");
            Some(format!("http://127.0.0.1:{}/", METASEARCH_BACKEND_PORT))
        }
        Err(e) => {
            warn!(%e, "failed to spawn Metasearch backend");
            None
        }
    }
}

/// Resolve the Metasearch backend root: the directory that contains `config.toml`
/// (and the `templates/` + `static/` dirs it references).
///
/// Resolution order:
/// 1. `DX_METASEARCH_ROOT` environment override.
/// 2. The `cwd` from the `companion()` block in `<webRoot>/Metasearch/dx`
///    (resolved relative to the project dir, e.g. `../../../metasearch`).
/// 3. A `metasearch` sibling of the DX web root (e.g. `G:\Dx\metasearch`).
fn resolve_metasearch_root() -> Option<PathBuf> {
    if let Ok(env) = std::env::var("DX_METASEARCH_ROOT") {
        let p = PathBuf::from(env);
        if p.join("config.toml").is_file() {
            return Some(p);
        }
    }

    if let Some(root) = web_root() {
        let proj_dir = root.join("Metasearch");
        let dx_file = proj_dir.join("dx");
        if dx_file.is_file() {
            if let Ok(contents) = std::fs::read_to_string(&dx_file) {
                for line in contents.lines().map(str::trim) {
                    if let Some(rest) = line.strip_prefix("cwd") {
                        let raw = rest
                            .split_once('=')
                            .map(|(_, v)| v)
                            .unwrap_or(rest)
                            .trim()
                            .trim_matches('"')
                            .trim_matches(',')
                            .trim();
                        if !raw.is_empty() {
                            if let Ok(joined) = proj_dir.join(raw).canonicalize() {
                                if joined.join("config.toml").is_file() {
                                    return Some(joined);
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }

        // Fallback: `<webRoot parent>/metasearch` (the canonical dev layout `G:\Dx\metasearch`).
        if let Some(parent) = root.parent() {
            let cand = parent.join("metasearch");
            if cand.join("config.toml").is_file() {
                return Some(cand);
            }
        }
    }

    None
}

/// Locate the metasearch companion binary. Tries the repo's own build outputs first
/// (`target/release`, `target/debug`, `bin`), then the shared `{webRoot}/../bin`
/// (e.g. `G:\Dx\bin\dx-metasearch.exe`).
fn find_metasearch_binary(root: &Path) -> Option<PathBuf> {
    let exe = if cfg!(windows) {
        "metasearch.exe"
    } else {
        "metasearch"
    };
    let dx_exe = if cfg!(windows) {
        "dx-metasearch.exe"
    } else {
        "dx-metasearch"
    };

    let mut candidates = vec![
        root.join("target").join("release").join(exe),
        root.join("target").join("debug").join(exe),
        root.join("bin").join(dx_exe),
        root.join(dx_exe),
    ];

    if let Some(web_root) = web_root() {
        if let Some(parent) = web_root.parent() {
            candidates.push(parent.join("bin").join(dx_exe));
        }
    }

    for c in candidates {
        if c.is_file() {
            return Some(c);
        }
    }
    None
}

/// Ensure the Train workflow's supporting services are running. Returns the origin of the
/// *live* backend that should be used, or `None` when it's unavailable (callers then fall
/// back to the static preview server for this tool).
fn spawn_train_backend() -> Option<String> {
    spawn_or_reuse_llama_server();
    None
}

/// Find `llama-server` on PATH and start it on `TRAIN_BACKEND_PORT` if it's not already
/// listening there. Used by the Train workflow so the chat backend has a live endpoint.
fn spawn_or_reuse_llama_server() {
    if std::net::TcpListener::bind(("127.0.0.1", TRAIN_BACKEND_PORT)).is_err() {
        info!(
            port = TRAIN_BACKEND_PORT,
            "llama-server already listening, reusing"
        );
        return;
    }

    let Some(binary) = find_executable("llama-server") else {
        warn!("llama-server not found on PATH; Train chat backend unavailable");
        return;
    };

    let port = TRAIN_BACKEND_PORT.to_string();
    match Command::new(&binary)
        .args(["--host", "127.0.0.1", "--port", &port])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
    {
        Ok(_) => info!(port = TRAIN_BACKEND_PORT, "llama-server spawned"),
        Err(e) => warn!(%e, "failed to spawn llama-server"),
    }
}

/// Spawn the Route Next.js app on the fixed backend port. Route's production
/// build lives under `<Router>/.next` and is served via `next start` (the app
/// has middleware, API routes and a SQLite database, so it cannot be statically
/// exported like the other tools). PORT is overridden to the fixed backend port
/// so the dashboard is reachable on the same origin as the other tools.
fn spawn_route_backend() -> Option<String> {
    // `Route` never existed on disk — the app lives in `Router`. Resolve the
    // folder case-insensitively so a renamed checkout can't silently break the
    // lookup again.
    let route_root = std::env::var("DX_ROUTE_ROOT")
        .ok()
        .map(PathBuf::from)
        .or_else(|| {
            let root = web_root()?;
            resolve_dir_case_insensitive(root, project_dir_name("route"))
        })?;

    // The production build lives in `.next` as `next start`. Require it.
    if !route_root.join(".next").is_dir() {
        warn!(root = %route_root.display(), "Route build output missing (.next)");
        return None;
    }

    if std::net::TcpListener::bind(("127.0.0.1", ROUTE_BACKEND_PORT)).is_err() {
        info!(
            port = ROUTE_BACKEND_PORT,
            "Route backend port already in use, reusing"
        );
        return Some(format!("http://127.0.0.1:{}/", ROUTE_BACKEND_PORT));
    }

    let node = find_executable("node")?;
    let next_bin = resolve_next_bin(&route_root, &node)?;
    match Command::new(&node)
        .arg(&next_bin)
        .args([
            "start",
            "-p",
            &ROUTE_BACKEND_PORT.to_string(),
            "-H",
            "127.0.0.1",
        ])
        .current_dir(&route_root)
        .env("NODE_ENV", "production")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
    {
        Ok(_) => {
            info!(port = ROUTE_BACKEND_PORT, "Route backend spawned");
            Some(format!("http://127.0.0.1:{}/", ROUTE_BACKEND_PORT))
        }
        Err(e) => {
            warn!(%e, "failed to spawn Route backend");
            None
        }
    }
}

/// Resolve the local `next` CLI entry for a project so `next start` runs against
/// that project's own install (`node_modules/.bin/next` or `node_modules/next/dist/bin/next`).
fn resolve_next_bin(project_root: &Path, node: &Path) -> Option<PathBuf> {
    let candidates = [
        project_root
            .join("node_modules")
            .join("next")
            .join("dist")
            .join("bin")
            .join("next"),
        project_root.join("node_modules").join(".bin").join("next"),
    ];
    for c in candidates {
        if c.is_file() {
            return Some(c);
        }
    }
    // Fall back to resolving the package script via node -e.
    if let Ok(out) = Command::new(node)
        .args(["-e", "console.log(require.resolve('next/dist/bin/next'))"])
        .current_dir(project_root)
        .output()
    {
        let p = String::from_utf8_lossy(&out.stdout).trim().to_string();
        if !p.is_empty() {
            let q = PathBuf::from(p);
            if q.is_file() {
                return Some(q);
            }
        }
    }
    None
}

/// Find an executable on PATH (Windows: also with .exe appended).
fn find_executable(name: &str) -> Option<PathBuf> {
    let path_var = std::env::var_os("PATH")?;
    for dir in std::env::split_paths(&path_var) {
        let candidate = dir.join(name);
        if candidate.is_file() {
            return Some(candidate);
        }
        #[cfg(windows)]
        {
            let candidate = dir.join(format!("{name}.exe"));
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }
    None
}

/// Discover the DX web root: the directory that contains the bundled web tool
/// projects (`shader`, `whiteboard`, the Next.js apps, ...). Each project is
/// expected to expose its static output under `<project>/.dx/www/output`.
///
/// Resolution order:
/// 1. `DX_WEB_ROOT` environment override.
/// 2. A `web` directory found by walking ancestors of the current dir and the
///    running executable (also checking `<ancestor>/web` and
///    `<ancestor>/code/web`).
/// 3. The `G:\Dx\code\web` fallback used by the canonical DX dev layout.
fn find_dx_web_root() -> Option<PathBuf> {
    if let Ok(env) = std::env::var("DX_WEB_ROOT") {
        let p = PathBuf::from(env);
        if is_dx_web_root(&p) {
            return Some(p);
        }
    }

    let mut candidates: Vec<PathBuf> = Vec::new();
    if let Ok(cwd) = std::env::current_dir() {
        candidates.push(cwd);
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            candidates.push(parent.to_path_buf());
        }
    }

    for start in candidates {
        let mut dir = Some(start.as_path());
        while let Some(d) = dir {
            if is_dx_web_root(d) {
                return Some(d.to_path_buf());
            }
            for nested in [d.join("web"), d.join("code").join("web")] {
                if is_dx_web_root(&nested) {
                    return Some(nested);
                }
            }
            dir = d.parent();
        }
    }

    let fallback = PathBuf::from(r"G:\Dx\desktop\web");
    if is_dx_web_root(&fallback) {
        return Some(fallback);
    }
    let fallback2 = PathBuf::from(r"G:\Dx\code\web");
    if is_dx_web_root(&fallback2) {
        return Some(fallback2);
    }

    None
}

fn is_dx_web_root(p: &Path) -> bool {
    p.is_dir() && (p.join("shader").is_dir() || p.join("whiteboard").is_dir())
}

fn web_root() -> Option<&'static Path> {
    static WEB_ROOT: OnceLock<Option<PathBuf>> = OnceLock::new();
    WEB_ROOT.get_or_init(find_dx_web_root).as_deref()
}

/// Resolve the static output directory for a tool id, matching the project
/// folder case-insensitively and requiring a built `index.html`.
fn project_output_dir(tool_id: &str) -> Option<PathBuf> {
    let wanted = project_dir_name(tool_id);

    // Per task: support professional folders with built static exports (HTML/CSS/JS from next export)
    // copied to assets/web/<professional-name>/ (index.html directly under it). These take precedence
    // for the 7 nextjs projects so clicking their icons in AI input opens webpreview to localhost url
    // serving the copied static (served at own origin for asset paths).
    if let Some(assets_root) = find_assets_web_root() {
        let mut p = assets_root.join(wanted);
        if p.join("index.html").is_file() {
            return Some(p);
        }
        // case-insensitive
        if let Ok(rd) = std::fs::read_dir(&assets_root) {
            if let Some(found) = rd.flatten().map(|e| e.path()).find(|pp| {
                pp.is_dir()
                    && pp
                        .file_name()
                        .and_then(|n| n.to_str())
                        .is_some_and(|n| n.eq_ignore_ascii_case(wanted))
                    && pp.join("index.html").is_file()
            }) {
                return Some(found);
            }
        }
    }

    // Original: for 2 www framework (whiteboard/shader) and any built inside web sources under <name>/.dx/www/output
    let root = web_root()?;
    let project_dir = resolve_dir_case_insensitive(root, wanted)?;

    let output_dir = project_dir.join(".dx").join("www").join("output");
    output_dir
        .join("index.html")
        .is_file()
        .then_some(output_dir)
}

/// Find assets/web professional static outputs root (for copied nextjs exports).
/// Walks similar to web root, prefers <cwd>/assets/web , exe parent/assets/web , G:\Dx\code\assets\web
fn find_assets_web_root() -> Option<PathBuf> {
    if let Ok(env) = std::env::var("DX_ASSETS_WEB_ROOT") {
        let p = PathBuf::from(env);
        if p.is_dir() {
            return Some(p);
        }
    }

    let mut candidates: Vec<PathBuf> = Vec::new();
    if let Ok(cwd) = std::env::current_dir() {
        candidates.push(cwd.join("assets").join("web"));
        candidates.push(cwd);
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            candidates.push(parent.join("assets").join("web"));
            candidates.push(parent.to_path_buf());
        }
    }

    for start in candidates {
        let mut dir = Some(start.as_path());
        while let Some(d) = dir {
            let candidate = d.join("assets").join("web");
            if candidate.is_dir() && has_output_subdirs(&candidate) {
                return Some(candidate);
            }
            // Also check if `start` itself is assets/web
            if d.file_name().map_or(false, |n| n == "web")
                && d.parent()
                    .map_or(false, |pp| pp.file_name().map_or(false, |n| n == "assets"))
                && has_output_subdirs(d)
            {
                return Some(d.to_path_buf());
            }
            dir = d.parent();
        }
    }

    // fallback — support both G:\Dx\desktop\assets\web and legacy G:\Dx\code\assets\web
    let fb = PathBuf::from(r"G:\Dx\desktop\assets\web");
    if fb.is_dir() {
        return Some(fb);
    }
    let fb2 = PathBuf::from(r"G:\Dx\code\assets\web");
    if fb2.is_dir() { Some(fb2) } else { None }
}

fn has_output_subdirs(p: &Path) -> bool {
    std::fs::read_dir(p).map_or(false, |rd| {
        rd.flatten()
            .any(|e| e.path().is_dir() && e.path().join("index.html").is_file())
    })
}

#[derive(Default)]
struct ProjectServers {
    ports: HashMap<String, u16>,
}

static PROJECT_SERVERS: std::sync::LazyLock<std::sync::Mutex<ProjectServers>> =
    std::sync::LazyLock::new(|| std::sync::Mutex::new(ProjectServers::default()));

fn lock_project_servers() -> std::sync::MutexGuard<'static, ProjectServers> {
    PROJECT_SERVERS.lock().unwrap_or_else(|e| e.into_inner())
}

pub fn local_preview_url(tool_id: &str) -> Option<String> {
    let mut servers = lock_project_servers();
    if let Some(&port) = servers.ports.get(tool_id) {
        return Some(format!("http://127.0.0.1:{}/", port));
    }

    // Tools with a real backend are served from their backend origin so the
    // app's own API calls work (same origin, no CORS).
    if let Some(backend) = spawn_backend_for_tool(tool_id) {
        servers
            .ports
            .insert(tool_id.to_string(), backend_origin_port(&backend)?);
        return Some(backend);
    }

    let root = match project_output_dir(tool_id) {
        Some(r) => r,
        None => {
            warn!(tool = tool_id, "no output directory for tool");
            return None;
        }
    };
    match start_axum_static_server_for_tool(tool_id.to_string(), root) {
        Some(port) => {
            servers.ports.insert(tool_id.to_string(), port);
            Some(format!("http://127.0.0.1:{}/", port))
        }
        None => {
            warn!(tool = tool_id, "failed to start static file server");
            None
        }
    }
}

/// Parse the port out of an origin that may also carry a path (the CMS origin
/// is `http://127.0.0.1:3002/admin/`). The port lives in the authority, so the
/// scheme and path have to be stripped before splitting on the last colon.
fn backend_origin_port(origin: &str) -> Option<u16> {
    let authority = origin
        .split_once("://")
        .map(|(_, rest)| rest)
        .unwrap_or(origin)
        .split('/')
        .next()?;

    authority.rsplit(':').next()?.parse().ok()
}

pub fn ensure_dx_preview_server_running() {
    static STARTED: OnceLock<()> = OnceLock::new();
    STARTED.get_or_init(|| {
        start_agent_cursor_ws_relay();
        let ids = [
            "design",
            "graphics",
            "presentations",
            "spreadsheets",
            "video",
            "whiteboard",
            "cms",
            "graph",
            "media",
            "train",
            "metasearch",
            "3d",
            "shader",
            "route",
            "dx-web",
        ];
        for id in ids {
            let _ = local_preview_url(id);
        }
    });
}

/// Tracks the number of active WebSocket connections for rate-limiting purposes.
static WS_ACTIVE_CONNECTIONS: AtomicU64 = AtomicU64::new(0);
static WS_CONN_ID: AtomicU64 = AtomicU64::new(0);

/// Start a shared WebSocket relay for the agent cursor system.
/// AI agents connect here and send JSON commands; the server relays
/// them to all connected browser clients.
/// Port is configured via `AGENT_CURSOR_PORT` env var (default: 3001).
pub fn start_agent_cursor_ws_relay() -> Option<u16> {
    static STARTED: OnceLock<Option<u16>> = OnceLock::new();
    *STARTED.get_or_init(|| start_agent_cursor_ws_relay_inner())
}

fn start_agent_cursor_ws_relay_inner() -> Option<u16> {
    let port: u16 = std::env::var("AGENT_CURSOR_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3001);

    let addr = format!("127.0.0.1:{}", port);
    let listener = match std::net::TcpListener::bind(&addr) {
        Ok(l) => l,
        Err(e) => {
            error!(%e, port, "failed to bind agent cursor WS relay");
            return None;
        }
    };
    let actual_port = listener.local_addr().ok()?.port();

    let (tx, _) = broadcast::channel::<String>(256);

    let app = Router::new().route(
        "/",
        get({
            let tx = tx;
            move |ws: WebSocketUpgrade| async move {
                ws.on_upgrade(move |socket| handle_agent_cursor_ws(socket, tx))
            }
        }),
    );

    let rt = shared_tokio_runtime();
    thread::Builder::new()
        .name("agent-cursor-ws-relay".to_string())
        .spawn(move || {
            rt.block_on(async move {
                info!(port = actual_port, "agent cursor relay listening");
                if let Ok(server) = axum::Server::from_tcp(listener) {
                    if let Err(e) = server.serve(app.into_make_service()).await {
                        error!(%e, "agent cursor relay server error");
                    }
                }
            });
        })
        .ok()?;

    Some(actual_port)
}

async fn handle_agent_cursor_ws(socket: WebSocket, tx: broadcast::Sender<String>) {
    let conn_id = WS_CONN_ID.fetch_add(1, Ordering::Relaxed);
    let active = WS_ACTIVE_CONNECTIONS.fetch_add(1, Ordering::Relaxed) + 1;

    if active as usize > MAX_WS_CONNECTIONS {
        warn!(
            conn_id,
            active, "dropping connection — too many concurrent connections"
        );
        WS_ACTIVE_CONNECTIONS.fetch_sub(1, Ordering::Relaxed);
        return;
    }

    info!(conn_id, active, "agent cursor WS connected");

    let (mut write, read) = socket.split();
    let mut rx = tx.subscribe();
    let (pong_tx, mut pong_rx) = tokio::sync::mpsc::unbounded_channel::<String>();

    // Send welcome message
    let welcome = r#"{"type":"connected","message":"Agent cursor relay connected"}"#.to_string();
    let _ = write.send(Message::Text(welcome)).await;

    let read_task = tokio::spawn(async move {
        let mut read = read;
        while let Some(msg) = read.next().await {
            match msg {
                Ok(Message::Text(text)) => {
                    if text.len() > MAX_WS_MESSAGE_BYTES {
                        warn!(
                            conn_id,
                            size = text.len(),
                            "dropping oversized text message"
                        );
                        continue;
                    }
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&text) {
                        if parsed.get("type").and_then(|t| t.as_str()) == Some("ping") {
                            let _ = pong_tx.send(r#"{"type":"pong"}"#.to_string());
                        } else {
                            let _ = tx.send(text);
                        }
                    } else {
                        let _ = tx.send(text);
                    }
                }
                Ok(Message::Binary(data)) => {
                    if data.len() > MAX_WS_MESSAGE_BYTES {
                        warn!(
                            conn_id,
                            size = data.len(),
                            "dropping oversized binary message"
                        );
                        continue;
                    }
                    if let Ok(text) = String::from_utf8(data) {
                        let _ = tx.send(text);
                    }
                }
                Ok(Message::Close(_)) | Err(_) => break,
                _ => {}
            }
        }
    });

    let write_task = tokio::spawn(async move {
        loop {
            tokio::select! {
                msg = rx.recv() => {
                    match msg {
                        Ok(text) => {
                            if write.send(Message::Text(text)).await.is_err() {
                                break;
                            }
                        }
                        Err(broadcast::error::RecvError::Closed) => break,
                        Err(broadcast::error::RecvError::Lagged(n)) => {
                            warn!(conn_id, lagged = n, "dropped messages in WS broadcast");
                            continue;
                        }
                    }
                }
                Some(text) = pong_rx.recv() => {
                    if write.send(Message::Text(text)).await.is_err() {
                        break;
                    }
                }
            }
        }
    });

    let _ = tokio::join!(read_task, write_task);

    WS_ACTIVE_CONNECTIONS.fetch_sub(1, Ordering::Relaxed);
    info!(conn_id, "agent cursor WS disconnected");
}

fn start_axum_static_server_for_tool(tool: String, root: PathBuf) -> Option<u16> {
    // Prefer the tool's stable port so localStorage persists across restarts;
    // fall back to an ephemeral port if the stable one is taken.
    let stable = stable_port_for_tool(&tool);
    let listener = match stable {
        Some(port) => std::net::TcpListener::bind(("127.0.0.1", port))
            .or_else(|_| std::net::TcpListener::bind("127.0.0.1:0"))
            .ok(),
        None => std::net::TcpListener::bind("127.0.0.1:0").ok(),
    }?;
    let port = listener.local_addr().ok()?.port();

    let root_arc = Arc::new(root);

    let app = Router::new()
        .route(
            "/",
            get({
                let root = root_arc.clone();
                let tool = tool.clone();
                move |headers: axum::http::HeaderMap| async move {
                    serve_dx_file_direct(root, tool.clone(), "index.html".to_string(), headers)
                        .await
                }
            }),
        )
        .route(
            "/*path",
            get({
                let root = root_arc;
                let tool = tool.clone();
                move |AxumPath(path): AxumPath<String>, headers: axum::http::HeaderMap| async move {
                    serve_dx_file_direct(root, tool.clone(), path, headers).await
                }
            }),
        )
        .fallback(get(|| async { (StatusCode::NOT_FOUND, "Not Found") }));

    let rt = shared_tokio_runtime();
    thread::Builder::new()
        .name(format!("dx-preview-{tool}"))
        .spawn(move || {
            rt.block_on(async move {
                info!(tool, port, "static file server started");
                if let Ok(server) = axum::Server::from_tcp(listener) {
                    if let Err(e) = server.serve(app.into_make_service()).await {
                        error!(tool, %e, "static file server error");
                    }
                }
            });
        })
        .ok()?;

    Some(port)
}

async fn serve_dx_file_direct(
    root: Arc<PathBuf>,
    tool: String,
    mut req_path: String,
    headers: axum::http::HeaderMap,
) -> impl axum::response::IntoResponse {
    if req_path.is_empty() || req_path == "/" {
        req_path = "index.html".to_string();
    }
    if req_path.contains("..") || req_path.contains('\\') || req_path.contains(':') {
        return (StatusCode::BAD_REQUEST, "Invalid path").into_response();
    }

    let mut target = root.join(req_path.trim_start_matches('/'));
    if target.is_dir() {
        target = target.join("index.html");
    }

    if !target.is_file() {
        // SPA fallback: only for navigation requests (HTML accepts), never for
        // JSON/API/asset fetches — serving index.html for those would return
        // "Unexpected token '<'" errors to the page's own API calls.
        if accepts_html(&headers) {
            let idx = root.join("index.html");
            if idx.is_file() {
                target = idx;
            } else {
                let placeholder = placeholder_html(&tool);
                return axum::http::Response::builder()
                    .header(CACHE_CONTROL, "no-store, max-age=0")
                    .header(CONTENT_TYPE, "text/html; charset=utf-8")
                    .body(Body::from(placeholder))
                    .unwrap()
                    .into_response();
            }
        } else {
            return (StatusCode::NOT_FOUND, "Not Found").into_response();
        }
    }

    match std::fs::read(&target) {
        Ok(bytes) => {
            let mime = mime_type_for(&target);
            axum::http::Response::builder()
                .header(CACHE_CONTROL, "no-store, max-age=0")
                .header(CONTENT_TYPE, mime)
                .body(Body::from(bytes))
                .unwrap()
                .into_response()
        }
        Err(_) => (StatusCode::NOT_FOUND, "Not Found").into_response(),
    }
}

/// True when the request's `Accept` header indicates a browser navigation
/// (text/html accepted). Requests without an Accept header (or with `*/*`
/// only, e.g. fetch()/XHR defaults) are NOT treated as navigations.
fn accepts_html(headers: &axum::http::HeaderMap) -> bool {
    match headers.get(ACCEPT).and_then(|v| v.to_str().ok()) {
        Some(accept) => accept
            .split(',')
            .any(|part| part.trim().to_ascii_lowercase().starts_with("text/html")),
        None => false,
    }
}

fn placeholder_html(tool: &str) -> String {
    let safe: String = tool
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '-' || *c == '_')
        .collect();
    let safe = if safe.is_empty() {
        "tool".to_string()
    } else {
        safe
    };
    format!(
        r#"<!doctype html>
<html lang="en">
<head>
  <base href="/dx/{safe}/">
  <meta charset="utf-8">
  <title>{safe}</title>
  <style>
    body {{ margin:0; height:100vh; display:flex; align-items:center; justify-content:center; background:#0a0a0a; color:#aaa; font-family: system-ui, sans-serif; }}
    .box {{ text-align:center; }}
    h1 {{ font-weight:300; letter-spacing:1px; }}
    p {{ opacity:0.7; font-size:14px; }}
  </style>
</head>
<body>
  <div class="box">
    <h1>{safe}</h1>
    <p>DX web tool preview<br>Place your built static site (index.html + assets) under assets/web/{safe}/ or the project's .dx/www/output</p>
  </div>
</body>
</html>"#,
        safe = safe
    )
}

fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            let hi = (bytes[i + 1] as char).to_digit(16);
            let lo = (bytes[i + 2] as char).to_digit(16);
            if let (Some(hi), Some(lo)) = (hi, lo) {
                out.push((hi * 16 + lo) as u8);
                i += 3;
                continue;
            }
        }
        out.push(bytes[i]);
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn mime_type_for(path: &Path) -> &'static str {
    let ext = path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    get_mime_type(&format!(".{ext}"))
}

/// Read a file from the live `assets/web` tree on disk (when resolvable), so the
/// embedded fallback server can serve freshly published static sites instead of
/// the compile-time snapshot baked into the binary. `asset_path` is the `web/...`
/// key used by [`Assets`]; returns `None` when the disk tree is unavailable or the
/// file is missing, in which case callers fall back to the embedded bytes.
fn load_disk_preview_file(asset_path: &str) -> Option<std::borrow::Cow<'static, [u8]>> {
    let root = find_assets_web_root()?;
    let rel = asset_path.strip_prefix("web/").unwrap_or(asset_path);
    let file = root.join(rel);
    if !file.is_file() {
        return None;
    }
    Some(std::borrow::Cow::Owned(std::fs::read(file).ok()?))
}

/// Legacy embedded server that serves the bundled `assets/web` tree. Kept as a
/// fallback for callers (and the `OpenWebPreview` action) that still build
/// `http://127.0.0.1:<port>/<project>` URLs. New code should prefer
/// [`local_preview_url`], which serves each project at its own origin root.
pub fn start_embedded_web_server() -> u16 {
    let server = Server::http("127.0.0.1:0").unwrap();
    let port = server.server_addr().to_ip().unwrap().port();
    let server = Arc::new(server);

    let _ = thread::Builder::new()
        .name("dx-embedded-web-server".to_string())
        .spawn(move || {
            for request in server.incoming_requests() {
                let mut path = request.url().to_string();
                if let Some(idx) = path.find('?') {
                    path = path[..idx].to_string();
                }
                path = path.trim_start_matches('/').to_string();

                let mut asset_path = format!("web/{}", path);
                let assets = Assets;

                // Prefer the live on-disk `assets/web` tree (fresh publishes) over
                // the snapshot of `assets/web` embedded into the binary at build time,
                // so clicking a statusbar/tool icon never opens a stale baked-in copy.
                let mut bytes_opt = load_disk_preview_file(&asset_path);

                if bytes_opt.is_none() {
                    bytes_opt = assets.load(&asset_path).ok().flatten();
                }

                if bytes_opt.is_none() {
                    let index_path = format!("{}/index.html", asset_path.trim_end_matches('/'));
                    if let Some(bytes) = load_disk_preview_file(&index_path) {
                        bytes_opt = Some(bytes);
                        asset_path = index_path;
                    } else if let Ok(Some(bytes)) = assets.load(&index_path) {
                        bytes_opt = Some(bytes);
                        asset_path = index_path;
                    }
                }

                if let Some(bytes) = bytes_opt {
                    let mime_type = get_mime_type(&asset_path);
                    let response = Response::from_data(bytes.into_owned())
                        .with_status_code(200)
                        .with_header(
                            Header::from_bytes(&b"Content-Type"[..], mime_type.as_bytes()).unwrap(),
                        )
                        .with_header(
                            Header::from_bytes(&b"Cache-Control"[..], &b"no-store, max-age=0"[..])
                                .unwrap(),
                        );
                    let _ = request.respond(response);
                } else {
                    let response = Response::empty(404);
                    let _ = request.respond(response);
                }
            }
        });

    port
}

fn get_mime_type(path: &str) -> &'static str {
    if path.ends_with(".html") {
        "text/html; charset=utf-8"
    } else if path.ends_with(".css") {
        "text/css; charset=utf-8"
    } else if path.ends_with(".mjs") || path.ends_with(".js") {
        "application/javascript; charset=utf-8"
    } else if path.ends_with(".json") || path.ends_with(".map") {
        "application/json; charset=utf-8"
    } else if path.ends_with(".wasm") {
        "application/wasm"
    } else if path.ends_with(".svg") {
        "image/svg+xml"
    } else if path.ends_with(".png") {
        "image/png"
    } else if path.ends_with(".jpg") || path.ends_with(".jpeg") {
        "image/jpeg"
    } else if path.ends_with(".gif") {
        "image/gif"
    } else if path.ends_with(".webp") {
        "image/webp"
    } else if path.ends_with(".ico") {
        "image/x-icon"
    } else if path.ends_with(".woff2") {
        "font/woff2"
    } else if path.ends_with(".woff") {
        "font/woff"
    } else if path.ends_with(".ttf") {
        "font/ttf"
    } else if path.ends_with(".txt") {
        "text/plain; charset=utf-8"
    } else {
        "application/octet-stream"
    }
}
