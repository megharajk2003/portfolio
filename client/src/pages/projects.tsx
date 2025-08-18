import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type projects } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Menu, Bell, Plus, FolderOpen, ExternalLink, Github, Edit, Trash2, Eye } from "lucide-react";

const CURRENT_USER_ID = "user-1";

export default function Projects() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: projects = [] } = useQuery<typeof projects.$inferSelect[]>({
    queryKey: ["/api/projects", CURRENT_USER_ID],
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
                  Projects
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                  Showcase your work and achievements
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
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
          {/* Add New Project Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Projects</h3>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </Button>
          </div>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: any) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-gray-900 dark:text-white line-clamp-1">
                        {project.title}
                      </CardTitle>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                        {project.description}
                      </p>
                    )}
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 3).map((tech: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-2">
                        {project.link && (
                          <Button variant="outline" size="sm" className="flex items-center space-x-1">
                            <ExternalLink className="w-3 h-3" />
                            <span>Live</span>
                          </Button>
                        )}
                        {project.githubLink && (
                          <Button variant="outline" size="sm" className="flex items-center space-x-1">
                            <Github className="w-3 h-3" />
                            <span>Code</span>
                          </Button>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-500">
                        <Eye className="w-3 h-3" />
                        <span className="text-xs">View</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No projects added yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Showcase your work by adding your projects, applications, and side projects.
                </p>
                <Button className="flex items-center space-x-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Project</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Project Categories */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-800 dark:text-blue-200">Web Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Full-stack web applications, websites, and web-based tools.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800 dark:text-green-200">Mobile Apps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 dark:text-green-300">
                  iOS, Android, and cross-platform mobile applications.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-800 dark:text-purple-200">Open Source</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Libraries, tools, and contributions to open source projects.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tips Card */}
          <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="text-indigo-800 dark:text-indigo-200">Project Portfolio Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-indigo-700 dark:text-indigo-300 text-sm">
                <li>• Include a clear description of what the project does</li>
                <li>• Highlight the technologies and tools you used</li>
                <li>• Provide live demos and source code links when possible</li>
                <li>• Focus on projects that demonstrate relevant skills</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}