"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GradedAssignment, gradedAssignmentService } from "@/services/gradedAssignmentService";

export default function GradedAssignmentsHistory() {
  const [assignments, setAssignments] = useState<GradedAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  console.log("assignments", assignments);
  const fetchAssignments = async () => {
    try {
      const data = await gradedAssignmentService.getAllAssignments();
      setAssignments(data);
    } catch (error) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      await gradedAssignmentService.deleteAssignment(id);
      setAssignments(assignments.filter((assignment) => assignment.id !== id));
      toast.success("Assignment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete assignment");
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Graded Assignments History</h1>
      
      {assignments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No graded assignments found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  {assignment.project_name}
                </CardTitle>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this assignment? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteAssignment(assignment.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Graded on: {format(new Date(assignment.created_at), "PPP")}
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Files:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {assignment.selected_files.map((file, index) => (
                        <li key={index} className="truncate">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Criteria:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {assignment.criterias_list.map((criteria, index) => (
                        <li key={index}>{criteria}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() =>
                      router.push(`/code-grader/history/${assignment.id}`)
                    }
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
