import { Chat } from "@/features/dx/components/chat";

export function generateStaticParams() {
  return [];
}

export default function ChatSlugPage() {
  return <Chat swapped />;
}
