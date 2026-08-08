# dx-route

Prompt compression proxy in Rust — token saver engine with 7 compression engines.

## Engines

| Engine | Crate | Description |
|---|---|---|
| Lite | `dx-route-lite` | Whitespace, ANSI, comments, JSON nulls |
| Caveman | `dx-route-caveman` | 80+ rule-based prose condensation |
| RTK | `dx-route-rtk` | Command-aware tool output compression |
| Ultra | `dx-route-ultra` | Token-scoring heuristic |
| Aggressive | `dx-route-aggressive` | 3-stage: compress + age + summarize |
| Headroom | `dx-route-headroom` | TOON JSON array compaction |
| Dedup | `dx-route-dedup` | Cross-turn exact + fuzzy dedup |
| CCR | `dx-route-ccr` | Reversible compression with blob store |

## Binaries

| Binary | Description |
|---|---|
| `dx` | CLI — pipe stdin through any engine |
| `dx-mcp` | MCP server — 8 compression tools |
| `dx-proxy` | HTTP proxy — OpenAI-compatible on `:9812` |

## Quickstart

```bash
# compress stdin
echo "some long text" | dx compress
echo "some long text" | dx caveman --intensity ultra

# stacked pipeline
echo "some text" | dx stacked --steps "rtk,caveman,ultra"

# HTTP proxy
dx-proxy --port 9812 --mode auto

# MCP server
dx-mcp

# stats dashboard
dx stats
```

## Proxy mode

```bash
dx-proxy --port 9812 --mode auto
```

Then point your LLM client at `http://localhost:9812/v1/chat/completions`.
All requests are compressed before forwarding.

## Architecture

```
                           ┌─────────────┐
Request ──────────────────►│ strategy.ts  │
                           └──────┬──────┘
                                  │ plan
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
   ┌──────────┐           ┌────────────┐           ┌──────────┐
   │   Lite   │           │  Caveman   │           │   RTK    │
   │ (tersify)│           │(cave rules)│           │(tokf)    │
   └──────────┘           └────────────┘           └──────────┘
          │                       │                       │
          ▼                       ▼                       ▼
   ┌──────────┐           ┌────────────┐           ┌──────────┐
   │   Ultra  │           │ Aggressive │           │ Headroom │
   │(heuristic)│          │  (3-stage)  │           │  (TOON)  │
   └──────────┘           └────────────┘           └──────────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                                  ▼
                          ┌─────────────┐
                          │   Storage   │
                          │  (SQLite)   │
                          └─────────────┘
```

## Project structure

```
crates/
├── Cargo.toml              # workspace root
├── crates/
│   ├── dx-route-core/      # pipeline orchestrator
│   ├── dx-route-lite/      # lite engine
│   ├── dx-route-caveman/   # caveman engine
│   ├── dx-route-rtk/       # rtk engine
│   ├── dx-route-ultra/     # ultra engine
│   ├── dx-route-aggressive/ # aggressive engine
│   ├── dx-route-headroom/  # headroom engine
│   ├── dx-route-dedup/     # dedup engine
│   ├── dx-route-ccr/       # ccr engine
│   ├── dx-route-storage/   # sqlite storage
│   ├── dx-route-cli/       # cli binary
│   ├── dx-route-mcp/       # mcp binary
│   └── dx-route-proxy/     # proxy binary
├── filters/                # RTK TOML filters
├── rules/                  # Caveman language packs
└── models/                 # ONNX models
```

## License

MIT
