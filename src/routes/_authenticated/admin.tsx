import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";

export const Route = createFileRoute("/_authenticated/admin")({
  component: () => (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1"><Outlet /></div>
    </div>
  ),
});
