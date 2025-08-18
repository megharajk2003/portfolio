import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, Trophy, Play, Clock, Users, Star, Search, Filter,
  Code, Database, Cpu, Zap, Globe, Smartphone, Palette, TrendingUp,
  ChevronRight, Calendar, Award, ExternalLink
} from "lucide-react";

const CURRENT_USER_ID = "user-1";

const categories = [
  { name: "Popular Courses", icon: Trophy, color: "text-blue-600", count: 145 },
  { name: "AI & Machine Learning", icon: Cpu, color: "text-purple-600", count: 89 },
  { name: "Data Science & Analytics", icon: Database, color: "text-green-600", count: 76 },
  { name: "Generative AI", icon: Zap, color: "text-yellow-600", count: 54 },
  { name: "Management", icon: Users, color: "text-orange-600", count: 67 },
  { name: "Software & Tech", icon: Code, color: "text-blue-500", count: 123 },
  { name: "Doctorate", icon: Award, color: "text-red-600", count: 23 },
  { name: "Microsoft Programs", icon: Globe, color: "text-cyan-600", count: 45 },
  { name: "EV Design", icon: Palette, color: "text-pink-600", count: 12 },
  { name: "Cloud Computing", icon: Globe, color: "text-indigo-600", count: 78 },
  { name: "Design", icon: Palette, color: "text-rose-600", count: 34 }
];

const levels = [
  { name: "Beginner", count: 721 },
  { name: "Intermediate", count: 300 },
  { name: "Advanced", count: 28 },
  { name: "Mixed", count: 126 }
];

const durations = [
  { name: "Less Than 2 Hours", count: 278 },
  { name: "1-4 Weeks", count: 416 },
  { name: "1-3 Months", count: 399 },
  { name: "3-6 Months", count: 82 }
];

const skills = [
  { name: "Data Analysis", count: 95 },
  { name: "Generative AI", count: 84 },
  { name: "Content Creation", count: 80 },
  { name: "Marketing", count: 77 }
];

// Mock featured courses data
const featuredCourses = [
  {
    id: "1",
    title: "PG Program in Artificial Intelligence & Machine Learning",
    provider: "MCCOMES SCHOOL OF BUSINESS AT THE",
    duration: "12 Months",
    format: "Online",
    badge: "#1 RANKED AI PROGRAM",
    image: "/api/placeholder/300/200",
    rating: 4.8,
    enrollments: 15420,
    price: "Free Trial"
  },
  {
    id: "2", 
    title: "Post Graduate Program in Data Science with Generative AI",
    provider: "MCCOMES SCHOOL OF BUSINESS AT THE",
    duration: "12 months",
    format: "Online", 
    badge: "DEDICATED CAREER SUPPORT",
    image: "/api/placeholder/300/200",
    rating: 4.7,
    enrollments: 8950,
    price: "Free Trial"
  },
  {
    id: "3",
    title: "Post Graduate Diploma in Management (Online)",
    provider: "GREAT LAKES INSTITUTE OF MANAGEMENT",
    duration: "24 Months",
    format: "Online",
    badge: "ONLINE MBA EQUIVALENT", 
    image: "/api/placeholder/300/200",
    rating: 4.9,
    enrollments: 12340,
    price: "Free Trial"
  },
  {
    id: "4",
    title: "PGP in Data Science (with Specialization in Gen AI)",
    provider: "GREAT LAKES EXECUTIVE LEARNING",
    duration: "5 months",
    format: "Classroom",
    badge: "DEDICATED PLACEMENT ASSISTANCE",
    image: "/api/placeholder/300/200", 
    rating: 4.6,
    enrollments: 6780,
    price: "Preview"
  },
  {
    id: "5",
    title: "Generative AI for Business with Microsoft Azure OpenAI Program", 
    provider: "MICROSOFT AZURE",
    duration: "16 weeks",
    format: "Online",
    badge: "MICROSOFT CERTIFIED",
    image: "/api/placeholder/300/200",
    rating: 4.5,
    enrollments: 9340,
    price: "Free Trial"
  },
  {
    id: "6",
    title: "6-Postgraduate Diploma (ePGD) in Artificial Intelligence and Data Science",
    provider: "IIT BOMBAY", 
    duration: "18 months",
    format: "Online",
    badge: "IIT BOMBAY CERTIFIED",
    image: "/api/placeholder/300/200",
    rating: 4.8,
    enrollments: 11200,
    price: "Free Trial"
  }
];

export default function Learning() {
  const [selectedCategory, setSelectedCategory] = useState("Popular Courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");

  const { data: modules = [] } = useQuery({
    queryKey: ["/api/learning-modules"],
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/user-progress", CURRENT_USER_ID],
  });

  const handleLevelChange = (level: string, checked: boolean) => {
    setSelectedLevels(prev => 
      checked ? [...prev, level] : prev.filter(l => l !== level)
    );
  };

  const handleDurationChange = (duration: string, checked: boolean) => {
    setSelectedDurations(prev => 
      checked ? [...prev, duration] : prev.filter(d => d !== duration)
    );
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    setSelectedSkills(prev => 
      checked ? [...prev, skill] : prev.filter(s => s !== skill)
    );
  };

  const filteredCourses = featuredCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Hub</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Explore courses and advance your skills</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <IconComponent className={`mr-2 h-4 w-4 ${category.color}`} />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-1">({category.count})</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    </Button>
                  );
                })}
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
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Level</h4>
                  <div className="space-y-2">
                    {levels.map((level) => (
                      <div key={level.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={level.name}
                          checked={selectedLevels.includes(level.name)}
                          onCheckedChange={(checked) => handleLevelChange(level.name, checked as boolean)}
                        />
                        <label htmlFor={level.name} className="text-sm cursor-pointer flex-1">
                          {level.name} ({level.count})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Duration Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Duration</h4>
                  <div className="space-y-2">
                    {durations.map((duration) => (
                      <div key={duration.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={duration.name}
                          checked={selectedDurations.includes(duration.name)}
                          onCheckedChange={(checked) => handleDurationChange(duration.name, checked as boolean)}
                        />
                        <label htmlFor={duration.name} className="text-sm cursor-pointer flex-1">
                          {duration.name} ({duration.count})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Skills Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Skills</h4>
                  <div className="space-y-2">
                    {skills.map((skill) => (
                      <div key={skill.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill.name}
                          checked={selectedSkills.includes(skill.name)}
                          onCheckedChange={(checked) => handleSkillChange(skill.name, checked as boolean)}
                        />
                        <label htmlFor={skill.name} className="text-sm cursor-pointer flex-1">
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
                Showing {filteredCourses.length} of {featuredCourses.length} courses
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

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-all duration-200 group">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-t-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-80" />
                        <p className="text-xs opacity-60">{course.provider}</p>
                      </div>
                    </div>
                    {course.price && (
                      <Badge className="absolute top-3 right-3 bg-blue-600 text-white">
                        {course.price}
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {course.provider}
                      </p>
                      <CardTitle className="text-lg leading-tight line-clamp-2">
                        {course.title}
                      </CardTitle>
                      {course.badge && (
                        <Badge variant="outline" className="text-xs">
                          {course.badge}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        {course.format}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(course.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {course.enrollments.toLocaleString()}
                      </div>
                    </div>

                    <Link href={`/course/${course.id}`}>
                      <Button className="w-full" variant="outline">
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
      </div>
    </div>
  );
}