import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Trophy, Briefcase, Star } from "lucide-react";
import type { Project as PreviewProject, Profile } from "@shared/schema";

interface ProjectsAchievementsProps {
  userId: string;
}

export default function ProjectsAchievements({
  userId,
}: ProjectsAchievementsProps) {
  const { data: projectsData = [] } = useQuery<PreviewProject[]>({
    queryKey: ["/api/projects", userId],
  });

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile", userId],
  });

  const achievementsData = profile?.otherDetails?.achievements || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* ========================================================== */}
      {/* Projects Section                                         */}
      {/* ========================================================== */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl text-blue-700 dark:text-blue-300">
              <Briefcase className="mr-3 h-6 w-6 text-blue-600" />
              Projects
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 px-3 py-1"
            >
              {projectsData.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {projectsData.length > 0 ? (
              projectsData.map((project) => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-blue-500/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {project.title}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        {project.domain}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {project.url && (
                        <Button
                          size="icon"
                          variant="ghost"
                          asChild
                          className="h-8 w-8"
                        >
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Project"
                          >
                            <ExternalLink className="h-4 w-4 text-slate-500" />
                          </a>
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button
                          size="icon"
                          variant="ghost"
                          asChild
                          className="h-8 w-8"
                        >
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on GitHub"
                          >
                            <Github className="h-4 w-4 text-slate-500" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  {project.toolsOrMethods && (
                    <div className="flex flex-wrap gap-2 pt-3">
                      {project.toolsOrMethods.split(",").map((tool) => (
                        <Badge key={tool} variant="secondary">
                          {tool.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No projects added yet</p>
                <p className="text-sm">Showcase your amazing work!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================== */}
      {/* Achievements Section with "Yellow Glow Up"               */}
      {/* ========================================================== */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl text-amber-700 dark:text-amber-300">
              <Trophy className="mr-3 h-6 w-6 text-amber-600" />
              Achievements
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200 px-3 py-1"
            >
              {achievementsData.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {achievementsData.length > 0 ? (
              achievementsData.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:shadow-amber-500/10"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                    {typeof achievement === "string"
                      ? achievement
                      : achievement.title}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No achievements yet</p>
                <p className="text-sm">
                  Your accomplishments will appear here!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
