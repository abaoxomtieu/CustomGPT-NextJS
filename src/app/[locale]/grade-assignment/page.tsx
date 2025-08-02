"use client";

import "./grade-assignment.css";
import { useTranslations } from "next-intl";
import {
  ExtractQuestionsDialog,
  HeroSection,
  QuickGuide,
  QuestionsSection,
  GradeResultsSection,
  StatsDashboard,
} from "@/components/grade-assignment";
import {
  useGradeAssignmentState,
  useGradeAssignmentActions,
  useGradingActions,
} from "@/hooks/grade-assignment";

const GradeAssignmentPage = () => {
  const t = useTranslations("gradeAssignment");

  // State management
  const state = useGradeAssignmentState();

  // Actions
  const actions = useGradeAssignmentActions({
    questions: state.questions,
    setQuestions: state.setQuestions,
    setExtractedData: state.setExtractedData,
    setIsLoading: state.setIsLoading,
    setQuestionFiles: state.setQuestionFiles,
    setGradeResults: state.setGradeResults,
    setGeneratedAnswers: state.setGeneratedAnswers,
    setGeneratingAnswerIds: state.setGeneratingAnswerIds,
    setEditingQuestionId: state.setEditingQuestionId,
    extractedData: state.extractedData,
    questionFiles: state.questionFiles,
    generatedAnswers: state.generatedAnswers,
    generatingAnswerIds: state.generatingAnswerIds,
  });

  const gradingActions = useGradingActions({
    questions: state.questions,
    questionFiles: state.questionFiles,
    setIsGrading: state.setIsGrading,
    setGradeResults: state.setGradeResults,
  });

  // UI handlers
  const handleExpandAllAnswers = () => {
    const allAnswerIds = Array.from(state.generatedAnswers.keys());
    state.setExpandedAnswers(new Set(allAnswerIds));
  };

  const handleCollapseAllAnswers = () => {
    state.setExpandedAnswers(new Set());
  };

  const handleToggleAnswerExpansion = (
    questionId: string,
    expanded: boolean
  ) => {
    state.setExpandedAnswers((prev) => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });
  };

  const handleExpandAllResults = () => {
    if (state.gradeResults) {
      state.setExpandedResults(
        new Set(Array.from({ length: state.gradeResults.length }, (_, i) => i))
      );
    }
  };

  const handleCollapseAllResults = () => {
    state.setExpandedResults(new Set());
  };

  const handleToggleResultExpansion = (index: number, expanded: boolean) => {
    state.setExpandedResults((prev) => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <HeroSection />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Start Guide */}
        <QuickGuide />

        {/* Main Questions Section */}
        <QuestionsSection
          questions={state.questions}
          questionFiles={state.questionFiles}
          generatedAnswers={state.generatedAnswers}
          generatingAnswerIds={state.generatingAnswerIds}
          expandedAnswers={state.expandedAnswers}
          compactView={state.compactView}
          editingQuestionId={state.editingQuestionId}
          isGrading={state.isGrading}
          isLoading={state.isLoading}
          setShowExtractDialog={state.setShowExtractDialog}
          setCompactView={state.setCompactView}
          onAddQuestion={actions.addQuestion}
          onUpdateQuestion={actions.updateQuestion}
          onRemoveQuestion={actions.removeQuestion}
          onToggleEdit={state.setEditingQuestionId}
          onFileUpload={actions.handleFileUpload}
          onGenerateAnswer={actions.generateAnswerForQuestion}
          onGenerateAllAnswers={actions.generateAnswersForAllQuestions}
          onToggleAnswerExpansion={handleToggleAnswerExpansion}
          onExpandAllAnswers={handleExpandAllAnswers}
          onCollapseAllAnswers={handleCollapseAllAnswers}
          onGradeAll={gradingActions.submitGrading}
          setGradeResults={state.setGradeResults}
          setIsGrading={state.setIsGrading}
        />

        {/* Grade Results Section */}
        {state.gradeResults && state.gradeResults.length > 0 && (
          <GradeResultsSection
            gradeResults={state.gradeResults}
            expandedResults={state.expandedResults}
            onToggleResultExpansion={handleToggleResultExpansion}
            onExpandAllResults={handleExpandAllResults}
            onCollapseAllResults={handleCollapseAllResults}
          />
        )}

        {/* Quick Stats */}
        <StatsDashboard
          extractedData={state.extractedData}
          questions={state.questions}
          questionFiles={state.questionFiles}
          generatedAnswers={state.generatedAnswers}
          gradeResults={state.gradeResults}
        />
      </div>

      {/* Extract Questions Dialog */}
      <ExtractQuestionsDialog
        open={state.showExtractDialog}
        onOpenChange={state.setShowExtractDialog}
        onExtractComplete={actions.handleExtractComplete}
        onExtractStart={actions.handleExtractStart}
        isLoading={state.isLoading}
      />
    </div>
  );
};

export default GradeAssignmentPage;
