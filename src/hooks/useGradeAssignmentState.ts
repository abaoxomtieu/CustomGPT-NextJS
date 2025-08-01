import { useState } from "react";
import { Question, ExtractedData, GradeResult } from "@/types/grade-assignment";
import { GeneratedAnswer } from "@/services/grade-assignment-service";

export const useGradeAssignmentState = () => {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questionFiles, setQuestionFiles] = useState<Map<number, File>>(new Map());
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResults, setGradeResults] = useState<GradeResult[] | null>(null);
  const [showExtractDialog, setShowExtractDialog] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Generated answers state
  const [generatedAnswers, setGeneratedAnswers] = useState<Map<string, GeneratedAnswer>>(new Map());
  const [generatingAnswerIds, setGeneratingAnswerIds] = useState<Set<string>>(new Set());

  // UI state for collapsibles and expandable content
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  
  // Compact view states
  const [compactView, setCompactView] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  return {
    // Data states
    extractedData,
    setExtractedData,
    questions,
    setQuestions,
    questionFiles,
    setQuestionFiles,
    gradeResults,
    setGradeResults,
    generatedAnswers,
    setGeneratedAnswers,
    
    // Loading states
    isLoading,
    setIsLoading,
    isGrading,
    setIsGrading,
    generatingAnswerIds,
    setGeneratingAnswerIds,
    
    // UI states
    showExtractDialog,
    setShowExtractDialog,
    expandedAnswers,
    setExpandedAnswers,
    expandedResults,
    setExpandedResults,
    compactView,
    setCompactView,
    editingQuestionId,
    setEditingQuestionId,
  };
};
