"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ImageIcon,
  FileText,
  Users,
  Target,
  BookOpen,
  Upload,
} from "lucide-react";
import ImageUploadDropzone from "@/components/grade-assignment/image-upload-dropzone";
import ExtractedTextDisplay from "@/components/grade-assignment/extracted-text-display";
import QuestionsList from "@/components/grade-assignment/questions-list";
import ExtractQuestionsDialog from "@/components/grade-assignment/extract-questions-dialog";
import FileUpload from "@/components/grade-assignment/file-upload";
import MarkdownRenderer from "@/components/markdown-render";
import { gradeAssignmentApiService } from "@/services/grade-assignment-service";

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
      alert("Vui lòng upload ít nhất một file để chấm điểm");
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
      alert("Chấm điểm thành công!");
    } catch (error) {
      console.error("❌ Error grading assignment:", error);
      alert(
        `Có lỗi xảy ra khi chấm điểm bài tập: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`
      );
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl">
      {/* Header with Feature Description */}
      <div className="mb-6 sm:mb-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            🎯 Hệ Thống Chấm Bài Tập Tự Động
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-4">
            AI hỗ trợ chấm điểm bài tập lập trình một cách thông minh và chính
            xác
          </p>
        </div>

        {/* Feature Description Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <ImageIcon className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Trích Xuất Đề Bài
                </h3>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Upload hình ảnh đề bài, AI sẽ tự động nhận dạng và tách từng câu
                hỏi riêng biệt
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Quản Lý Linh Hoạt
                </h3>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                Tạo câu hỏi thủ công, chỉnh sửa, và đính kèm file bài làm cho
                từng câu hỏi
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                  Chấm Điểm AI
                </h3>
              </div>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                AI phân tích code và đưa ra nhận xét chi tiết với điểm số công
                bằng
              </p>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6">
          <BookOpen className="h-4 w-4" />
          <AlertDescription>
            <strong>Hướng dẫn sử dụng:</strong> Bạn có thể tạo câu hỏi thủ công
            hoặc trích xuất từ hình ảnh. Sau đó upload file bài làm cho từng câu
            hỏi và nhấn "Chấm điểm" để nhận kết quả chi tiết.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content - Mobile First Grid */}
      {/* Control Panel - Always first on mobile */}

      {/* Questions and Results Section - Stack vertically on mobile */}
      <div className="w-full">
        {/* Integrated Questions List with Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Danh Sách Câu Hỏi và Upload Bài Làm
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {/* Extract and View Controls */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                onClick={() => setShowExtractDialog(true)}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? "Đang trích xuất..." : "Trích xuất câu hỏi"}
              </Button>
              {extractedData?.extracted_text && (
                <Button
                  onClick={() => {
                    // Show extracted text
                  }}
                  variant="outline"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Xem văn bản đã trích xuất
                </Button>
              )}
            </div>

            {/* Questions with Integrated Upload and Add Buttons */}
            <div className="space-y-4">
              {/* Add button at the beginning */}
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    const newQuestion: Question = {
                      id: `manual-${Date.now()}`,
                      text: "",
                      type: "manual",
                    };
                    setQuestions([newQuestion, ...questions]);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full max-w-xs border-dashed"
                >
                  <span className="text-lg mr-2">+</span>
                  Thêm câu hỏi đầu tiên
                </Button>
              </div>

              {questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  {/* Question Card with Upload */}
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
                              onClick={() => {
                                const updatedQuestions = questions.filter(
                                  (q) => q.id !== question.id
                                );
                                setQuestions(updatedQuestions);
                                // Remove associated file
                                const newFiles = new Map(questionFiles);
                                newFiles.delete(index);
                                setQuestionFiles(newFiles);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <span className="sr-only">Xóa câu hỏi</span>×
                            </Button>
                          </div>

                          <textarea
                            placeholder="Nhập nội dung câu hỏi..."
                            className="w-full p-3 border rounded resize-none h-32"
                            value={question.text}
                            onChange={(e) => {
                              const updatedQuestions = questions.map((q) =>
                                q.id === question.id
                                  ? { ...q, text: e.target.value }
                                  : q
                              );
                              setQuestions(updatedQuestions);
                            }}
                          />

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
                                    if (!results)
                                      throw new Error(
                                        "Không nhận được kết quả từ server"
                                      );

                                    const newResult: GradeResult = {
                                      question: question.text,
                                      file_name: file.name,
                                      result: results[0],
                                    };

                                    // Add or update result for this question
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

                                    alert("Chấm điểm câu hỏi thành công!");
                                  } catch (error) {
                                    console.error(
                                      "❌ Error grading question:",
                                      error
                                    );
                                    alert(
                                      `Có lỗi xảy ra: ${
                                        error instanceof Error
                                          ? error.message
                                          : "Lỗi không xác định"
                                      }`
                                    );
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
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
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
                        <div className="col-span-1 space-y-3">
                          <div className="text-sm font-medium text-muted-foreground">
                            Upload bài làm:
                          </div>
                          <div className="h-32">
                            <FileUpload
                              onFileChange={(file) =>
                                handleFileUpload(index, file)
                              }
                              uploadedFile={questionFiles.get(index)}
                              accept="image/*"
                              placeholder="Kéo thả hoặc click"
                            />
                          </div>
                          {questionFiles.get(index) && (
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Sẵn sàng chấm
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add button between questions */}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => {
                        const newQuestion: Question = {
                          id: `manual-${Date.now()}`,
                          text: "",
                          type: "manual",
                        };
                        const updatedQuestions = [...questions];
                        updatedQuestions.splice(index + 1, 0, newQuestion);
                        setQuestions(updatedQuestions);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full max-w-xs border-dashed hover:border-solid"
                    >
                      <span className="text-lg mr-2">+</span>
                      Thêm câu hỏi
                    </Button>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Chưa có câu hỏi nào</p>
                  <p className="text-sm mb-4">
                    Thêm câu hỏi thủ công hoặc trích xuất từ hình ảnh
                  </p>
                </div>
              )}

              {/* Grading Button */}
              {questions.length > 0 && questionFiles.size > 0 && (
                <div className="flex justify-center pt-6 border-t">
                  <Button
                    onClick={submitGrading}
                    disabled={isGrading || questionFiles.size === 0}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {isGrading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang chấm điểm...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Chấm điểm ({questionFiles.size}/{questions.length} câu)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grade Results Card */}
        {gradeResults && gradeResults.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Kết Quả Chấm Điểm Chi Tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-4">
                {gradeResults.map((result, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Question Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                Câu {index + 1}
                              </span>
                            </h4>
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                              <MarkdownRenderer content={result.question} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              📎 File: {result.file_name}
                            </p>
                          </div>
                        </div>

                        {/* AI Result */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border">
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            Kết Quả Chấm Điểm AI
                          </h5>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer Info - Mobile Optimized */}
      {(extractedData || questions.length > 0) && (
        <div className="mt-6 sm:mt-8">
          <Separator className="mb-3 sm:mb-4" />
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
            {extractedData && (
              <>
                <p>
                  📊 Đã xử lý {extractedData.total_images} hình ảnh:{" "}
                  {extractedData.image_names.join(", ")}
                </p>
                {extractedData.saved_combined_image && (
                  <p className="break-all">
                    💾 Hình ảnh đã lưu: {extractedData.saved_combined_image}
                  </p>
                )}
              </>
            )}
            {questions.length > 0 && (
              <p>📝 Tổng số câu hỏi: {questions.length}</p>
            )}
            {questionFiles.size > 0 && (
              <p>📎 Đã upload {questionFiles.size} file bài làm</p>
            )}
          </div>
        </div>
      )}

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
