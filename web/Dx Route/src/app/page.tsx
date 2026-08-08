import { redirect } from "next/navigation";

// Go straight to the dashboard — no login required
export default function InitPage() {
  redirect("/dashboard");
}
