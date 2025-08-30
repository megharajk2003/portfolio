import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/ui/footer";
import { Link } from "wouter";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Rocket,
  Users,
  Trophy,
  Zap,
  Star,
  ChevronRight,
  Code,
  Palette,
  BookOpen,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-100 to-violet-500 dark:from-gray-900 dark:via-blue-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 gradient-primary rounded-full opacity-10 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 gradient-success rounded-full opacity-10 animate-pulse-slow delay-1000"></div>
      </div>
      {/* Header */}
      <header className="relative z-10 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text dark:text-white text-transparent">
              knowme
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <Link href="/auth">
              <Button
                className="gradient-primary border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="button-login"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Card className="mx-auto mt-10 max-w-5xl border-0 shadow-2xl rounded-3xl bg-white/80 dark:bg-gradient-to-br from-grey-800  to-purple-500 backdrop-blur-md">
        <CardContent className="px-8 py-16 md:px-16 text-center">
          <section>
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm md:text-base"
            >
              <Zap className="w-4 h-4 mr-2" />
              Portfolio + Learning Platform
            </Badge>

            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              Build Your
              <span className="relative">
                <span className="relative bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark: bg-gradient-to-r from-blue-400 via-neutral-100 to-purple-500">
                  {" "}
                  Career{" "}
                </span>
              </span>
              Portfolio
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Create stunning portfolios, track your skills, and accelerate your
              learning with our gamified platform designed for modern
              professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                  data-testid="button-get-started"
                >
                  Get Started Free
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg rounded-full border-2"
                data-testid="button-view-demo"
              >
                View Demo Portfolio
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 dark:text-gray-400 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>10K+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>50+ Skills</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>4.9 Rating</span>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From portfolio creation to skill development, we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Professional Portfolios</CardTitle>
              <CardDescription>
                Create stunning, customizable portfolios that showcase your work
                and skills.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Skill Tracking</CardTitle>
              <CardDescription>
                Monitor your progress with detailed analytics and skill
                assessments.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Learning Modules</CardTitle>
              <CardDescription>
                Access curated learning content and earn XP as you progress.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Project Showcase</CardTitle>
              <CardDescription>
                Display your projects with live links, GitHub integration, and
                detailed descriptions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>Goal Setting</CardTitle>
              <CardDescription>
                Set and track career goals with personalized recommendations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Earn badges and certifications as you complete learning
                milestones.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Build Your Future?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of professionals who are already using knowme to
              advance their careers.
            </p>
            <Link href="/auth">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
                data-testid="button-start-building"
              >
                Start Building Today
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
