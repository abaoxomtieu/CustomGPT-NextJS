export interface TreeNode {
    label: string;
    value: string;
    children?: TreeNode[];
  }
  
  export interface FileResult {
    file_name: string;
    comment: string | null;
    criteria_eval: string;
    rating: number;
  }
  
  export interface GradingResult {
    selected_files: string[];
    criterias: string;
    analyze_code_result: FileResult[];
    grade_criteria: string;
  }
  
  export interface FileTreeProps {
    nodes: TreeNode[];
    onFileSelection: (selectedFiles: string[]) => void;
  }
  interface Status {
    text: string;
    color: string;
    description: string;
  }
  export interface StatusConfig {
    [key: number]: Status;
  }
  export interface GradeResponse {
    type: "final" | "folder_structure" | "criteria_result" | "error";
    output: string | GradingResult[];
    grade_folder_structure?: string;
    criteria_index?: number;
    total_criteria?: number;
    result?: GradingResult;
    partial_results?: GradingResult[];
  }
  
  