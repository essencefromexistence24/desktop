# OmniRoute — Merged Project Reference

**OmniRoute v3.8.49** — Unified AI router with 160+ providers, RTK+Caveman compression, auto fallback, MCP/A2A, desktop, PWA, and OpenAI-compatible APIs.

Merged from `g:\dx\mobile\route` into `g:\dx\mobile` on Jul 25, 2026.

---

## Page inventory (`route/src/app/`)

| Type | Count |
|------|-------|
| **Pages** (`page.tsx`/`.mdx`/`.jsx`) | **130** |
| **API routes** (`route.ts`) | **581** |
| **Layouts** (`layout.tsx`) | **11** |
| **Total** | **722** |

### Pages (130)

#### Landing & auth
```
/ (root page)
/landing
/login
/forgot-password
/auth/callback
/callback
/connect/codex/[token]
/terms
/privacy
/status
/offline
/maintenance
/forbidden
```

#### Error pages
```
/400
/401
/403
/408
/429
/500
/502
/503
```

#### Docs
```
/docs
/docs/[...slug]
/docs/api-explorer
```

#### Dashboard — home
```
/(dashboard)/home
/(dashboard)/dashboard
```

#### Dashboard — providers & models
```
/(dashboard)/dashboard/providers
/(dashboard)/dashboard/providers/[id]
/(dashboard)/dashboard/providers/new
/(dashboard)/dashboard/providers/services
/(dashboard)/dashboard/provider-stats
/(dashboard)/dashboard/discovery
/(dashboard)/dashboard/free-provider-rankings
/(dashboard)/dashboard/free-tiers
/(dashboard)/dashboard/media-providers
/(dashboard)/dashboard/media-providers/[kind]
/(dashboard)/dashboard/media-providers/[kind]/[id]
/(dashboard)/dashboard/tokens
```

#### Dashboard — routing & combos
```
/(dashboard)/dashboard/combos
/(dashboard)/dashboard/combos/[id]
/(dashboard)/dashboard/combos/live
/(dashboard)/dashboard/combos/playground
/(dashboard)/dashboard/auto-combo
/(dashboard)/dashboard/routing (via settings/routing)
/(dashboard)/dashboard/endpoint
```

#### Dashboard — compression & context
```
/(dashboard)/dashboard/compression
/(dashboard)/dashboard/compression/live
/(dashboard)/dashboard/compression/studio
/(dashboard)/dashboard/context
/(dashboard)/dashboard/context/aggressive
/(dashboard)/dashboard/context/caveman
/(dashboard)/dashboard/context/ccr
/(dashboard)/dashboard/context/combos
/(dashboard)/dashboard/context/headroom
/(dashboard)/dashboard/context/lite
/(dashboard)/dashboard/context/llmlingua
/(dashboard)/dashboard/context/omniglyph
/(dashboard)/dashboard/context/rtk
/(dashboard)/dashboard/context/session-dedup
/(dashboard)/dashboard/context/settings
/(dashboard)/dashboard/context/ultra
```

#### Dashboard — usage & analytics
```
/(dashboard)/dashboard/usage
/(dashboard)/dashboard/analytics
/(dashboard)/dashboard/analytics/combo-health
/(dashboard)/dashboard/analytics/compression
/(dashboard)/dashboard/analytics/evals
/(dashboard)/dashboard/analytics/search
/(dashboard)/dashboard/analytics/utilization
/(dashboard)/dashboard/costs
/(dashboard)/dashboard/costs/budget
/(dashboard)/dashboard/costs/pricing
/(dashboard)/dashboard/costs/quota-share
/(dashboard)/dashboard/quota
/(dashboard)/dashboard/limits
```

#### Dashboard — logs
```
/(dashboard)/dashboard/logs
/(dashboard)/dashboard/logs/activity
/(dashboard)/dashboard/logs/console
/(dashboard)/dashboard/logs/proxy
```

#### Dashboard — settings
```
/(dashboard)/dashboard/settings
/(dashboard)/dashboard/settings/access-tokens
/(dashboard)/dashboard/settings/advanced
/(dashboard)/dashboard/settings/ai
/(dashboard)/dashboard/settings/appearance
/(dashboard)/dashboard/settings/feature-flags
/(dashboard)/dashboard/settings/general
/(dashboard)/dashboard/settings/pricing
/(dashboard)/dashboard/settings/resilience
/(dashboard)/dashboard/settings/routing
/(dashboard)/dashboard/settings/security
/(dashboard)/dashboard/settings/sidebar
```

#### Dashboard — system & tools
```
/(dashboard)/dashboard/system/1proxy
/(dashboard)/dashboard/system/mitm-proxy
/(dashboard)/dashboard/system/proxy
/(dashboard)/dashboard/tools/agent-bridge
/(dashboard)/dashboard/tools/traffic-inspector
/(dashboard)/dashboard/cache
/(dashboard)/dashboard/cache/media
/(dashboard)/dashboard/relay
/(dashboard)/dashboard/runtime
/(dashboard)/dashboard/health
```

#### Dashboard — agents & protocols
```
/(dashboard)/dashboard/a2a
/(dashboard)/dashboard/acp-agents
/(dashboard)/dashboard/agent-skills
/(dashboard)/dashboard/cli-agents
/(dashboard)/dashboard/cli-agents/[id]
/(dashboard)/dashboard/cli-code
/(dashboard)/dashboard/cli-code/[id]
/(dashboard)/dashboard/cloud-agents
/(dashboard)/dashboard/mcp
/(dashboard)/dashboard/omni-skills
/(dashboard)/dashboard/memory
```

#### Dashboard — plugins, batch, webhooks
```
/(dashboard)/dashboard/plugins
/(dashboard)/dashboard/plugins/[name]/config
/(dashboard)/dashboard/batch
/(dashboard)/dashboard/batch/files
/(dashboard)/dashboard/webhooks
/(dashboard)/dashboard/activity
/(dashboard)/dashboard/audit
/(dashboard)/dashboard/audit/a2a
/(dashboard)/dashboard/audit/mcp
/(dashboard)/dashboard/changelog
/(dashboard)/dashboard/chaos
/(dashboard)/dashboard/gamification/admin
/(dashboard)/dashboard/leaderboard
/(dashboard)/dashboard/onboarding
/(dashboard)/dashboard/playground
/(dashboard)/dashboard/profile
/(dashboard)/dashboard/search-tools
/(dashboard)/dashboard/translator
/(dashboard)/dashboard/api-endpoints
/(dashboard)/dashboard/api-manager
```

### Layouts (11)
```
/layout.tsx
/docs/layout.tsx
/(dashboard)/layout.tsx
/400/layout.tsx
/401/layout.tsx
/403/layout.tsx
/408/layout.tsx
/429/layout.tsx
/500/layout.tsx
/502/layout.tsx
/503/layout.tsx
```

### API routes (581) — key areas

| Area | Routes |
|------|--------|
| **v1 API** | `api/v1/chat/completions`, `api/v1/responses`, `api/v1/embeddings`, `api/v1/images/generations`, `api/v1/audio/speech`, `api/v1/audio/transcriptions`, `api/v1/moderations`, `api/v1/models`, `api/v1/files`, `api/v1/batches`, `api/v1/search` |
| **v1beta API** | `api/v1beta/models` |
| **Auth** | `api/auth/login`, `api/auth/logout`, `api/auth/status`, `api/auth/csrf` |
| **OAuth** | `api/oauth/[provider]/[action]`, `api/oauth/cliproxy-import`, `api/oauth/codex/import`, `api/oauth/cursor/import`, `api/oauth/kiro/import` |
| **Combos** | `api/combos`, `api/combos/[id]`, `api/combos/auto`, `api/combos/metrics`, `api/combos/test` |
| **Models** | `api/models`, `api/models/catalog`, `api/models/alias`, `api/models/test` |
| **Providers** | `api/providers`, `api/providers/[id]`, `api/providers/bulk`, `api/providers/validate`, `api/providers/test-batch` |
| **Settings** | `api/settings`, `api/settings/compression`, `api/settings/memory`, `api/settings/proxies`, `api/settings/qdrant`, `api/settings/feature-flags` |
| **Usage & analytics** | `api/usage/analytics`, `api/usage/history`, `api/usage/call-logs`, `api/usage/provider-limits`, `api/usage/combo-health` |
| **Memory** | `api/memory`, `api/memory/[id]`, `api/memory/health`, `api/memory/reindex`, `api/memory/retrieve-preview` |
| **MCP** | `api/mcp/sse`, `api/mcp/stream`, `api/mcp/tools`, `api/mcp/audit` |
| **A2A** | `a2a/route.ts`, `api/a2a/tasks`, `api/a2a/tasks/[id]` |
| **Skills** | `api/skills`, `api/skills/[id]`, `api/skills/executions`, `api/skills/marketplace` |
| **CLI tools** | `api/cli-tools/detect`, `api/cli-tools/status`, `api/cli-tools/config`, 20+ CLI-specific settings routes |
| **Logs** | `api/logs/[id]`, `api/logs/console`, `api/logs/export` |
| **Webhooks** | `api/webhooks`, `api/webhooks/[id]`, `api/webhooks/[id]/deliveries` |
| **Traffic inspector** | `api/tools/traffic-inspector/requests`, `api/tools/traffic-inspector/sessions`, `api/tools/traffic-inspector/hosts` |
| **Agent bridge** | `api/tools/agent-bridge/agents`, `api/tools/agent-bridge/cert`, `api/tools/agent-bridge/config`, `api/tools/agent-bridge/tproxy` |
| **Tunnels** | `api/tunnels/cloudflared`, `api/tunnels/ngrok`, `api/tunnels/tailscale` |
| **System** | `api/health/ping`, `api/restart`, `api/shutdown`, `api/system/version`, `api/init` |
| **Compression** | `api/compression/engines`, `api/compression/preview`, `api/compression/language-packs`, `api/compression/rules` |
| **Context** | `api/context/caveman/config`, `api/context/rtk/config`, `api/context/combos` |
| **Cache** | `api/cache`, `api/cache/entries`, `api/cache/stats`, `api/cache/reasoning` |
| **Quota** | `api/quota/pools`, `api/quota/groups`, `api/quota/plans`, `api/quota/preview` |
| **Keys** | `api/keys`, `api/keys/[id]`, `api/keys/groups` |
| **Services** | `api/services/9router/`, `api/services/bifrost/`, `api/services/cliproxy/`, `api/services/mux/` (start/stop/restart/status/install for each) |
| **Gamification** | `api/gamification/badges`, `api/gamification/leaderboard`, `api/gamification/level`, `api/gamification/servers` |
| **Pricing** | `api/pricing`, `api/pricing/sync`, `api/pricing/defaults`, `api/pricing/models` |
| **Discovery** | `api/discovery/scan`, `api/discovery/results`, `api/discovery/verify` |
| **Other** | `api/guardrails`, `api/evals`, `api/chaos`, `api/headroom`, `api/plugins`, `api/policies`, `api/translator`, `api/copilot`, `api/compliance`, `api/db-backups`, `api/docs` |

### Notable catch-all routes
- `api/[...omnirouteApiCatchAll]/route.ts` — fallthrough for unknown API paths
- `api/v1/[...omnirouteCatchAll]/route.ts` — catch-all v1 proxy
- `(dashboard)/dashboard/providers/services/[name]/embed/[[...path]]/route.ts` — service embedding
- `.well-known/agent.json/route.ts` — A2A agent card

---

## Merge stats

| Metric | Value |
|--------|-------|
| New files added | 3,301 |
| Lines inserted | +866,409 |
| Lines removed/modified | -66,646 |
| Route pages in `src/app/` (after merge) | 747 total (144 pages, 584 routes, 19 layouts) |
| Original route project path | `route/` (still preserved alongside merged code) |
