"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { GradedAssignment, gradedAssignmentService } from "@/services/gradedAssignmentService";
import GradingResultView from "@/components/grade-code/grading-result";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { marked } from "marked";
import { FolderOpen } from "lucide-react";

export default function GradedAssignmentDetail() {
  const [assignment, setAssignment] = useState<GradedAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFolderStructureModalVisible, setIsFolderStructureModalVisible] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!params.id) {
        toast.error("Invalid assignment ID");
        setLoading(false);
        return;
      }

      try {
        const data = await gradedAssignmentService.getAssignmentById(params.id as string);
        setAssignment(data);
      } catch (error) {
        toast.error("Failed to load assignment details");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Assignment Not Found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/code-grader")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to History
        </Button>

        <h1 className="text-3xl font-bold mb-8">{assignment.project_name}</h1>

        {assignment.folder_structure_criteria && (
          <>
            <Button
              variant="default"
              onClick={() => setIsFolderStructureModalVisible(true)}
              className="mb-4 flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-blue-500" />
              View Folder Structure Evaluation
            </Button>

            <Dialog
              open={isFolderStructureModalVisible}
              onOpenChange={setIsFolderStructureModalVisible}
            >
              <DialogContent className="overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <FolderOpen className="text-blue-500" />
                    <span className="font-semibold">
                      Folder Structure Evaluation
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="prose max-w-none break-words">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked(assignment.folder_structure_criteria),
                    }}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => setIsFolderStructureModalVisible(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {assignment.grade_result && assignment.grade_result.length > 0 && (
          <GradingResultView
            results={assignment.grade_result}
            gradeFolderStructureResult={assignment.folder_structure_criteria}
          />
        )}
      </div>
    </div>
  );
} 