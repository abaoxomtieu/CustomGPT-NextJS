"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Sparkles, Eye, Play, FileText } from "lucide-react";
import {
  apiTestingService,
  GenerateTestCasesRequest,
  TestCase,
  TestAPIRequest,
} from "@/services/apiTestingService";

interface TestResult {
  passed: number;
  total: number;
  evaluation_response: Array<{
    actual_api_response: string;
    reason: string;
    test_case_description: string;
  }>;
}

interface ApiTestRow {
  id: string;
  method: string;
  api_endpoint: string;
  api_description: string;
  field_description: string;
  testCases: TestCase[];
  isGenerating: boolean;
  isTesting: boolean;
  baseUrl: string;
  testResult?: TestResult;
}

// Component to display test case details in dialog
function TestCaseDetailsDialog({
  testCases,
  apiEndpoint,
  method,
  open,
  onOpenChange,
}: {
  testCases: TestCase[];
  apiEndpoint: string;
  method: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 "
        >
          <Eye className="w-4 h-4" />
          Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-bold">{method}</span>
            <span className="text-muted-foreground">{apiEndpoint}</span>
            <span className="text-sm text-muted-foreground">
              ({testCases.length} test cases)
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto max-h-[70vh]">
          {testCases.map((testCase, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg">
                    Test Case {index + 1}
                  </h3>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Description:
                  </h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                    {testCase.test_case_description}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Expected Output:
                  </h4>
                  <div className="bg-background border p-3 rounded-lg">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      <span
                        className={
                          testCase.expected_output
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {testCase.expected_output ? "Pass" : "Fail"}
                      </span>
                    </pre>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Component to display test results in dialog
function TestResultDialog({
  testResult,
  apiEndpoint,
  method,
  open,
  onOpenChange,
}: {
  testResult: TestResult;
  apiEndpoint: string;
  method: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const successRate = (testResult.passed / testResult.total) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Results
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-bold">{method}</span>
            <span className="text-muted-foreground">{apiEndpoint}</span>
            <span className="text-sm text-muted-foreground">
              - Test Results
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Summary */}
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Test Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {testResult.passed} out of {testResult.total} tests passed
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${successRate >= 70 ? 'text-green-600' : successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {successRate.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </Card>

          {/* Detailed Results */}
          <div className="space-y-3">
            {testResult.evaluation_response.map((result, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">
                      Test Case {index + 1}
                    </h3>
                    <span className={`text-sm px-2 py-1 rounded ${
                      result.reason.toLowerCase().includes('pass') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.reason.toLowerCase().includes('pass') ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      Test Description:
                    </h4>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">
                      {result.test_case_description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      Actual API Response:
                    </h4>
                    <div className="bg-background border p-3 rounded-lg">
                      <pre className="text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {result.actual_api_response}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      Evaluation Reason:
                    </h4>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">
                      {result.reason}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ApiTestingClient() {
  const [rows, setRows] = useState<ApiTestRow[]>([
    {
      id: "1",
      method: "GET",
      api_endpoint: "/",
      api_description: "Get index page",
      field_description: "",
      testCases: [],
      isGenerating: false,
      isTesting: false,
      baseUrl: "https://ai.ftes.vn",
    },
  ]);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [openResultDialogId, setOpenResultDialogId] = useState<string | null>(null);

  const addRow = () => {
    const newRow: ApiTestRow = {
      id: Date.now().toString(),
      method: "GET",
      api_endpoint: "",
      api_description: "",
      field_description: "",
      testCases: [],
      isGenerating: false,
      isTesting: false,
      baseUrl: "",
    };
    setRows([...rows, newRow]);
  };

  const deleteRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id: string, field: keyof ApiTestRow, value: any) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  const generateTestCases = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    // Validate inputs
    if (!row.api_endpoint || !row.method || !row.api_description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Set loading state
    setRows((prevRows) =>
      prevRows.map((r) => (r.id === id ? { ...r, isGenerating: true } : r))
    );

    try {
      const data: GenerateTestCasesRequest = {
        api_endpoint: row.api_endpoint,
        method: row.method,
        api_description: row.api_description,
        field_description: row.field_description,
      };

      const testCases = await apiTestingService.generateTestCases(data);
      console.log("Received test cases:", testCases);

      // Update test cases
      setRows((prevRows) =>
        prevRows.map((r) =>
          r.id === id ? { ...r, testCases: testCases, isGenerating: false } : r
        )
      );

      toast.success("Test cases generated successfully");
    } catch (error) {
      toast.error("Failed to generate test cases");
      console.error(error);

      // Reset loading state on error
      setRows((prevRows) =>
        prevRows.map((r) => (r.id === id ? { ...r, isGenerating: false } : r))
      );
    }
  };

  const testApi = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    // Validate inputs
    if (!row.baseUrl || !row.api_endpoint || !row.testCases.length) {
      toast.error("Please provide base URL and ensure test cases are generated");
      return;
    }

    // Set testing state
    setRows((prevRows) =>
      prevRows.map((r) => (r.id === id ? { ...r, isTesting: true } : r))
    );

    try {
      const data: TestAPIRequest = {
        base_url: row.baseUrl,
        api_endpoint: row.api_endpoint,
        method: row.method,
        test_cases: row.testCases,
        api_description: row.api_description,
        field_description: row.field_description,
      };

      const result = await apiTestingService.testApi(data);
      console.log("Test API result:", result);
      
      // Store test results
      setRows((prevRows) =>
        prevRows.map((r) => 
          r.id === id 
            ? { ...r, isTesting: false, testResult: result } 
            : r
        )
      );
      
      toast.success(`API testing completed! ${result.passed}/${result.total} tests passed`);
    } catch (error) {
      toast.error("Failed to test API");
      console.error(error);
      
      // Reset testing state on error
      setRows((prevRows) =>
        prevRows.map((r) => (r.id === id ? { ...r, isTesting: false } : r))
      );
    }
  };

  return (
    <div className="container mx-auto py-8 p-4">
      <Card className="">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              API Test Case Generator
            </CardTitle>
            <Button
              onClick={addRow}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add API
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Method</TableHead>
                  <TableHead className="w-[200px]">API Endpoint</TableHead>
                  <TableHead className="w-[150px]">Base URL</TableHead>
                  <TableHead className="w-[250px]">Description</TableHead>
                  <TableHead className="w-[300px]">Field Description</TableHead>
                  <TableHead className="w-[200px]">Action</TableHead>
                  <TableHead>Example Test Cases</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Select
                        value={row.method}
                        onValueChange={(value) =>
                          updateRow(row.id, "method", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.api_endpoint}
                        onChange={(e) =>
                          updateRow(row.id, "api_endpoint", e.target.value)
                        }
                        placeholder="/api/..."
                        className="w-full min-h-[40px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.baseUrl}
                        onChange={(e) =>
                          updateRow(row.id, "baseUrl", e.target.value)
                        }
                        placeholder="https://api.example.com"
                        className="w-full min-h-[40px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={row.api_description}
                        onChange={(e) =>
                          updateRow(row.id, "api_description", e.target.value)
                        }
                        placeholder="Describe what this API does..."
                        className="w-full min-h-[40px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={row.field_description}
                        onChange={(e) =>
                          updateRow(row.id, "field_description", e.target.value)
                        }
                        placeholder="Describe the fields and their types..."
                        className="w-full min-h-[40px]"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => generateTestCases(row.id)}
                            disabled={row.isGenerating}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            {row.isGenerating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            Generate
                          </Button>
                          <Button
                            onClick={() => deleteRow(row.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        {row.testCases.length > 0 && (
                          <Button
                            onClick={() => testApi(row.id)}
                            disabled={row.isTesting}
                            size="sm"
                            variant="secondary"
                            className="flex items-center gap-2"
                          >
                            {row.isTesting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            Test API
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.testCases.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {row.testCases.length} test case
                              {row.testCases.length !== 1 ? "s" : ""}
                            </span>
                            {row.testResult && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                row.testResult.passed === row.testResult.total 
                                  ? 'bg-green-100 text-green-800' 
                                  : row.testResult.passed > 0 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {row.testResult.passed}/{row.testResult.total} passed
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <TestCaseDetailsDialog
                              testCases={row.testCases}
                              apiEndpoint={row.api_endpoint}
                              method={row.method}
                              open={openDialogId === row.id}
                              onOpenChange={(open) =>
                                setOpenDialogId(open ? row.id : null)
                              }
                            />
                            {row.testResult && (
                              <TestResultDialog
                                testResult={row.testResult}
                                apiEndpoint={row.api_endpoint}
                                method={row.method}
                                open={openResultDialogId === row.id}
                                onOpenChange={(open) =>
                                  setOpenResultDialogId(open ? row.id : null)
                                }
                              />
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No test cases generated yet
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {rows.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No APIs added yet</p>
              <Button onClick={addRow} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add First API
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
