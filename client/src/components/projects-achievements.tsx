import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Trophy, Award, Star, Calendar } from "lucide-react";
import type { Project, Achievement } from "@shared/schema";

interface ProjectsAchievementsProps {
  userId: string;
}

export default function ProjectsAchievements({ userId }: ProjectsAchievementsProps) {
  const { data: projects = [], error: projectsError, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects", userId],
  });

  const { data: achievements = [], error: achievementsError, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements", userId],
  });

  // Debug logging
  console.log("ProjectsAchievements Debug:", {
    userId,
    projects,
    achievements,
    projectsError,
    achievementsError,
    projectsLoading,
    achievementsLoading
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Projects Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5 text-primary" />
              Projects
            </CardTitle>
            <Badge variant="outline">{projects.length} projects</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {projects.filter(project => project.isVisible).map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{project.title}</h3>
                  <div className="flex space-x-2">
                    {project.link && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {project.githubLink && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                
                {project.description && (
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    {project.description}
                  </p>
                )}
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {projects.filter(project => project.isVisible).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Github className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No projects added yet</p>
                <p className="text-sm">Start showcasing your work!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
            <Badge variant="outline">{achievements.length} achievements</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {achievements.filter(achievement => achievement.isVisible).map((achievement) => (
              <div key={achievement.id} className="relative">
                <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  {/* Achievement Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      {achievement.title.toLowerCase().includes('hackathon') && (
                        <Star className="h-6 w-6 text-white" />
                      )}
                      {achievement.title.toLowerCase().includes('certified') && (
                        <Award className="h-6 w-6 text-white" />
                      )}
                      {(!achievement.title.toLowerCase().includes('hackathon') && 
                        !achievement.title.toLowerCase().includes('certified')) && (
                        <Trophy className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>
                  
                  {/* Achievement Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {achievement.title}
                      </h3>
                      {achievement.year && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {achievement.year}
                        </div>
                      )}
                    </div>
                    
                    {achievement.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {achievements.filter(achievement => achievement.isVisible).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No achievements added yet</p>
                <p className="text-sm">Celebrate your wins!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}