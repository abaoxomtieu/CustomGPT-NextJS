"use client";

import { useState } from "react";
import { Edit2, Save, X, Plus, Trash2, GripVertical } from "lucide-react";
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
}

const QuestionsList: React.FC<QuestionsListProps> = ({ questions, onQuestionsUpdate }) => {
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

  if (validQuestions.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Chưa có câu hỏi nào được phát hiện. Vui lòng tải lên hình ảnh chứa đề bài.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold">
          Danh sách câu hỏi ({validQuestions.length})
        </h3>
        <Button
          onClick={addNewQuestion}
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
    </div>
  );
};

export default QuestionsList;