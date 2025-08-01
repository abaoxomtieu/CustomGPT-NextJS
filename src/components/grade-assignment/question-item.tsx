import { useState } from "react";
import { Question, GradeResult } from "@/types/grade-assignment";
import { GeneratedAnswer, gradeAssignmentApiService } from "@/services/grade-assignment-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle,
  Edit3,
  Save,
  X,
  Lightbulb,
  Target,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import FileUpload from "./file-upload";
import MarkdownRenderer from "@/components/markdown-render";
import { toast } from "sonner";

interface QuestionItemProps {
  question: Question;
  index: number;
  compactView: boolean;
  isEditing: boolean;
  hasFile: boolean;
  generatedAnswer?: GeneratedAnswer;
  isGeneratingAnswer: boolean;
  isAnswerExpanded: boolean;
  isGrading: boolean;
  onUpdateQuestion: (questionId: string, text: string) => void;
  onRemoveQuestion: (questionId: string, index: number) => void;
  onToggleEdit: (questionId: string | null) => void;
  onFileUpload: (questionIndex: number, file: File | null) => void;
  onGenerateAnswer: (question: Question) => void;
  onAddQuestion: (index: number) => void;
  onToggleAnswerExpansion: (questionId: string, expanded: boolean) => void;
  setGradeResults: (setter: (prev: GradeResult[] | null) => GradeResult[] | null) => void;
  setIsGrading: (loading: boolean) => void;
  uploadedFile?: File;
}

const QuestionItem = ({
  question,
  index,
  compactView,
  isEditing,
  hasFile,
  generatedAnswer,
  isGeneratingAnswer,
  isAnswerExpanded,
  isGrading,
  onUpdateQuestion,
  onRemoveQuestion,
  onToggleEdit,
  onFileUpload,
  onGenerateAnswer,
  onAddQuestion,
  onToggleAnswerExpansion,
  setGradeResults,
  setIsGrading,
  uploadedFile,
}: QuestionItemProps) => {
  
  const handleGradeQuestion = async () => {
    const file = uploadedFile;
    if (!file || !question.text) return;

    setIsGrading(true);
    try {
      const { data: results, error } =
        await gradeAssignmentApiService.gradeAssignment(
          [question.text],
          [file]
        );

      if (error) throw new Error(error);
      if (!results) throw new Error("Không nhận được kết quả từ server");

      const newResult: GradeResult = {
        question: question.text,
        file_name: file.name,
        result: results[0],
      };

      setGradeResults((prev) => {
        const existing = prev || [];
        const existingIndex = existing.findIndex(
          (r) => r.question === question.text
        );
        if (existingIndex >= 0) {
          const updated = [...existing];
          updated[existingIndex] = newResult;
          return updated;
        } else {
          return [...existing, newResult];
        }
      });

      toast.success("Chấm điểm câu hỏi thành công!");
    } catch (error) {
      console.error("❌ Error grading question:", error);
      toast.error(`Có lỗi xảy ra: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
    } finally {
      setIsGrading(false);
    }
  };

  if (compactView) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Question Info & Controls - Mobile: Full width, Desktop: 8 cols */}
            <div className="lg:col-span-8 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Câu {index + 1}
                  </Badge>
                  {question.type && (
                    <Badge variant="outline" className="text-xs">
                      {question.type}
                    </Badge>
                  )}
                  {hasFile && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Có file
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => onToggleEdit(isEditing ? null : question.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    {isEditing ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Edit3 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => onRemoveQuestion(question.id, index)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Question Content */}
              {isEditing ? (
                <textarea
                  value={question.text}
                  onChange={(e) => onUpdateQuestion(question.id, e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full p-3 border rounded-md resize-none h-24 text-sm"
                  onBlur={() => onToggleEdit(null)}
                  autoFocus
                />
              ) : (
                <div 
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[60px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => onToggleEdit(question.id)}
                >
                  {question.text ? (
                    <p className="text-sm whitespace-pre-wrap line-clamp-3">
                      {question.text}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Nhấp để thêm nội dung câu hỏi...
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => onGenerateAnswer(question)}
                  disabled={!question.text.trim() || isGeneratingAnswer}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  {isGeneratingAnswer ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Lightbulb className="h-3 w-3 mr-1" />
                  )}
                  <span className="text-xs">
                    {isGeneratingAnswer ? "Tạo..." : "Đáp án"}
                  </span>
                </Button>

                {question.text && uploadedFile && (
                  <Button
                    onClick={handleGradeQuestion}
                    disabled={isGrading}
                    size="sm"
                    className="h-8 bg-blue-600 hover:bg-blue-700"
                  >
                    {isGrading ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Target className="h-3 w-3 mr-1" />
                    )}
                    <span className="text-xs">Chấm</span>
                  </Button>
                )}

                <Button
                  onClick={() => onAddQuestion(index)}
                  variant="ghost"
                  size="sm"
                  className="h-8 border-dashed border"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span className="text-xs">Thêm sau</span>
                </Button>
              </div>

              {/* Generated Answer - Compact */}
              {generatedAnswer && (
                <Collapsible
                  open={isAnswerExpanded}
                  onOpenChange={(open) => onToggleAnswerExpansion(question.id, open)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full h-8 justify-between bg-yellow-50 hover:bg-yellow-100 border border-yellow-200"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-3 w-3 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-800">
                          Đáp án AI
                        </span>
                      </div>
                      {isAnswerExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200 max-h-40 overflow-y-auto">
                      <Tabs defaultValue="answer" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-8">
                          <TabsTrigger value="answer" className="text-xs h-6">
                            Đáp án
                          </TabsTrigger>
                          <TabsTrigger value="reasoning" className="text-xs h-6">
                            Lý do
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="answer" className="mt-2">
                          <div className="prose prose-sm max-w-none text-xs">
                            <MarkdownRenderer content={generatedAnswer.answer} />
                          </div>
                        </TabsContent>
                        <TabsContent value="reasoning" className="mt-2">
                          <div className="prose prose-sm max-w-none text-xs">
                            <MarkdownRenderer content={generatedAnswer.reasoning} />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            {/* File Upload - Mobile: Full width, Desktop: 4 cols */}
            <div className="lg:col-span-4">
              <div className="text-xs font-medium text-gray-600 mb-2">
                📎 Upload bài làm:
              </div>
              <div className="h-32">
                <FileUpload
                  onFileChange={(file) => onFileUpload(index, file)}
                  uploadedFile={uploadedFile || null}
                  accept=".py,.js,.java,.cpp,.c,.txt"
                  placeholder="Chọn file code"
                  className="h-full"
                />
              </div>
              {uploadedFile && (
                <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3" />
                  Sẵn sàng chấm điểm
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed View
  return (
    <Card className="border-l-4 border-l-green-500">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Question Content - Left Side (2/3) */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  Câu {index + 1}
                </span>
                {question.type && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {question.type}
                  </span>
                )}
              </div>
              <Button
                onClick={() => onRemoveQuestion(question.id, index)}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <textarea
              placeholder="Nhập nội dung câu hỏi..."
              className="w-full p-3 border rounded resize-none h-32"
              value={question.text}
              onChange={(e) => onUpdateQuestion(question.id, e.target.value)}
            />

            {/* Generate Answer Button */}
            <div className="flex gap-2">
              <Button
                onClick={() => onGenerateAnswer(question)}
                disabled={!question.text.trim() || isGeneratingAnswer}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {isGeneratingAnswer ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-3 w-3 mr-2" />
                    Tạo đáp án
                  </>
                )}
              </Button>
            </div>

            {/* Display Generated Answer */}
            {generatedAnswer && (
              <Collapsible
                open={isAnswerExpanded}
                onOpenChange={(open) => onToggleAnswerExpansion(question.id, open)}
              >
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full p-3 h-auto justify-between hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-sm">
                          Đáp án được tạo bởi AI
                        </span>
                      </div>
                      {isAnswerExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3">
                    <Tabs defaultValue="answer" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="answer" className="text-xs">
                          Đáp án
                        </TabsTrigger>
                        <TabsTrigger value="reasoning" className="text-xs">
                          Lý do
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="answer" className="mt-3">
                        <div className="max-h-40 overflow-y-auto prose prose-sm max-w-none">
                          <MarkdownRenderer content={generatedAnswer.answer} />
                        </div>
                      </TabsContent>
                      <TabsContent value="reasoning" className="mt-3">
                        <div className="max-h-40 overflow-y-auto prose prose-sm max-w-none">
                          <MarkdownRenderer content={generatedAnswer.reasoning} />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Individual Grading Button */}
            {question.text && uploadedFile && (
              <div className="pt-2 border-t">
                <Button
                  onClick={handleGradeQuestion}
                  disabled={isGrading}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isGrading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Đang chấm...
                    </>
                  ) : (
                    <>
                      <Target className="h-3 w-3 mr-2" />
                      Chấm câu này
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Upload Area - Right Side (1/3) */}
          <div className="col-span-1">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Upload bài làm:
            </div>
            <div className="h-32 overflow-hidden">
              <FileUpload
                onFileChange={(file) => onFileUpload(index, file)}
                uploadedFile={uploadedFile || null}
                accept=".py,.js,.java,.cpp,.c,.txt"
                placeholder="Chọn file code"
                className="h-full"
              />
            </div>
            {uploadedFile && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Sẵn sàng chấm
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionItem;
