import { Provider as JotaiProvider } from "jotai";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <NuqsAdapter>{children}</NuqsAdapter>
    </JotaiProvider>
  );
}
