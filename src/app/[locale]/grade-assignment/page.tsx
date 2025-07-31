"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ImageUploadDropzone from "@/components/grade-assignment/image-upload-dropzone";
import ExtractedTextDisplay from "@/components/grade-assignment/extracted-text-display";
import QuestionsList from "@/components/grade-assignment/questions-list";

export interface ExtractedData {
  extracted_text: string;
  split_questions: string[];
  total_images: number;
  image_names: string[];
  saved_combined_image: string;
}

const GradeAssignmentPage = () => {
  const t = useTranslations("gradeAssignment");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExtractComplete = (data: ExtractedData) => {
    console.log("Extracted data received:", data);
    console.log("Split questions type:", typeof data.split_questions);
    console.log("Split questions value:", data.split_questions);
    setExtractedData(data);
    setIsLoading(false);
  };

  const handleExtractStart = () => {
    setIsLoading(true);
    setExtractedData(null);
  };

  const handleQuestionsUpdate = (questions: string[]) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        split_questions: questions
      });
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl">
      {/* Header - Responsive */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Chấm Bài Tập</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Tải lên hình ảnh đề bài để trích xuất văn bản và phân tích câu hỏi
        </p>
      </div>

      {/* Main Content - Mobile First Grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Upload Section - Always first on mobile */}
        <div className="w-full lg:order-1">
          <Card className="h-fit">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Tải Lên Hình Ảnh</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ImageUploadDropzone
                onExtractComplete={handleExtractComplete}
                onExtractStart={handleExtractStart}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Results Section - Stack vertically on mobile */}
        <div className="w-full lg:order-2 space-y-4 sm:space-y-6">
          {extractedData && (
            <>
              {/* Extracted Text Card */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Văn Bản Đã Trích Xuất</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <ExtractedTextDisplay text={extractedData.extracted_text} />
                </CardContent>
              </Card>

              {/* Questions List Card */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Danh Sách Câu Hỏi</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <QuestionsList
                    questions={extractedData.split_questions}
                    onQuestionsUpdate={handleQuestionsUpdate}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Footer Info - Mobile Optimized */}
      {extractedData && (
        <div className="mt-6 sm:mt-8">
          <Separator className="mb-3 sm:mb-4" />
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
            <p>Đã xử lý {extractedData.total_images} hình ảnh: {extractedData.image_names.join(", ")}</p>
            {extractedData.saved_combined_image && (
              <p className="break-all">Hình ảnh đã lưu: {extractedData.saved_combined_image}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeAssignmentPage;