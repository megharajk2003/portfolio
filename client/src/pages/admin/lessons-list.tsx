import React, { useState } from "react";
import Sidebar from "@/components/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Edit,
  Trash2,
  ArrowLeft,
  GripVertical,
  Video,
  FileText,
  HelpCircle,
  Menu,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  durationMinutes: number;
  contentType: "video" | "text" | "quiz";
}

interface Module {
  id: string;
  title: string;
  courseId: string;
}

interface Course {
  id: string;
  title: string;
}

export default function LessonsList() {
  const { toast } = useToast();
  const [moduleId] = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Lesson>>({
    title: "",
    content: "",
    videoUrl: "",
    durationMinutes: 10,
    order: 0,
    contentType: "text",
    moduleId: moduleId,
  });

  // Fetch module details
  const { data: module } = useQuery<Module>({
    queryKey: [`/api/admin/modules/${moduleId}`],
    enabled: !!moduleId,
  });

  // Fetch course details (for breadcrumb)
  const { data: course } = useQuery<Course>({
    queryKey: [`/api/admin/courses/${module?.courseId}`],
    enabled: !!module?.courseId,
  });

  // Fetch lessons for this module
  const { data: lessons = [], isLoading: isLoadingLessons } = useQuery<
    Lesson[]
  >({
    queryKey: [`/api/admin/modules/${moduleId}/lessons`],
    enabled: !!moduleId,
  });

  // Create lesson mutation
  const createLessonMutation = useMutation({
    mutationFn: async (lessonData: Partial<Lesson>) => {
      const response = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        throw new Error("Failed to create lesson");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/modules/${moduleId}/lessons`],
      });
      toast({
        title: "Success",
        description: "Lesson created successfully",
      });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create lesson: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update lesson mutation
  const updateLessonMutation = useMutation({
    mutationFn: async (lessonData: Partial<Lesson>) => {
      const response = await fetch(`/api/admin/lessons/${lessonData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        throw new Error("Failed to update lesson");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/modules/${moduleId}/lessons`],
      });
      toast({
        title: "Success",
        description: "Lesson updated successfully",
      });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update lesson: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete lesson mutation
  const deleteLessonMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/lessons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete lesson");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/modules/${moduleId}/lessons`],
      });
      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setCurrentLesson(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete lesson: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Reorder lessons mutation
  const reorderLessonsMutation = useMutation({
    mutationFn: async (updatedLessons: Partial<Lesson>[]) => {
      const response = await fetch(
        `/api/admin/modules/${moduleId}/lessons/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessons: updatedLessons }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reorder lessons");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/modules/${moduleId}/lessons`],
      });
      toast({
        title: "Success",
        description: "Lessons reordered successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reorder lessons: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "durationMinutes" ? Number(value) : value,
    }));
  };

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
      content: "",
      videoUrl: "",
      durationMinutes: 10,
      order: lessons.length,
      contentType: "text",
      moduleId: moduleId,
    });
  };

  // Open edit modal with lesson data
  const handleEditLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setFormData({
      ...lesson,
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setIsDeleteModalOpen(true);
  };

  // Handle drag end for reordering lessons
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property for each lesson
    const updatedLessons = items.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    // Call API to update order in the database
    reorderLessonsMutation.mutate(updatedLessons);
  };

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "text":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

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
          {/* Breadcrumb navigation */}
          <div className="flex items-center space-x-2 flex-wrap">
            <Link href="/admin/courses">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Courses
              </Button>
            </Link>
            <span className="text-muted-foreground">/</span>
            {course && (
              <>
                <Link href={`/admin/courses/${course.id}/modules`}>
                  <Button variant="ghost" size="sm">
                    {course.title}
                  </Button>
                </Link>
                <span className="text-muted-foreground">/</span>
              </>
            )}
            <span className="font-medium">{module?.title || "Module"}</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Lesson Management
                </h1>
                <p className="text-muted-foreground">
                  Manage lessons for {module?.title || "this module"}.
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Lesson
            </Button>
          </div>

          {/* Lessons table */}
          <Card>
            <CardContent className="p-0">
              {isLoadingLessons ? (
                <div className="flex justify-center items-center py-10">
                  <p>Loading lessons...</p>
                </div>
              ) : lessons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <h3 className="font-medium text-lg">No lessons yet</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Start by adding your first lesson to this module.
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Lesson
                  </Button>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]"></TableHead>
                        <TableHead>Lesson</TableHead>
                        <TableHead className="text-center">Order</TableHead>
                        <TableHead className="text-center">Duration</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <Droppable droppableId="lessons">
                      {(provided: any) => (
                        <TableBody
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {lessons
                            .sort((a, b) => a.order - b.order)
                            .map((lesson, index) => (
                              <Draggable
                                key={lesson.id}
                                draggableId={lesson.id}
                                index={index}
                              >
                                {(provided: any) => (
                                  <TableRow
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="group"
                                  >
                                    <TableCell
                                      {...provided.dragHandleProps}
                                      className="w-[60px]"
                                    >
                                      <div className="flex justify-center cursor-grab">
                                        <GripVertical className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">
                                          {lesson.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                          {lesson.content.substring(0, 100)}
                                          {lesson.content.length > 100
                                            ? "..."
                                            : ""}
                                        </p>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {lesson.order + 1}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {lesson.durationMinutes} min
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge
                                        variant="outline"
                                        className="flex items-center gap-1 justify-center"
                                      >
                                        {getContentTypeIcon(lesson.contentType)}
                                        <span className="capitalize">
                                          {lesson.contentType}
                                        </span>
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleEditLesson(lesson)
                                          }
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteClick(lesson)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </TableBody>
                      )}
                    </Droppable>
                  </Table>
                </DragDropContext>
              )}
            </CardContent>
          </Card>

          {/* Add Lesson Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Lesson</DialogTitle>
                <DialogDescription>
                  Create a new lesson for {module?.title || "this module"}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Introduction to React Hooks"
                  />
                </div>
                <div>
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) =>
                      handleSelectChange("contentType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Lesson content or description"
                    rows={5}
                  />
                </div>
                {formData.contentType === "video" && (
                  <div>
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      placeholder="e.g. https://youtube.com/watch?v=..."
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationMinutes"
                    name="durationMinutes"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createLessonMutation.mutate(formData)}
                  disabled={createLessonMutation.isPending}
                >
                  {createLessonMutation.isPending
                    ? "Creating..."
                    : "Create Lesson"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Lesson Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Lesson</DialogTitle>
                <DialogDescription>
                  Update the lesson details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="edit-title">Lesson Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-contentType">Content Type</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) =>
                      handleSelectChange("contentType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>
                {formData.contentType === "video" && (
                  <div>
                    <Label htmlFor="edit-videoUrl">Video URL</Label>
                    <Input
                      id="edit-videoUrl"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="edit-durationMinutes">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="edit-durationMinutes"
                    name="durationMinutes"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    min="1"
                  />
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
                    updateLessonMutation.mutate({
                      ...formData,
                      id: currentLesson?.id,
                    })
                  }
                  disabled={updateLessonMutation.isPending}
                >
                  {updateLessonMutation.isPending
                    ? "Updating..."
                    : "Update Lesson"}
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
                  Are you sure you want to delete the lesson "
                  {currentLesson?.title}"? This action cannot be undone.
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
                    currentLesson &&
                    deleteLessonMutation.mutate(currentLesson.id)
                  }
                  disabled={deleteLessonMutation.isPending}
                >
                  {deleteLessonMutation.isPending
                    ? "Deleting..."
                    : "Delete Lesson"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
