# OmniRoute Token Saver — Rust Architecture

Build a standalone prompt compression proxy in Rust by composing existing
crates to replicate OmniRoute's 7-engine compression pipeline.

## Pipeline Overview

```
Request → Lite → Caveman → RTK → Ultra → Aggressive → Headroom → Session dedup → Provider
                    ↑                                        ↑
                (prose rules)                         (JSON column blocks)
                rust-cave-001                         temporal-cortex-toon
```

---

## Engine → Crate Mapping

| Engine | Crate | Purpose | Lines of Rust |
|---|---|---|---|
| **Lite** | `tersify` | Whitespace, comments, blank lines, JSON null stripping, ANSI removal | 141 |
| **Caveman** | `rust-cave-001` | 9 deterministic prose rules: filler removal, pronoun resolution, active voice, article elimination | 44 |
| **RTK** | `tokf` | 70+ per-command TOML filters (git, cargo, docker, npm, pytest, etc.) with dedup + truncation | 1,304 |
| **Ultra** | `anyllm_optimize_scorer` | ONNX LLMLingua-2 token-importance scoring — drop low-info tokens | 108 |
| **Aggressive** | `forgetless` | Multi-stage: tool result compress → age-based degradation → summarizer fallback | 67 |
| **Headroom** | `temporal-cortex-toon` | TOON encoding — lossless JSON array → columnar compact blocks | 191 |
| **Session dedup** | `simi-flow` | 8 algorithms for exact + fuzzy cross-turn dedup | 75 |
| **CCR** | `ogham-core` | Reversible compression + content-addressed blob retrievaasl | 155 |

---

## Architecture

```rust
// src/lib.rs — top-level pipeline

pub struct CompressionPipeline {
    lite: tersify::Compressor,
    caveman: rust_cave_001::Caveman,
    rtk: tokf::Formatter,
    ultra: anyllm_optimize_scorer::Scorer,
    aggressive: forgetless::ContextOptimizer,
    headroom: temporal_cortex_toon::Encoder,
    dedup: simi_flow::Deduplicator,
    ccr: ogham_core::ContextEngine,
}

pub struct CompressedBody {
    pub text: String,
    pub stats: CompressionStats,
    pub refs: Vec<ContentRef>,
}

pub struct CompressionStats {
    pub original_tokens: u32,
    pub compressed_tokens: u32,
    pub savings_pct: f64,
    pub engine: Vec<String>,
    pub adapted: bool,
}

impl CompressionPipeline {
    pub fn new(config: Config) -> Self { ... }

    pub fn compress(&self, body: &str, context: &Context) -> Result<CompressedBody, Error> {
        match context.mode {
            Mode::Lite => self.run_lite(body),
            Mode::Caveman => self.run_caveman(body),
            Mode::Rtk => self.run_rtk(body, context.command),
            Mode::Ultra => self.run_ultra(body),
            Mode::Aggressive => self.run_aggressive(body, context.turns),
            Mode::Headroom => self.run_headroom(body),
            Mode::Stacked => self.run_stacked(body, context),
        }
    }
}
```

## Strategy Resolution

Priority order (mirrors OmniRoute `strategySelector.ts`):

1. **Master switch off** → passthrough
2. **Request header** `x-compression-mode` → override
3. **Combo override** → per-routing-combo mode
4. **Active profile** → named compression combo
5. **Auto-trigger** → if `estimated_tokens >= threshold`
6. **Default plan** → fallback mode
7. **Adaptive budget** → escalate further if prompt exceeds context window

```rust
// src/strategy.rs
pub fn select_plan(config: &Config, ctx: &RequestContext) -> CompressionPlan {
    if !config.enabled {
        return CompressionPlan::off();
    }

    // 1. Header override
    if let Some(mode) = &ctx.header_override {
        return plan_for(mode.clone());
    }

    // 2. Combo override
    if let Some(mode) = config.combo_overrides.get(&ctx.combo_id) {
        return plan_for(mode.clone());
    }

    // 3. Named profile
    if let Some(combo_id) = &config.active_combo_id {
        if let Some(combo) = config.compression_combos.get(combo_id) {
            return combo.plan();
        }
    }

    // 4. Auto-trigger
    if ctx.estimated_tokens >= config.auto_trigger_tokens {
        return plan_for(config.auto_trigger_mode.clone());
    }

    // 5. Default
    plan_for(config.default_mode.clone())
}
```

## Stacked Pipeline

When mode is `Stacked`, engines run sequentially on the same body:

```rust
// src/stacked.rs
pub fn apply_stacked(body: &str, steps: &[EngineStep]) -> Result<CompressedBody, Error> {
    let mut current = body.to_string();
    let mut all_stats = vec![];

    for step in steps {
        let engine = resolve_engine(&step.engine)?;
        let result = engine.apply(&current, step.intensity)?;
        all_stats.push(result.stats);
        current = result.text;
    }

    // Hard-budget post-pass (optional)
    if let Some(target) = &step.target_budget {
        current = enforce_budget(&current, target)?;
    }

    Ok(CompressedBody {
        text: current,
        stats: aggregate(all_stats),
        refs: vec![],
    })
}
```

## RTK Filter System

`tokf` uses TOML filter files per command (same concept as OmniRoute's RTK JSON filters):

```toml
# filters/git-diff.toml
[filter]
command = "git diff"

[[drop]]
pattern = "^index [0-9a-f]+\\.\\.[0-9a-f]+.*$"

[[drop]]
pattern = "^--- a/"

[[drop]]
pattern = "^\\+\\+\\+ b/"

[preserve]
error_patterns = ["^diff --git ", "^@@ ", "^[+-](?![+-]{2})"]

[collapse]
pattern = "^\\s*$"
```

55+ built-in filters ship with `tokf` covering: git, cargo, npm, docker, kubectl, pytest, eslint, tsc, go, gradle, gh, aws, gcloud, terraform, and more.

## Ultra Token Scoring

```rust
// src/ultra.rs — heuristic tier
pub fn score_tokens(text: &str) -> Vec<f64> {
    text.split_whitespace().map(|token| {
        if STOP_WORDS.contains(token) { return 0.1 }
        if token.len() <= 2 { return 0.2 }
        if is_capitalized(token) { return 0.8 }
        if token.len() >= 6 { return 0.7 }
        if has_digit_or_url(token) { return 1.0 }
        0.5
    }).collect()
}

// ONNX SLM tier (via anyllm_optimize_scorer)
pub fn score_tokens_slm(text: &str) -> Result<Vec<f64>> {
    let model = anyllm_optimize_scorer::Model::load("llmlingua-2.onnx")?;
    model.score(text)
}
```

## Storage Layer

SQLite-backed (same as OmniRoute's `compression` + `compression_combos` tables):

```sql
-- settings
CREATE TABLE compression_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- named profiles
CREATE TABLE compression_combos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    pipeline TEXT NOT NULL,     -- JSON array of {engine, intensity}
    is_default INTEGER DEFAULT 0
);

-- per-routing-combo assignments
CREATE TABLE compression_combo_assignments (
    routing_combo_id TEXT PRIMARY KEY,
    compression_combo_id TEXT NOT NULL REFERENCES compression_combos(id)
);

-- stats
CREATE TABLE compression_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT,
    original_tokens INTEGER,
    compressed_tokens INTEGER,
    engine TEXT,
    mode TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
```

## CLI Usage

```bash
# pipeline — compress stdin through all engines
omnitoken compress < input.txt > output.txt

# run specific engine only
omnitoken lite < input.txt
omnitoken caveman < input.txt
omnitoken rtk --command "git diff" < input.txt
omnitoken ultra < input.txt

# stacked pipeline
omnitoken stacked --steps "rtk,caveman,ultra" < input.txt

# MCP server mode
omnitoken mcp

# stats
omnitoken stats

# preview with diff visualization
omnitoken preview --mode caveman < input.txt
```

## Full Cargo.toml

```toml
[package]
name = "omnitoken"
version = "0.1.0"
edition = "2024"

[dependencies]
tersify = "0.5"
rust-cave-001 = "0.4"
tokf = "0.2"
anyllm-optimize-scorer = "0.16"
forgetless = "0.1"
temporal-cortex-toon = "0.3"
simi-flow = "0.1"
ogham-core = "0.4"
clap = { version = "4", features = ["derive"] }
rusqlite = { version = "0.31", features = ["bundled"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
anyhow = "1"
tiktoken-rs = "0.6"
```

## Integration as OmniRoute Provider

The compiled binary can run as an upstream compression proxy:

```
Client → OmniRoute → omnitoken (localhost:9812) → Provider
```

Register in `src/shared/constants/providers.ts` as `openai-compatible-omnitoken`
pointing at `http://localhost:9812/v1`. The proxy receives the full request body,
compresses it per strategy, and forwards to the real upstream.
