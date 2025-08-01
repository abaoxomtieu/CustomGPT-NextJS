'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Upload, FileText, Download } from 'lucide-react';
import MarkdownRenderer from '@/components/markdown-render';

interface Question {
  id: string;
  text: string;
  type?: string;
  difficulty?: string;
}

interface QuestionsListProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  extractedText?: string;
  onExtractQuestions?: () => void;
  onViewExtractedText?: () => void;
  isExtracting?: boolean;
}

export default function QuestionsList({ 
  questions, 
  onQuestionsChange, 
  extractedText, 
  onExtractQuestions,
  onViewExtractedText,
  isExtracting = false
}: QuestionsListProps) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [showExtractedText, setShowExtractedText] = useState(false);

  const addQuestion = () => {
    if (newQuestionText.trim()) {
      const newQuestion: Question = {
        id: Date.now().toString(),
        text: newQuestionText.trim(),
        type: 'manual'
      };
      onQuestionsChange([...questions, newQuestion]);
      setNewQuestionText('');
      setIsAddingQuestion(false);
    }
  };

  const removeQuestion = (id: string) => {
    onQuestionsChange(questions.filter(q => q.id !== id));
  };

  const handleViewExtractedText = () => {
    if (onViewExtractedText) {
      onViewExtractedText();
    } else {
      setShowExtractedText(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Danh sách câu hỏi
              </CardTitle>
              <CardDescription>
                Quản lý các câu hỏi cho bài kiểm tra của bạn
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {onExtractQuestions && (
                <Button
                  onClick={onExtractQuestions}
                  disabled={isExtracting}
                  size="sm"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isExtracting ? 'Đang trích xuất...' : 'Trích xuất'}
                </Button>
              )}
              {extractedText && (
                <Button
                  onClick={handleViewExtractedText}
                  size="sm"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem văn bản
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có câu hỏi nào</p>
              <p className="text-sm">Thêm câu hỏi thủ công hoặc trích xuất từ hình ảnh</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Câu {index + 1}</Badge>
                        {question.type && (
                          <Badge variant="secondary">{question.type}</Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        <MarkdownRenderer content={question.text} />
                      </div>
                    </div>
                    <Button
                      onClick={() => removeQuestion(question.id)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isAddingQuestion ? (
            <Button
              onClick={() => setIsAddingQuestion(true)}
              variant="outline"
              className="w-full"
            >
              Thêm câu hỏi thủ công
            </Button>
          ) : (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <Textarea
                placeholder="Nhập nội dung câu hỏi..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={addQuestion} size="sm">
                  Thêm câu hỏi
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingQuestion(false);
                    setNewQuestionText('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog hiển thị văn bản đã trích xuất */}
      <Dialog open={showExtractedText} onOpenChange={setShowExtractedText}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Văn bản đã trích xuất</DialogTitle>
            <DialogDescription>
              Nội dung văn bản được trích xuất từ hình ảnh
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] p-4 border rounded-lg bg-muted/50">
            {extractedText ? (
              <MarkdownRenderer content={extractedText} />
            ) : (
              <p className="text-muted-foreground">Không có văn bản nào được trích xuất.</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                if (extractedText) {
                  navigator.clipboard.writeText(extractedText);
                }
              }}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Sao chép
            </Button>
            <Button onClick={() => setShowExtractedText(false)} size="sm">
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}