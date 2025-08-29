import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Edit,
  Trash2,
  ArrowLeft,
  GripVertical,
  BookOpen,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Sidebar from "@/components/sidebar";

interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  durationHours: number;
  lessonsCount?: number;
}

interface Course {
  id: string;
  title: string;
}

export default function ModulesList() {
  const { toast } = useToast();
  const { courseId } = useParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Module>>({
    title: "",
    description: "",
    durationHours: 1,
    order: 0,
    courseId: courseId,
  });

  // Fetch course details
  const { data: course } = useQuery<Course>({
    queryKey: [`/api/admin/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch modules for this course
  const { data: modules = [], isLoading: isLoadingModules } = useQuery<
    Module[]
  >({
    queryKey: [`/api/admin/courses/${courseId}/modules`],
    enabled: !!courseId,
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: Partial<Module>) => {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleData),
      });

      if (!response.ok) {
        throw new Error("Failed to create module");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/courses/${courseId}/modules`],
      });
      toast({
        title: "Success",
        description: "Module created successfully",
      });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create module: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: async (moduleData: Partial<Module>) => {
      const response = await fetch(`/api/admin/modules/${moduleData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleData),
      });

      if (!response.ok) {
        throw new Error("Failed to update module");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/courses/${courseId}/modules`],
      });
      toast({
        title: "Success",
        description: "Module updated successfully",
      });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update module: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/modules/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete module");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/courses/${courseId}/modules`],
      });
      toast({
        title: "Success",
        description: "Module deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setCurrentModule(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete module: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Reorder modules mutation
  const reorderModulesMutation = useMutation({
    mutationFn: async (updatedModules: Partial<Module>[]) => {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modules: updatedModules }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reorder modules");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/courses/${courseId}/modules`],
      });
      toast({
        title: "Success",
        description: "Modules reordered successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reorder modules: ${error.message}`,
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
      [name]: name === "durationHours" ? Number(value) : value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      durationHours: 1,
      order: modules.length,
      courseId: courseId,
    });
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Open edit modal with module data
  const handleEditModule = (module: Module) => {
    setCurrentModule(module);
    setFormData({
      ...module,
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (module: Module) => {
    setCurrentModule(module);
    setIsDeleteModalOpen(true);
  };

  // Handle drag end for reordering modules
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property for each module
    const updatedModules = items.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    // Call API to update order in the database
    reorderModulesMutation.mutate(updatedModules);
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
          <div className="flex items-center space-x-2">
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
            <span className="font-medium">{course?.title || "Course"}</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Module Management
              </h1>
              <p className="text-muted-foreground">
                Manage modules for {course?.title || "this course"}.
              </p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Module
            </Button>
          </div>

          {/* Modules table */}
          <Card>
            <CardContent className="p-0">
              {isLoadingModules ? (
                <div className="flex justify-center items-center py-10">
                  <p>Loading modules...</p>
                </div>
              ) : modules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <h3 className="font-medium text-lg">No modules yet</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Start by adding your first module to this course.
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Module
                  </Button>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]"></TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead className="text-center">Order</TableHead>
                        <TableHead className="text-center">Duration</TableHead>
                        <TableHead className="text-center">Lessons</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <Droppable droppableId="modules">
                      {(provided: any) => (
                        <TableBody
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {modules
                            .sort((a, b) => a.order - b.order)
                            .map((module, index) => (
                              <Draggable
                                key={module.id}
                                draggableId={module.id}
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
                                          {module.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                          {module.description}
                                        </p>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {module.order + 1}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {module.durationHours} hours
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {module.lessonsCount || 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Link
                                          href={`/admin/modules/${module.id}/lessons`}
                                        >
                                          <Button variant="outline" size="sm">
                                            <BookOpen className="h-4 w-4 mr-1" />
                                            Manage Lessons
                                          </Button>
                                        </Link>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleEditModule(module)
                                          }
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteClick(module)
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
        </div>

        {/* Add Module Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Module</DialogTitle>
              <DialogDescription>
                Create a new module for {course?.title || "this course"}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="title">Module Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Introduction to React"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of this module"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="durationHours">Duration (hours)</Label>
                <Input
                  id="durationHours"
                  name="durationHours"
                  type="number"
                  value={formData.durationHours}
                  onChange={handleInputChange}
                  min="1"
                />
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
                onClick={() => createModuleMutation.mutate(formData)}
                disabled={createModuleMutation.isPending}
              >
                {createModuleMutation.isPending
                  ? "Creating..."
                  : "Create Module"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Module Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
              <DialogDescription>Update the module details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-title">Module Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
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
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-durationHours">Duration (hours)</Label>
                <Input
                  id="edit-durationHours"
                  name="durationHours"
                  type="number"
                  value={formData.durationHours}
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
                  updateModuleMutation.mutate({
                    ...formData,
                    id: currentModule?.id,
                  })
                }
                disabled={updateModuleMutation.isPending}
              >
                {updateModuleMutation.isPending
                  ? "Updating..."
                  : "Update Module"}
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
                Are you sure you want to delete the module "
                {currentModule?.title}
                "? This will also delete all lessons within this module. This
                action cannot be undone.
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
                  currentModule && deleteModuleMutation.mutate(currentModule.id)
                }
                disabled={deleteModuleMutation.isPending}
              >
                {deleteModuleMutation.isPending
                  ? "Deleting..."
                  : "Delete Module"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
