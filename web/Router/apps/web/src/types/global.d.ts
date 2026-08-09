/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module "@/assets/icons" {
  export const IconLogo: React.ComponentType;
  export const IconGithub: React.ComponentType;
}

declare module "@trpc/server" {
  export type inferAsyncReturnType<T extends (...args: unknown[]) => unknown> = T extends (
    ...args: unknown[]
  ) => Promise<infer R>
    ? R
    : never;
  export const initTRPC: {
    create(): {
      router: <T>(routes: T) => T;
      procedure: unknown;
    };
  };
}
