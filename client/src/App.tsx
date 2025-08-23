import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AuthProviderWrapper from "@/components/clerk-provider";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import { useToast } from "@/hooks/use-toast";

import Portfolio from "@/pages/portfolio";
import Learning from "@/pages/learning";
import CourseDetail from "@/pages/course-detail";
import CourseLearn from "@/pages/course-learn";
import ModuleDetail from "@/pages/module-detail";
import EditPortfolio from "@/pages/edit-portfolio";
import PublicPortfolio from "@/pages/public-portfolio";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Home from "./pages/dashboard";
import CareerTools from "@/pages/career-tools";
import CareerAdvisor from "@/pages/career-advisor";
import CareerTimeline from "@/pages/career-timeline";
import ResumeGenerator from "@/pages/resume-generator";
import CareerChat from "@/pages/career-chat";
import Forum from "@/pages/forum";
import GoalTracker from "@/pages/goal-tracker";
import GoalDetails from "@/pages/goal-details";

function Router() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect to dashboard when user is authenticated and on root path
  useEffect(() => {
    if (isAuthenticated && !isLoading && location === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, location, navigate]);

  // Protected routes - redirect to base URL and show toast if not authenticated
  useEffect(() => {
    const protectedRoutes = [
      "/profile",
      "/dashboard",
      "/portfolio",
      "/learning",
      "/forum",
      "/edit-portfolio",
      "/course",
      "/module",
      "/career-tools",
      "/career-advisor",
      "/career-timeline",
      "/resume-generator",
      "/career-chat",
      "/goal-tracker",
    ];
    const isProtectedRoute = protectedRoutes.some((route) =>
      location.startsWith(route)
    );

    // Add a small delay to ensure authentication state is fully loaded
    const timer = setTimeout(() => {
      // Only check authentication after loading is complete AND user is definitely not authenticated
      if (!isLoading && !isAuthenticated && isProtectedRoute) {
        console.log(
          "Auth check - isLoading:",
          isLoading,
          "isAuthenticated:",
          isAuthenticated,
          "location:",
          location
        );
        toast({
          title: "Authentication Required",
          description: "Please sign in to access this page.",
          variant: "destructive",
        });
        navigate("/", { replace: true });
      }
    }, 500); // 500ms delay to allow auth state to settle

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, location, navigate, toast]);

  // Show loading spinner during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/learning" component={Learning} />
          <Route path="/forum" component={Forum} />
        <Route path="/goal-tracker" component={GoalTracker} />
        <Route path="/goal-tracker/:id" component={GoalDetails} />
          <Route path="/course/:courseId/learn" component={CourseLearn} />
          <Route path="/course/:id" component={CourseDetail} />
          <Route path="/module/:id" component={ModuleDetail} />
          <Route path="/edit-portfolio" component={EditPortfolio} />
          <Route path="/public-portfolio/:username" component={PublicPortfolio} />
          <Route path="/career-tools" component={CareerTools} />
          <Route path="/career-advisor" component={CareerAdvisor} />
          <Route path="/career-timeline" component={CareerTimeline} />
          <Route path="/resume-generator" component={ResumeGenerator} />
          <Route path="/career-chat" component={CareerChat} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviderWrapper>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProviderWrapper>
    </QueryClientProvider>
  );
}

export default App;
