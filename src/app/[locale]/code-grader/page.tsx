"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Trash2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
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
import {
  GradedAssignment,
  gradedAssignmentService,
} from "@/services/gradedAssignmentService";
import { useGrading } from "@/hooks/use-grading";

export default function CodeGraderHistoryPage() {
  const t = useTranslations("codeGrader");
  const [assignments, setAssignments] = useState<GradedAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { gradeResult }  = useGrading({
    selectedFiles: [],
    projectDescription: "",
  });

  // Handler functions
  const handleExtensionChange = useCallback((value: string[]) => {
    // Implementation needed
  }, []);

  const handleFileSelection = useCallback((files: string[]) => {
    // Implementation needed
  }, []);

  const handleFetchFileTree = useCallback(() => {
    // Implementation needed
  }, []);

  const handleGenerateDescription = useCallback(() => {
    // Implementation needed
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await gradedAssignmentService.getAllAssignments();
      setAssignments(data);
    } catch (error) {
      toast.error(t("messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      await gradedAssignmentService.deleteAssignment(id);
      setAssignments(assignments.filter((assignment) => assignment.id !== id));
      toast.success(t("messages.deleteSuccess"));
    } catch (error) {
      toast.error(t("messages.deleteError"));
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button
          onClick={() => router.push("/code-grader/grade")}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("newGrading")}
        </Button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{t("noAssignmentsFound")}</p>
          <Button
            onClick={() => router.push("/code-grader/grade")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("createFirstAssignment")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="hover:shadow-md transition-shadow border border-foreground/10"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-medium line-clamp-2 flex-1 mr-2">
                    {assignment.project_name}
                  </CardTitle>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteAssignment")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("deleteConfirm")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAssignment(assignment.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          {t("delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(assignment.created_at), "MMM dd, yyyy")}
                </p>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-foreground/80 mb-1">
                      {t("files")} ({assignment.selected_files.length})
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {assignment.selected_files
                        .slice(0, 2)
                        .map((file, index) => (
                          <div key={index} className="truncate">
                            {file.split("/").pop()}
                          </div>
                        ))}
                      {assignment.selected_files.length > 2 && (
                        <div className="text-muted-foreground/60">
                          +{assignment.selected_files.length - 2} {t("more")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-foreground/80 mb-1">
                      {t("criteria")} ({assignment.criterias_list.length})
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {assignment.criterias_list
                        .slice(0, 1)
                        .map((criteria, index) => (
                          <div key={index} className="truncate">
                            {criteria.length > 40
                              ? criteria.substring(0, 40) + "..."
                              : criteria}
                          </div>
                        ))}
                      {assignment.criterias_list.length > 1 && (
                        <div className="text-muted-foreground/60">
                          +{assignment.criterias_list.length - 1} {t("more")}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 h-7 text-xs"
                    onClick={() =>
                      router.push(`/code-grader/history/${assignment.id}`)
                    }
                  >
                    {t("viewDetails")}
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
