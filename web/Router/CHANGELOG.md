# Changelog

All notable changes to this project are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] - 2026-08-22

### Added

- **Provider catalog merged from `G:\Dx\OmniRoute` (+73 definitions, +86 registry
  catalogs, +4 icons) — catalog now at 433 providers / ~1,740 models**:
  - NoAuth (+3): `devin-cli-agentic`, `felo-web`, `zcode`
  - OAuth (+4): `ghe-copilot`, `xai-oauth`, `openference`, `raycast`
  - WebCookie (+8): `chatgpt-web-codex`, `microsoft-designer-web`,
    `tencent-aistudio-web`, `tinycms-web`, `promptql`, `notion-web`, `hyperagent`,
    `conol-web`
  - APIKey gateways (+38): `cheaperinference`, `freebuff`, `zylo-api`, `electronhub`,
    `llm-kiwi`, `literouter`, `mnn-ai`, `meganova-ai`, `speka`, `tokenreply`,
    `yolo-auto`, `dxnt`, `cloudcode-one`, `ofoxai`, `zerolimitai`, `chatanywhere`,
    `poixe-ai`, `naga-ai`, `chat-oripe`, `freeinference`, `free-ai`, `dahl`,
    `freetheai`, `g4f-groq`, `g4f-gemini`, `g4f-pollinations`, `g4f-ollama`,
    `g4f-nvidia`, `token-kiosk`, `chenzk`, `navy`, `aion`, `routeway`, `nara`,
    `naga-ac`, `void-ai`, `helixmind`, `tabitoken`
  - Frontier labs (+1): `muse-code`
  - Regional (+9): `qwen-cloud`, `qwen-cloud-token-plan`, `sealion`, `clova-studio`,
    `internlm`, `ant-ling`, `sarvam`, `plamo`, `typhoon`
  - Specialty media (+3): `magnific`, `segmind`, `mixedbread`
  - Local (+2): `mlx-gemma`, `mlx-qwen`
  - Search (+2): `firecrawl`, `x-search`
  - Audio (+3): `gladia`, `rev-ai`, `speechmatics`
- **86 model registry folders** copied from OmniRoute
  (`route/open-sse/config/providers/registry/`) → registry now covers 253 providers.
- **4 provider icons** copied → 464 total in `public/providers/`.
- **README.md**: added complete provider index — all 433 providers listed in collapsible
  per-category tables (NoAuth 12 / OAuth 27 / WebCookie 35 / APIKey 314 / Local 14 /
  Search 13 / Audio 12 / Proxy 2 / CloudAgent 3 / System 1), generated from
  `providers.generated.ts` between `PROVIDER-LIST` markers.

### Changed

- **`scripts/generate-providers.ts`**: fixed `ROUTE_DIR` to resolve to the repo root
  and the registry reader path to `route/open-sse/...`; regeneration now reads all
  15 category files (was silently reading a non-existent `route/src/...` tree and
  producing a stale catalog).

### Verified

- Regenerated `src/lib/ai/providers.generated.ts`: **433 providers / ~1,740 models**
  (APIKey 314, WebCookie 35, OAuth 27, Local 14, Audio 12, NoAuth 12, Search 13,
  CloudAgent 3, Proxy 2, System 1); file parses cleanly; DEFAULT ids intact.
- All 15 edited category files parse via `bun build --no-bundle`.
- Provider-definition count now matches generated catalog exactly (433 === 433).
- OpenCode Zen free tier via live curl: `/zen/v1/models` returns 64 models;
  `POST /chat/completions` with `x-preview-f-free` and `nemotron-3.5-lightning-free`
  returned HTTP 200 with `"cost":"0"`; `big-pickle` rate-limited (429) under load.

### Consumed downstream (dx-desktop)

- **dx-desktop `assets/settings/default.json`**: generated and merged 223
  `openai_compatible` + 10 `anthropic_compatible` provider entries from this
  repo's registry catalogs — dx-desktop now ships with 240 additional configured
  providers out of the box.
- **dx-desktop `crates/opencode`**: added free-tier models `x-preview-f-free`
  (DX Alpha Preview — free-unlimited launch offer, new default free model),
  `nemotron-3.5-lightning-free`, `laguna-s-2.1-free`,
  `muse-spark-1.2-contributor-free`; all use `Authorization: Bearer public`.

### Known issues

- 26 providers still lack icons (see TODO.md).
- ~110 orphan icons remain in `public/providers/` without definitions.
- Possible id collisions between OmniRoute and Router variants
  (`openference` vs `openference-api`, `devin` vs `devin-cli`).

## 0.1.0 (2026-07-10)

- Initial monorepo scaffolding
