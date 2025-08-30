import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Profile } from "@shared/schema";
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Github,
  Calendar,
  Building,
  GraduationCap,
  Award,
  Download,
  Star,
  Users,
  Code,
  Palette,
  BookOpen,
  Trophy,
  Target,
  Heart,
  Globe,
  Linkedin,
  Twitter,
  MessageCircle,
  FileText,
  ChevronRight,
  CheckCircle,
  TrendingUp,
  Briefcase,
  User,
  Quote,
  Send,
  Laptop,
} from "lucide-react";

export default function PublicPortfolio() {
  const [, params] = useRoute("/public-portfolio/:username");
  const [activeTab, setActiveTab] = useState("about");
  const username = params?.username;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Resolve username to user ID
  const { data: userData } = useQuery<{
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  }>({
    queryKey: ["/api/user-by-username", username],
    enabled: !!username,
  });

  const userId = userData?.id?.toString();

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile", userId],
    enabled: !!userId,
  });

  const { data: workExperience = [] } = useQuery<any[]>({
    queryKey: ["/api/work-experience", userId],
    enabled: !!userId,
  });

  const { data: education = [] } = useQuery<any[]>({
    queryKey: ["/api/education", userId],
    enabled: !!userId,
  });

  const { data: skills = [] } = useQuery<any[]>({
    queryKey: ["/api/skills", userId],
    enabled: !!userId,
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects", userId],
    enabled: !!userId,
  });

  const { data: certifications = [] } = useQuery<any[]>({
    queryKey: ["/api/certifications", userId],
    enabled: !!userId,
  });

  const { data: achievements = [] } = useQuery<any[]>({
    queryKey: ["/api/achievements", userId],
    enabled: !!userId,
  });

  // Mock additional data for comprehensive portfolio
  const portfolioStats = {
    projectsCompleted: projects.length,
    yearsExperience: workExperience.length,
    clientsSatisfied: 50,
    certificationsEarned: certifications.length,
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager at TechCorp",
      company: "TechCorp",
      quote:
        "Working with this developer was exceptional. They delivered high-quality code on time and exceeded our expectations.",
      rating: 5,
      image: "/api/placeholder/60/60",
    },
    {
      name: "Michael Chen",
      role: "CTO at StartupXYZ",
      company: "StartupXYZ",
      quote:
        "Incredible problem-solving skills and attention to detail. Would definitely work with them again.",
      rating: 5,
      image: "/api/placeholder/60/60",
    },
    {
      name: "Emily Rodriguez",
      role: "Design Lead at Creative Studio",
      company: "Creative Studio",
      quote:
        "Great collaboration and communication throughout the project. Delivered exactly what we needed.",
      rating: 5,
      image: "/api/placeholder/60/60",
    },
  ];

  const socialLinks = [
    {
      icon: Linkedin,
      href: "https://linkedin.com/in/username",
      label: "LinkedIn",
    },
    { icon: Github, href: "https://github.com/username", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com/username", label: "Twitter" },
    { icon: Globe, href: "https://website.com", label: "Website" },
  ];

  // Show loading while resolving username
  if (!userData && username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Portfolio...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we load the portfolio.
          </p>
        </div>
      </div>
    );
  }

  // Show error if username resolution failed
  if (userData === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Portfolio Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The portfolio for "{username}" could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Show loading while fetching profile data
  if (!profile && userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Portfolio...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Loading portfolio data for "{userData?.firstName || username}"...
          </p>
        </div>
      </div>
    );
  }

  const visibleSkills = skills; // All skills are visible by default
  const visibleProjects = projects; // All projects are visible by default
  const visibleWorkExperience = workExperience; // All work experience is visible by default
  const visibleEducation = education; // All education is visible by default

  return (
    <div className="min-h-screen px-10 pt-10 bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-550 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <Card className="mx-auto  max-w-6xl border-0 shadow-2xl rounded-3xl bg-white/80 dark:bg-gradient-to-br from-grey-800  to-purple-500 backdrop-blur-md">
        <CardContent className="-10  ">
          <section className="relative px-6 py-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                      Hi, I'm{" "}
                      <span className="text-blue-600">
                        {profile?.personalDetails?.fullName || "Professional"}
                      </span>
                    </h1>
                    <p className="text-2xl text-gray-600 dark:text-gray-300 font-medium">
                      {profile?.personalDetails?.roleOrTitle ||
                        "Full Stack Developer & UI/UX Designer"}
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                      {profile?.personalDetails?.summary ||
                        "Passionate about creating exceptional digital experiences. I specialize in building scalable web applications and crafting intuitive user interfaces that solve real-world problems."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Let's Talk
                    </Button>
                    <Button size="lg" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download CV
                    </Button>
                  </div>

                  <div className="flex items-center space-x-6">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        aria-label={social.label}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    <div className="w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                      <Avatar className="w-72 h-72 border-4 border-white shadow-2xl">
                        <AvatarImage src={profile?.personalDetails?.photo} />
                        <AvatarFallback className="text-6xl font-bold text-white bg-transparent">
                          {profile?.personalDetails?.photo || "P"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
      {/* Stats Section */}
      <section className="bg-transparent dark:bg-gray-800 py-16 border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {portfolioStats.projectsCompleted}+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Projects Completed
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {portfolioStats.yearsExperience}+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Years Experience
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {portfolioStats.clientsSatisfied}+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Happy Clients
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {portfolioStats.certificationsEarned}+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Certifications
              </div>
            </div>
          </div>
        </div>
      </section>
      <Card className="mx-auto  max-w-6xl border-0 shadow-2xl rounded-3xl  bg-white/50 dark:bg-gradient-to-br from-grey-800  to-purple-500 backdrop-blur-md">
        {/* Main Content Tabs */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6 mb-12">
              <TabsTrigger
                value="about"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="experience"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                Experience
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                Skills
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="education"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                Education
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                Contact
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-12">
              {/* About Me */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    About Me
                  </h2>
                  <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                    <p>
                      {profile?.personalDetails?.summary ||
                        "I'm a passionate full-stack developer with over 5 years of experience creating digital solutions that make a difference. My journey began with a curiosity about how things work, which led me to discover the power of code to transform ideas into reality."}
                    </p>
                    <p>
                      I specialize in building scalable web applications using
                      modern technologies like React, Node.js, and cloud
                      platforms. My approach combines technical expertise with
                      user-centered design thinking to create products that are
                      not only functional but delightful to use.
                    </p>
                    <p>
                      When I'm not coding, you'll find me exploring new
                      technologies, contributing to open-source projects, or
                      sharing knowledge with the developer community through
                      articles and mentoring.
                    </p>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Core Values
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-blue-600" />
                        <span className="text-gray-700 dark:text-gray-300">
                          User-first approach
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Heart className="h-5 w-5 text-red-600" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Quality over quantity
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Collaborative mindset
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Continuous learning
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Personal Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {profile?.contactDetails?.email ||
                            "megharaj@example.com"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {profile?.contactDetails?.phone || "+91 12345 67890"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {profile?.personalDetails?.location?.city ||
                            "Tamil Nadu"}
                          ,{" "}
                          {profile?.personalDetails?.location?.country ||
                            "India"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievements Highlights */}
                  {achievements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Trophy className="mr-2 h-5 w-5" />
                          Recent Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {achievements.slice(0, 3).map((achievement) => (
                            <div
                              key={achievement.id}
                              className="flex items-center space-x-3"
                            >
                              <Award className="h-4 w-4 text-yellow-500" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {achievement.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {achievement.issuer}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  Work Experience
                </h2>
                <div className="space-y-6">
                  {visibleWorkExperience.map((exp, index) => (
                    <Card
                      key={exp.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <Building className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {exp.position}
                              </h3>
                              <p className="text-blue-600 font-medium">
                                {exp.company}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {exp.startDate} | {exp.endDate || "Present"}
                          </Badge>
                        </div>

                        {exp.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            {exp.description}
                          </p>
                        )}

                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              Key Achievements:
                            </h4>
                            <ul className="space-y-1">
                              {exp.achievements.map(
                                (achievement: string, i: number) => (
                                  <li
                                    key={i}
                                    className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>{achievement}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  Skills & Expertise
                </h2>

                {/* Skills Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {
                          visibleSkills.filter(
                            (s) => s.category === "technical"
                          ).length
                        }
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Technical Skills
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {
                          visibleSkills.filter((s) => s.category === "soft")
                            .length
                        }
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Soft Skills
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {Math.round(
                          (visibleSkills.reduce(
                            (sum, skill) => sum + skill.level,
                            0
                          ) /
                            visibleSkills.length /
                            5) *
                            100
                        ) || 0}
                        %
                      </div>

                      <div className="text-gray-600 dark:text-gray-400">
                        Average Level
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Skills by Category - Compact Cards */}
                <div className="space-y-8">
                  {/* Technical Skills */}
                  {visibleSkills.filter(
                    (skill) => skill.category === "technical"
                  ).length > 0 && (
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <Code className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Technical Skills
                        </h3>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {
                            visibleSkills.filter(
                              (skill) => skill.category === "technical"
                            ).length
                          }
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {visibleSkills
                          .filter((skill) => skill.category === "technical")
                          .map((skill) => (
                            <Card
                              key={skill.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="mb-3">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                    {skill.name}
                                  </h4>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < skill.level
                                              ? "text-yellow-400 fill-current"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {(skill.level / 5) * 100}%
                                    </span>
                                  </div>

                                  {skill.level >= 80 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-green-50 text-green-700 border-green-200"
                                    >
                                      Expert
                                    </Badge>
                                  )}
                                  {skill.level >= 60 && skill.level < 80 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      Advanced
                                    </Badge>
                                  )}
                                  {skill.level >= 40 && skill.level < 60 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                                    >
                                      Intermediate
                                    </Badge>
                                  )}
                                  {skill.level < 40 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                                    >
                                      Beginner
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Soft Skills */}
                  {visibleSkills.filter((skill) => skill.category === "soft")
                    .length > 0 && (
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <Users className="w-6 h-6 text-green-600" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Soft Skills
                        </h3>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          {
                            visibleSkills.filter(
                              (skill) => skill.category === "soft"
                            ).length
                          }
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {visibleSkills
                          .filter((skill) => skill.category === "soft")
                          .map((skill) => (
                            <Card
                              key={skill.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="mb-3">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                    {skill.name}
                                  </h4>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < skill.level
                                              ? "text-yellow-400 fill-current"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {(skill.level / 5) * 100}%
                                    </span>
                                  </div>

                                  {skill.level >= 80 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-green-50 text-green-700 border-green-200"
                                    >
                                      Expert
                                    </Badge>
                                  )}
                                  {skill.level >= 60 && skill.level < 80 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      Advanced
                                    </Badge>
                                  )}
                                  {skill.level >= 40 && skill.level < 60 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                                    >
                                      Intermediate
                                    </Badge>
                                  )}
                                  {skill.level < 40 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                                    >
                                      Beginner
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tools & Technologies */}
                {/* <Card>
                  <CardHeader>
                    <CardTitle>Tools & Technologies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "React",
                        "Node.js",
                        "TypeScript",
                        "Python",
                        "AWS",
                        "Docker",
                        "PostgreSQL",
                        "MongoDB",
                        "GraphQL",
                        "Next.js",
                        "Tailwind CSS",
                        "Figma",
                      ].map((tool) => (
                        <Badge
                          key={tool}
                          variant="secondary"
                          className="text-sm px-3 py-1"
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card> */}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  Featured Projects
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {visibleProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="hover:shadow-lg transition-shadow group"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Code className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {project.title}
                            </h3>
                          </div>
                          <div className="flex space-x-2">
                            {project.url && (
                              <Button size="sm" variant="outline" asChild>
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
                              <Button size="sm" variant="outline" asChild>
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

                        {project.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                        {project.domain && (
                          <>
                            <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
                              <Laptop className="h-4 w-4" />
                              <span>{project.domain}</span>
                            </div>
                          </>
                        )}

                        {project.toolsOrMethods &&
                          project.toolsOrMethods.split(",").length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.toolsOrMethods
                                .split(",")
                                .map((tech: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tech.trim()}
                                  </Badge>
                                ))}
                            </div>
                          )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {project.startDate}
                            </span>
                            {project.status && (
                              <Badge
                                variant={
                                  project.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {project.status}
                              </Badge>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="education" className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  Education & Certifications
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Education */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Academic Background
                    </h3>
                    {visibleEducation.map((edu) => (
                      <Card key={edu.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                              <GraduationCap className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {edu.degree}
                              </h4>
                              <p className="text-green-600 font-medium">
                                {edu.institution}
                              </p>
                              <p className="text-sm text-gray-500 ">
                                {edu.level}
                              </p>
                              <p className="text-sm text-gray-500 mb-2">
                                {edu.yearOfPassing}
                              </p>

                              {edu.description && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                  {edu.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Certifications */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Certifications
                    </h3>
                    {certifications.map((cert) => (
                      <Card key={cert.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                              <Award className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {cert.title}
                              </h4>
                              <p className="text-yellow-600 font-medium">
                                {cert.organization}
                              </p>
                              <p className="text-sm text-gray-500 mb-2">
                                Issued: {cert.year}
                              </p>
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm flex items-center"
                                >
                                  View Certificate
                                  <ExternalLink className="ml-1 h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Let's Work Together
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    I'm always interested in hearing about new opportunities and
                    exciting projects. Whether you have a project in mind or
                    just want to chat about technology, feel free to reach out.
                  </p>

                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <Mail className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Email
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {profile?.contactDetails?.email ||
                                "megharaj@example.com"}
                            </p>
                          </div>
                        </div>
                        <Button className="w-full">
                          <Send className="mr-2 h-4 w-4" />
                          Send Email
                        </Button>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                      {socialLinks.map((social, index) => (
                        <a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <social.icon className="h-5 w-5 mr-2" />
                          {social.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    What People Say
                  </h3>
                  <div className="space-y-6">
                    {testimonials.map((testimonial, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage
                                src={testimonial.image}
                                alt={testimonial.name}
                              />
                              <AvatarFallback>
                                {testimonial.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className="flex">
                                  {[...Array(testimonial.rating)].map(
                                    (_, i) => (
                                      <Star
                                        key={i}
                                        className="h-4 w-4 text-yellow-400 fill-current"
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 italic">
                                "{testimonial.quote}"
                              </p>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {testimonial.name}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {testimonial.role} at {testimonial.company}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </Card>
      {/* Footer */}
      <footer className="bg-gray-50 mt-10 dark:bg-gray-800 border-t py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400">
                © 2024 {profile?.personalDetails?.fullName || "Megharaj K"}. All
                rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
