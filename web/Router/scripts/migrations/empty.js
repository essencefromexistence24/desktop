export const normalize = (p) => p;
export const join = (...args) => args.join("/");
export const resolve = (...args) => args.join("/");
export const dirname = () => "";
export const basename = () => "";
export const readFileSync = () => "";
export const existsSync = () => false;
export const performance =
  typeof globalThis !== "undefined" ? globalThis.performance : { now: () => 0 };
export const createRequire = () => () => ({});
export const posix = { normalize, join, resolve, dirname, basename };
export const win32 = { normalize, join, resolve, dirname, basename };
export default {
  normalize,
  join,
  resolve,
  dirname,
  basename,
  readFileSync,
  existsSync,
  performance,
  createRequire,
  posix,
  win32,
};
