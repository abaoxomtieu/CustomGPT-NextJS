"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";
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

export default function CodeGraderHistoryPage() {
  const t = useTranslations("codeGrader.history");
  const [assignments, setAssignments] = useState<GradedAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gradedAssignmentService.getAllAssignments();
      setAssignments(data);
    } catch (error) {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await gradedAssignmentService.deleteAssignment(id);
      toast.success(t("deleteSuccess"));
      await fetchAssignments();
    } catch (error) {
      toast.error(t("deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/code-grader")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToGrader")}
          </Button>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">{t("noAssignments")}</h2>
          <p className="text-muted-foreground mb-6">{t("noAssignmentsDesc")}</p>
          <Button
            onClick={() => router.push("/code-grader")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("startGrading")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
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
                        <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("deleteConfirmDesc")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(assignment.id)}
                          disabled={deletingId === assignment.id}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          {deletingId === assignment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            t("delete")
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignment.project_description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("description")}
                      </p>
                      <p className="text-sm bg-muted p-2 rounded">
                        {assignment.project_description}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("gradedAt")}
                    </p>
                    <p className="text-sm">
                      {format(new Date(assignment.created_at), "PPp")}
                    </p>
                  </div>

                  {assignment.grade_result && assignment.grade_result.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("totalFiles")}
                      </p>
                      <p className="text-sm font-semibold">
                        {assignment.grade_result.length} {t("files")}
                      </p>
                    </div>
                  )}

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