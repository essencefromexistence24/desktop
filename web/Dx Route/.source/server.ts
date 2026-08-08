// @ts-nocheck
import * as __fd_glob_7 from "../docs/architecture/adr/0003-ai-streaming-protocol.md?collection=docs"
import * as __fd_glob_6 from "../docs/architecture/adr/0002-tauri-v2-mobile.md?collection=docs"
import * as __fd_glob_5 from "../docs/architecture/adr/0001-bun-workspaces.md?collection=docs"
import * as __fd_glob_4 from "../docs/guides/deployment.md?collection=docs"
import * as __fd_glob_3 from "../docs/guides/contributing.md?collection=docs"
import * as __fd_glob_2 from "../docs/architecture/tauri-nextjs-integration.md?collection=docs"
import * as __fd_glob_1 from "../docs/architecture/overview.md?collection=docs"
import * as __fd_glob_0 from "../docs/architecture/monorepo.md?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();

export const docs = await create.docs("docs", "docs", {}, {"architecture/monorepo.md": __fd_glob_0, "architecture/overview.md": __fd_glob_1, "architecture/tauri-nextjs-integration.md": __fd_glob_2, "guides/contributing.md": __fd_glob_3, "guides/deployment.md": __fd_glob_4, "architecture/adr/0001-bun-workspaces.md": __fd_glob_5, "architecture/adr/0002-tauri-v2-mobile.md": __fd_glob_6, "architecture/adr/0003-ai-streaming-protocol.md": __fd_glob_7, });