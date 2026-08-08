import { dxSourceModule as dep0, dxRuntimeExports as dep0Runtime } from "./components-metasearch-search-controls-tsx-a6b028f6b9965ee0.mjs";
import { dxSourceModule as dep1, dxRuntimeExports as dep1Runtime } from "./components-metasearch-search-toolbar-tsx-db84713bde16854e.mjs";
export const dxSourceText = "import { SearchControls } from \"../../components/metasearch/search-controls\";\nimport { SearchToolbar } from \"../../components/metasearch/search-toolbar\";\n\nexport const metadata = {\n  title: \"DX Metasearch Media\",\n  description: \"Media search results served through DX WWW.\",\n} as const;\n\nexport default function MediaPage() {\n  return (\n    <div\n      className=\"site-shell\"\n      data-metasearch-app=\"true\"\n      data-flow-tts-endpoint=\"http://127.0.0.1:8789/api/flow/tts\"\n    >\n      <header className=\"site-header\">\n        <a className=\"brand\" href=\"/\" aria-label=\"DX Metasearch\">\n          <img className=\"brand-mark\" src=\"/logo.svg\" alt=\"DX\" />\n          <span className=\"brand-text\">\n            <span>DX</span>\n            <strong>Metasearch</strong>\n          </span>\n        </a>\n\n        {/* <SearchToolbar /> */}\n      </header>\n\n      <SearchControls />\n\n      <main className=\"results-shell\" id=\"results\">\n        <section className=\"results-main\" aria-label=\"Search results\">\n          <section className=\"default-showcase\" data-default-showcase=\"true\" aria-label=\"Media preview\">\n            <article className=\"default-media-card default-media-card--image\" data-hello-glow-media=\"true\">\n              <img\n                src=\"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=82\"\n                alt=\"Mountain lake landscape\"\n                loading=\"lazy\"\n                decoding=\"async\"\n              />\n            </article>\n\n            <article className=\"default-media-card default-media-card--audio\" data-audio-gradient-card=\"true\" data-hello-glow-media=\"true\">\n              <audio\n                controls\n                preload=\"metadata\"\n                src=\"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=\"\n              />\n            </article>\n\n            <article className=\"default-media-card default-media-card--video\" data-hello-glow-media=\"true\">\n              <video\n                controls\n                playsInline\n                preload=\"metadata\"\n                aria-label=\"Video preview\"\n                poster=\"https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1400&q=82\"\n              >\n                <source src=\"/public/metasearch/media/default-preview.mp4\" type=\"video/mp4\" />\n              </video>\n            </article>\n          </section>\n\n          <div className=\"results-status\" data-results-status=\"true\" aria-live=\"polite\" />\n          <div className=\"result-list\" data-result-list=\"true\" />\n        </section>\n      </main>\n\n      <script src=\"/public/metasearch/url-safety.ts\" defer></script>\n      <script src=\"/public/metasearch/i18n-languages.ts\" defer></script>\n      <script src=\"/public/metasearch/answer-common.ts\" defer></script>\n      <script src=\"/public/metasearch/answer-tts.ts\" defer></script>\n      <script src=\"/public/metasearch/answer-controls.ts\" defer></script>\n      <script src=\"/public/metasearch/answer-summary.ts\" defer></script>\n      <script src=\"/public/metasearch/answer-evidence.ts\" defer></script>\n      <script src=\"/public/metasearch/answer-media.ts\" defer></script>\n      <script src=\"/public/metasearch/answer-renderer.ts\" defer></script>\n      <script src=\"/public/metasearch/result-common.ts\" defer></script>\n      <script src=\"/public/metasearch/result-cards.ts\" defer></script>\n      <script src=\"/public/metasearch/results-renderer.ts\" defer></script>\n      <script src=\"/public/metasearch/search-scheduler.ts\" defer></script>\n      <script src=\"/public/metasearch/runtime.ts\" defer></script>\n    </div>\n  );\n}\n";
export const dxSourceModule = Object.freeze({
  "source_path": "app/media/page.tsx",
  "chunk_output": ".dx/www/output/.dx/build-cache/source-routes/media/modules/app-media-page-tsx-93e65191d4d488cb.mjs",
  "kind": "tsx",
  "hash": "93e65191d4d488cb",
  "dependencies": [
    {
      "specifier": "../../components/metasearch/search-controls",
      "resolved_path": "components/metasearch/search-controls.tsx",
      "chunk_output": ".dx/www/output/.dx/build-cache/source-routes/media/modules/components-metasearch-search-controls-tsx-a6b028f6b9965ee0.mjs",
      "kind": "tsx",
      "resolver_source": "relative",
      "node_modules_required": false
    },
    {
      "specifier": "../../components/metasearch/search-toolbar",
      "resolved_path": "components/metasearch/search-toolbar.tsx",
      "chunk_output": ".dx/www/output/.dx/build-cache/source-routes/media/modules/components-metasearch-search-toolbar-tsx-db84713bde16854e.mjs",
      "kind": "tsx",
      "resolver_source": "relative",
      "node_modules_required": false
    }
  ],
  "browser_executable": true,
  "source_transformed": false,
  "transform_kind": "metadata-only",
  "runtime_exports": [],
  "ecmascript_analysis": {
    "schema": "dx.ecmascript.analysis",
    "schema_revision": 1,
    "source_path": "app/media/page.tsx",
    "source_kind": "tsx",
    "parser_backend": "oxc-parser",
    "diagnostics": 0,
    "compatibility_reference": {
      "upstream_crates": [
        "turbopack-ecmascript"
      ],
      "reference_only": true,
      "runtime_build_adoption": false,
      "public_runtime_dependency": false,
      "vendor_root": "vendor/next-rust",
      "vendor_commit": "f3f56ecec2f3f8cefa0f0a1323ea406740251d5c",
      "next_transform_references": [
        "next-custom-transforms::track_dynamic_imports",
        "next-custom-transforms::react_server_components"
      ],
      "copied_code": false
    },
    "output_model": {
      "contract": "dx.www.moduleGraph",
      "compiler_owns_output": true,
      "public_architecture": "DX-owned source graph analysis"
    },
    "runtime_boundaries": {
      "next_runtime_required": false,
      "react_runtime_required": false,
      "rsc_required": false,
      "node_modules_required": false
    },
    "directives": [],
    "static_imports": [
      {
        "specifier": "../../components/metasearch/search-controls",
        "side_effect_only": false,
        "type_only": false
      },
      {
        "specifier": "../../components/metasearch/search-toolbar",
        "side_effect_only": false,
        "type_only": false
      }
    ],
    "dynamic_imports": [],
    "unresolved_dynamic_imports": [],
    "unsupported_dynamic_imports": [],
    "dynamic_import_analysis": {
      "status": "none-observed",
      "static_count": 0,
      "unresolved_count": 0,
      "unsupported_count": 0,
      "boundary": "source-owned dynamic import analysis; static specifiers become evidence, expressions remain unresolved, and unsupported call forms stay as adapter-boundary receipts"
    },
    "export_names": [
      "MediaPage",
      "metadata"
    ],
    "jsx": true,
    "top_level_await": false,
    "full_nextjs_parity": false,
    "analysis_boundary": "Uses vendored Turbopack ECMAScript and selected Next transform behavior as compatibility references while emitting DX-owned source graph receipts."
  },
  "node_modules_required": false
});
export const dxRuntimeModule = Object.freeze({
  transformed: false,
  transformKind: "metadata-only",
  exportNames: []
});
export const dxRuntimeExports = Object.freeze({});
export const dxLinkedDependencies = Object.freeze([dep0, dep1]);
export default dxSourceModule;
