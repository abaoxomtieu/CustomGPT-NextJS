import { ApiDomain } from "@/constant";
import { getCookie } from "@/helpers/Cookies";

export interface GenerateTestCasesRequest {
  api_endpoint: string;
  method: string;
  api_description: string;
  field_description: string;
}

export interface TestCase {
  test_case_description: string;
  expected_output: boolean;
}

export interface TestAPIRequest {
  base_url: string;
  api_endpoint: string;
  method: string;
  test_cases: TestCase[];
  api_description: string;
  field_description: string;
}

export const apiTestingService = {
  generateTestCases: async (
    data: GenerateTestCasesRequest
  ): Promise<TestCase[]> => {
    const response = await fetch(
      `${ApiDomain}/api-testing/generate-test-cases`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
  },

  testApi: async (data: TestAPIRequest): Promise<any> => {
    const response = await fetch(`${ApiDomain}/api-testing/test-api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
  },
};
