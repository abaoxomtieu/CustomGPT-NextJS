"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import CriteriaInput from "./criteria-input";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("codeGrader.gradingPanel");
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-[500px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3 flex-shrink-0">
        <CardTitle className="text-sm font-medium">
          <div className="flex flex-col">
            <span>{t("title")}</span>
            <span className="text-xs text-foreground/50 font-normal">
              {t("criteriaCount", {
                count: criteria.filter((c) => c.trim() !== "").length,
              })}
            </span>
          </div>
        </CardTitle>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadFrontendCriteria}
            type="button"
            className="h-7 text-xs"
          >
            {t("feCriteria")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadBackendCriteria}
            type="button"
            className="h-7 text-xs"
          >
            {t("beCriteria")}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 flex-1 flex flex-col overflow-hidden">
        <div className="flex gap-2 mb-3 flex-shrink-0">
          <Textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder={t("projectDescriptionPlaceholder")}
            className="rounded-lg text-sm"
            rows={3}
          />
          <Button
            onClick={onGenerateDescription}
            disabled={isGenerateDisabled}
            type="button"
            className="h-7 text-xs whitespace-nowrap"
          >
            {t("generate")}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto mb-3">
          <CriteriaInput
            criterias={criteria}
            folderCriteria={folderCriteria}
            setFolderCriteria={setFolderCriteria}
            setCriterias={setCriteria}
          />
        </div>

        <div className="pt-3 border-t border-foreground/10 flex-shrink-0">
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
                {t("grading")}
              </span>
            ) : (
              t("gradeButton")
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
