import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Sidebar from "@/components/sidebar";

export default function Portfolio() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Management</h1>
              <p className="text-gray-600 mt-1">Manage your public portfolio settings and preview</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
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

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Public Portfolio</h2>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Your portfolio is live at: <br />
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      /portfolio/megharaj
                    </span>
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/portfolio/megharaj">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Public Portfolio
                    </Link>
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
