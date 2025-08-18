import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type profiles } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X, 
  Plus, Menu, Bell, FileText, Target, Trophy, Award, Star
} from "lucide-react";

const CURRENT_USER_ID = "user-1";

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: profile } = useQuery<typeof profiles.$inferSelect>({
    queryKey: ["/api/profile", CURRENT_USER_ID],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
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
                  Profile
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                  Manage your profile information
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Profile Header Card */}
          <Card className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile?.photoUrl || ""} alt={profile?.name || ""} />
                    <AvatarFallback className="text-2xl">
                      {profile?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full p-2">
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profile?.name || "Sivaraman M"}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                    {profile?.role || "Full Stack Developer"}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{profile?.email || "sivaraman0314@gmail.com"}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile?.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {profile?.summary && (
                <div>
                  <p className="text-gray-700 dark:text-gray-300">{profile.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Sections */}
          <div className="grid gap-6">
            {/* Objective Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Objective</span>
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Add your career objective to help employers understand your goals.
                </p>
                <Button variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </Button>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Skills</span>
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  List your technical, managerial or soft skills in this section.
                </p>
                <Button variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </Button>
              </CardContent>
            </Card>

            {/* Languages Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Languages</span>
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  You speak more than one language? Make sure to list them here.
                </p>
                <Button variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </Button>
              </CardContent>
            </Card>

            {/* Other sections that would be expandable like in the attached image */}
            {[
              { icon: Trophy, title: "Courses", description: "Did you complete MOOCs or an evening course? Show them off in this section." },
              { icon: Award, title: "Awards", description: "Awards like student competitions or industry accolades belong here." },
              { icon: User, title: "References", description: "If you have former colleagues or bosses that vouch for you, list them." },
              { icon: FileText, title: "Declaration", description: "You need a declaration with signature?" },
              { icon: Target, title: "Interests", description: "Do you have interests that align with your career aspiration?" },
              { icon: Trophy, title: "Organizations", description: "If you volunteer or participate in a good cause, why not state it?" },
              { icon: FileText, title: "Publications", description: "Academic publications or book releases have a dedicated place here." },
              { icon: Award, title: "Certificates", description: "Drivers licenses and other industry-specific certificates you have belong here." }
            ].map((section, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <section.icon className="h-5 w-5" />
                    <span>{section.title}</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {section.description}
                  </p>
                  <Button variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Content Button */}
          <div className="flex justify-center pt-6">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3">
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}