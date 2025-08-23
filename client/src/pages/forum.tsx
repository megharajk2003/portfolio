import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MessageCircle,
  Heart,
  Reply,
  Plus,
  Clock,
  Users,
  Send,
  Menu,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";

const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

const createReplySchema = z.object({
  content: z.string().min(3, "Reply must be at least 3 characters"),
});

type ForumPost = {
  id: string;
  title: string;
  content: string;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
};

type ForumReply = {
  id: string;
  content: string;
  likesCount: number;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
};

function UserAvatar({
  user,
  size = "h-10 w-10",
}: {
  user: any;
  size?: string;
}) {
  const initials = `${user.firstName?.[0] || ""}${
    user.lastName?.[0] || ""
  }`.toUpperCase();
  const displayName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;

  return (
    <Link
      href={`/public-portfolio/${user.email.split("@")[0]}`}
      data-testid={`link-user-profile-${user.id}`}
    >
      <Avatar
        className={`${size} cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all`}
        data-testid={`avatar-user-${user.id}`}
      >
        <AvatarImage src={user.profileImageUrl || ""} alt={displayName} />
        <AvatarFallback>
          {initials || user.email[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}

function PostCard({ post }: { post: ForumPost }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const { data: replies = [] } = useQuery<ForumReply[]>({
    queryKey: [`/api/forum/posts/${post.id}/replies`],
    enabled: showReplies,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/forum/like", {
        userId: user?.id,
        postId: post.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest(
        "POST",
        `/api/forum/posts/${post.id}/replies`,
        {
          content,
          userId: user?.id,
        }
      );
      return res.json();
    },
    onSuccess: () => {
      setReplyContent("");
      queryClient.invalidateQueries({
        queryKey: [`/api/forum/posts/${post.id}/replies`],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      toast({
        title: "Success",
        description: "Reply posted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    },
  });

  const handleReply = () => {
    if (!replyContent.trim()) return;
    replyMutation.mutate(replyContent);
  };

  return (
    <Card
      className="mb-6 card-with-gradient-outline"
      data-testid={`card-forum-post-${post.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-4">
          <UserAvatar user={post.user} />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3
                className="font-semibold text-gray-900 dark:text-white"
                data-testid={`text-post-title-${post.id}`}
              >
                {post.title}
              </h3>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </Badge>
            </div>
            <p
              className="text-sm text-gray-600 dark:text-gray-400"
              data-testid={`text-post-author-${post.id}`}
            >
              by {post.user.firstName || post.user.email}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p
          className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap"
          data-testid={`text-post-content-${post.id}`}
        >
          {post.content}
        </p>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => likeMutation.mutate()}
            disabled={!user}
            className="text-gray-600 hover:text-red-600"
            data-testid={`button-like-post-${post.id}`}
          >
            <Heart className="h-4 w-4 mr-1" />
            {post.likesCount}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="text-gray-600 hover:text-blue-600"
            data-testid={`button-toggle-replies-${post.id}`}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.repliesCount} {post.repliesCount === 1 ? "reply" : "replies"}
          </Button>
        </div>

        {showReplies && (
          <>
            <Separator className="my-4" />

            {user && (
              <div className="mb-4">
                <div className="flex items-start space-x-3">
                  <UserAvatar user={user} size="h-8 w-8" />
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="mb-2"
                      data-testid={`textarea-reply-${post.id}`}
                    />
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={!replyContent.trim() || replyMutation.isPending}
                      data-testid={`button-submit-reply-${post.id}`}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className="flex items-start space-x-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                  data-testid={`card-reply-${reply.id}`}
                >
                  <UserAvatar user={reply.user} size="h-8 w-8" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className="text-sm font-medium text-gray-900 dark:text-white"
                        data-testid={`text-reply-author-${reply.id}`}
                      >
                        {reply.user.firstName || reply.user.email}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(reply.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p
                      className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                      data-testid={`text-reply-content-${reply.id}`}
                    >
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CreatePostDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createPostSchema>) => {
      const res = await apiRequest("POST", "/api/forum/posts", {
        ...data,
        userId: user?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof createPostSchema>) => {
    createPostMutation.mutate(data);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-2" data-testid="button-create-post">
          <Plus className="h-4 w-4 mr-2" />
          Create New Post
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Forum Post</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter post title..."
                      {...field}
                      data-testid="input-post-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's on your mind?"
                      className="min-h-[100px]"
                      {...field}
                      data-testid="textarea-post-content"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPostMutation.isPending}
                data-testid="button-submit-post"
              >
                Create Post
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Forum() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: posts = [], isLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum/posts"],
  });

  if (isLoading) {
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

        {/* Main content */}
        <main className="lg:ml-64 min-h-screen p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">Loading forum posts...</div>
          </div>
        </main>
      </div>
    );
  }

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

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Community Forum
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                  Connect with other learners and share your experiences
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {posts.length} posts
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <CreatePostDialog />
            </div>

            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Be the first to start a conversation in the community forum!
                  </p>
                  {user && <CreatePostDialog />}
                </CardContent>
              </Card>
            ) : (
              <div>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
