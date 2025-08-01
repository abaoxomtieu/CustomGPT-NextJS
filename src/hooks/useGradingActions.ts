import { Question, GradeResult } from "@/types/grade-assignment";
import { gradeAssignmentApiService } from "@/services/grade-assignment-service";
import { toast } from "sonner";

interface UseGradingActionsProps {
  questions: Question[];
  questionFiles: Map<number, File>;
  setIsGrading: (loading: boolean) => void;
  setGradeResults: (results: GradeResult[] | null) => void;
}

export const useGradingActions = ({
  questions,
  questionFiles,
  setIsGrading,
  setGradeResults,
}: UseGradingActionsProps) => {
  
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

  return {
    submitGrading,
  };
};
