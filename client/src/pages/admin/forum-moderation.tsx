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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2, MessageSquare, ThumbsUp } from "lucide-react";
import { format } from "date-fns";
import Sidebar from "@/components/sidebar";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  repliesCount: number;
  likesCount: number;
}

interface ForumReply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  postId: string;
}

export default function ForumModeration() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<ForumPost | null>(null);

  // Fetch forum posts
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery<ForumPost[]>(
    {
      queryKey: ["/api/admin/forum/posts"],
    }
  );

  // Fetch replies for a specific post
  const { data: replies = [], isLoading: isLoadingReplies } = useQuery<
    ForumReply[]
  >({
    queryKey: [`/api/admin/forum/posts/${currentPost?.id}/replies`],
    enabled: !!currentPost?.id && isViewModalOpen,
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/forum/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/forum/posts"] });
      toast({
        title: "Success",
        description: "Forum post deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setCurrentPost(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete reply mutation
  const deleteReplyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/forum/replies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete reply");
      }

      return response.json();
    },
    onSuccess: () => {
      if (currentPost) {
        queryClient.invalidateQueries({
          queryKey: [`/api/admin/forum/posts/${currentPost.id}/replies`],
        });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/forum/posts"] });
      }
      toast({
        title: "Success",
        description: "Reply deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete reply: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Open view modal with post data
  const handleViewPost = (post: ForumPost) => {
    setCurrentPost(post);
    setIsViewModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (post: ForumPost) => {
    setCurrentPost(post);
    setIsDeleteModalOpen(true);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Filter posts based on search query and date filter
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());

    if (dateFilter === "all") return matchesSearch;

    const postDate = new Date(post.createdAt);
    const now = new Date();

    switch (dateFilter) {
      case "today":
        return (
          matchesSearch &&
          postDate.getDate() === now.getDate() &&
          postDate.getMonth() === now.getMonth() &&
          postDate.getFullYear() === now.getFullYear()
        );
      case "week":
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return matchesSearch && postDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return matchesSearch && postDate >= monthAgo;
      default:
        return matchesSearch;
    }
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
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Forum Moderation
            </h1>
            <p className="text-muted-foreground">
              Manage and moderate forum posts and replies.
            </p>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts by title, content, or author..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Forum posts table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Post</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-center">Replies</TableHead>
                    <TableHead className="text-center">Likes</TableHead>
                    <TableHead>Date Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPosts ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        Loading forum posts...
                      </TableCell>
                    </TableRow>
                  ) : filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        No forum posts found.{" "}
                        {searchQuery && "Try a different search term."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{post.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {post.content}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{post.authorName}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 justify-center"
                          >
                            <MessageSquare className="h-3 w-3" />
                            {post.repliesCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 justify-center"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            {post.likesCount}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(post.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewPost(post)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(post)}
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

        {/* View Post Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{currentPost?.title}</DialogTitle>
              <DialogDescription>
                Posted by {currentPost?.authorName} on{" "}
                {currentPost && formatDate(currentPost.createdAt)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Post content */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Post Content</h3>
                <div className="rounded-md bg-muted p-4">
                  <p className="whitespace-pre-wrap">{currentPost?.content}</p>
                </div>
              </div>

              {/* Replies */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">
                  Replies ({replies.length})
                </h3>
                {isLoadingReplies ? (
                  <p className="text-center py-4">Loading replies...</p>
                ) : replies.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    No replies yet.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-md border p-4 relative"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{reply.authorName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(reply.createdAt)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => deleteReplyMutation.mutate(reply.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (currentPost) {
                    deletePostMutation.mutate(currentPost.id);
                    setIsViewModalOpen(false);
                  }
                }}
              >
                Delete Post
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
                Are you sure you want to delete the post "{currentPost?.title}"?
                This will also delete all replies to this post. This action
                cannot be undone.
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
                  currentPost && deletePostMutation.mutate(currentPost.id)
                }
                disabled={deletePostMutation.isPending}
              >
                {deletePostMutation.isPending ? "Deleting..." : "Delete Post"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
