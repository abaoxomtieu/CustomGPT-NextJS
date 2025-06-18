import axios from "axios";
import { ApiDomain } from "@/constant";
import { getCookie } from "@/helpers/Cookies";

export interface GradedAssignment {
  id: string;
  user_id: string;
  project_name: string;
  selected_files: string[];
  folder_structure_criteria?: string;
  criterias_list: string[];
  project_description?: string;
  grade_result: any;
  created_at: string;
  updated_at: string;
}

class GradedAssignmentService {
  private baseUrl = `${ApiDomain}/graded-assignments/`;

  async getAllAssignments(): Promise<GradedAssignment[]> {
    try {
      const response = await axios.get<GradedAssignment[]>(this.baseUrl , {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      throw error;
    }
  }

  async getAssignmentById(id: string): Promise<GradedAssignment> {
    try {
      const response = await axios.get<GradedAssignment>(`${this.baseUrl}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching assignment ${id}:`, error);
      throw error;
    }
  }

  async deleteAssignment(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
    } catch (error) {
      console.error(`Error deleting assignment ${id}:`, error);
      throw error;
    }
  }
}

export const gradedAssignmentService = new GradedAssignmentService(); 