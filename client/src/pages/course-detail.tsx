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
import { useAuth } from "@/hooks/useAuth";
import React from "react";

export default function CourseDetail() {
  const [, params] = useRoute("/course/:id");
  const { user } = useAuth();
  const CURRENT_USER_ID = user?.id || "";
  console.log("Current User ID:", CURRENT_USER_ID);
  const [activeTab, setActiveTab] = useState("about");
  const courseId = params?.id || "1";

  // Fetch course data from API
  const { data: course, isLoading: courseLoading } = useQuery<any>({
    queryKey: ["/api/courses", courseId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/courses/${courseId}`);
      return response.json ? await response.json() : response;
    },
  });

  // Fetch course modules from API
  const { data: modules = [] } = useQuery<any[]>({
    queryKey: ["/api/courses", courseId, "modules"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/courses/${courseId}/modules`
      );
      return response.json ? await response.json() : response;
    },
    enabled: !!courseId,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user enrollments to check enrollment status
  const { data: userEnrollments = [] } = useQuery<any[]>({
    queryKey: ["/api/users", CURRENT_USER_ID, "enrollments"],
    queryFn: async () => {
      if (!CURRENT_USER_ID) return [];
      const response = await apiRequest(
        "GET",
        `/api/users/${CURRENT_USER_ID}/enrollments`
      );
      return response.json ? await response.json() : response;
    },
    enabled: !!CURRENT_USER_ID,
  });

  // Fetch course reviews from API
  const { data: courseReviews = [] } = useQuery<any[]>({
    queryKey: ["/api/courses", courseId, "reviews"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/courses/${courseId}/reviews`
      );
      return response.json ? await response.json() : response;
    },
  });

  // Find the specific enrollment record for the current course
  const courseEnrollment = React.useMemo(() => {
    return userEnrollments.find(
      (enrollment: any) => enrollment.courseId === courseId
    );
  }, [userEnrollments, courseId]);

  // The user is enrolled if that record exists
  const isEnrolled = !!courseEnrollment;

  // The course is completed if the record exists AND has a completion date
  const isCourseCompleted = !!courseEnrollment?.completedAt;

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

  // Move conditional returns here to ensure all hooks are called before any returns
  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading course details...
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Course not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The course you're looking for doesn't exist.
          </p>
          <Link href="/learning">
            <Button>Back to Learning</Button>
          </Link>
        </div>
      </div>
    );
  }

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
              {/* Course Info */}
              <div className="lg:col-span-2 space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/960px-IBM_logo.svg.png"
                    alt={course.provider}
                    className="h-12 w-12"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {course.title}
                    </h1>
                    <p className="text-gray-300">{course.description}</p>
                  </div>
                </div>

                {course.instructor && (
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          course.instructor.profileImageUrl ||
                          "/images/instructor.png"
                        }
                        alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
                      />
                      <AvatarFallback>
                        {course.instructor.firstName?.[0]}
                        {course.instructor.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-gray-400">Instructor:</p>
                      <p className="font-medium text-blue-400 hover:underline cursor-pointer">
                        {course.instructor.firstName}{" "}
                        {course.instructor.lastName}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.enrollmentCount || 0} already enrolled
                  </div>
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className="mr-1 border-gray-400 text-gray-300"
                    >
                      {course.level}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Enrollment Card */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    {isCourseCompleted ? (
                      <div className="text-center space-y-2">
                        <Link href={`/course/${courseId}/learn`}>
                          <Button
                            className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white"
                            size="lg"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Course Completed
                          </Button>
                        </Link>
                        <p className="text-sm text-green-600 font-medium">
                          Congratulations! You've completed this course.
                        </p>
                      </div>
                    ) : isEnrolled ? (
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
                            {modules.length}
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
                            {courseReviews.length > 0
                              ? (
                                  courseReviews.reduce(
                                    (sum: number, review: any) =>
                                      sum + review.rating,
                                    0
                                  ) / courseReviews.length
                                ).toFixed(1)
                              : "N/A"}{" "}
                            <Star className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            ({courseReviews.length}{" "}
                            {courseReviews.length === 1 ? "review" : "reviews"})
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
                            {course.durationMonths} months
                          </div>
                          <div className="text-xs text-gray-500">
                            Learn at your own pace
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="font-bold">Self-paced</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Complete at your own speed
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
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
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
                      {course.learningOutcomes &&
                      course.learningOutcomes.length > 0 ? (
                        course.learningOutcomes.map(
                          (outcome: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3"
                            >
                              <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {outcome}
                              </p>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 col-span-2">
                          Learning outcomes will be updated soon.
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Skills you'll gain */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      Skills you'll gain
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {course.skillsYouWillGain &&
                      course.skillsYouWillGain.length > 0 ? (
                        course.skillsYouWillGain
                          .slice(0, 8)
                          .map((skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-sm"
                            >
                              {skill}
                            </Badge>
                          ))
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                          Skills information will be updated soon.
                        </p>
                      )}
                      {course.skillsYouWillGain &&
                        course.skillsYouWillGain.length > 8 && (
                          <Button variant="link" className="h-auto p-0 text-sm">
                            View all skills
                          </Button>
                        )}
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
                          Interactive assignments
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
                      {course.instructor ? (
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={course.instructor.profileImageUrl}
                            />
                            <AvatarFallback>
                              {course.instructor.firstName?.[0]}
                              {course.instructor.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {course.instructor.firstName}{" "}
                              {course.instructor.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {course.instructor.expertise ||
                                "Course Instructor"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Instructor information will be updated soon.
                        </p>
                      )}
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
                      There are {modules.length} modules in this course
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {course.fullDescription || course.description}
                    </p>
                  </section>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="modules" className="space-y-6">
              <h2 className="text-2xl font-bold">Course Modules</h2>
              <div className="space-y-4">
                {modules.length > 0 ? (
                  modules.map((module: any, index: number) => (
                    <Card key={module.id}>
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
                          <Badge variant="outline">
                            {module.estimatedDuration || "Self-paced"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {module.lessonCount || 0} lessons
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {module.estimatedDuration || "Flexible"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No modules available yet.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Learner reviews</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {courseReviews.length > 0
                    ? `Showing ${courseReviews.length} reviews`
                    : "No reviews yet"}
                </p>
              </div>

              {courseReviews.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Rating Summary */}
                  <div className="lg:col-span-1">
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center mb-2">
                        <Star className="h-6 w-6 text-yellow-400 fill-current mr-1" />
                        <span className="text-3xl font-bold">
                          {(
                            courseReviews.reduce(
                              (sum: number, review: any) => sum + review.rating,
                              0
                            ) / courseReviews.length
                          ).toFixed(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {courseReviews.length}{" "}
                        {courseReviews.length === 1 ? "review" : "reviews"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((starCount) => {
                        const count = courseReviews.filter(
                          (review: any) => review.rating === starCount
                        ).length;
                        const percentage =
                          courseReviews.length > 0
                            ? (count / courseReviews.length) * 100
                            : 0;
                        return (
                          <div
                            key={starCount}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-sm w-6">{starCount}</span>
                            <div className="flex">
                              {[...Array(starCount)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 text-yellow-400 fill-current"
                                />
                              ))}
                            </div>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="lg:col-span-3 space-y-6">
                    {courseReviews.map((review: any) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarImage src={review.user?.profileImageUrl} />
                              <AvatarFallback>
                                {review.user?.firstName?.[0]}
                                {review.user?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">
                                  {review.user?.firstName}{" "}
                                  {review.user?.lastName}
                                </h4>
                                <div className="flex items-center">
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
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {review.comment}
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-gray-500">
                    Be the first to review this course!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
