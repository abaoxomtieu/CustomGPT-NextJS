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
// import { toast } from "sonner";
import ImageUploadDropzone from "@/components/grade-assignment/image-upload-dropzone";
import ExtractedTextDisplay from "@/components/grade-assignment/extracted-text-display";
import QuestionsList from "@/components/grade-assignment/questions-list";
import ExtractQuestionsDialog from "@/components/grade-assignment/extract-questions-dialog";
import MarkdownRenderer from "@/components/markdown-render";
import { gradeAssignmentApiService } from "@/services/grade-assignment-service";

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
  const [questions, setQuestions] = useState<string[]>([]);

  const handleExtractComplete = (data: ExtractedData) => {
    console.log("Extracted data received:", data);
    console.log("Split questions type:", typeof data.split_questions);
    console.log("Split questions value:", data.split_questions);
    setExtractedData(data);
    setQuestions(data.split_questions || []);
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

  const handleQuestionsUpdate = (updatedQuestions: string[]) => {
    setQuestions(updatedQuestions);
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        split_questions: updatedQuestions,
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
          questionsWithFiles.push(questions[index]);
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
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Control Panel - Always first on mobile */}
        <div className="w-full lg:col-span-4 lg:order-1 space-y-4">
          {/* Extract Questions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                Trích Xuất Câu Hỏi
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Upload hình ảnh đề bài để AI tự động trích xuất và phân tách
                  câu hỏi
                </p>
                <Button
                  onClick={() => setShowExtractDialog(true)}
                  className="w-full"
                  variant="outline"
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? "Đang xử lý..." : "Tải Lên Hình Ảnh Đề Bài"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Text Card */}
          {extractedData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Văn Bản Đã Trích Xuất</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <ExtractedTextDisplay text={extractedData.extracted_text} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Questions and Results Section - Stack vertically on mobile */}
        <div className="w-full lg:col-span-8 lg:order-2 space-y-4 sm:space-y-6">
          {/* Questions List Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Danh Sách Câu Hỏi và Upload Bài Làm
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <QuestionsList
                questions={questions}
                onQuestionsUpdate={handleQuestionsUpdate}
                uploadedFiles={questionFiles}
                onFileUpload={handleFileUpload}
                onSubmitGrading={submitGrading}
                isGrading={isGrading}
              />
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
