import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, Phone, MapPin, ExternalLink, Github, 
  Calendar, Building, GraduationCap 
} from "lucide-react";

export default function PublicPortfolio() {
  const [, params] = useRoute("/portfolio/:username");
  const username = params?.username;

  // Mock user ID mapping - in real app this would be resolved from username
  const CURRENT_USER_ID = "user-1";

  const { data: profile } = useQuery({
    queryKey: ["/api/profile", CURRENT_USER_ID],
  });

  const { data: workExperience = [] } = useQuery({
    queryKey: ["/api/work-experience", CURRENT_USER_ID],
  });

  const { data: education = [] } = useQuery({
    queryKey: ["/api/education", CURRENT_USER_ID],
  });

  const { data: skills = [] } = useQuery({
    queryKey: ["/api/skills", CURRENT_USER_ID],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects", CURRENT_USER_ID],
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ["/api/certifications", CURRENT_USER_ID],
  });

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Not Found</h1>
          <p className="text-gray-600">The portfolio for "{username}" could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">
                {profile.name?.charAt(0) || "M"}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{profile.name || "Megharaj K"}</h1>
              <p className="text-xl opacity-90 mb-4">{profile.role || "Full Stack Developer"}</p>
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <span className="flex items-center">
                  <Mail className="mr-1 h-4 w-4" />
                  {profile.email || "megharaj@example.com"}
                </span>
                <span className="flex items-center">
                  <Phone className="mr-1 h-4 w-4" />
                  {profile.phone || "+91 12345 67890"}
                </span>
                <span className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {profile.location || "Tamil Nadu, India"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* About Section */}
        {profile.summary && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{profile.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skills.filter(skill => skill.isVisible).map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{skill.name}</span>
                      <span className="text-gray-500">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.filter(project => project.isVisible).map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex space-x-2">
                      {project.link && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {project.githubLink && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                            <Github className="mr-1 h-3 w-3" />
                            Code
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Work Experience Section */}
        {workExperience.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workExperience.filter(exp => exp.isVisible).map((exp) => (
                  <div key={exp.id} className="border-l-2 border-primary pl-4">
                    <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Building className="mr-1 h-4 w-4" />
                      <span className="mr-4">{exp.company}</span>
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>{exp.startDate} - {exp.endDate || "Present"}</span>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {education.filter(edu => edu.isVisible).map((edu) => (
                  <div key={edu.id} className="flex items-start space-x-3">
                    <GraduationCap className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">
                        {edu.startDate} - {edu.endDate || "Present"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certifications Section */}
        {certifications.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certifications.filter(cert => cert.isVisible).map((cert) => (
                  <div key={cert.id} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                      <p className="text-gray-600">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">{cert.date}</p>
                    </div>
                    {cert.link && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={cert.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact CTA */}
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's Work Together</h2>
            <p className="text-gray-600 mb-4">
              Interested in collaborating? I'd love to hear from you.
            </p>
            <Button size="lg" asChild>
              <a href={`mailto:${profile.email || "megharaj@example.com"}`}>
                Get In Touch
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
