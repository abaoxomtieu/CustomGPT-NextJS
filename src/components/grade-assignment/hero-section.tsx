import { Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 py-2 mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">AI-Powered Grading</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-blue-900 dark:text-blue-100">
          Hệ Thống Chấm Bài Tập Tự Động
        </h1>
        <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300 max-w-xl mx-auto">
          AI hỗ trợ chấm điểm bài tập lập trình một cách thông minh và chính xác
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
