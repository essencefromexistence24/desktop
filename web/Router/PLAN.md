# OmniRoute Integration Plan

## Goal
Integrate the full OmniRoute engine (`g:\dx\mobile\route\`) into the mobile chat app — all 347 providers, DX Compact token compaction, and the complete request pipeline.

## Current State

```
g:\dx\mobile\
├── src/                          # Mobile's Next.js app (chat, UI)
├── packages/                     # Mobile's workspaces
├── route/                        # OmniRoute (copied from g:\dx\route)
│   ├── open-sse/                 # Core streaming engine (@omniroute/open-sse)
│   ├── packages/dx-serializer/   # DX Compact (@dx-serializer/core)
│   ├── packages/dx-cli/          # CLI tool
│   ├── src/shared/constants/providers/  # 347 provider definitions
│   └── src/shared/utils/tiktokenCounter.ts  # Exact token counting
│
├── bun.lock                      # Mobile uses bun
└── package.json                  # Workspaces: ["apps/*", "packages/*"]
```

## Phase 1: Workspace Wiring

Add route's workspaces to mobile's bun workspace config so packages are resolvable.

**Files to modify:**
- `package.json` — add `"route/open-sse"`, `"route/packages/*"` to workspaces
- Add `@dx-serializer/core` and `@omniroute/open-sse` as dependencies

## Phase 2: Provider Registry (347 providers)

Generate a complete provider registry from route's 347 provider definitions and merge it into mobile.

**Files to create/modify:**
- `scripts/generate-providers.ts` — build-time script reading route's providers
- `src/lib/ai/providers.tsx` — replace static ~60 providers with generated 347
- `src/lib/ai/models-config.ts` — update with all model configs
- `src/features/dx/types.ts` — expand ModelId, add contextLength to types

## Phase 3: Model Picker (search + 347 providers)

Update the model picker UI to handle 347 providers with search, grouping, and live filtering.

**Files to modify:**
- `src/features/dx/components/chat/model-picker.tsx` — add search bar, category grouping
- `src/features/dx/components/chat/ai-provider.tsx` — handle long list performance

## Phase 4: Settings API Keys CRUD

Replace the static 3 API key inputs with a dynamic list of all 347 providers, each with its own key input.

**Files to modify:**
- `src/features/dx/components/chat-settings.tsx` — `SettingsApiKeys` component

## Phase 5: Chat API via handleChatCore

Wire mobile's `/api/chat` through OmniRoute's `handleChatCore()` instead of direct provider SDK calls.

**Files to modify:**
- `src/app/api/chat/route.ts` — import and call `handleChatCore()`
- New env vars for provider authentication

## Phase 6: Token Compaction

Integrate DX Compact + caveman compression + exact token counting into the chat flow.

**Files to create/modify:**
- `packages/ai-core/src/tokens/counter.ts` — replace with js-tiktoken
- `packages/ai-core/src/tokens/compaction.ts` — new: DX Compact + caveman
- `src/features/dx/hooks/use-chat.ts` — add context window management

## Phase 7: Default Provider

Set OpenCode as default provider (uses `https://opencode.ai/zen/v1`, no API key needed).

**Files to modify:**
- `src/lib/ai/providers.tsx` — defaultProvider = "opencode"
- `src/features/dx/types.ts` — DEFAULT_MODEL_ID
