import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Github,
  Trophy,
  Briefcase, // Changed from Github icon for title
} from "lucide-react";
// Make sure to import the Profile type from your shared schema
import type { Project, Profile } from "@shared/schema";

interface ProjectsAchievementsProps {
  userId: string;
}

// Define the Project type as it's expected by the preview component
// This ensures consistency across your app.
interface PreviewProject {
  id: string;
  title: string;
  description: string;
  domain: string;
  toolsOrMethods?: string;
  outcome?: string;
  url?: string;
  githubUrl?: string;
}

export default function ProjectsAchievements({
  userId,
}: ProjectsAchievementsProps) {
  // Use the new PreviewProject type for data consistency
  const { data: projectsData = [] } = useQuery<PreviewProject[]>({
    queryKey: ["/api/projects", userId],
  });

  // Fetch the main profile to get achievements, just like the preview tab does
  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile", userId],
  });

  // Achievements are now an array of strings from the profile's otherDetails
  const achievementsData = profile?.otherDetails?.achievements || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* ========================================================== */}
      {/* Projects Section - Updated to match preview style        */}
      {/* ========================================================== */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Projects
            </CardTitle>
            <Badge variant="outline">{projectsData.length} projects</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {projectsData.length > 0 ? (
              projectsData.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {project.title}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        {project.domain}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {project.url && (
                        <Button size="icon" variant="outline" asChild>
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button size="icon" variant="outline" asChild>
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {project.description}
                  </p>

                  {project.toolsOrMethods && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tools & Methods
                      </p>
                      <p className="text-gray-700 dark:text-gray-200 text-sm">
                        {project.toolsOrMethods}
                      </p>
                    </div>
                  )}

                  {project.outcome && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Outcome
                      </p>
                      <p className="text-gray-700 dark:text-gray-200 text-sm">
                        {project.outcome}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No projects added yet</p>
                <p className="text-sm">Start showcasing your work!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================== */}
      {/* Achievements Section - Updated to match preview style    */}
      {/* ========================================================== */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
            <Badge variant="outline">
              {achievementsData.length} achievements
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {achievementsData.length > 0 ? (
              achievementsData.map((achievement, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md"
                >
                  <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {typeof achievement === 'string' ? achievement : achievement.title}
                  </p>
                </div>
              ))
            ) : (
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
