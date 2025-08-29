import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Search, Plus, Pencil, Trash2, Award } from "lucide-react";
import Sidebar from "@/components/sidebar";

interface BadgeType {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  xpValue: number;
  criteria: string;
  createdAt: string;
}

export default function BadgeManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<BadgeType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    category: "achievement",
    xpValue: 0,
    criteria: "",
  });

  // Fetch badges
  const { data: badges = [], isLoading: isLoadingBadges } = useQuery<
    BadgeType[]
  >({
    queryKey: ["/api/admin/badges"],
  });

  // Create badge mutation
  const createBadgeMutation = useMutation({
    mutationFn: async (data: Omit<BadgeType, "id" | "createdAt">) => {
      const response = await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create badge");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/badges"] });
      toast({
        title: "Success",
        description: "Badge created successfully",
      });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create badge: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update badge mutation
  const updateBadgeMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Omit<BadgeType, "id" | "createdAt">;
    }) => {
      const response = await fetch(`/api/admin/badges/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update badge");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/badges"] });
      toast({
        title: "Success",
        description: "Badge updated successfully",
      });
      setIsEditModalOpen(false);
      setCurrentBadge(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update badge: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete badge mutation
  const deleteBadgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/badges/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete badge");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/badges"] });
      toast({
        title: "Success",
        description: "Badge deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setCurrentBadge(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete badge: ${error.message}`,
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
      [name]: name === "xpValue" ? parseInt(value) || 0 : value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      category: "achievement",
      xpValue: 0,
      criteria: "",
    });
  };

  // Open add modal
  const handleAddBadge = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleEditBadge = (badge: BadgeType) => {
    setCurrentBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description,
      imageUrl: badge.imageUrl,
      category: badge.category,
      xpValue: badge.xpValue,
      criteria: badge.criteria,
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (badge: BadgeType) => {
    setCurrentBadge(badge);
    setIsDeleteModalOpen(true);
  };

  // Submit form for creating a badge
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBadgeMutation.mutate(formData);
  };

  // Submit form for updating a badge
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentBadge) {
      updateBadgeMutation.mutate({
        id: currentBadge.id,
        data: formData,
      });
    }
  };

  // Filter badges based on search query and category
  const filteredBadges = badges.filter((badge) => {
    const matchesSearch =
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || badge.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get badge category display name
  const getCategoryDisplayName = (category: string) => {
    const categories: Record<string, string> = {
      achievement: "Achievement",
      skill: "Skill",
      participation: "Participation",
      milestone: "Milestone",
      special: "Special",
    };
    return categories[category] || category;
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Get badge category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      achievement:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      skill: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      participation:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      milestone:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      special: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return (
      colors[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    );
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
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Badge Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage badges for your learning platform.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search badges by name or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                  <SelectItem value="participation">Participation</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddBadge}>
                <Plus className="h-4 w-4 mr-2" />
                Add Badge
              </Button>
            </div>
          </div>

          {/* Badges table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Badge</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      XP Value
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Criteria
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingBadges ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        Loading badges...
                      </TableCell>
                    </TableRow>
                  ) : filteredBadges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        No badges found.{" "}
                        {searchQuery && "Try a different search term."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBadges.map((badge) => (
                      <TableRow key={badge.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {badge.imageUrl ? (
                                <img
                                  src={badge.imageUrl}
                                  alt={badge.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <Award className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{badge.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {badge.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            className={`${getCategoryColor(badge.category)}`}
                          >
                            {getCategoryDisplayName(badge.category)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {badge.xpValue} XP
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="line-clamp-1">{badge.criteria}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBadge(badge)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(badge)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Add Badge Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Badge</DialogTitle>
              <DialogDescription>
                Create a new badge for your learning platform.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Badge Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter badge name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="skill">Skill</SelectItem>
                        <SelectItem value="participation">
                          Participation
                        </SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter badge description"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="Enter image URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="xpValue">XP Value</Label>
                    <Input
                      id="xpValue"
                      name="xpValue"
                      type="number"
                      value={formData.xpValue}
                      onChange={handleInputChange}
                      placeholder="Enter XP value"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="criteria">Earning Criteria</Label>
                  <Textarea
                    id="criteria"
                    name="criteria"
                    value={formData.criteria}
                    onChange={handleInputChange}
                    placeholder="Enter criteria for earning this badge"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createBadgeMutation.isPending}>
                  {createBadgeMutation.isPending
                    ? "Creating..."
                    : "Create Badge"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Badge Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Badge</DialogTitle>
              <DialogDescription>
                Update the details of this badge.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Badge Name</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter badge name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="skill">Skill</SelectItem>
                        <SelectItem value="participation">
                          Participation
                        </SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter badge description"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-imageUrl">Image URL</Label>
                    <Input
                      id="edit-imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="Enter image URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-xpValue">XP Value</Label>
                    <Input
                      id="edit-xpValue"
                      name="xpValue"
                      type="number"
                      value={formData.xpValue}
                      onChange={handleInputChange}
                      placeholder="Enter XP value"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-criteria">Earning Criteria</Label>
                  <Textarea
                    id="edit-criteria"
                    name="criteria"
                    value={formData.criteria}
                    onChange={handleInputChange}
                    placeholder="Enter criteria for earning this badge"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateBadgeMutation.isPending}>
                  {updateBadgeMutation.isPending
                    ? "Updating..."
                    : "Update Badge"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the badge "{currentBadge?.name}
                "? This action cannot be undone.
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
                  currentBadge && deleteBadgeMutation.mutate(currentBadge.id)
                }
                disabled={deleteBadgeMutation.isPending}
              >
                {deleteBadgeMutation.isPending ? "Deleting..." : "Delete Badge"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
