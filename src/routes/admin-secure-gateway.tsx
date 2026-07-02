import { createFileRoute } from "@tanstack/react-router";
import { LoginGateway } from "@/components/LoginGateway";

export const Route = createFileRoute("/admin-secure-gateway")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Admin — Secure Gateway" },
    ],
  }),
  component: LoginGateway,
});
