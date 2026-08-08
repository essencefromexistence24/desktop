import type { inferAsyncReturnType } from "@trpc/server";

export async function createTRPCContext() {
  return {};
}

export type TRPCContext = inferAsyncReturnType<typeof createTRPCContext>;
