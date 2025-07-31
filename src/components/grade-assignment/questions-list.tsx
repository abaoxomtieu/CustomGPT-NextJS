"use client";

import { useState } from "react";
import { Edit2, Save, X, Plus, Trash2, GripVertical, Upload, FileText, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MarkdownRenderer from '@/components/markdown-render';
// import { toast } from "sonner";

interface QuestionsListProps {
  questions: string[];
  onQuestionsUpdate: (questions: string[]) => void;
  uploadedFiles?: Map<number, File>;
  onFileUpload?: (questionIndex: number, file: File | null) => void;
  onSubmitGrading?: () => void;
  isGrading?: boolean;
}

const QuestionsList: React.FC<QuestionsListProps> = ({ 
  questions, 
  onQuestionsUpdate,
  uploadedFiles = new Map(),
  onFileUpload,
  onSubmitGrading,
  isGrading = false
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");

  // Ensure questions is always a valid string array
  const validQuestions = Array.isArray(questions) 
    ? questions.filter(q => typeof q === 'string' && q.trim().length > 0)
    : [];

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(validQuestions[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingText.trim()) {
      const updatedQuestions = [...validQuestions];
      updatedQuestions[editingIndex] = editingText.trim();
      onQuestionsUpdate(updatedQuestions);
      setEditingIndex(null);
      setEditingText("");
      // toast.success("Đã cập nhật câu hỏi!");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = validQuestions.filter((_, i) => i !== index);
    onQuestionsUpdate(updatedQuestions);
    // toast.success("Đã xóa câu hỏi!");
  };

  const addNewQuestion = () => {
    if (newQuestionText.trim()) {
      const updatedQuestions = [...validQuestions, newQuestionText.trim()];
      onQuestionsUpdate(updatedQuestions);
      setNewQuestionText("");
      setIsAddingNew(false);
      // toast.success("Đã thêm câu hỏi mới!");
    }
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
    setNewQuestionText("");
  };

  const cancelAddNew = () => {
    setIsAddingNew(false);
    setNewQuestionText("");
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= validQuestions.length) return;
    
    const updatedQuestions = [...validQuestions];
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedQuestion);
    onQuestionsUpdate(updatedQuestions);
  };

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (onFileUpload) {
      onFileUpload(index, file);
    }
  };

  const removeFile = (index: number) => {
    if (onFileUpload) {
      onFileUpload(index, null);
    }
  };

  const getUploadedFilesCount = () => {
    return uploadedFiles.size;
  };

  if (validQuestions.length === 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            Chưa có câu hỏi nào. Bạn có thể tạo câu hỏi thủ công hoặc trích xuất từ hình ảnh.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button
            onClick={startAddingNew}
            variant="outline"
            size="sm"
            className="h-10 px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo câu hỏi thủ công
          </Button>
        </div>

        {/* Add New Question Form */}
        {isAddingNew && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">1.</span>
                  <span className="text-sm text-muted-foreground">Câu hỏi mới:</span>
                </div>
                <Textarea
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="min-h-[80px] resize-none"
                  placeholder="Nhập nội dung câu hỏi mới..."
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={addNewQuestion}>
                    <Save className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelAddNew}>
                    <X className="h-4 w-4 mr-1" />
                    Hủy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold">
          Danh sách câu hỏi ({validQuestions.length})
        </h3>
        <Button
          onClick={startAddingNew}
          variant="outline"
          size="sm"
          className="h-8 px-2 sm:px-3"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Thêm câu hỏi</span>
          <span className="sm:hidden">Thêm</span>
        </Button>
      </div>

      <div className="space-y-3">
        {validQuestions.map((question, index) => (
          <Card key={index} className="transition-all hover:shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start space-x-2 sm:space-x-3">
                {/* Drag Handle - Hidden on mobile */}
                <div className="hidden sm:flex flex-col space-y-1 mt-1">
                  <button
                    onClick={() => moveQuestion(index, index - 1)}
                    disabled={index === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <button
                    onClick={() => moveQuestion(index, index + 1)}
                    disabled={index === validQuestions.length - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    ↓
                  </button>
                </div>

                {/* Question Number */}
                <div className="min-w-[1.5rem] sm:min-w-[2rem] mt-1 sm:mt-2">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {index + 1}.
                  </span>
                </div>

                {/* Question Content */}
                <div className="flex-1 min-w-0">
                  {editingIndex === index ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="min-h-[80px] text-xs sm:text-sm resize-none"
                        placeholder="Nhập nội dung câu hỏi..."
                      />
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button size="sm" onClick={saveEdit} className="h-8 px-2 sm:px-3">
                          <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Lưu</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8 px-2 sm:px-3">
                          <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Hủy</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2 sm:p-3 border rounded bg-background">
                        <MarkdownRenderer
                          content={question || "Nội dung câu hỏi..."}
                        />
                      </div>
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(index)}
                          className="h-8 px-2 sm:px-3"
                        >
                          <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Sửa</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteQuestion(index)}
                          className="h-8 px-2 sm:px-3 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Xóa</span>
                        </Button>
                      </div>

                      {/* File Upload Section */}
                      {onFileUpload && (
                        <div className="mt-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Upload file bài làm:</span>
                            {uploadedFiles.has(index) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFile(index)}
                                className="h-6 px-2 text-red-600 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          
                          {uploadedFiles.has(index) ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">
                                {uploadedFiles.get(index)?.name}
                              </span>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="file"
                                id={`file-${index}`}
                                onChange={(e) => handleFileChange(index, e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".py,.js,.java,.cpp,.c,.ts,.jsx,.tsx,.php,.rb,.go,.rs,.swift,.kt,.scala,.dart,.m,.h,.cs,.vb,.sql,.html,.css,.json,.xml,.yaml,.yml,.txt,.md"
                              />
                              <div className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                                <div className="text-center">
                                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm text-gray-600">Click để chọn file</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Hỗ trợ các file code: .py, .js, .java, .cpp, .c, .ts, etc.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Question Form */}
        {isAddingNew && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {validQuestions.length + 1}.
                  </span>
                  <span className="text-sm text-muted-foreground">Câu hỏi mới:</span>
                </div>
                <Textarea
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="min-h-[80px] resize-none"
                  placeholder="Nhập nội dung câu hỏi mới..."
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={addNewQuestion}>
                    <Save className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelAddNew}>
                    <X className="h-4 w-4 mr-1" />
                    Hủy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submit Section */}
      {onSubmitGrading && validQuestions.length > 0 && (
        <div className="mt-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">Chấm điểm bài tập</h4>
              <p className="text-xs text-muted-foreground">
                Đã upload {getUploadedFilesCount()}/{validQuestions.length} file. 
                Chỉ những câu hỏi có file upload sẽ được chấm điểm.
              </p>
            </div>
            <Button
              onClick={onSubmitGrading}
              disabled={isGrading || getUploadedFilesCount() === 0}
              className="w-full sm:w-auto"
            >
              {isGrading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang chấm điểm...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Chấm điểm ({getUploadedFilesCount()} file)
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsList;