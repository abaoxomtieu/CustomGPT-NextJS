export interface Question {
  id: string;
  text: string;
  type?: string;
  difficulty?: string;
}

export interface ExtractedData {
  extracted_text: string;
  split_questions: string[];
  total_images: number;
  image_names: string[];
  saved_combined_image: string;
}

export interface GradeResult {
  question: string;
  file_name: string;
  result: any; // API response structure
}
