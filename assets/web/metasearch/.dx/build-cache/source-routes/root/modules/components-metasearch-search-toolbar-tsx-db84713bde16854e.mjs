
export const dxSourceText = "export function SearchToolbar() {\n  return (\n    <form className=\"search-form\" data-search-form=\"true\" action=\"/\" method=\"get\">\n      <label className=\"text-field query-field\" htmlFor=\"query\">\n        <span className=\"field-label\">Search</span>\n        <span className=\"field-shell\">\n          <svg\n            aria-hidden=\"true\"\n            className=\"ui-icon field-icon\"\n            data-dx-icon=\"search\"\n            data-icon-source=\"dx-icons\"\n            viewBox=\"0 0 24 24\"\n          >\n            <path d=\"M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z\" />\n            <path d=\"m16 16 5 5\" />\n          </svg>\n          <input\n            id=\"query\"\n            name=\"q\"\n            type=\"search\"\n            inputMode=\"text\"\n            autoComplete=\"off\"\n            placeholder=\"Search the web\"\n            data-query-input=\"true\"\n          />\n        </span>\n      </label>\n\n      <input id=\"category\" name=\"category\" type=\"hidden\" data-category-input=\"true\" />\n      <input id=\"safe-search\" name=\"safe_search\" type=\"hidden\" data-safe-search-input=\"true\" />\n      <input id=\"time-range\" name=\"time_range\" type=\"hidden\" data-time-range-input=\"true\" />\n\n      <button className=\"primary-action\" type=\"submit\" data-tooltip=\"Search\">\n        <svg\n          aria-hidden=\"true\"\n          className=\"ui-icon\"\n          data-dx-icon=\"search\"\n          data-icon-source=\"dx-icons\"\n          viewBox=\"0 0 24 24\"\n        >\n          <path d=\"M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z\" />\n          <path d=\"m16 16 5 5\" />\n        </svg>\n        <span>Search</span>\n      </button>\n    </form>\n  );\n}\n";
export const dxSourceModule = Object.freeze({
  "source_path": "components/metasearch/search-toolbar.tsx",
  "chunk_output": ".dx/www/output/.dx/build-cache/source-routes/root/modules/components-metasearch-search-toolbar-tsx-db84713bde16854e.mjs",
  "kind": "tsx",
  "hash": "db84713bde16854e",
  "dependencies": [],
  "browser_executable": true,
  "source_transformed": false,
  "transform_kind": "metadata-only",
  "runtime_exports": [],
  "ecmascript_analysis": {
    "schema": "dx.ecmascript.analysis",
    "schema_revision": 1,
    "source_path": "components/metasearch/search-toolbar.tsx",
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
    "static_imports": [],
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
      "SearchToolbar"
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
export const dxLinkedDependencies = Object.freeze([]);
export default dxSourceModule;
