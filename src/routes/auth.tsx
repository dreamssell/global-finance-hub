import { createFileRoute } from "@tanstack/react-router";
import { LoginGateway } from "@/components/LoginGateway";

// The managed _authenticated redirect target. Same component as the hidden gateway.
export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: LoginGateway,
});
