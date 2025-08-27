import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListChecks } from "lucide-react";
import Sidebar from "@/components/sidebar";

// 1. Interface to define the shape of our subtopic data
interface Subtopic {
  id: string;
  categoryName: string;
  topicName: string;
  subtopicName: string;
  status: "pending" | "in_progress" | "completed";
}

// 2. Dummy data based on the list you provided
const initialSubtopics: Subtopic[] = [
  {
    id: "sub-1",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Analogies (Semantic, Symbolic/Number, Figural)",
    status: "pending",
  },
  {
    id: "sub-2",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Classification (Semantic, Symbolic/Number, Figural)",
    status: "pending",
  },
  {
    id: "sub-3",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Series (Number, Alphabet, Semantic, Figural, Non-Verbal)",
    status: "pending",
  },
  {
    id: "sub-4",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Coding-Decoding",
    status: "pending",
  },
  {
    id: "sub-5",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Blood Relations",
    status: "pending",
  },
  {
    id: "sub-6",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Direction Sense Test",
    status: "pending",
  },
  {
    id: "sub-7",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Logical Venn Diagrams",
    status: "pending",
  },
  {
    id: "sub-8",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Syllogism",
    status: "pending",
  },
  {
    id: "sub-9",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Statement & Conclusions",
    status: "pending",
  },
  {
    id: "sub-10",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Statement & Assumptions",
    status: "pending",
  },
  {
    id: "sub-11",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Critical Thinking",
    status: "pending",
  },
  {
    id: "sub-12",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Emotional Intelligence",
    status: "pending",
  },
  {
    id: "sub-13",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Social Intelligence",
    status: "pending",
  },
  {
    id: "sub-14",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Word Building",
    status: "pending",
  },
  {
    id: "sub-15",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Numerical Operations",
    status: "pending",
  },
  {
    id: "sub-16",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Symbolic Operations",
    status: "pending",
  },
  {
    id: "sub-17",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Puzzles",
    status: "pending",
  },
  {
    id: "sub-18",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Space Visualization",
    status: "pending",
  },
  {
    id: "sub-19",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Space Orientation",
    status: "pending",
  },
  {
    id: "sub-20",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Problem Solving",
    status: "pending",
  },
  {
    id: "sub-21",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Analysis, Judgment, Decision Making",
    status: "pending",
  },
  {
    id: "sub-22",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Visual Memory",
    status: "pending",
  },
  {
    id: "sub-23",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Discrimination, Observation",
    status: "pending",
  },
  {
    id: "sub-24",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Relationship Concepts",
    status: "pending",
  },
  {
    id: "sub-25",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Arithmetical Reasoning and Figural Classification",
    status: "pending",
  },
  {
    id: "sub-26",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Embedded Figures",
    status: "pending",
  },
  {
    id: "sub-27",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Pattern Completion",
    status: "pending",
  },
  {
    id: "sub-28",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Figure Classification",
    status: "pending",
  },
  {
    id: "sub-29",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Odd One Out",
    status: "pending",
  },
  {
    id: "sub-30",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Punched hole/pattern-folding & unfolding",
    status: "pending",
  },
  {
    id: "sub-31",
    categoryName: "SSC CGL",
    topicName: "General Intelligence & Reasoning",
    subtopicName: "Figural Pattern-folding and completion",
    status: "pending",
  },
];

export default function SubtopicListPage() {
  const [subtopics, setSubtopics] = useState<Subtopic[]>(initialSubtopics);

  // 3. Handler function to update the status of a subtopic
  const handleStatusChange = (
    subtopicId: string,
    newStatus: "pending" | "in_progress" | "completed"
  ) => {
    setSubtopics((currentSubtopics) =>
      currentSubtopics.map((subtopic) =>
        subtopic.id === subtopicId
          ? { ...subtopic, status: newStatus }
          : subtopic
      )
    );
  };

  // Helper to get colors for status badges
  const getStatusColor = (status: Subtopic["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Subtopic Status
          </h1>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-blue-500" />
                General Intelligence & Reasoning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Category</TableHead>
                    <TableHead className="w-1/4">Topic</TableHead>
                    <TableHead className="w-1/2">Subtopic</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Update Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subtopics.map((subtopic) => (
                    <TableRow key={subtopic.id}>
                      <TableCell className="font-medium">
                        {subtopic.categoryName}
                      </TableCell>
                      <TableCell>{subtopic.topicName}</TableCell>
                      <TableCell>{subtopic.subtopicName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(subtopic.status)}
                        >
                          {subtopic.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={subtopic.status}
                          onValueChange={(newStatus: Subtopic["status"]) =>
                            handleStatusChange(subtopic.id, newStatus)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
