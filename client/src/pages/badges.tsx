import React from "react";
import Sidebar from "@/components/sidebar";
import AllBadgesDisplay from "@/components/all-badges-display";
import { useAuth } from "@/hooks/useAuth";

export default function BadgesPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Badge Collection
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your achievements and milestones across the platform
            </p>
          </div>
          
          <AllBadgesDisplay userId={user.id} />
        </div>
      </main>
    </div>
  );
}