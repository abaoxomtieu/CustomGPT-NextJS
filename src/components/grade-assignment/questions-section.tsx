import { Question, GradeResult } from "@/types/grade-assignment";
import { GeneratedAnswer } from "@/services/grade-assignment-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Maximize2,
  Minimize2,
  Plus,
  Lightbulb,
  Target,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import QuestionItem from "./question-item";

interface QuestionsSectionProps {
  questions: Question[];
  questionFiles: Map<number, File>;
  generatedAnswers: Map<string, GeneratedAnswer>;
  generatingAnswerIds: Set<string>;
  expandedAnswers: Set<string>;
  compactView: boolean;
  editingQuestionId: string | null;
  isGrading: boolean;
  setShowExtractDialog: (show: boolean) => void;
  setCompactView: (compact: boolean) => void;
  onAddQuestion: () => void;
  onUpdateQuestion: (questionId: string, text: string) => void;
  onRemoveQuestion: (questionId: string, index: number) => void;
  onToggleEdit: (questionId: string | null) => void;
  onFileUpload: (questionIndex: number, file: File | null) => void;
  onGenerateAnswer: (question: Question) => void;
  onGenerateAllAnswers: () => void;
  onToggleAnswerExpansion: (questionId: string, expanded: boolean) => void;
  onExpandAllAnswers: () => void;
  onCollapseAllAnswers: () => void;
  onGradeAll: () => void;
  setGradeResults: (setter: (prev: GradeResult[] | null) => GradeResult[] | null) => void;
  setIsGrading: (loading: boolean) => void;
  isLoading: boolean;
}

const QuestionsSection = ({
  questions,
  questionFiles,
  generatedAnswers,
  generatingAnswerIds,
  expandedAnswers,
  compactView,
  editingQuestionId,
  isGrading,
  setShowExtractDialog,
  setCompactView,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onToggleEdit,
  onFileUpload,
  onGenerateAnswer,
  onGenerateAllAnswers,
  onToggleAnswerExpansion,
  onExpandAllAnswers,
  onCollapseAllAnswers,
  onGradeAll,
  setGradeResults,
  setIsGrading,
  isLoading,
}: QuestionsSectionProps) => {
  
  const allAnswersExpanded = Array.from(generatedAnswers.keys()).every((id) =>
    expandedAnswers.has(id)
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Câu Hỏi & Bài Làm ({questions.length})
          </CardTitle>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Extract Button */}
            <Button
              onClick={() => setShowExtractDialog(true)}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-1" />
              {isLoading ? "Trích xuất..." : "Trích xuất"}
            </Button>

            {/* View Toggle */}
            <Button
              onClick={() => setCompactView(!compactView)}
              variant="outline"
              size="sm"
            >
              {compactView ? (
                <>
                  <Maximize2 className="h-4 w-4 mr-1" />
                  Chi tiết
                </>
              ) : (
                <>
                  <Minimize2 className="h-4 w-4 mr-1" />
                  Gọn
                </>
              )}
            </Button>

            {/* Add Question */}
            <Button
              onClick={onAddQuestion}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm câu hỏi
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Empty State */}
        {questions.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Chưa có câu hỏi nào
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Bắt đầu bằng cách thêm câu hỏi thủ công hoặc trích xuất từ hình ảnh
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={onAddQuestion}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm câu hỏi thủ công
              </Button>
              <Button
                onClick={() => setShowExtractDialog(true)}
                variant="outline"
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Trích xuất từ hình ảnh
              </Button>
            </div>
          </div>
        )}

        {/* Questions List */}
        {questions.map((question, index) => (
          <QuestionItem
            key={question.id}
            question={question}
            index={index}
            compactView={compactView}
            isEditing={editingQuestionId === question.id}
            hasFile={questionFiles.has(index)}
            generatedAnswer={generatedAnswers.get(question.id)}
            isGeneratingAnswer={generatingAnswerIds.has(question.id)}
            isAnswerExpanded={expandedAnswers.has(question.id)}
            isGrading={isGrading}
            onUpdateQuestion={onUpdateQuestion}
            onRemoveQuestion={onRemoveQuestion}
            onToggleEdit={onToggleEdit}
            onFileUpload={onFileUpload}
            onGenerateAnswer={onGenerateAnswer}
            onAddQuestion={(idx) => onAddQuestion()}
            onToggleAnswerExpansion={onToggleAnswerExpansion}
            setGradeResults={setGradeResults}
            setIsGrading={setIsGrading}
            uploadedFile={questionFiles.get(index)}
          />
        ))}

        {/* Bulk Actions */}
        {questions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            {/* Generate All Answers */}
            {questions.some((q) => q.text.trim()) && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={onGenerateAllAnswers}
                  disabled={generatingAnswerIds.size > 0}
                  variant="outline"
                  className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                >
                  {generatingAnswerIds.size > 0 ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Tạo đáp án...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Tạo đáp án ({questions.filter((q) => q.text.trim()).length})
                    </>
                  )}
                </Button>

                {/* Answer Controls */}
                {Array.from(generatedAnswers.keys()).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={allAnswersExpanded ? onCollapseAllAnswers : onExpandAllAnswers}
                  >
                    {allAnswersExpanded ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Thu gọn</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Mở rộng</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Grade All Button */}
            {questionFiles.size > 0 && (
              <div className="flex-1 flex justify-end">
                <Button
                  onClick={onGradeAll}
                  disabled={isGrading || questionFiles.size === 0}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {isGrading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang chấm...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Chấm tất cả ({questionFiles.size}/{questions.length})
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionsSection;
