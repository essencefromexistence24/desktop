// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"architecture/monorepo.md": () => import("../docs/architecture/monorepo.md?collection=docs"), "architecture/overview.md": () => import("../docs/architecture/overview.md?collection=docs"), "architecture/tauri-nextjs-integration.md": () => import("../docs/architecture/tauri-nextjs-integration.md?collection=docs"), "guides/contributing.md": () => import("../docs/guides/contributing.md?collection=docs"), "guides/deployment.md": () => import("../docs/guides/deployment.md?collection=docs"), "architecture/adr/0001-bun-workspaces.md": () => import("../docs/architecture/adr/0001-bun-workspaces.md?collection=docs"), "architecture/adr/0002-tauri-v2-mobile.md": () => import("../docs/architecture/adr/0002-tauri-v2-mobile.md?collection=docs"), "architecture/adr/0003-ai-streaming-protocol.md": () => import("../docs/architecture/adr/0003-ai-streaming-protocol.md?collection=docs"), }),
};
export default browserCollections;