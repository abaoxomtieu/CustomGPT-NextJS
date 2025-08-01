import { Question, ExtractedData, GradeResult } from "@/types/grade-assignment";
import { GeneratedAnswer } from "@/services/grade-assignment-service";

interface StatsProps {
  extractedData: ExtractedData | null;
  questions: Question[];
  questionFiles: Map<number, File>;
  generatedAnswers: Map<string, GeneratedAnswer>;
  gradeResults: GradeResult[] | null;
}

const StatsDashboard = ({
  extractedData,
  questions,
  questionFiles,
  generatedAnswers,
  gradeResults,
}: StatsProps) => {
  if (!extractedData && questions.length === 0) {
    return null;
  }

  return (
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
  );
};

export default StatsDashboard;
