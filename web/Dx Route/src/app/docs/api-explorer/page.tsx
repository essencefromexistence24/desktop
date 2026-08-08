import { Metadata } from "next";
import { ApiExplorerClient } from "../components/ApiExplorerClient";

export const metadata: Metadata = {
  title: "API Explorer — Dx Route Docs",
  description: "Interactive API explorer — try Dx Route endpoints live with real-time responses",
};

export default function ApiExplorerPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-2">API Explorer</h1>
      <p className="text-text-muted mb-8">
        Try Dx Route endpoints live. Select an endpoint, configure your request, and see the
        response in real time.
      </p>
      <ApiExplorerClient />
    </div>
  );
}
