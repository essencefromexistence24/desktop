import type { Metadata } from "next";
import RelayProxyClient from "./RelayProxyClient";

export const metadata: Metadata = {
  title: "Dx Route — Relay Proxies",
  description: "Serverless relay proxy endpoints for your AI infrastructure",
};

export default function RelayProxyPage() {
  return <RelayProxyClient />;
}
