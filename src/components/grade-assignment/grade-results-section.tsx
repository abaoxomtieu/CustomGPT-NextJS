import { GradeResult } from "@/types/grade-assignment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Target,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import MarkdownRenderer from "@/components/markdown-render";

interface GradeResultsSectionProps {
  gradeResults: GradeResult[];
  expandedResults: Set<number>;
  onToggleResultExpansion: (index: number, expanded: boolean) => void;
  onExpandAllResults: () => void;
  onCollapseAllResults: () => void;
}

const GradeResultsSection = ({
  gradeResults,
  expandedResults,
  onToggleResultExpansion,
  onExpandAllResults,
  onCollapseAllResults,
}: GradeResultsSectionProps) => {
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Kết Quả Chấm Điểm ({gradeResults.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExpandAllResults}
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              Mở rộng
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCollapseAllResults}
            >
              <Minimize2 className="h-3 w-3 mr-1" />
              Thu gọn
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {gradeResults.map((result, index) => (
          <Collapsible
            key={index}
            open={expandedResults.has(index)}
            onOpenChange={(open) => onToggleResultExpansion(index, open)}
          >
            <Card className="border-l-4 border-l-purple-500">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full p-4 h-auto justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3 text-left">
                    <Badge variant="secondary" className="text-xs">
                      Câu {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.question.slice(0, 80)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        📎 {result.file_name}
                      </p>
                    </div>
                  </div>
                  {expandedResults.has(index) ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="p-4 pt-0">
                  <Tabs defaultValue="result" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="result" className="text-xs">
                        Kết quả AI
                      </TabsTrigger>
                      <TabsTrigger value="question" className="text-xs">
                        Câu hỏi gốc
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="result" className="mt-3">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <MarkdownRenderer
                            content={
                              typeof result.result === "string"
                                ? result.result
                                : JSON.stringify(result.result, null, 2)
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="question" className="mt-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border max-h-60 overflow-y-auto">
                        <MarkdownRenderer content={result.question} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};

export default GradeResultsSection;
