import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  BookOpen,
  Briefcase,
  Award,
  Globe,
  FileText,
  Heart,
  Folder,
  GraduationCap,
  Trophy,
  Building,
  Book,
  Users,
  Edit,
  ShieldCheck,
  Zap,
  Wrench,
  Plus,
} from "lucide-react";

interface ContentCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const contentCategories: ContentCategory[] = [
  {
    id: "profile",
    title: "Profile",
    description:
      "Make a great first impression by presenting yourself in a few sentences.",
    icon: <User className="h-5 w-5" />,
  },
  {
    id: "education",
    title: "Education",
    description:
      "Show off your primary education, college degrees & exchange semesters.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    id: "experience",
    title: "Professional Experience",
    description:
      "A place to highlight your professional experience - including internships.",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    id: "skills",
    title: "Skills",
    description:
      "List your technical, managerial or soft skills in this section.",
    icon: <Award className="h-5 w-5" />,
  },
  {
    id: "languages",
    title: "Languages",
    description:
      "You speak more than one language? Make sure to list them here.",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    id: "certificates",
    title: "Certificates",
    description:
      "Drivers licenses and other industry-specific certificates you have belong here.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    id: "interests",
    title: "Interests",
    description:
      "Do you have interests that align with your career aspiration?",
    icon: <Heart className="h-5 w-5" />,
  },
  {
    id: "projects",
    title: "Projects",
    description:
      "Worked on a particular challenging project in the past? Mention it here.",
    icon: <Folder className="h-5 w-5" />,
  },
  {
    id: "courses",
    title: "Courses",
    description:
      "Did you complete MOOCs or an evening course? Show them off in this section.",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    id: "awards",
    title: "Awards",
    description:
      "Awards like student competitions or industry accolades belong here.",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    id: "organizations",
    title: "Organizations",
    description:
      "If you volunteer or participate in a good cause, why not state it?",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "publications",
    title: "Publications",
    description:
      "Academic publications or book releases have a dedicated place here.",
    icon: <Book className="h-5 w-5" />,
  },
  {
    id: "references",
    title: "References",
    description:
      "If you have former colleagues or bosses that vouch for you, list them.",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "internship",
    title: "Internship",
    description: "This is a custom section",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "tools",
    title: "Tools",
    description: "This is a custom section",
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    id: "custom",
    title: "Custom",
    description:
      "You didn't find what you are looking for? Or you want to combine two sections to save space?",
    icon: <Plus className="h-5 w-5" />,
  },
];

interface AddContentModalProps {
  open: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
}

export function AddContentModal({
  open,
  onClose,
  onSelectCategory,
}: AddContentModalProps) {
  const handleCategorySelect = (categoryId: string) => {
    onSelectCategory(categoryId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add content
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {contentCategories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-shadow border hover:border-blue-300"
              onClick={() => handleCategorySelect(category.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-gray-600 dark:text-gray-400 mt-1">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
