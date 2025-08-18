import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type profiles } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import StatsGrid from "@/components/stats-grid";
import LearningModules from "@/components/learning-modules";
import SkillRadarChart from "@/components/skill-radar-chart";
import ProjectsAchievements from "@/components/projects-achievements";
import ActivityCalendar from "@/components/activity-calendar";
import QuickActions from "@/components/quick-actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, FileText, Menu, X, Edit } from "lucide-react";
import { Link } from "wouter";

// Mock user ID for demo - in real app this would come from auth
const CURRENT_USER_ID = "user-1";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: userStats } = useQuery({
    queryKey: ["/api/user-stats", CURRENT_USER_ID],
  });

  const { data: profile } = useQuery<typeof profiles.$inferSelect>({
    queryKey: ["/api/profile", CURRENT_USER_ID],
  });

  const handleExportPDF = () => {
    // PDF export functionality will be implemented
    console.log("Exporting PDF...");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, <span className="text-primary">Megharaj</span>!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                  Manage your portfolio and continue learning
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* PDF Export Button - Hidden on mobile */}
              <Button
                onClick={handleExportPDF}
                className="hidden sm:flex bg-red-600 text-white hover:bg-red-700"
                size="sm"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              
              {/* Mobile PDF button */}
              <Button
                onClick={handleExportPDF}
                variant="ghost"
                size="icon"
                className="sm:hidden"
              >
                <FileText className="h-5 w-5" />
              </Button>
              
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Hero Section */}
          <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profile?.photoUrl || ""} alt={profile?.name || ""} />
                    <AvatarFallback className="text-xl">
                      {profile?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile?.name || "User Name"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {profile?.role || "Professional Role"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profile?.email || "email@example.com"}
                  </p>
                </div>
              </div>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            </div>
          </section>

          {/* Stats Cards */}
          <StatsGrid userId={CURRENT_USER_ID} />

          {/* Quick Actions - Mobile First */}
          <div className="lg:hidden">
            <QuickActions />
          </div>

          {/* Learning Activity - Now before Learning Modules */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Learning Activity</h3>
            <ActivityCalendar userId={CURRENT_USER_ID} />
          </section>

          {/* Learning Modules */}
          <LearningModules userId={CURRENT_USER_ID} />

          {/* Skill Dashboard */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Skill Dashboard</h3>
            <SkillRadarChart userId={CURRENT_USER_ID} />
          </section>

          {/* Projects & Achievements */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Projects & Achievements</h3>
            <ProjectsAchievements userId={CURRENT_USER_ID} />
          </section>

          {/* Right sidebar content for desktop */}
          <div className="hidden lg:block">
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
}
