import { Provider as JotaiProvider } from "jotai";

export default function DxLayout({ children }: { children: React.ReactNode }) {
  return <JotaiProvider>{children}</JotaiProvider>;
}
