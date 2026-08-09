import { ConsentBanner, ConsentDialog, ConsentManagerProvider } from "@c15t/nextjs";

export function ConsentManager({ children }: { children: React.ReactNode }) {
  return (
    <ConsentManagerProvider
      options={{
        mode: "offline",
        consentCategories: ["necessary", "measurement"],
        // ignoreGeoLocation: process.env.NODE_ENV === "development", // Useful for development to always view the banner.
      }}
    >
      <ConsentBanner />

      <ConsentDialog />

      {children}
    </ConsentManagerProvider>
  );
}
