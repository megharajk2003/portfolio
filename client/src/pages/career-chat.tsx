import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Send,
  Plus,
  User,
  Bot,
  Sparkles,
  Calendar,
} from "lucide-react";

export default function CareerChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat sessions
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/chat-sessions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log("🔍 [FRONTEND] Fetching chat sessions for user:", user.id);
      const response = await apiRequest("GET", `/api/chat-sessions/${user.id}`);
      const sessionsData = await response.json();
      console.log("📋 [FRONTEND] Sessions data received:", sessionsData);
      return sessionsData;
    },
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch current session details
  const { data: currentSession, isLoading: isLoadingSession } = useQuery({
    queryKey: ["/api/chat-sessions/session", selectedSessionId],
    queryFn: async () => {
      if (!selectedSessionId) return null;
      console.log(
        "🔍 [FRONTEND] Fetching session details for:",
        selectedSessionId
      );
      const response = await apiRequest(
        "GET",
        `/api/chat-sessions/session/${selectedSessionId}`
      );
      const sessionData = await response.json();
      console.log("📋 [FRONTEND] Session data received:", sessionData);
      return sessionData;
    },
    enabled: !!selectedSessionId,
    refetchInterval: 2000, // Refetch every 2 seconds when active
  });

  // Create new session mutation
  const createSession = useMutation({
    mutationFn: async (data: any) => {
      console.log("🎯 [FRONTEND] Creating chat session with data:", data);
      return apiRequest("POST", `/api/chat-sessions`, data);
    },
    onSuccess: (newSession: any) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/chat-sessions", user?.id],
      });
      setSelectedSessionId(newSession.id);
      setNewSessionTitle("");
      setIsCreatingSession(false);
      toast({
        title: "Chat Session Created!",
        description: "Start your career conversation.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create chat session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (data: any) => {
      console.log("🎯 [FRONTEND] Sending message:", data);
      return apiRequest(
        "POST",
        `/api/chat-sessions/${data.sessionId}/message`,
        { message: data.message }
      );
    },
    onSuccess: () => {
      console.log(
        "✅ [FRONTEND] Message sent successfully, invalidating queries..."
      );
      queryClient.invalidateQueries({
        queryKey: ["/api/chat-sessions/session", selectedSessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/chat-sessions", user?.id],
      });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [(currentSession as any)?.messages]);

  // Auto-select first session if available
  useEffect(() => {
    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    if (sessionsArray.length > 0 && !selectedSessionId) {
      setSelectedSessionId((sessionsArray[0] as any).id);
    }
  }, [sessions, selectedSessionId]);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a title for your chat session.",
        variant: "destructive",
      });
      return;
    }

    createSession.mutate({
      userId: user?.id,
      title: newSessionTitle.trim(),
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedSessionId) return;

    sendMessage.mutate({
      sessionId: selectedSessionId,
      message: message.trim(),
    });
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-6 bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            AI Career Chat
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Have interactive conversations with your personal AI career counselor.
          Get instant answers to career questions and personalized guidance.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sessions Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Chat Sessions</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setIsCreatingSession(!isCreatingSession)}
                  data-testid="button-new-session"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Your career conversations</CardDescription>
            </CardHeader>
            <CardContent>
              {/* New Session Form */}
              {isCreatingSession && (
                <form
                  onSubmit={handleCreateSession}
                  className="space-y-3 mb-4 p-3 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Label htmlFor="sessionTitle">Session Title</Label>
                    <Input
                      id="sessionTitle"
                      value={newSessionTitle}
                      onChange={(e) => setNewSessionTitle(e.target.value)}
                      placeholder="e.g., Career Change Discussion"
                      data-testid="input-session-title"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={createSession.isPending}
                    >
                      Create
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreatingSession(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Sessions List */}
              <div className="space-y-2">
                {isLoadingSessions ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                ) : Array.isArray(sessions) && sessions.length > 0 ? (
                  (sessions as any[]).map((session: any) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedSessionId === session.id
                          ? "border-orange-600 bg-orange-50"
                          : "hover:border-orange-300"
                      }`}
                      onClick={() => setSelectedSessionId(session.id)}
                      data-testid={`session-${session.id}`}
                    >
                      <h4 className="font-medium text-sm truncate">
                        {session.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="text-xs">
                          {session.messages?.length || 0} messages
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    No chat sessions yet. Create your first one!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[700px] flex flex-col shadow-lg border-0 bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-600" />
                {currentSession
                  ? (currentSession as any).title
                  : "Select a Chat Session"}
              </CardTitle>
              <CardDescription>
                {currentSession && (
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(
                        (currentSession as any).createdAt
                      ).toLocaleDateString()}
                    </Badge>
                    <Badge variant="outline">
                      {(currentSession as any).messages?.length || 0} messages
                    </Badge>
                  </div>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col overflow-hidden">
              {selectedSessionId ? (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 pr-4">
                    {isLoadingSession ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="text-muted-foreground mt-2">
                          Loading conversation...
                        </p>
                      </div>
                    ) : (currentSession as any)?.messages &&
                      (currentSession as any).messages.length > 0 ? (
                      <div className="space-y-4">
                        {(currentSession as any).messages.map(
                          (msg: any, index: number) => (
                            <div
                              key={index}
                              className={`flex gap-3 ${
                                msg.role === "user"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`flex gap-3 max-w-[80%] ${
                                  msg.role === "user"
                                    ? "flex-row-reverse"
                                    : "flex-row"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    msg.role === "user"
                                      ? "bg-blue-600"
                                      : "bg-orange-600"
                                  }`}
                                >
                                  {msg.role === "user" ? (
                                    <User className="h-4 w-4 text-white" />
                                  ) : (
                                    <Bot className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <div
                                  className={`rounded-xl p-4 shadow-sm ${
                                    msg.role === "user"
                                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                      : "bg-white border border-orange-200 text-gray-900"
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {msg.content}
                                  </p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      msg.role === "user"
                                        ? "text-blue-100"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {formatMessageTime(msg.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Start a conversation with your AI career counselor!
                        </p>
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <form
                    onSubmit={handleSendMessage}
                    className="flex gap-2 mt-4"
                  >
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask me anything about your career..."
                      className="flex-1 min-h-[60px] max-h-[120px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      data-testid="textarea-message"
                    />
                    <Button
                      type="submit"
                      disabled={!message.trim() || sendMessage.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a chat session or create a new one to start
                      chatting
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
