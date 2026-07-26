use anyhow::{Context as _, Result, anyhow, bail};
use futures::AsyncReadExt as _;
use http_client::{AsyncBody, HttpClient, HttpRequestExt as _, RedirectPolicy, Request};
use serde::Deserialize;
use serde_json::{Map, Value};
use std::{
    collections::{BTreeSet, HashMap, HashSet},
    fs,
    path::{Component, Path, PathBuf},
    sync::Arc,
};
use url::Url;

const OFFICIAL_REGISTRY: &str = "https://ui.shadcn.com/r/styles/new-york-v4/{name}.json";
const MAX_REGISTRY_BODY_BYTES: usize = 8 * 1024 * 1024;
const MAX_REGISTRY_DEPTH: usize = 32;
const MAX_REGISTRY_ITEMS: usize = 512;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ShadcnAddCommand {
    pub items: Vec<String>,
}

#[derive(Debug)]
pub struct RegistryInstallReport {
    pub installed_items: Vec<String>,
    pub written_files: Vec<PathBuf>,
    pub skipped_files: Vec<PathBuf>,
    pub added_dependencies: Vec<String>,
    pub package_install_command: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
enum RegistryConfig {
    Url(String),
    Advanced {
        url: String,
        #[serde(default)]
        params: HashMap<String, String>,
        #[serde(default)]
        headers: HashMap<String, String>,
    },
}

impl RegistryConfig {
    fn parts(&self) -> (&str, &HashMap<String, String>, &HashMap<String, String>) {
        static EMPTY: std::sync::OnceLock<HashMap<String, String>> = std::sync::OnceLock::new();
        let empty = EMPTY.get_or_init(HashMap::new);
        match self {
            Self::Url(url) => (url, empty, empty),
            Self::Advanced {
                url,
                params,
                headers,
            } => (url, params, headers),
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ComponentsConfig {
    #[serde(default = "default_style")]
    style: String,
    #[serde(default)]
    aliases: Aliases,
    #[serde(default)]
    registries: HashMap<String, RegistryConfig>,
}

fn default_style() -> String {
    "new-york-v4".to_string()
}

#[derive(Debug, Clone, Default, Deserialize)]
struct Aliases {
    #[serde(default)]
    components: String,
    #[serde(default)]
    ui: String,
    #[serde(default)]
    lib: String,
    #[serde(default)]
    hooks: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RegistryItem {
    name: String,
    #[serde(rename = "type")]
    item_type: String,
    #[serde(default)]
    dependencies: Vec<String>,
    #[serde(default)]
    dev_dependencies: Vec<String>,
    #[serde(default)]
    registry_dependencies: Vec<String>,
    #[serde(default)]
    files: Vec<RegistryFile>,
}

#[derive(Debug, Clone, Deserialize)]
struct RegistryFile {
    path: String,
    #[serde(default)]
    content: String,
    #[serde(rename = "type", default = "default_file_type")]
    file_type: String,
    #[serde(default)]
    target: Option<String>,
}

fn default_file_type() -> String {
    "registry:ui".to_string()
}

#[derive(Clone)]
struct ResolvedAddress {
    url: String,
    local_path: Option<PathBuf>,
    headers: HashMap<String, String>,
}

pub fn parse_shadcn_add_command(input: &str) -> Result<ShadcnAddCommand> {
    let tokens = shell_words(input)?;
    let add_index = tokens
        .iter()
        .position(|token| token == "add")
        .ok_or_else(|| anyhow!("Expected a shadcn `add` command"))?;
    if add_index == 0
        || !tokens[..add_index]
            .iter()
            .any(|token| token == "shadcn" || token.starts_with("shadcn@"))
    {
        bail!("Expected `shadcn add ...`");
    }

    let mut items = Vec::new();
    let mut skip_next = false;
    for token in &tokens[add_index + 1..] {
        if skip_next {
            skip_next = false;
            continue;
        }
        if matches!(token.as_str(), "--cwd" | "-c" | "--path" | "--diff") {
            skip_next = true;
            continue;
        }
        if token.starts_with('-') {
            continue;
        }
        items.push(token.clone());
    }
    if items.is_empty() {
        bail!("The shadcn add command does not contain a registry item");
    }
    Ok(ShadcnAddCommand { items })
}

pub async fn install_registry_command(
    command: &str,
    project_root: &Path,
    http_client: Arc<dyn HttpClient>,
) -> Result<RegistryInstallReport> {
    let command = parse_shadcn_add_command(command)?;
    let config = read_components_config(project_root)?;
    let mut resolver = Resolver {
        project_root,
        config: &config,
        http_client,
        visited: HashSet::new(),
        items: Vec::new(),
    };
    for item in &command.items {
        resolver.resolve(item, None, 0).await?;
    }
    install_resolved_items(project_root, &config, resolver.items)
}

fn read_components_config(project_root: &Path) -> Result<ComponentsConfig> {
    let path = project_root.join("components.json");
    if !path.is_file() {
        return Ok(ComponentsConfig {
            style: default_style(),
            aliases: Aliases {
                components: "@/components".to_string(),
                ui: "@/components/ui".to_string(),
                lib: "@/lib".to_string(),
                hooks: "@/hooks".to_string(),
            },
            registries: HashMap::new(),
        });
    }
    let source = fs::read_to_string(&path)
        .with_context(|| format!("reading shadcn config {}", path.display()))?;
    serde_json::from_str(&source)
        .with_context(|| format!("parsing shadcn config {}", path.display()))
}

struct Resolver<'a> {
    project_root: &'a Path,
    config: &'a ComponentsConfig,
    http_client: Arc<dyn HttpClient>,
    visited: HashSet<String>,
    items: Vec<RegistryItem>,
}

impl Resolver<'_> {
    fn resolve<'a>(
        &'a mut self,
        address: &'a str,
        inherited_namespace: Option<&'a str>,
        depth: usize,
    ) -> futures::future::BoxFuture<'a, Result<()>> {
        Box::pin(async move {
            if depth > MAX_REGISTRY_DEPTH {
                bail!("Registry dependency depth exceeds {MAX_REGISTRY_DEPTH}");
            }
            if self.items.len() >= MAX_REGISTRY_ITEMS {
                bail!("Registry graph exceeds {MAX_REGISTRY_ITEMS} items");
            }
            let resolved =
                resolve_address(address, inherited_namespace, self.project_root, self.config)?;
            let key = resolved.url.clone();
            if !self.visited.insert(key) {
                return Ok(());
            }
            let item = if let Some(path) = &resolved.local_path {
                let source = fs::read_to_string(path)
                    .with_context(|| format!("reading registry item {}", path.display()))?;
                parse_registry_item(&source, address)?
            } else {
                fetch_registry_item(&resolved, self.http_client.as_ref()).await?
            };
            for dependency in item.registry_dependencies.clone() {
                self.resolve(&dependency, None, depth + 1).await?;
            }
            self.items.push(item);
            Ok(())
        })
    }
}

fn resolve_address(
    address: &str,
    inherited_namespace: Option<&str>,
    project_root: &Path,
    config: &ComponentsConfig,
) -> Result<ResolvedAddress> {
    if address.starts_with("https://") || address.starts_with("http://") {
        Url::parse(address).context("invalid registry URL")?;
        return Ok(ResolvedAddress {
            url: address.to_string(),
            local_path: None,
            headers: HashMap::new(),
        });
    }
    if address.starts_with("./") || address.starts_with("../") || address.ends_with(".json") {
        let path = project_root.join(address);
        let path = path
            .canonicalize()
            .with_context(|| format!("resolving local registry item {}", path.display()))?;
        return Ok(ResolvedAddress {
            url: format!("file:{}", path.display()),
            local_path: Some(path),
            headers: HashMap::new(),
        });
    }

    let (namespace, name) = if address.starts_with('@') {
        parse_namespaced_item(address)?
    } else if let Some(namespace) = inherited_namespace {
        (Some(namespace), address)
    } else {
        (None, address)
    };

    let registry = if let Some(namespace) = namespace {
        config
            .registries
            .get(namespace)
            .ok_or_else(|| anyhow!("Registry {namespace} is not configured in components.json"))?
    } else {
        let template = OFFICIAL_REGISTRY.replace("new-york-v4", &config.style);
        return Ok(ResolvedAddress {
            url: template.replace("{name}", name),
            local_path: None,
            headers: HashMap::new(),
        });
    };

    let (template, params, headers) = registry.parts();
    if !template.contains("{name}") {
        bail!("Registry {namespace:?} URL must contain {{name}}");
    }
    let mut url = Url::parse(&template.replace("{name}", name))
        .with_context(|| format!("invalid URL for registry {namespace:?}"))?;
    {
        let mut query = url.query_pairs_mut();
        for (key, value) in params {
            query.append_pair(key, &expand_env(value)?);
        }
    }
    let headers = headers
        .iter()
        .map(|(key, value)| Ok((key.clone(), expand_env(value)?)))
        .collect::<Result<HashMap<_, _>>>()?;
    Ok(ResolvedAddress {
        url: url.to_string(),
        local_path: None,
        headers,
    })
}

fn parse_namespaced_item(address: &str) -> Result<(Option<&str>, &str)> {
    let Some((namespace, item)) = address.split_once('/') else {
        bail!("Namespaced registry item must look like @registry/item");
    };
    if namespace.len() < 2
        || !namespace[1..]
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || "-_".contains(character))
        || item.is_empty()
    {
        bail!("Invalid namespaced registry item {address}");
    }
    Ok((Some(namespace), item))
}

fn expand_env(value: &str) -> Result<String> {
    let mut output = value.to_string();
    while let Some(start) = output.find("${") {
        let rest = &output[start + 2..];
        let end = rest
            .find('}')
            .ok_or_else(|| anyhow!("Unclosed environment variable in registry configuration"))?;
        let name = &rest[..end];
        let replacement = std::env::var(name).with_context(|| {
            format!("Registry configuration requires environment variable {name}")
        })?;
        output.replace_range(start..start + end + 3, &replacement);
    }
    Ok(output)
}

async fn fetch_registry_item(
    resolved: &ResolvedAddress,
    client: &dyn HttpClient,
) -> Result<RegistryItem> {
    let mut builder = Request::builder()
        .uri(&resolved.url)
        .header(
            "Accept",
            "application/vnd.shadcn.v1+json, application/json;q=0.9",
        )
        .header("User-Agent", "dx-desktop-shadcn")
        .follow_redirects(RedirectPolicy::FollowLimit(8));
    for (name, value) in &resolved.headers {
        builder = builder.header(name, value);
    }
    let request = builder.body(AsyncBody::default())?;
    let mut response = client.send(request).await?;
    if !response.status().is_success() {
        bail!(
            "Registry request {} failed with HTTP {}",
            resolved.url,
            response.status()
        );
    }
    let mut body = Vec::new();
    response
        .body_mut()
        .take((MAX_REGISTRY_BODY_BYTES + 1) as u64)
        .read_to_end(&mut body)
        .await?;
    if body.len() > MAX_REGISTRY_BODY_BYTES {
        bail!("Registry response exceeds {MAX_REGISTRY_BODY_BYTES} bytes");
    }
    let source = String::from_utf8(body).context("registry response is not UTF-8")?;
    parse_registry_item(&source, &resolved.url)
}

fn parse_registry_item(source: &str, address: &str) -> Result<RegistryItem> {
    let value: Value =
        serde_json::from_str(source).with_context(|| format!("parsing registry item {address}"))?;
    let item: RegistryItem = serde_json::from_value(value)
        .with_context(|| format!("validating registry item {address}"))?;
    const TYPES: &[&str] = &[
        "registry:lib",
        "registry:block",
        "registry:component",
        "registry:ui",
        "registry:hook",
        "registry:page",
        "registry:file",
        "registry:theme",
        "registry:style",
        "registry:item",
        "registry:base",
        "registry:font",
        "registry:example",
        "registry:internal",
    ];
    if !TYPES.contains(&item.item_type.as_str()) {
        bail!(
            "Registry item {} has unsupported type {}",
            item.name,
            item.item_type
        );
    }
    for file in &item.files {
        if file.content.is_empty() {
            bail!(
                "Registry item {} contains a file without content",
                item.name
            );
        }
        validate_relative_path(&file.path)?;
        if let Some(target) = &file.target {
            validate_relative_path(target)?;
        }
        if matches!(file.file_type.as_str(), "registry:file" | "registry:page")
            && file.target.is_none()
        {
            bail!("{} requires an explicit target", file.file_type);
        }
    }
    Ok(item)
}

fn install_resolved_items(
    project_root: &Path,
    config: &ComponentsConfig,
    items: Vec<RegistryItem>,
) -> Result<RegistryInstallReport> {
    let mut written_files = Vec::new();
    let mut skipped_files = Vec::new();
    let mut dependencies = BTreeSet::new();
    let mut dev_dependencies = BTreeSet::new();
    let mut installed_items = Vec::new();
    let mut targets = HashSet::new();

    for item in items {
        installed_items.push(item.name.clone());
        dependencies.extend(item.dependencies);
        dev_dependencies.extend(item.dev_dependencies);
        for file in item.files {
            let relative = target_for_file(&file, config)?;
            if !targets.insert(relative.clone()) {
                continue;
            }
            let destination = safe_join(project_root, &relative)?;
            if destination.exists() {
                skipped_files.push(destination);
                continue;
            }
            if let Some(parent) = destination.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::write(&destination, file.content.as_bytes())
                .with_context(|| format!("writing {}", destination.display()))?;
            written_files.push(destination);
        }
    }

    let added_dependencies =
        merge_package_dependencies(project_root, &dependencies, &dev_dependencies)?;
    Ok(RegistryInstallReport {
        installed_items,
        written_files,
        skipped_files,
        package_install_command: if added_dependencies.is_empty() {
            None
        } else {
            super::package_install_command(project_root)
        },
        added_dependencies,
    })
}

fn target_for_file(file: &RegistryFile, config: &ComponentsConfig) -> Result<PathBuf> {
    if let Some(target) = &file.target {
        return Ok(PathBuf::from(target));
    }
    let file_name = Path::new(&file.path)
        .file_name()
        .ok_or_else(|| anyhow!("Registry file path has no file name"))?;
    let alias = match file.file_type.as_str() {
        "registry:ui" => alias_path(&config.aliases.ui, "components/ui"),
        "registry:hook" => alias_path(&config.aliases.hooks, "hooks"),
        "registry:lib" => alias_path(&config.aliases.lib, "lib"),
        "registry:block" | "registry:component" | "registry:example" | "registry:internal" => {
            alias_path(&config.aliases.components, "components")
        }
        _ => alias_path(&config.aliases.components, "components"),
    };
    Ok(alias.join(file_name))
}

fn alias_path(alias: &str, fallback: &str) -> PathBuf {
    let alias = alias.strip_prefix("@/").unwrap_or(alias);
    if alias.is_empty() {
        PathBuf::from("src").join(fallback)
    } else if alias.starts_with("src/") {
        PathBuf::from(alias)
    } else {
        PathBuf::from("src").join(alias)
    }
}

fn validate_relative_path(path: &str) -> Result<()> {
    let path = Path::new(path);
    if path.is_absolute()
        || path.components().any(|component| {
            matches!(
                component,
                Component::ParentDir | Component::RootDir | Component::Prefix(_)
            )
        })
    {
        bail!("Unsafe registry file target {}", path.display());
    }
    Ok(())
}

fn safe_join(root: &Path, relative: &Path) -> Result<PathBuf> {
    validate_relative_path(&relative.to_string_lossy())?;
    Ok(root.join(relative))
}

fn merge_package_dependencies(
    project_root: &Path,
    dependencies: &BTreeSet<String>,
    dev_dependencies: &BTreeSet<String>,
) -> Result<Vec<String>> {
    let path = project_root.join("package.json");
    let source =
        fs::read_to_string(&path).with_context(|| format!("reading {}", path.display()))?;
    let mut package: Value = serde_json::from_str(&source)?;
    let object = package
        .as_object_mut()
        .ok_or_else(|| anyhow!("package.json must contain an object"))?;
    let mut added = Vec::new();
    merge_dependency_section(object, "dependencies", dependencies, &mut added);
    merge_dependency_section(object, "devDependencies", dev_dependencies, &mut added);
    if !added.is_empty() {
        fs::write(
            &path,
            format!("{}\n", serde_json::to_string_pretty(&package)?),
        )?;
    }
    Ok(added)
}

fn merge_dependency_section(
    package: &mut Map<String, Value>,
    section: &str,
    dependencies: &BTreeSet<String>,
    added: &mut Vec<String>,
) {
    let values = package
        .entry(section)
        .or_insert_with(|| Value::Object(Map::new()))
        .as_object_mut();
    let Some(values) = values else {
        return;
    };
    for spec in dependencies {
        let (name, version) = split_package_spec(spec);
        if !values.contains_key(name) {
            values.insert(name.to_string(), Value::String(version.to_string()));
            added.push(spec.clone());
        }
    }
}

fn split_package_spec(spec: &str) -> (&str, &str) {
    let split = if spec.starts_with('@') {
        spec.rfind('@')
            .filter(|index| *index > spec.find('/').unwrap_or(0))
    } else {
        spec.rfind('@').filter(|index| *index > 0)
    };
    split
        .map(|index| (&spec[..index], &spec[index + 1..]))
        .unwrap_or((spec, "latest"))
}

fn shell_words(input: &str) -> Result<Vec<String>> {
    let mut words = Vec::new();
    let mut word = String::new();
    let mut quote = None;
    let mut escaped = false;
    for character in input.chars() {
        if escaped {
            word.push(character);
            escaped = false;
            continue;
        }
        if character == '\\' && quote != Some('\'') {
            escaped = true;
            continue;
        }
        if matches!(character, '\'' | '"') {
            if quote == Some(character) {
                quote = None;
            } else if quote.is_none() {
                quote = Some(character);
            } else {
                word.push(character);
            }
            continue;
        }
        if character.is_whitespace() && quote.is_none() {
            if !word.is_empty() {
                words.push(std::mem::take(&mut word));
            }
        } else {
            word.push(character);
        }
    }
    if escaped || quote.is_some() {
        bail!("Unterminated quote or escape in shadcn command");
    }
    if !word.is_empty() {
        words.push(word);
    }
    Ok(words)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_common_package_runner_commands() {
        for command in [
            "npx shadcn@latest add button",
            "pnpm dlx shadcn@latest add @acme/card dialog",
            "bunx --bun shadcn add https://example.com/r/chat.json",
        ] {
            assert!(!parse_shadcn_add_command(command).unwrap().items.is_empty());
        }
    }

    #[test]
    fn rejects_unsafe_registry_targets() {
        assert!(validate_relative_path("../../outside.tsx").is_err());
        assert!(validate_relative_path("components/ui/button.tsx").is_ok());
    }

    #[test]
    fn splits_scoped_and_unscoped_package_versions() {
        assert_eq!(split_package_spec("react@19.0.0"), ("react", "19.0.0"));
        assert_eq!(
            split_package_spec("@radix-ui/react-slot@^1.2.0"),
            ("@radix-ui/react-slot", "^1.2.0")
        );
    }
}
