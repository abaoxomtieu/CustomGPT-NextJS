"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import CriteriaInput from "./criteria-input";

interface GradingPanelProps {
  criteria: string[];
  setCriteria: React.Dispatch<React.SetStateAction<string[]>>;
  folderCriteria: string;
  setFolderCriteria: React.Dispatch<React.SetStateAction<string>>;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  onGenerateDescription: () => void;
  onGradeCode: () => void;
  onLoadFrontendCriteria: () => void;
  onLoadBackendCriteria: () => void;
  isGenerateDisabled: boolean;
  isGradeDisabled: boolean;
  gradeLoading: boolean;
}

export default function GradingPanel({
  criteria,
  setCriteria,
  folderCriteria,
  setFolderCriteria,
  projectDescription,
  setProjectDescription,
  onGenerateDescription,
  onGradeCode,
  onLoadFrontendCriteria,
  onLoadBackendCriteria,
  isGenerateDisabled,
  isGradeDisabled,
  gradeLoading,
}: GradingPanelProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <CardTitle className="text-base font-medium">
          Grading Criteria
        </CardTitle>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadFrontendCriteria}
            type="button"
            className="h-7 text-xs"
          >
            FE Criteria
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadBackendCriteria}
            type="button"
            className="h-7 text-xs"
          >
            BE Criteria
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="flex gap-2">
          <Textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Enter project description (optional)"
            className="rounded-lg text-sm"
            rows={3}
          />
          <Button
            onClick={onGenerateDescription}
            disabled={isGenerateDisabled}
            type="button"
            className="h-7 text-xs whitespace-nowrap"
          >
            Generate
          </Button>
        </div>
        <div className="space-y-3">
          <CriteriaInput
            criterias={criteria}
            folderCriteria={folderCriteria}
            setFolderCriteria={setFolderCriteria}
            setCriterias={setCriteria}
          />
          <Button
            type="button"
            size="lg"
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-sm h-9"
            onClick={onGradeCode}
            disabled={isGradeDisabled || gradeLoading}
          >
            {gradeLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-3.5 h-3.5" />
                Grading...
              </span>
            ) : (
              "Grade Selected Files"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
