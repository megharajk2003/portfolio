import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type skills } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Menu, Bell, Plus, Zap, Star, Edit, Trash2, Code, Users, Lightbulb } from "lucide-react";

const CURRENT_USER_ID = "user-1";

export default function Skills() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: skills = [] } = useQuery<typeof skills.$inferSelect[]>({
    queryKey: ["/api/skills", CURRENT_USER_ID],
  });

  const groupedSkills = skills.reduce((acc: any, skill: any) => {
    const category = skill.category || 'technical';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return Code;
      case 'soft':
        return Users;
      case 'creative':
        return Lightbulb;
      default:
        return Star;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'soft':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'creative':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
                  Skills
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                  Manage your technical and soft skills
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
          {/* Add New Skill Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Skills</h3>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </Button>
          </div>

          {/* Skills by Category */}
          {Object.keys(groupedSkills).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedSkills).map(([category, categorySkills]: [string, any]) => {
                const IconComponent = getCategoryIcon(category);
                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 capitalize">
                        <IconComponent className="h-5 w-5" />
                        <span>{category} Skills</span>
                        <Badge className={getCategoryColor(category)}>
                          {categorySkills.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {categorySkills.map((skill: any) => (
                          <div key={skill.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {skill.name}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Progress value={skill.level} className="flex-1" />
                                <span className="text-sm text-gray-500 min-w-[3rem]">
                                  {skill.level}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No skills added yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start building your skill profile by adding your technical and soft skills.
                </p>
                <Button className="flex items-center space-x-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Skill</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Skill Categories Info */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                  <Code className="h-5 w-5" />
                  <span>Technical Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Programming languages, frameworks, tools, and technologies you work with.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                  <Users className="h-5 w-5" />
                  <span>Soft Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Communication, leadership, teamwork, and other interpersonal skills.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-purple-800 dark:text-purple-200">
                  <Lightbulb className="h-5 w-5" />
                  <span>Creative Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Design, writing, problem-solving, and other creative abilities.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tips Card */}
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200">Skill Assessment Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-yellow-700 dark:text-yellow-300 text-sm">
                <li>• Be honest about your skill levels - employers appreciate authenticity</li>
                <li>• Update skill levels regularly as you improve</li>
                <li>• Include both hard and soft skills relevant to your field</li>
                <li>• Use industry-standard terminology for technical skills</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}