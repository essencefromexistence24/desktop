"use client";

import { ConsentManagerProvider } from "@c15t/nextjs";
import { posthog } from "posthog-js";

export function ConsentManagerClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsentManagerProvider
      options={{
        mode: "offline",
        consentCategories: ["necessary", "measurement"],
        callbacks: {
          onConsentSet({ preferences }) {
            if (preferences.measurement) {
              posthog.opt_in_capturing();
            } else {
              posthog.opt_out_capturing();
            }
          },
        },
      }}
    >
      {children}
    </ConsentManagerProvider>
  );
}
