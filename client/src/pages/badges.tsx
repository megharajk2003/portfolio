import React from "react";
import SidebarLayout from "@/components/sidebar-layout";
import AllBadgesDisplay from "@/components/all-badges-display";
import { useAuth } from "@/hooks/useAuth";

export default function BadgesPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <SidebarLayout
      title="Badge Collection"
      description="Track your achievements and milestones across the platform"
      contentClassName="max-w-7xl mx-auto space-y-6"
    >
      <AllBadgesDisplay userId={user.id} />
    </SidebarLayout>
  );
}
