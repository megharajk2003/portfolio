import { useRoute, Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Calendar,
  Award,
  Globe,
  CheckCircle,
  PlayCircle,
  Download,
  Share2,
  Heart,
  ChevronLeft,
  ExternalLink,
  Languages,
  FileText,
  User,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import Footer from "@/components/ui/footer";

const CURRENT_USER_ID = 1; // Changed to number to match database schema

// Mock course data based on the images
const courseDetails = {
  "1": {
    id: "1",
    title: "Python for Data Science, AI & Development",
    provider: "IBM",
    providerLogo: "/api/placeholder/60/60",
    instructor: {
      name: "Joseph Santarcangelo",
      title: "Data Scientist at IBM",
      image: "/api/placeholder/50/50",
    },
    enrolledCount: "1,287,160",
    rating: 4.6,
    reviewCount: 42124,
    level: "Beginner",
    duration: "5 modules",
    schedule: "3 weeks at 10 hours a week",
    languages: ["English", "+30 languages available"],
    certificate: true,
    assessments: 22,
    startDate: "Aug 18",
    price: "Free",
    coursePlusIncluded: true,
    satisfaction: 95,
    description: "This course is part of multiple programs.",
    learningOutcomes: [
      "Develop a foundational understanding of Python programming by learning basic syntax, data types, expressions, variables, and string operations.",
      "Demonstrate proficiency in using Python libraries such as Pandas and Numpy and developing code using Jupyter Notebooks.",
      "Apply Python programming logic using data structures, conditions and branching, loops, functions, exception handling, objects, and classes.",
      "Access and extract web-based data by working with REST APIs using requests and performing web scraping with BeautifulSoup.",
    ],
    skills: [
      "Python Programming",
      "Web Scraping",
      "Object Oriented Programming (OOP)",
      "Data Import/Export",
      "Scripting",
      "NumPy",
      "Data Structures",
      "Jupyter",
      "Data Manipulation",
      "Application Programming Interface (API)",
    ],
    modules: [
      {
        title: "Python Basics",
        description: "Your introduction to Python fundamentals",
        duration: "8 hours",
        lessons: 5,
      },
      {
        title: "Python Data Structures",
        description: "Lists, tuples, dictionaries, and sets",
        duration: "6 hours",
        lessons: 4,
      },
      {
        title: "Python Programming Fundamentals",
        description: "Conditions, loops, functions, and objects",
        duration: "10 hours",
        lessons: 6,
      },
      {
        title: "Working with Data in Python",
        description: "Reading files, writing files, and Pandas",
        duration: "8 hours",
        lessons: 5,
      },
      {
        title: "APIs, and Data Collection",
        description: "REST APIs, webscraping with BeautifulSoup",
        duration: "6 hours",
        lessons: 4,
      },
    ],
    reviews: [
      {
        id: 1,
        user: "HK",
        rating: 4,
        date: "Oct 20, 2022",
        comment:
          "This was an extremely informative course and I believe is perfect way to start off your coding journey. The teaching style was understandable,detail oriented and very practical. Highly Recommended.",
      },
      {
        id: 2,
        user: "PJ",
        rating: 5,
        date: "Dec 1, 2020",
        comment:
          "It is a good course and teaches with the basic of Python so that anyone can understand it very well. Videos are good and can easily be understandable to anyone who is new to Python and Data Science.",
      },
      {
        id: 3,
        user: "JE",
        rating: 4,
        date: "May 31, 2019",
        comment:
          "The cloud storage question on the final is just a ploy to get us to use IBM products and shouldn't be part of the grade. The course was a good pace and nice, slow introduction for new Python users.",
      },
    ],
    recommendedCourses: [
      {
        id: "rec1",
        title: "Python for Data Analysis and Automation",
        provider: "PackIt",
        type: "Course",
        badge: "Free Trial",
      },
      {
        id: "rec2",
        title: "Programming for Data Science",
        provider: "University of Leeds",
        type: "Course",
        badge: "Preview",
      },
      {
        id: "rec3",
        title: "Python Project for Data Science",
        provider: "IBM",
        type: "Course",
        badge: "Free Trial",
      },
      {
        id: "rec4",
        title: "Python for Data Science",
        provider: "Fractal Analytics",
        type: "Course",
        badge: "Free Trial",
      },
    ],
  },
};

export default function CourseDetail() {
  const [, params] = useRoute("/course/:id");
  const [activeTab, setActiveTab] = useState("about");
  const courseId = params?.id || "1";
  const course =
    courseDetails[courseId as keyof typeof courseDetails] || courseDetails["1"];

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user enrollments to check enrollment status
  const { data: userEnrollments = [] } = useQuery<any[]>({
    queryKey: ["/api/users", CURRENT_USER_ID, "enrollments"],
  });

  // Check if user is enrolled in a course - moved here to avoid initialization issues
  const isEnrolled = (courseId: string) => {
    return userEnrollments.some(
      (enrollment: any) => enrollment.courseId === courseId
    );
  };

  // Check course completion status
  const { data: courseCompletion } = useQuery<{
    isCompleted: boolean;
    completedModules: number;
    totalModules: number;
    progress: number;
  }>({
    queryKey: ["/api/course-completion", CURRENT_USER_ID, courseId],
    enabled: isEnrolled(courseId),
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

  // Check if course is completed
  const isCourseCompleted = () => {
    return courseCompletion?.isCompleted || false;
  };

  // Handle enrollment
  const handleEnrollment = (courseId: string) => {
    enrollMutation.mutate(courseId);
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 font-semibold">{rating}</span>
        <span className="ml-1 text-gray-500">
          ({course.reviewCount.toLocaleString()} reviews)
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b">
          <div className="px-6 py-4">
            <Link href="/learning">
              <Button variant="ghost" className="mb-4">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Learning
              </Button>
            </Link>

            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-cover bg-center rounded-2xl p-8 items-start"
              style={{
                backgroundImage:
                  "url('https://talentsprint.com/course/generative-ai/images/generativeai-header-bg.webp')",
              }}
            >
              {/* Course Info - Added white/light text colors for visibility */}
              <div className="lg:col-span-2 space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  {/* The IBM logo image here is likely a light color, so it should be fine */}
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/960px-IBM_logo.svg.png"
                    alt={course.provider}
                    className="h-12 w-12"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {course.title}
                    </h1>
                    <p className="text-gray-300">
                      {" "}
                      {/* Lighter text for subtitle */}
                      This course is part of multiple programs.{" "}
                      <a href="#" className="text-blue-400 hover:underline">
                        {" "}
                        {/* Brighter blue for link */}
                        Learn more
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="/images/instructor.png"
                      alt="Joseph Santarcangelo"
                    />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-gray-400">Instructor:</p>{" "}
                    {/* Lighter text */}
                    <p className="font-medium text-blue-400 hover:underline cursor-pointer">
                      {" "}
                      {/* Brighter blue */}
                      Joseph Santarcangelo
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                  {" "}
                  {/* Lighter text */}
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.enrolledCount} already enrolled
                  </div>
                  <div className="flex items-center">
                    {/* The badge styling might need adjustment in its own component for dark mode */}
                    <Badge
                      variant="outline"
                      className="mr-1 border-gray-400 text-gray-300"
                    >
                      Coursera Plus
                    </Badge>
                    <a href="#" className="text-blue-400 hover:underline">
                      {" "}
                      {/* Brighter blue */}
                      Learn more
                    </a>
                  </div>
                </div>
              </div>

              {/* Enrollment Card - This part is on a light background, so no color changes needed */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    {isCourseCompleted() ? (
                      <div className="text-center space-y-2">
                        <Button
                          className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white"
                          size="lg"
                          disabled
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Course Completed
                        </Button>
                        <p className="text-sm text-green-600 font-medium">
                          Congratulations! You've completed this course.
                        </p>
                      </div>
                    ) : isEnrolled(courseId) ? (
                      <Link href={`/course/${courseId}/learn`}>
                        <Button className="w-full mb-4" size="lg">
                          Continue Learning
                          <PlayCircle className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        className="w-full mb-4"
                        size="lg"
                        onClick={() => handleEnrollment(courseId)}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending
                          ? "Enrolling..."
                          : "Enroll for free"}
                        {!enrollMutation.isPending && (
                          <Calendar className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Starts {course.startDate}
                    </p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {course.modules.length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            modules
                          </div>
                          <div className="text-xs text-gray-500">
                            Gain insight into a topic and learn the fundamentals
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold flex items-center justify-center">
                            {course.rating}{" "}
                            <Star className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            ({course.reviewCount.toLocaleString()} reviews)
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="font-semibold">
                            {course.level} level
                          </div>
                          <div className="text-xs text-gray-500">
                            Recommended experience
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">Flexible schedule</div>
                          <div className="text-xs text-gray-500">
                            {course.schedule}
                          </div>
                          <div className="text-xs text-gray-500">
                            Learn at your own pace
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span className="font-bold">
                            {course.satisfaction}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Most learners liked this course
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* What you'll learn */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6">
                      What you'll learn
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {outcome}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Skills you'll gain */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      Skills you'll gain
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {course.skills.slice(0, 8).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-sm"
                        >
                          {skill}
                        </Badge>
                      ))}
                      <Button variant="link" className="h-auto p-0 text-sm">
                        View all skills
                      </Button>
                    </div>
                  </section>

                  {/* Details to know */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6">Details to know</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <Award className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold mb-2">
                          Shareable certificate
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Add to your LinkedIn profile
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Assessments</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {course.assessments} assignments
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <Languages className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold mb-2">
                          Taught in English
                        </h3>
                        <a
                          href="#"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          30 languages available
                        </a>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Instructor info */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Instructor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={course.instructor.image} />
                          <AvatarFallback>
                            {course.instructor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {course.instructor.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {course.instructor.title}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        View Instructor Profile
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-8">
              <div className="max-w-4xl">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold">
                    Build your subject-matter expertise
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    This course is available as part of{" "}
                    <strong>multiple programs</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    When you enroll in this course, you'll also be asked to
                    select a specific program.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Learn new concepts from industry experts</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span>
                            Gain a foundational understanding of a subject or
                            tool
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span>
                            Develop job-relevant skills with hands-on projects
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Earn a shareable career certificate</span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-64 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                        <User className="h-20 w-20 opacity-80" />
                      </div>
                    </div>
                  </div>

                  <section className="space-y-4">
                    <h3 className="text-xl font-bold">
                      There are {course.modules.length} modules in this course
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Kickstart your Python journey with this beginner-friendly,
                      self-paced course taught by an expert. Python is one of
                      the most popular programming languages in the world and
                      demand for individuals with Python skills continues to
                      grow.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      This course takes you from zero to programming in Python
                      in a matter of hours—no prior programming experience is
                      necessary!
                    </p>
                    <Button variant="link" className="h-auto p-0">
                      Read more
                    </Button>
                  </section>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="modules" className="space-y-6">
              <h2 className="text-2xl font-bold">Course Modules</h2>
              <div className="space-y-4">
                {course.modules.map((module, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Module {index + 1}: {module.title}
                          </CardTitle>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {module.description}
                          </p>
                        </div>
                        <Badge variant="outline">{module.duration}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {module.lessons} lessons
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {module.duration}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <section>
                <div className="flex items-center space-x-4 mb-6">
                  <h2 className="text-2xl font-bold">
                    Explore more from Data Analysis
                  </h2>
                  <div className="flex space-x-2">
                    <Badge variant="default">Recommended</Badge>
                    <Badge variant="outline">Degrees</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {course.recommendedCourses.map((recCourse) => (
                    <Card
                      key={recCourse.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 rounded-t-lg relative">
                        <Badge className="absolute top-3 right-3 bg-white text-gray-900">
                          {recCourse.badge}
                        </Badge>
                        <div className="absolute bottom-4 left-4 text-white">
                          <div className="text-xs opacity-80">
                            {recCourse.provider}
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {recCourse.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {recCourse.type}
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          View Course
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center mt-8">
                  <Button variant="outline">Show 8 more</Button>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold">
                  Why people choose Coursera for their career
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      name: "Felipe M.",
                      year: "Learner since 2018",
                      quote:
                        "To be able to take courses at my own pace and rhythm has been an amazing experience. I can learn whenever it fits my schedule and mood.",
                    },
                    {
                      name: "Jennifer J.",
                      year: "Joined in 2020",
                      quote:
                        "I directly applied the concepts and skills I learned from my courses to an exciting new project at work.",
                    },
                    {
                      name: "Larry W.",
                      year: "Learner since 2021",
                      quote:
                        "When I need courses on topics that my university doesn't offer, Coursera is one of the best places to go.",
                    },
                    {
                      name: "Chaitanya A.",
                      year: "",
                      quote:
                        "Learning isn't just about being better at your job; it's so much more than that. Coursera allows me to learn without limits.",
                    },
                  ].map((testimonial, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar>
                            <AvatarFallback>
                              {testimonial.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {testimonial.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {testimonial.year}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          "{testimonial.quote}"
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Learner reviews</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Showing 3 of {course.reviewCount.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Rating Summary */}
                <div className="lg:col-span-1">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-6 w-6 text-yellow-400 fill-current mr-1" />
                      <span className="text-3xl font-bold">
                        {course.rating}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {course.reviewCount.toLocaleString()} reviews
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { stars: 5, percentage: 72.12 },
                      { stars: 4, percentage: 20.69 },
                      { stars: 3, percentage: 4.36 },
                      { stars: 2, percentage: 1.42 },
                      { stars: 1, percentage: 1.38 },
                    ].map((rating) => (
                      <div
                        key={rating.stars}
                        className="flex items-center space-x-2"
                      >
                        <span className="text-sm w-6">{rating.stars}</span>
                        <div className="flex">
                          {[...Array(rating.stars)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${rating.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                          {rating.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div className="lg:col-span-3 space-y-6">
                  {course.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarFallback>{review.user}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <span className="font-semibold">
                                {review.user}
                              </span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Reviewed on {review.date}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex justify-center">
                    <Button variant="outline">View more reviews</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="testimonials" className="space-y-6">
              <h2 className="text-2xl font-bold">What learners are saying</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {course.reviews.slice(0, 2).map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar>
                          <AvatarFallback>{review.user}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{review.user}</h3>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        "{review.comment}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
