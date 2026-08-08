export const featureFlags = {
  uiGenerator: process.env.NEXT_PUBLIC_FEATURE_UI_GENERATOR === "true",
  localLlm: process.env.NEXT_PUBLIC_FEATURE_LOCAL_LLM === "true",
  artifacts: process.env.NEXT_PUBLIC_FEATURE_ARTIFACTS === "true",
};
