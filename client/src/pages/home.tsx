import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type profiles } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/ui/footer";
import StatsGrid from "@/components/stats-grid";
import LearningModules from "@/components/learning-modules";
import SkillRadarChart from "@/components/skill-radar-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import {
  LogOut,
  User,
  Settings,
  Bell,
  Calendar,
  TrendingUp,
  BookOpen,
  Target,
  Award,
  Zap,
} from "lucide-react";

const CURRENT_USER_ID = "user-1";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { handleLogout } = useLogout();

  const { data: profile } = useQuery({
    queryKey: ["/api/profile", CURRENT_USER_ID],
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back,{" "}
                {user?.firstName || profile?.name || "Professional"}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                data-testid="button-notifications"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" data-testid="button-profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const { handleLogout } = useLogout();
                  handleLogout();
                }}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                data-testid="card-learning"
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Continue Learning
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      3 modules in progress
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                data-testid="card-portfolio"
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Update Portfolio
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add new projects
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                data-testid="card-goals"
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Set Goals
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Plan your next step
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                data-testid="card-achievements"
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      View Achievements
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      See your progress
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Progress
            </h2>
            <StatsGrid userId={""} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Learning Progress */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current Learning
              </h2>
              <LearningModules userId={""} />
            </div>

            {/* Skills Overview */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Skills Overview
              </h2>
              <SkillRadarChart userId={""} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        Completed "React Advanced Patterns" - Earned 50 XP
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        2 hours ago
                      </p>
                    </div>
                    <Badge variant="secondary">+50 XP</Badge>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        Updated portfolio with new project
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        1 day ago
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        Achieved "JavaScript Expert" badge
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        3 days ago
                      </p>
                    </div>
                    <Badge variant="outline">Achievement</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
