import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function Portfolio() {
  // Get current user to extract email prefix for portfolio URL
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Extract username from email (part before @)
  const username = user?.email?.split('@')[0] || 'user';

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-8 animate-slide-up">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Management</h1>
              <p className="text-gray-600 mt-1">Manage your public portfolio settings and preview</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="card-hover shadow-lg border-0 gradient-border">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Portfolio Settings</h2>
                <div className="space-y-4">
                  <Button className="w-full" asChild>
                    <Link href="/edit-portfolio">
                      Edit Portfolio Sections
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    Change Theme
                  </Button>
                  <Button variant="outline" className="w-full">
                    SEO Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover shadow-lg border-0 gradient-border">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Public Portfolio</h2>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Your portfolio is live at: <br />
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      /public-portfolio/{username}
                    </span>
                  </p>
                  <Button className="w-full" asChild>
                    <a href={`/public-portfolio/${username}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Public Portfolio
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
