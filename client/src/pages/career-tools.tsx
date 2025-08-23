import { Link } from "wouter";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/sidebar";
import {
  BrainCircuit,
  Calendar as Timeline,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Menu,
} from "lucide-react";

export default function CareerTools() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tools = [
    {
      id: "career-advisor",
      title: "Personal Career Advisor",
      description:
        "Get personalized AI-powered career guidance based on your profile, skills, and learning progress. Receive specific recommendations for your career growth.",
      icon: BrainCircuit,
      link: "/career-advisor",
      color: "bg-blue-500",
      features: [
        "Career Guidance",
        "Skill Gap Analysis",
        "Next Steps Planning",
      ],
      status: "AI-Powered",
    },
    {
      id: "career-timeline",
      title: "AI Career Timeline",
      description:
        "Generate a detailed roadmap for your career progression. Get phase-by-phase plans with milestones and skills to develop.",
      icon: Timeline,
      link: "/career-timeline",
      color: "bg-green-500",
      features: ["Roadmap Planning", "Milestone Tracking", "Skill Development"],
      status: "AI-Powered",
    },
    {
      id: "resume-generator",
      title: "AI Resume Generator",
      description:
        "Create professional resumes tailored to specific roles using your profile data. Multiple templates and customization options.",
      icon: FileText,
      link: "/resume-generator",
      color: "bg-purple-500",
      features: ["Multiple Templates", "Role-Specific", "Auto-Generated"],
      status: "AI-Powered",
    },
    {
      id: "chat-assistant",
      title: "AI Chat Assistant",
      description:
        "Have interactive conversations with an AI career counselor. Get instant answers to career questions and personalized advice.",
      icon: MessageSquare,
      link: "/career-chat",
      color: "bg-orange-500",
      features: ["Interactive Chat", "Real-time Advice", "Personalized"],
      status: "AI-Powered",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <h1 className="text-lg font-semibold">AI Career Tools</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Career Tools
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Supercharge your career with AI-powered tools designed to guide
              your professional growth and help you achieve your goals.
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link key={tool.id} href={tool.link}>
                  <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-blue-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`${tool.color} p-3 rounded-lg text-white`}
                          >
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                              {tool.title}
                            </CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {tool.status}
                            </Badge>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4 leading-relaxed">
                        {tool.description}
                      </CardDescription>

                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
