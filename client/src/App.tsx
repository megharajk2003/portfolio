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

import Skills from "@/pages/skills";
import Projects from "@/pages/projects";
import Portfolio from "@/pages/portfolio";
import Learning from "@/pages/learning";
import CourseDetail from "@/pages/course-detail";
import EditPortfolio from "@/pages/edit-portfolio";
import PublicPortfolio from "@/pages/public-portfolio";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Home from "./pages/dashboard";

function Router() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const [location, navigate] = useLocation();

  // Redirect to dashboard when user is authenticated and on root path
  useEffect(() => {
    if (isAuthenticated && !isLoading && location === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, location, navigate]);

  return (
    <Switch>
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" component={Home} />
          <Route path="/profile" component={Profile} />

          <Route path="/skills" component={Skills} />
          <Route path="/projects" component={Projects} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/learning" component={Learning} />
          <Route path="/course/:id" component={CourseDetail} />
          <Route path="/edit-portfolio" component={EditPortfolio} />
          <Route path="/portfolio/:username" component={PublicPortfolio} />
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
