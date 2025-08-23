import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Trophy,
  Play,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  Code,
  Database,
  Cpu,
  Zap,
  Globe,
  Smartphone,
  Palette,
  TrendingUp,
  ChevronRight,
  Calendar,
  Award,
  ExternalLink,
} from "lucide-react";

const CURRENT_USER_ID = 1; // Changed to number to match database schema

const categoryIcons = {
  "AI & Machine Learning": { icon: Cpu, color: "text-purple-600" },
  "Data Science & Analytics": { icon: Database, color: "text-green-600" },
  "Generative AI": { icon: Zap, color: "text-yellow-600" },
  Management: { icon: Users, color: "text-orange-600" },
  "Software & Tech": { icon: Code, color: "text-blue-500" },
  "Cloud Computing": { icon: Globe, color: "text-indigo-600" },
  Design: { icon: Palette, color: "text-rose-600" },
  Business: { icon: TrendingUp, color: "text-blue-600" },
  Marketing: { icon: TrendingUp, color: "text-pink-600" },
  Leadership: { icon: Award, color: "text-red-600" },
};

const levels = [
  { name: "Beginner", count: 0 },
  { name: "Intermediate", count: 0 },
  { name: "Advanced", count: 0 },
  { name: "All", count: 0 },
];

const durations = [
  { name: "1-3 Months", count: 0 },
  { name: "3-6 Months", count: 0 },
  { name: "6-12 Months", count: 0 },
  { name: "12+ Months", count: 0 },
];

export default function Learning() {
  const [selectedCategory, setSelectedCategory] = useState("Popular Courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real data from the API
  const {
    data: courses = [],
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery<any[]>({
    queryKey: ["/api/courses"],
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["/api/learning-modules"],
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/user-progress", CURRENT_USER_ID],
  });

  // Get user enrollments to check enrollment status
  const { data: userEnrollments = [] } = useQuery<any[]>({
    queryKey: ["/api/users", CURRENT_USER_ID, "enrollments"],
  });

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return apiRequest("POST", `/api/enrollments`, {
        userId: CURRENT_USER_ID,
        courseId: courseId,
        enrollmentDate: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Course Enrolled!",
        description: "You have successfully enrolled in this course.",
      });
      // Invalidate enrollments to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["/api/users", CURRENT_USER_ID, "enrollments"],
      });
    },
    onError: () => {
      toast({
        title: "Enrollment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check if user is enrolled in a course
  const isEnrolled = (courseId: string) => {
    return userEnrollments.some(
      (enrollment: any) => enrollment.courseId === courseId
    );
  };

  // Handle enrollment
  const handleEnrollment = (courseId: string) => {
    enrollMutation.mutate(courseId);
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    setSelectedLevels((prev) =>
      checked ? [...prev, level] : prev.filter((l) => l !== level)
    );
  };

  const handleDurationChange = (duration: string, checked: boolean) => {
    setSelectedDurations((prev) =>
      checked ? [...prev, duration] : prev.filter((d) => d !== duration)
    );
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    setSelectedSkills((prev) =>
      checked ? [...prev, skill] : prev.filter((s) => s !== skill)
    );
  };

  // Filter courses based on search and filters
  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel =
      selectedLevels.length === 0 || selectedLevels.includes(course.level);
    return matchesSearch && matchesLevel;
  });

  // Fallback categories if API returns empty
  const fallbackCategories = Object.keys(categoryIcons).map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    count: 0,
  }));

  // Update category counts dynamically
  const allCategories = categories.length > 0 ? categories : fallbackCategories;
  const categoriesWithCounts = allCategories.map((category: any) => {
    const courseCount = courses.filter((course: any) =>
      course.categories?.some((cat: any) => cat.id === category.id)
    ).length;
    const iconData = categoryIcons[
      category.name as keyof typeof categoryIcons
    ] || { icon: BookOpen, color: "text-gray-600" };
    return {
      ...category,
      count: courseCount,
      ...iconData,
    };
  });

  // Generate skills from course data
  const skills = React.useMemo(() => {
    const skillMap = new Map();
    courses.forEach((course: any) => {
      if (course.skillsYouWillGain && Array.isArray(course.skillsYouWillGain)) {
        course.skillsYouWillGain.forEach((skill: string) => {
          const count = skillMap.get(skill) || 0;
          skillMap.set(skill, count + 1);
        });
      }
    });

    return Array.from(skillMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 skills
  }, [courses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="max-w-8xl mx-auto p-6 animate-fade-in">
        {/* Header */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                  🎓 Learning Hub
                </h1>
                <p className="text-blue-100 text-lg">
                  Explore courses and advance your skills
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {courses.length} Courses Available
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                    <Trophy className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Earn XP & Badges
                    </span>
                  </div>
                </div>
              </div>
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 py-3 shadow-lg"
                >
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-8">
          {/* Sidebar with Categories and Filters */}
          <div className="w-80 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="pb-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4">
                {categoriesWithCounts.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No categories available</p>
                  </div>
                ) : (
                  categoriesWithCounts.map((category: any) => {
                    const IconComponent = category.icon;
                    return (
                      <Button
                        key={category.name}
                        variant={
                          selectedCategory === category.name
                            ? "default"
                            : "ghost"
                        }
                        className={`w-full justify-start h-auto p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                          selectedCategory === category.name
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                            : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600"
                        }`}
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <IconComponent
                              className={`mr-3 h-5 w-5 ${
                                selectedCategory === category.name
                                  ? "text-white"
                                  : category.color
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {category.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                selectedCategory === category.name
                                  ? "bg-white/20 text-white"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {category.count}
                            </span>
                            <ChevronRight className="ml-2 h-3 w-3" />
                          </div>
                        </div>
                      </Button>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Level Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Level
                  </h4>
                  <div className="space-y-2">
                    {levels.map((level) => (
                      <div
                        key={level.name}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={level.name}
                          checked={selectedLevels.includes(level.name)}
                          onCheckedChange={(checked) =>
                            handleLevelChange(level.name, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={level.name}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {level.name} ({level.count})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Duration Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Duration
                  </h4>
                  <div className="space-y-2">
                    {durations.map((duration) => (
                      <div
                        key={duration.name}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={duration.name}
                          checked={selectedDurations.includes(duration.name)}
                          onCheckedChange={(checked) =>
                            handleDurationChange(
                              duration.name,
                              checked as boolean
                            )
                          }
                        />
                        <label
                          htmlFor={duration.name}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {duration.name} ({duration.count})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Skills Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Skills
                  </h4>
                  <div className="space-y-2">
                    {skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={skill.name}
                          checked={selectedSkills.includes(skill.name)}
                          onCheckedChange={(checked) =>
                            handleSkillChange(skill.name, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={skill.name}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {skill.name} ({skill.count})
                        </label>
                      </div>
                    ))}
                    <Button variant="link" className="h-auto p-0 text-xs">
                      Show more
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400">
                Showing {filteredCourses.length} of {courses.length} courses
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course completion badges */}
            {courses.length > 0 && (
              <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
                    🏆 Course Completion Badges
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg text-center border border-purple-300 shadow-md hover:scale-105 transition-all duration-200">
                      <div className="w-10 h-10 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-purple-800 text-sm">AI Pioneer</h4>
                      <p className="text-xs text-purple-600">Complete AI course</p>
                      <Badge className="mt-2 bg-purple-500 text-white text-xs">+100 XP</Badge>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg text-center border border-blue-300 shadow-md hover:scale-105 transition-all duration-200">
                      <div className="w-10 h-10 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-blue-800 text-sm">Data Scientist</h4>
                      <p className="text-xs text-blue-600">Master Data Science</p>
                      <Badge className="mt-2 bg-blue-500 text-white text-xs">+150 XP</Badge>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-lg text-center border border-yellow-300 shadow-md hover:scale-105 transition-all duration-200">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-yellow-800 text-sm">Perfect Score</h4>
                      <p className="text-xs text-yellow-600">100% on exam</p>
                      <Badge className="mt-2 bg-yellow-500 text-white text-xs">+100 XP</Badge>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 rounded-lg text-center border border-emerald-300 shadow-md hover:scale-105 transition-all duration-200">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-emerald-800 text-sm">Streak Master</h4>
                      <p className="text-xs text-emerald-600">7-day streak</p>
                      <Badge className="mt-2 bg-emerald-500 text-white text-xs">+50 XP</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No courses found</p>
                </div>
              )}
              {filteredCourses.map((course: any) => (
                <Card
                  key={course.id}
                  className="hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-t-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-80" />
                        <p className="text-xs opacity-60">Learning Platform</p>
                      </div>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-blue-600 text-white">
                      {course.isFree ? "Free" : `$${course.price}`}
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {course.level} Level
                      </p>
                      <CardTitle className="text-lg leading-tight line-clamp-2">
                        {course.title}
                      </CardTitle>
                      {course.subtitle && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {course.subtitle}
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {course.durationMonths} Months
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        Online
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="line-clamp-2">{course.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {course.language}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {course.level}
                      </Badge>
                    </div>

                    <Link href={`/course/${course.id}`}>
                      <Button
                        className="w-full"
                        variant="outline"
                        data-testid={`button-view-program-${course.id}`}
                      >
                        View Program
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-8">
              <Button variant="outline" size="lg">
                Load More Courses
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
