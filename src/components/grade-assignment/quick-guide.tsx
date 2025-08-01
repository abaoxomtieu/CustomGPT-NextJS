import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen } from "lucide-react";

const QuickGuide = () => {
  return (
    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <BookOpen className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
        <strong>Quy trình:</strong> Trích xuất câu hỏi → Tạo đáp án AI → Upload bài làm → Chấm điểm tự động
      </AlertDescription>
    </Alert>
  );
};

export default QuickGuide;
