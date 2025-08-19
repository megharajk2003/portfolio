import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type education } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Bell,
  Plus,
  GraduationCap,
  Calendar,
  Edit,
  Trash2,
  Award,
} from "lucide-react";

const CURRENT_USER_ID = "user-1";

export default function Education() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: education = [] } = useQuery<(typeof education.$inferSelect)[]>({
    queryKey: ["/api/education", CURRENT_USER_ID],
  });

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
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 
      `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
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
                  Education
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                  Manage your educational background
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
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
          {/* Add New Education Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Educational Background
            </h3>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </Button>
          </div>

          {/* Education List */}
          <div className="space-y-4">
            {education.length > 0 ? (
              education.map((edu: any) => (
                <Card
                  key={edu.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                          {edu.degree}
                        </CardTitle>
                        <p className="text-primary font-semibold text-lg mt-1">
                          {edu.institution}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {edu.startDate} - {edu.endDate || "Present"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No education added yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Add your educational background to showcase your academic
                    achievements.
                  </p>
                  <Button className="flex items-center space-x-2 mx-auto">
                    <Plus className="w-4 h-4" />
                    <span>Add Your First Education</span>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Certifications Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Certifications
              </h3>
              <Button variant="outline" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Certification</span>
              </Button>
            </div>

            <Card className="text-center py-12">
              <CardContent>
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No certifications added yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Showcase your professional certifications and licenses.
                </p>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Certification</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tips Card */}
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200">
                Education Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                <li>• List your most recent education first</li>
                <li>• Include relevant coursework for entry-level positions</li>
                <li>• Mention GPA only if it's 3.5 or higher</li>
                <li>• Add certifications that are relevant to your field</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
