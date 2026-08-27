# TODO

Live task list for Router. AI agents **must** keep this file current — see
[`AGENTS.md`](./AGENTS.md) for the mandatory workflow.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` cancelled

## In Progress

- [ ] Typecheck full app after provider merge (`bun run typecheck` / `tsc --noEmit`).

## Todo

- [ ] Add icons for 26 providers still missing them (`abliteration`, `auto`,
  `bailing`, `blueclaw`, `chatanywhere`, `chenzk`, `daoxe`, `empiriolabs`,
  `fenayai`, `freetheai`, `inceptron`, `kuae-cloud-coding-plan`, `libertai`,
  `magnific`, `mixlayer`, `mlx-gemma`, `mlx-qwen`, `neosantara`, `neuralwatt`,
  `qihang-ai`, `tabitoken`, `tinycms-web`, `vivgrid`, `x-search`, `xpersona`, `zeldoc`).
- [ ] Prune or map ~110 orphan icons in `public/providers/` with no provider definition.
- [ ] Add automated test asserting generated provider count === constants count.
- [ ] Document per-provider rate limits observed in testing (e.g. opencode `big-pickle` 429).
- [ ] Reconcile duplicate-ish ids between OmniRoute and Router
  (`openference` vs `openference-api`, `devin` vs `devin-cli`, `poe` web vs api).

## Done

- [x] Merge 73 missing providers + 86 registry catalogs from OmniRoute; fix
  generate-providers paths; regenerate catalog → 433 providers / 1740 models (2026-08-22)
- [x] Copy 4 missing provider icons from OmniRoute → 464 total (2026-08-22)
- [x] Verify OpenCode Zen free tier via curl (`x-preview-f-free`, `nemotron-3.5-lightning-free` → 200) (2026-08-22)
- [x] Count full provider catalog across all 15 category files (2026-08-22)
- [x] Update README.md with provider metrics + full 433-provider list (grouped tables) (2026-08-22)
- [x] Merge 327 zero-code providers into dx-desktop defaults: 223 openai_compatible +
  10 anthropic_compatible entries generated from registry catalogs and merged into
  `assets/settings/default.json` (2026-08-22)
- [x] Add new OpenCode Zen free models to dx-desktop opencode crate:
  x-preview-f-free (DX Alpha Preview, now the default free model),
  nemotron-3.5-lightning-free, laguna-s-2.1-free, muse-spark-1.2-contributor-free (2026-08-22)
- [x] Merge 327 zero-code providers into dx-desktop defaults: 223 openai_compatible +
  10 anthropic_compatible entries generated from registry catalogs and merged into
  \ssets/settings/default.json\ (2026-08-22)
- [x] Add new OpenCode Zen free models to dx-desktop opencode crate:
  x-preview-f-free (DX Alpha Preview, default free model), nemotron-3.5-lightning-free,
  laguna-s-2.1-free, muse-spark-1.2-contributor-free (2026-08-22)
