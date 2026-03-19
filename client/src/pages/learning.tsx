import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  BookOpen,
  Trophy,
  Search,
  Filter,
  Calendar,
  Globe,
  ExternalLink,
} from "lucide-react";

const levels = ["Beginner", "Intermediate", "Advanced", "All"];
const durations = ["1-3 Months", "3-6 Months", "6-12 Months", "12+ Months"];

export default function Learning() {
  const { user } = useAuth();
  const CURRENT_USER_ID = user?.id || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState("Popular Courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const { data: courses = [] } = useQuery<any[]>({
    queryKey: ["/api/courses"],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const { data: userEnrollments = [] } = useQuery<any[]>({
    queryKey: ["/api/users", CURRENT_USER_ID, "enrollments"],
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return apiRequest("POST", `/api/enrollments`, {
        userId: CURRENT_USER_ID,
        courseId,
        enrollmentDate: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Course Enrolled!",
        description: "You have successfully enrolled in this course.",
      });
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

  const isEnrolled = (courseId: string) =>
    userEnrollments.some((enr: any) => enr.courseId === courseId);

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel =
      selectedLevels.length === 0 || selectedLevels.includes(course.level);
    return matchesSearch && matchesLevel;
  });

  const fallbackCategories = [
    "AI & Machine Learning",
    "Data Science & Analytics",
    "Generative AI",
    "Management",
    "Software & Tech",
  ].map((name) => ({ id: name, name, count: 0, icon: BookOpen }));

  const categoriesWithCounts = (categories.length ? categories : fallbackCategories).map(
    (category: any) => ({
      ...category,
      count: courses.filter((c: any) =>
        c.categories?.some((cat: any) => cat.id === category.id),
      ).length,
    }),
  );

  const skills = useMemo(() => {
    const map = new Map<string, number>();
    courses.forEach((c: any) =>
      (c.skillsYouWillGain || []).forEach((s: string) =>
        map.set(s, (map.get(s) || 0) + 1),
      ),
    );
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .slice(0, 10);
  }, [courses]);

  const FilterSection = (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
          Level
        </h4>
        <div className="space-y-2">
          {levels.map((level) => (
            <label key={level} className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={selectedLevels.includes(level)}
                onCheckedChange={(checked) =>
                  setSelectedLevels((prev) =>
                    checked
                      ? [...prev, level]
                      : prev.filter((l) => l !== level),
                  )
                }
              />
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
          Duration
        </h4>
        <div className="space-y-2">
          {durations.map((duration) => (
            <label key={duration} className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={selectedDurations.includes(duration)}
                onCheckedChange={(checked) =>
                  setSelectedDurations((prev) =>
                    checked
                      ? [...prev, duration]
                      : prev.filter((d) => d !== duration),
                  )
                }
              />
              <span>{duration}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
          Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill.name}
              variant={
                selectedSkills.includes(skill.name) ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() =>
                setSelectedSkills((prev) =>
                  prev.includes(skill.name)
                    ? prev.filter((s) => s !== skill.name)
                    : [...prev, skill.name],
                )
              }
            >
              {skill.name} ({skill.count})
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border-0 shadow-2xl">
          <CardContent className="p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                  🎓 Learning Hub
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Explore courses and advance your skills
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-full text-sm">
                  <BookOpen className="h-4 w-4" />
                  <span>{courses.length} Courses Available</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-full text-sm">
                  <Trophy className="h-4 w-4" />
                  <span>Earn XP & Badges</span>
                </div>
              </div>
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100 font-semibold px-4 py-2 shadow-lg"
                >
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Search & Controls */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm py-2"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px]"
              onClick={() => setCategoriesOpen(true)}
            >
              Categories
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px]"
              onClick={() => setFiltersOpen(true)}
            >
              Filters
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="min-h-[44px] w-full sm:w-[200px] text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto py-2 -mx-1 px-1">
          {categoriesWithCounts.map((category: any) => {
            const active = selectedCategory === category.name;
            return (
              <Button
                key={category.name}
                size="sm"
                variant={active ? "default" : "outline"}
                className="shrink-0 min-h-[44px] px-3 text-sm flex items-center gap-2"
                onClick={() => setSelectedCategory(category.name)}
              >
                <span>{category.name}</span>
                <Badge
                  variant={active ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {category.count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Courses */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No courses found
              </div>
            )}
            {filteredCourses.map((course: any) => (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-all duration-200 group"
              >
                <div className="relative">
                  <div className="h-32 sm:h-40 bg-gradient-to-br from-blue-400 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <div className="text-white text-center space-y-1">
                      <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto opacity-80" />
                      <p className="text-xs opacity-70">Learning Platform</p>
                    </div>
                  </div>
                  <Badge className="absolute top-3 right-3 bg-blue-600 text-white">
                    {course.isFree ? "Free" : `$${course.price}`}
                  </Badge>
                </div>

                <CardHeader className="pb-2 px-4 pt-3">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {course.level} Level
                    </p>
                    <CardTitle className="text-base sm:text-lg leading-tight line-clamp-2">
                      {course.title}
                    </CardTitle>
                    {course.subtitle && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {course.subtitle}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 px-4 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {course.durationMonths} Months
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      Online
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <Badge variant="outline">{course.language}</Badge>
                    <Badge variant="secondary">{course.level}</Badge>
                  </div>

                  <Link href={`/course/${course.id}`}>
                    <Button className="w-full min-h-[44px]" variant="outline">
                      View Program
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center pt-4 pb-2">
            <Button variant="outline" size="sm" className="min-h-[44px] px-4">
              Load More Courses
            </Button>
          </div>
        </div>

        {/* Filters Sheet */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="py-4">{FilterSection}</div>
          </SheetContent>
        </Sheet>

        {/* Categories Sheet */}
        <Sheet open={categoriesOpen} onOpenChange={setCategoriesOpen}>
          <SheetContent side="left" className="w-full sm:w-80">
            <SheetHeader>
              <SheetTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Categories
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-2 py-4">
              {categoriesWithCounts.map((category: any) => (
                <Button
                  key={category.name}
                  variant={
                    selectedCategory === category.name ? "default" : "ghost"
                  }
                  className="w-full justify-start h-auto p-3 rounded-lg"
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setCategoriesOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">{category.name}</span>
                    <Badge
                      variant={
                        selectedCategory === category.name
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {category.count}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <Footer />
      </div>
    </div>
  );
}
