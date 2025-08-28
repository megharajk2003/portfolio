import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Settings,
  GraduationCap,
  PlusCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  isFree: boolean;
  price: string;
  durationMonths: number;
  createdAt: string;
}

interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  moduleOrder: number;
  durationHours: number;
  createdAt: string;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl: string;
  lessonOrder: number;
  durationMinutes: number;
  createdAt: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  likesCount: number;
  repliesCount: number;
  isActive: boolean;
  createdAt: string;
  user: User;
}

interface ForumReply {
  id: string;
  postId: string;
  content: string;
  likesCount: number;
  isActive: boolean;
  createdAt: string;
  user: User;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Data queries
  const { data: courses = [], refetch: refetchCourses } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
  });

  const { data: modules = [], refetch: refetchModules } = useQuery<Module[]>({
    queryKey: ['/api/admin/modules'],
  });

  const { data: lessons = [], refetch: refetchLessons } = useQuery<Lesson[]>({
    queryKey: ['/api/admin/lessons'],
  });

  const { data: users = [], refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: forumPosts = [], refetch: refetchPosts } = useQuery<ForumPost[]>({
    queryKey: ['/api/admin/forum/posts'],
  });

  const { data: forumReplies = [], refetch: refetchReplies } = useQuery<ForumReply[]>({
    queryKey: ['/api/admin/forum/replies'],
  });

  // Delete handlers
  const handleDeleteCourse = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await apiRequest(`/api/admin/courses/${id}`, undefined, { method: 'DELETE' });
      refetchCourses();
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      await apiRequest(`/api/admin/modules/${id}`, undefined, { method: 'DELETE' });
      refetchModules();
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      await apiRequest(`/api/admin/lessons/${id}`, undefined, { method: 'DELETE' });
      refetchLessons();
    }
  };

  const handleDeleteForumPost = async (id: string) => {
    if (confirm('Are you sure you want to delete this forum post?')) {
      await apiRequest(`/api/admin/forum/posts/${id}`, undefined, { method: 'DELETE' });
      refetchPosts();
    }
  };

  const handleDeleteForumReply = async (id: string) => {
    if (confirm('Are you sure you want to delete this forum reply?')) {
      await apiRequest(`/api/admin/forum/replies/${id}`, undefined, { method: 'DELETE' });
      refetchReplies();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="admin-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your learning platform</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Settings className="w-4 h-4 mr-1" />
          Administrator
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stats-users">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stats-courses">{courses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stats-modules">{modules.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forum Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stats-posts">{forumPosts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="courses" data-testid="tab-courses">Courses</TabsTrigger>
          <TabsTrigger value="modules" data-testid="tab-modules">Modules</TabsTrigger>
          <TabsTrigger value="lessons" data-testid="tab-lessons">Lessons</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.slice(0, 5).map((user: User) => (
                    <div key={user.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Forum Activity</CardTitle>
                <CardDescription>Latest forum posts and replies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {forumPosts.slice(0, 5).map((post: ForumPost) => (
                    <div key={post.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium truncate">{post.title}</p>
                        <p className="text-sm text-muted-foreground">by {post.user?.firstName}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Course Management</h2>
            <Button data-testid="button-add-course">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </div>
          <div className="grid gap-4">
            {courses.map((course: Course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <p className="text-muted-foreground">{course.subtitle}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={course.isFree ? "secondary" : "default"}>
                          {course.isFree ? "Free" : `$${course.price}`}
                        </Badge>
                        <Badge variant="outline">{course.level}</Badge>
                        <Badge variant="outline">{course.durationMonths} months</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-edit-course-${course.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteCourse(course.id)}
                        data-testid={`button-delete-course-${course.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Module Management</h2>
            <Button data-testid="button-add-module">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </div>
          <div className="grid gap-4">
            {modules.map((module: Module) => (
              <Card key={module.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{module.title}</h3>
                      <p className="text-muted-foreground">{module.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Order: {module.moduleOrder}</Badge>
                        <Badge variant="outline">{module.durationHours} hours</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-edit-module-${module.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteModule(module.id)}
                        data-testid={`button-delete-module-${module.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Lesson Management</h2>
            <Button data-testid="button-add-lesson">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Lesson
            </Button>
          </div>
          <div className="grid gap-4">
            {lessons.map((lesson: Lesson) => (
              <Card key={lesson.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{lesson.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{lesson.content?.substring(0, 150)}...</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Order: {lesson.lessonOrder}</Badge>
                        <Badge variant="outline">{lesson.durationMinutes} minutes</Badge>
                        {lesson.videoUrl && <Badge variant="secondary">Has Video</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-edit-lesson-${lesson.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteLesson(lesson.id)}
                        data-testid={`button-delete-lesson-${lesson.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">User Management</h2>
          </div>
          <div className="grid gap-4">
            {users.map((user: User) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-view-user-${user.id}`}>
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}