# Browser-based LLM inference strategy

## Problem

Running LLMs in the browser requires choosing between two engines:

| Engine | Backend | Speed | Requirements |
| ------ | ------- | ----- | ------------ |
| WebLLM | WebGPU (GPU) | Fast (up to 80% native) | WebGPU + 2 GB+ VRAM |
| wllama | WASM (CPU) | Moderate (up to 40 tok/s with SIMD) | Any browser, uses system RAM |

No single engine is best on every machine. A discrete GPU makes WebLLM the clear winner; integrated graphics or CPU-only makes wllama the only practical option.

## Strategy: capability-based routing

Detect hardware at startup and select the appropriate engine:

```
navigator.gpu?  →  check adapter limits  →  VRAM >= 2 GB?  →  WebLLM
                                         →  VRAM < 2 GB?   →  wllama
no WebGPU        →  wllama
```

### Detection flow

1. **WebGPU availability** — `navigator.gpu` exists
2. **VRAM estimate** — `adapter.limits.maxBufferSize` and known integrated GPU heuristics (e.g., 512 MB VRAM = integrated AMD/Intel graphics)
3. **Fallback** — if WebGPU missing or VRAM insufficient, use wllama

### Model selection by tier

| Tier | VRAM | Engine | Suggested models |
| ---- | ---- | ------ | ---------------- |
| GPU-capable | 4 GB+ | WebLLM | Phi-3.5-mini, Llama-3.2-3B, Qwen2.5-1.5B |
| GPU-capable | 2-4 GB | WebLLM | Qwen2.5-0.5B, TinyLlama |
| CPU-only | any | wllama | Qwen2.5-0.5B, Phi-2, TinyLlama (GGUF Q4) |

### Implementation notes

- Wrap `CreateMLCEngine()` in a try-catch — WebLLM can fail at GPU init or model load even after passing detection
- wllama loads a tiny GGUF by default (fast download), user picks larger models later
- Both engines expose an OpenAI-compatible API — same `chat.completions.create()` interface
- Cache the detection result in `localStorage` to skip re-detection on subsequent visits
- Allow manual override in settings (user may prefer CPU for battery life, or GPU if available)
