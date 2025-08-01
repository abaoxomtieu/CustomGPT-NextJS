import { Dispatch, SetStateAction } from "react";
import { Question, ExtractedData, GradeResult } from "@/types/grade-assignment";
import { gradeAssignmentApiService, GeneratedAnswer } from "@/services/grade-assignment-service";
import { toast } from "sonner";

interface UseGradeAssignmentActionsProps {
  questions: Question[];
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  setExtractedData: Dispatch<SetStateAction<ExtractedData | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setQuestionFiles: Dispatch<SetStateAction<Map<number, File>>>;
  setGradeResults: Dispatch<SetStateAction<GradeResult[] | null>>;
  setGeneratedAnswers: Dispatch<SetStateAction<Map<string, GeneratedAnswer>>>;
  setGeneratingAnswerIds: Dispatch<SetStateAction<Set<string>>>;
  setEditingQuestionId: Dispatch<SetStateAction<string | null>>;
  extractedData: ExtractedData | null;
  questionFiles: Map<number, File>;
  generatedAnswers: Map<string, GeneratedAnswer>;
  generatingAnswerIds: Set<string>;
}

export const useGradeAssignmentActions = ({
  questions,
  setQuestions,
  setExtractedData,
  setIsLoading,
  setQuestionFiles,
  setGradeResults,
  setGeneratedAnswers,
  setGeneratingAnswerIds,
  setEditingQuestionId,
  extractedData,
  questionFiles,
  generatedAnswers,
  generatingAnswerIds,
}: UseGradeAssignmentActionsProps) => {
  
  const handleExtractComplete = (data: ExtractedData) => {
    console.log("Extracted data received:", data);
    setExtractedData(data);

    const questionsArray: Question[] = (data.split_questions || []).map(
      (text, index) => ({
        id: `extracted-${Date.now()}-${index}`,
        text,
        type: "extracted",
      })
    );
    setQuestions(questionsArray);
    setIsLoading(false);
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

  const generateAnswersForAllQuestions = async () => {
    const questionsWithText = questions.filter((q) => q.text.trim());
    if (questionsWithText.length === 0) {
      toast.error(
        "Vui lòng nhập nội dung cho ít nhất một câu hỏi trước khi tạo đáp án"
      );
      return;
    }

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

  return {
    handleExtractComplete,
    handleExtractStart,
    handleQuestionsUpdate,
    handleFileUpload,
    addQuestion,
    removeQuestion,
    updateQuestion,
    generateAnswerForQuestion,
    generateAnswersForAllQuestions,
  };
};
