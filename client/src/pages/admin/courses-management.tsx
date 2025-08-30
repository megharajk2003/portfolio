import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2, Search, BookOpen, Settings } from "lucide-react";
import { Link } from "wouter";
import Sidebar from "@/components/sidebar";

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  language: string;
  level: string;
  coverImageUrl: string;
  promoVideoUrl: string;
  isFree: boolean;
  price: string;
  durationMonths: number;
  scheduleInfo: string;
  whatYouWillLearn: string[];
  skillsYouWillGain: string[];
  detailsToKnow: string[];
  instructorId: string;
  status: "Published" | "Draft";
  createdAt: string;
  modulesCount?: number;
}

interface Instructor {
  id: string;
  fullName: string;

  email: string;
}

export default function CoursesManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Course>>({
    title: "",
    subtitle: "",
    description: "",
    language: "English",
    level: "Beginner",
    coverImageUrl: "",
    promoVideoUrl: "",
    isFree: true,
    price: "0",
    durationMonths: 1,
    scheduleInfo: "",
    whatYouWillLearn: [],
    skillsYouWillGain: [],
    detailsToKnow: [],
    instructorId: "",
    status: "Draft",
  });

  // Fetch courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<
    Course[]
  >({
    queryKey: ["/api/courses"],
  });

  // Fetch instructors
  const { data: instructors = [] } = useQuery<Instructor[]>({
    queryKey: ["/api/instructors"],
  });
  console.log(`instructors`, instructors);
  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create course: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      const response = await fetch(`/api/admin/courses/${courseData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error("Failed to update course");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update course: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setCurrentCourse(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete course: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update course details mutation
  const updateCourseDetailsMutation = useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      const response = await fetch(`/api/admin/courses/${courseData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error("Failed to update course details");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: "Success",
        description: "Course details updated successfully",
      });
      setIsDetailsModalOpen(false);
      setCurrentCourse(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update course details: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      language: "English",
      level: "Beginner",
      coverImageUrl: "",
      promoVideoUrl: "",
      isFree: true,
      price: "0",
      durationMonths: 1,
      scheduleInfo: "",
      whatYouWillLearn: [],
      skillsYouWillGain: [],
      detailsToKnow: [],
      instructorId: "",
      status: "Draft",
    });
  };

  // Open edit modal with course data
  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setFormData({
      ...course,
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (course: Course) => {
    setCurrentCourse(course);
    setIsDeleteModalOpen(true);
  };

  // Open course details modal
  const handleManageDetails = (course: Course) => {
    setCurrentCourse(course);
    setFormData({
      ...course,
    });
    setIsDetailsModalOpen(true);
  };

  // Filter courses based on search query and status filter
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
            fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 
          `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      <main className="lg:ml-64 min-h-screen p-6">
        <div className="space-y-6">
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full md:w-auto"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Course
            </Button>
          </div>

          {/* Courses table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead className="text-center">Modules</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCourses ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        Loading courses...
                      </TableCell>
                    </TableRow>
                  ) : filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        No courses found.{" "}
                        {searchQuery && "Try a different search term."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => {
                      const instructor = instructors.find(
                        (i) => i.id === course.instructorId
                      );
                      return (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{course.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {course.subtitle}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline">{course.level}</Badge>
                                <Badge
                                  variant={
                                    course.isFree ? "secondary" : "default"
                                  }
                                >
                                  {course.isFree ? "Free" : `$${course.price}`}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {instructor
                              ? `${instructor.fullName} `
                              : "Unassigned"}
                          </TableCell>
                          <TableCell className="text-center">
                            {course.modulesCount || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                course.status === "Published"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/admin/courses/${course.id}/modules`}
                              >
                                <Button variant="outline" size="sm">
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  Manage Modules
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManageDetails(course)}
                              >
                                <Settings className="h-4 w-4 mr-1" />
                                Manage Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCourse(course)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(course)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Add Course Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>
                Create a new course for your learning platform.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Introduction to Web Development"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Learn HTML, CSS, and JavaScript basics"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed course description"
                    rows={4}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      handleSelectChange("level", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="instructorId">Instructor</Label>
                  <Select
                    value={formData.instructorId}
                    onValueChange={(value) =>
                      handleSelectChange("instructorId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFree"
                      name="isFree"
                      checked={formData.isFree}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="isFree">Free Course</Label>
                  </div>
                </div>
                {!formData.isFree && (
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g. 29.99"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="durationMonths">Duration (months)</Label>
                  <Input
                    id="durationMonths"
                    name="durationMonths"
                    type="number"
                    value={formData.durationMonths}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange(
                        "status",
                        value as "Published" | "Draft"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createCourseMutation.mutate(formData)}
                disabled={createCourseMutation.isPending}
              >
                {createCourseMutation.isPending
                  ? "Creating..."
                  : "Create Course"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Course Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>Update the course details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="edit-title">Course Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-subtitle">Subtitle</Label>
                  <Input
                    id="edit-subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      handleSelectChange("level", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-instructorId">Instructor</Label>
                  <Select
                    value={formData.instructorId}
                    onValueChange={(value) =>
                      handleSelectChange("instructorId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-isFree"
                      name="isFree"
                      checked={formData.isFree}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="edit-isFree">Free Course</Label>
                  </div>
                </div>
                {!formData.isFree && (
                  <div>
                    <Label htmlFor="edit-price">Price ($)</Label>
                    <Input
                      id="edit-price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-durationMonths">Duration (months)</Label>
                  <Input
                    id="edit-durationMonths"
                    name="durationMonths"
                    type="number"
                    value={formData.durationMonths}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange(
                        "status",
                        value as "Published" | "Draft"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  updateCourseMutation.mutate({
                    ...formData,
                    id: currentCourse?.id,
                  })
                }
                disabled={updateCourseMutation.isPending}
              >
                {updateCourseMutation.isPending
                  ? "Updating..."
                  : "Update Course"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the course "
                {currentCourse?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  currentCourse && deleteCourseMutation.mutate(currentCourse.id)
                }
                disabled={deleteCourseMutation.isPending}
              >
                {deleteCourseMutation.isPending
                  ? "Deleting..."
                  : "Delete Course"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Course Details Management Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Course Details</DialogTitle>
              <DialogDescription>
                Update comprehensive course information including media, learning outcomes, and scheduling.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Media & Visual Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Media & Visual Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                    <Input
                      id="coverImageUrl"
                      name="coverImageUrl"
                      value={formData.coverImageUrl || ''}
                      onChange={handleInputChange}
                      placeholder="https://example.com/course-image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="promoVideoUrl">Promotional Video URL</Label>
                    <Input
                      id="promoVideoUrl"
                      name="promoVideoUrl"
                      value={formData.promoVideoUrl || ''}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Course Language</Label>
                    <Select
                      value={formData.language || 'English'}
                      onValueChange={(value) => handleSelectChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="Chinese">Chinese</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                        <SelectItem value="Portuguese">Portuguese</SelectItem>
                        <SelectItem value="Italian">Italian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scheduleInfo">Schedule Information</Label>
                    <Input
                      id="scheduleInfo"
                      name="scheduleInfo"
                      value={formData.scheduleInfo || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 hours/week, flexible schedule"
                    />
                  </div>
                </div>
              </div>

              {/* Learning Outcomes & Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Learning Outcomes & Skills</h3>

                {/* What You Will Learn */}
                <div>
                  <Label>What You Will Learn</Label>
                  <div className="space-y-2">
                    {(formData.whatYouWillLearn || []).map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => {
                            const updated = [...(formData.whatYouWillLearn || [])];
                            updated[index] = e.target.value;
                            setFormData(prev => ({ ...prev, whatYouWillLearn: updated }));
                          }}
                          placeholder="Enter learning outcome"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = (formData.whatYouWillLearn || []).filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, whatYouWillLearn: updated }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          whatYouWillLearn: [...(prev.whatYouWillLearn || []), '']
                        }));
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Learning Outcome
                    </Button>
                  </div>
                </div>

                {/* Skills You Will Gain */}
                <div>
                  <Label>Skills You Will Gain</Label>
                  <div className="space-y-2">
                    {(formData.skillsYouWillGain || []).map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={skill}
                          onChange={(e) => {
                            const updated = [...(formData.skillsYouWillGain || [])];
                            updated[index] = e.target.value;
                            setFormData(prev => ({ ...prev, skillsYouWillGain: updated }));
                          }}
                          placeholder="Enter skill"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = (formData.skillsYouWillGain || []).filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, skillsYouWillGain: updated }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          skillsYouWillGain: [...(prev.skillsYouWillGain || []), '']
                        }));
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>
                </div>

                {/* Important Details to Know */}
                <div>
                  <Label>Important Details to Know</Label>
                  <div className="space-y-2">
                    {(formData.detailsToKnow || []).map((detail, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={detail}
                          onChange={(e) => {
                            const updated = [...(formData.detailsToKnow || [])];
                            updated[index] = e.target.value;
                            setFormData(prev => ({ ...prev, detailsToKnow: updated }));
                          }}
                          placeholder="Enter important detail"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = (formData.detailsToKnow || []).filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, detailsToKnow: updated }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          detailsToKnow: [...(prev.detailsToKnow || []), '']
                        }));
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Detail
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateCourseDetailsMutation.mutate(formData)}
                disabled={updateCourseDetailsMutation.isPending}
              >
                {updateCourseDetailsMutation.isPending
                  ? "Updating..."
                  : "Update Details"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}