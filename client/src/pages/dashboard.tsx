import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import StatsGrid from "@/components/stats-grid";
import SectionManagement from "@/components/section-management";
import LearningModules from "@/components/learning-modules";
import SkillChart from "@/components/skill-chart";
import ActivityCalendar from "@/components/activity-calendar";
import QuickActions from "@/components/quick-actions";
import RecentActivity from "@/components/recent-activity";
import { Button } from "@/components/ui/button";
import { Bell, FileText } from "lucide-react";

// Mock user ID for demo - in real app this would come from auth
const CURRENT_USER_ID = "user-1";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: userStats } = useQuery({
    queryKey: ["/api/user-stats", CURRENT_USER_ID],
  });

  const handleExportPDF = () => {
    // PDF export functionality will be implemented
    console.log("Exporting PDF...");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, <span>Megharaj</span>!
            </h2>
            <p className="text-gray-600 mt-1">Manage your portfolio and continue learning</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* PDF Export Button */}
            <Button
              onClick={handleExportPDF}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <StatsGrid userId={CURRENT_USER_ID} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section Management & Learning Modules */}
          <div className="lg:col-span-2 space-y-6">
            <SectionManagement userId={CURRENT_USER_ID} />
            <LearningModules userId={CURRENT_USER_ID} />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <SkillChart userId={CURRENT_USER_ID} />
            <ActivityCalendar userId={CURRENT_USER_ID} />
            <QuickActions />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity userId={CURRENT_USER_ID} />
      </main>
    </div>
  );
}
