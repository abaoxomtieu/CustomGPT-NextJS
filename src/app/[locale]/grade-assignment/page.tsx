"use client";

import { useState } from "react";
import "./grade-assignment.css";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ImageIcon,
  FileText,
  Users,
  Target,
  BookOpen,
  Upload,
  Lightbulb,
  Loader2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  CheckCircle,
  Clock,
  Star,
  Zap,
  GraduationCap,
  FileCheck,
  Sparkles,
  Plus,
  X,
  Edit3,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import ExtractQuestionsDialog from "@/components/grade-assignment/extract-questions-dialog";
import FileUpload from "@/components/grade-assignment/file-upload";
import MarkdownRenderer from "@/components/markdown-render";
import {
  gradeAssignmentApiService,
  GeneratedAnswer,
} from "@/services/grade-assignment-service";
import { toast } from "sonner";

export interface Question {
  id: string;
  text: string;
  type?: string;
  difficulty?: string;
}

export interface ExtractedData {
  extracted_text: string;
  split_questions: string[];
  total_images: number;
  image_names: string[];
  saved_combined_image: string;
}

export interface GradeResult {
  question: string;
  file_name: string;
  result: any; // API response structure
}

const GradeAssignmentPage = () => {
  const t = useTranslations("gradeAssignment");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [questionFiles, setQuestionFiles] = useState<Map<number, File>>(
    new Map()
  );
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResults, setGradeResults] = useState<GradeResult[] | null>(null);
  const [showExtractDialog, setShowExtractDialog] = useState(false);

  // Initialize with empty questions list to allow manual question creation
  const [questions, setQuestions] = useState<Question[]>([]);

  // Generated answers state
  const [generatedAnswers, setGeneratedAnswers] = useState<
    Map<string, GeneratedAnswer>
  >(new Map());
  const [generatingAnswerIds, setGeneratingAnswerIds] = useState<Set<string>>(
    new Set()
  );

  // UI state for collapsibles and expandable content
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(
    new Set()
  );
  const [expandedResults, setExpandedResults] = useState<Set<number>>(
    new Set()
  );
  
  // Compact view states
  const [compactView, setCompactView] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const handleExtractComplete = (data: ExtractedData) => {
    console.log("Extracted data received:", data);
    console.log("Split questions type:", typeof data.split_questions);
    console.log("Split questions value:", data.split_questions);
    setExtractedData(data);

    // Convert string[] to Question[]
    const questionsArray: Question[] = (data.split_questions || []).map(
      (text, index) => ({
        id: `extracted-${Date.now()}-${index}`,
        text,
        type: "extracted",
      })
    );
    setQuestions(questionsArray);

    setIsLoading(false);
    // Reset files when new data is extracted
    setQuestionFiles(new Map());
    setGradeResults(null);
  };

  const handleExtractStart = () => {
    setIsLoading(true);
    setExtractedData(null);
    setQuestions([]);
    setQuestionFiles(new Map());
    setGradeResults(null);
  };

  const handleQuestionsUpdate = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        split_questions: updatedQuestions.map((q) => q.text),
      });
    }
    // Reset files when questions change
    setQuestionFiles(new Map());
    setGradeResults(null);
  };

  const handleFileUpload = (questionIndex: number, file: File | null) => {
    setQuestionFiles((prev) => {
      const newMap = new Map(prev);
      if (file) {
        newMap.set(questionIndex, file);
      } else {
        newMap.delete(questionIndex);
      }
      return newMap;
    });
  };

  const submitGrading = async () => {
    if (questions.length === 0 || questionFiles.size === 0) {
      console.error("Vui lòng upload ít nhất một file để chấm điểm");
      toast.error("Vui lòng upload ít nhất một file để chấm điểm");
      return;
    }

    setIsGrading(true);
    try {
      const questionsWithFiles: string[] = [];
      const filesArray: File[] = [];

      // Chỉ lấy những câu hỏi có file upload
      questionFiles.forEach((file, index) => {
        if (questions[index]) {
          questionsWithFiles.push(questions[index].text);
          filesArray.push(file);
        }
      });

      console.log(
        "🚀 Submitting grading request with",
        questionsWithFiles.length,
        "questions"
      );

      // Sử dụng service thay vì gọi API trực tiếp
      const { data: results, error } =
        await gradeAssignmentApiService.gradeAssignment(
          questionsWithFiles,
          filesArray
        );

      if (error) {
        throw new Error(error);
      }

      if (!results) {
        throw new Error("Không nhận được kết quả từ server");
      }

      // Map results with questions
      const mappedResults: GradeResult[] = questionsWithFiles.map(
        (question, index) => ({
          question,
          file_name: filesArray[index].name,
          result: results[index],
        })
      );

      setGradeResults(mappedResults);
      console.log("✅ Chấm điểm thành công!");
      toast.success("Chấm điểm thành công!");
    } catch (error) {
      console.error("❌ Error grading assignment:", error);
      toast.error(
        `Có lỗi xảy ra khi chấm điểm bài tập: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`
      );
    } finally {
      setIsGrading(false);
    }
  };

  // Generate answer for a single question
  const generateAnswerForQuestion = async (question: Question) => {
    if (!question.text.trim()) {
      toast.error("Vui lòng nhập nội dung câu hỏi trước khi tạo đáp án");
      return;
    }

    setGeneratingAnswerIds((prev) => new Set(prev).add(question.id));
    try {
      const { data, error } = await gradeAssignmentApiService.generateAnswer([
        question.text,
      ]);
      if (error) {
        throw new Error(error);
      }
      if (data && data.length > 0) {
        setGeneratedAnswers((prev) => new Map(prev).set(question.id, data[0]));
        toast.success("Tạo đáp án thành công!");
      }
    } catch (error) {
      console.error("Error generating answer:", error);
      toast.error(
        `Có lỗi xảy ra: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`
      );
    } finally {
      setGeneratingAnswerIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(question.id);
        return newSet;
      });
    }
  };

  // Generate answers for all questions
  const generateAnswersForAllQuestions = async () => {
    const questionsWithText = questions.filter((q) => q.text.trim());
    if (questionsWithText.length === 0) {
      toast.error(
        "Vui lòng nhập nội dung cho ít nhất một câu hỏi trước khi tạo đáp án"
      );
      return;
    }

    // Set all question IDs as generating
    setGeneratingAnswerIds(new Set(questionsWithText.map((q) => q.id)));

    try {
      const questionTexts = questionsWithText.map((q) => q.text);
      const { data, error } = await gradeAssignmentApiService.generateAnswer(
        questionTexts
      );
      if (error) {
        throw new Error(error);
      }
      if (data) {
        const newAnswers = new Map(generatedAnswers);
        questionsWithText.forEach((question, index) => {
          // Find the answer for this specific question
          const answerForQuestion = data.find(
            (answer) => answer.exercise_question === question.text
          );
          if (answerForQuestion) {
            newAnswers.set(question.id, answerForQuestion);
          }
        });
        setGeneratedAnswers(newAnswers);
        toast.success(
          `Tạo đáp án thành công cho ${questionsWithText.length} câu hỏi!`
        );
      }
    } catch (error) {
      console.error("Error generating answers for all questions:", error);
      toast.error(
        `Có lỗi xảy ra: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`
      );
    } finally {
      setGeneratingAnswerIds(new Set());
    }
  };

  // Helper functions for progress tracking
  const getProgressStep = () => {
    if (gradeResults) return 4;
    if (questionFiles.size > 0) return 3;
    if (questions.length > 0) return 2;
    if (extractedData) return 1;
    return 0;
  };

  const getProgressValue = () => {
    return (getProgressStep() / 4) * 100;
  };

  // Add/Remove questions functions
  const addQuestion = (index?: number) => {
    const newQuestion: Question = {
      id: `manual-${Date.now()}`,
      text: "",
      type: "manual",
    };
    
    if (index !== undefined) {
      const updated = [...questions];
      updated.splice(index + 1, 0, newQuestion);
      setQuestions(updated);
    } else {
      setQuestions([...questions, newQuestion]);
    }
    
    // Auto-focus on new question
    setEditingQuestionId(newQuestion.id);
  };

  const removeQuestion = (questionId: string, index: number) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    const newFiles = new Map(questionFiles);
    newFiles.delete(index);
    setQuestionFiles(newFiles);
    setGeneratedAnswers(prev => {
      const newMap = new Map(prev);
      newMap.delete(questionId);
      return newMap;
    });
  };

  const updateQuestion = (questionId: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, text } : q
    ));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section - Simplified */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Grading</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-blue-900 dark:text-blue-100">
            Hệ Thống Chấm Bài Tập Tự Động
          </h1>
          <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300 max-w-xl mx-auto">
            AI hỗ trợ chấm điểm bài tập lập trình một cách thông minh và chính xác
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Start Guide */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Quy trình:</strong> Trích xuất câu hỏi → Tạo đáp án AI → Upload bài làm → Chấm điểm tự động
          </AlertDescription>
        </Alert>

        {/* Main Questions Section - Optimized */}
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
                  onClick={() => addQuestion()}
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
                    onClick={() => addQuestion()}
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
              <div key={question.id} className="space-y-3">
                {compactView ? (
                  // Compact View
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
                              {questionFiles.has(index) && (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Có file
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={() => 
                                  setEditingQuestionId(
                                    editingQuestionId === question.id ? null : question.id
                                  )
                                }
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                {editingQuestionId === question.id ? (
                                  <Save className="h-4 w-4" />
                                ) : (
                                  <Edit3 className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                onClick={() => removeQuestion(question.id, index)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Question Content */}
                          {editingQuestionId === question.id ? (
                            <textarea
                              value={question.text}
                              onChange={(e) => updateQuestion(question.id, e.target.value)}
                              placeholder="Nhập nội dung câu hỏi..."
                              className="w-full p-3 border rounded-md resize-none h-24 text-sm"
                              onBlur={() => setEditingQuestionId(null)}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[60px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              onClick={() => setEditingQuestionId(question.id)}
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
                              onClick={() => generateAnswerForQuestion(question)}
                              disabled={!question.text.trim() || generatingAnswerIds.has(question.id)}
                              variant="outline"
                              size="sm"
                              className="h-8"
                            >
                              {generatingAnswerIds.has(question.id) ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Lightbulb className="h-3 w-3 mr-1" />
                              )}
                              <span className="text-xs">
                                {generatingAnswerIds.has(question.id) ? "Tạo..." : "Đáp án"}
                              </span>
                            </Button>

                            {question.text && questionFiles.get(index) && (
                              <Button
                                onClick={async () => {
                                  const file = questionFiles.get(index);
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
                                }}
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
                              onClick={() => addQuestion(index)}
                              variant="ghost"
                              size="sm"
                              className="h-8 border-dashed border"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              <span className="text-xs">Thêm sau</span>
                            </Button>
                          </div>

                          {/* Generated Answer - Compact */}
                          {generatedAnswers.has(question.id) && (
                            <Collapsible
                              open={expandedAnswers.has(question.id)}
                              onOpenChange={(open) => {
                                setExpandedAnswers((prev) => {
                                  const newSet = new Set(prev);
                                  if (open) {
                                    newSet.add(question.id);
                                  } else {
                                    newSet.delete(question.id);
                                  }
                                  return newSet;
                                });
                              }}
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
                                  {expandedAnswers.has(question.id) ? (
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
                                        <MarkdownRenderer
                                          content={generatedAnswers.get(question.id)!.answer}
                                        />
                                      </div>
                                    </TabsContent>
                                    <TabsContent value="reasoning" className="mt-2">
                                      <div className="prose prose-sm max-w-none text-xs">
                                        <MarkdownRenderer
                                          content={generatedAnswers.get(question.id)!.reasoning}
                                        />
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
                              onFileChange={(file) => {
                                const newFiles = new Map(questionFiles);
                                if (file) {
                                  newFiles.set(index, file);
                                } else {
                                  newFiles.delete(index);
                                }
                                setQuestionFiles(newFiles);
                              }}
                              uploadedFile={questionFiles.get(index) || null}
                              accept=".py,.js,.java,.cpp,.c,.txt"
                              placeholder="Chọn file code"
                              className="h-full"
                            />
                          </div>
                          {questionFiles.get(index) && (
                            <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                              <CheckCircle className="h-3 w-3" />
                              Sẵn sàng chấm điểm
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Detailed View (original layout but cleaner)
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
                              onClick={() => removeQuestion(question.id, index)}
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
                            onChange={(e) => updateQuestion(question.id, e.target.value)}
                          />

                          {/* Generate Answer Button */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => generateAnswerForQuestion(question)}
                              disabled={!question.text.trim() || generatingAnswerIds.has(question.id)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              {generatingAnswerIds.has(question.id) ? (
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
                          {generatedAnswers.has(question.id) && (
                            <Collapsible
                              open={expandedAnswers.has(question.id)}
                              onOpenChange={(open) => {
                                setExpandedAnswers((prev) => {
                                  const newSet = new Set(prev);
                                  if (open) {
                                    newSet.add(question.id);
                                  } else {
                                    newSet.delete(question.id);
                                  }
                                  return newSet;
                                });
                              }}
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
                                    {expandedAnswers.has(question.id) ? (
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
                                        <MarkdownRenderer
                                          content={generatedAnswers.get(question.id)!.answer}
                                        />
                                      </div>
                                    </TabsContent>
                                    <TabsContent value="reasoning" className="mt-3">
                                      <div className="max-h-40 overflow-y-auto prose prose-sm max-w-none">
                                        <MarkdownRenderer
                                          content={generatedAnswers.get(question.id)!.reasoning}
                                        />
                                      </div>
                                    </TabsContent>
                                  </Tabs>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          )}

                          {/* Individual Grading Button */}
                          {question.text && questionFiles.get(index) && (
                            <div className="pt-2 border-t">
                              <Button
                                onClick={async () => {
                                  const file = questionFiles.get(index);
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
                                }}
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
                              onFileChange={(file) => {
                                const newFiles = new Map(questionFiles);
                                if (file) {
                                  newFiles.set(index, file);
                                } else {
                                  newFiles.delete(index);
                                }
                                setQuestionFiles(newFiles);
                              }}
                              uploadedFile={questionFiles.get(index) || null}
                              accept=".py,.js,.java,.cpp,.c,.txt"
                              placeholder="Chọn file code"
                              className="h-full"
                            />
                          </div>
                          {questionFiles.get(index) && (
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Sẵn sàng chấm
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}

            {/* Bulk Actions */}
            {questions.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                {/* Generate All Answers */}
                {questions.some((q) => q.text.trim()) && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={generateAnswersForAllQuestions}
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
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allAnswerIds = Array.from(generatedAnswers.keys());
                            const allExpanded = allAnswerIds.every((id) =>
                              expandedAnswers.has(id)
                            );
                            if (allExpanded) {
                              setExpandedAnswers(new Set());
                            } else {
                              setExpandedAnswers(new Set(allAnswerIds));
                            }
                          }}
                        >
                          {Array.from(generatedAnswers.keys()).every((id) =>
                            expandedAnswers.has(id)
                          ) ? (
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
                      </>
                    )}
                  </div>
                )}

                {/* Grade All Button */}
                {questionFiles.size > 0 && (
                  <div className="flex-1 flex justify-end">
                    <Button
                      onClick={submitGrading}
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

        {/* Grade Results Card - Simplified */}
        {gradeResults && gradeResults.length > 0 && (
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
                    onClick={() => {
                      setExpandedResults(
                        new Set(Array.from({ length: gradeResults.length }, (_, i) => i))
                      );
                    }}
                  >
                    <Maximize2 className="h-3 w-3 mr-1" />
                    Mở rộng
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedResults(new Set())}
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
                  onOpenChange={(open) => {
                    setExpandedResults((prev) => {
                      const newSet = new Set(prev);
                      if (open) {
                        newSet.add(index);
                      } else {
                        newSet.delete(index);
                      }
                      return newSet;
                    });
                  }}
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
        )}

        {/* Quick Stats */}
        {(extractedData || questions.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {questions.length}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300">Câu hỏi</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-lg font-bold text-green-900 dark:text-green-100">
                {questionFiles.size}
              </div>
              <div className="text-xs text-green-600 dark:text-green-300">Đã upload</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <div className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                {generatedAnswers.size}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-300">Đáp án AI</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {gradeResults?.length || 0}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-300">Đã chấm</div>
            </div>
          </div>
        )}
      </div>

      {/* Extract Questions Dialog */}
      <ExtractQuestionsDialog
        open={showExtractDialog}
        onOpenChange={setShowExtractDialog}
        onExtractComplete={handleExtractComplete}
        onExtractStart={handleExtractStart}
        isLoading={isLoading}
      />
    </div>
  );
};

export default GradeAssignmentPage;