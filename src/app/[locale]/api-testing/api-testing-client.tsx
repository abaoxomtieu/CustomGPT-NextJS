"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import {
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  Play,
  FileText,
  Code,
  Zap,
  CheckCircle,
} from "lucide-react";
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
  const t = useTranslations("apiTesting");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 "
        >
          <Eye className="w-4 h-4" />
          {t("buttons.detail")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-bold">{method}</span>
            <span className="text-muted-foreground">{apiEndpoint}</span>
            <span className="text-sm text-muted-foreground">
              (
              {testCases.length === 1
                ? t("testCases.count", { count: testCases.length })
                : t("testCases.countPlural", { count: testCases.length })}
              )
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto max-h-[70vh]">
          {testCases.map((testCase, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg">
                    {t("dialogs.testCaseDetails.testCase")} {index + 1}
                  </h3>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    {t("dialogs.testCaseDetails.description")}
                  </h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                    {testCase.test_case_description}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    {t("dialogs.testCaseDetails.expectedOutput")}
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
                        {testCase.expected_output
                          ? t("status.pass")
                          : t("status.fail")}
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
  const t = useTranslations("apiTesting");
  const successRate = (testResult.passed / testResult.total) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {t("buttons.results")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-bold">{method}</span>
            <span className="text-muted-foreground">{apiEndpoint}</span>
            <span className="text-sm text-muted-foreground">
              - {t("dialogs.testResults.title")}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Summary */}
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {t("dialogs.testResults.summary")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("dialogs.testResults.summaryDescription", {
                    passed: testResult.passed,
                    total: testResult.total,
                  })}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${
                    successRate >= 70
                      ? "text-green-600"
                      : successRate >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {successRate.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("dialogs.testResults.successRate")}
                </p>
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
                      {t("dialogs.testCaseDetails.testCase")} {index + 1}
                    </h3>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        result.reason.toLowerCase().includes("pass")
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result.reason.toLowerCase().includes("pass")
                        ? t("dialogs.testResults.passed")
                        : t("dialogs.testResults.failed")}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      {t("dialogs.testResults.testDescription")}
                    </h4>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">
                      {result.test_case_description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      {t("dialogs.testResults.actualResponse")}
                    </h4>
                    <div className="bg-background border p-3 rounded-lg">
                      <pre className="text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {result.actual_api_response}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      {t("dialogs.testResults.evaluationReason")}
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
  const t = useTranslations("apiTesting");
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
  const [openResultDialogId, setOpenResultDialogId] = useState<string | null>(
    null
  );

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
      toast.error(t("messages.fillRequiredFields"));
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

      // Update test cases
      setRows((prevRows) =>
        prevRows.map((r) =>
          r.id === id ? { ...r, testCases: testCases, isGenerating: false } : r
        )
      );

      toast.success(t("messages.generateSuccess"));
    } catch (error) {
      toast.error(t("messages.generateError"));
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
      toast.error(t("messages.provideBaseUrlAndTestCases"));
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

      // Store test results
      setRows((prevRows) =>
        prevRows.map((r) =>
          r.id === id ? { ...r, isTesting: false, testResult: result } : r
        )
      );

      toast.success(
        t("messages.testSuccess", {
          passed: result.passed,
          total: result.total,
        })
      );
    } catch (error) {
      toast.error(t("messages.testError"));
      console.error(error);

      // Reset testing state on error
      setRows((prevRows) =>
        prevRows.map((r) => (r.id === id ? { ...r, isTesting: false } : r))
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-primary/5 to-blue-60/10 p-4 sm:p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-60/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10 py-8 space-y-8">
        {/* Hero Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-primary/8 via-blue-60/5 to-transparent border border-blue-60/20 mb-8 shadow-lg backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-primary/5 via-transparent to-blue-active/5"></div>
          <div className="relative p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-primary/10 to-blue-active/10 border border-blue-primary/20">
                    <Code className="w-8 h-8 text-blue-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-primary to-blue-active bg-clip-text text-transparent">
                      API Testing
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                      Generate and execute comprehensive API test cases with AI assistance
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-primary/10 border border-blue-primary/20">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-blue-primary">AI Generated</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-60/10 border border-blue-60/20">
                    <Zap className="w-3 h-3 text-blue-60" />
                    <span className="text-xs font-medium text-blue-60">Automated Testing</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-active/10 border border-blue-active/20">
                    <CheckCircle className="w-3 h-3 text-blue-active" />
                    <span className="text-xs font-medium text-blue-active">Quality Assurance</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-primary/10 to-blue-active/10 border-2 border-dashed border-blue-primary/30">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-blue-primary/20 animate-ping"></div>
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-primary to-blue-active flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="glass-card border-blue-60/20 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in delay-100">
        <CardHeader className="border-b border-blue-60/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-primary/10 text-blue-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-card-foreground">{t("title")}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure your APIs and generate comprehensive test cases
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={addRow}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-primary to-blue-active hover:from-blue-active hover:to-blue-primary shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                {t("addApi")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <style jsx>{`
            .glass-card {
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }
            .glass-card:hover {
              transform: translateY(-2px);
            }
            @media (max-width: 768px) {
              .glass-card:hover {
                transform: none;
              }
            }
          `}</style>
          <div className="overflow-x-auto rounded-lg border border-blue-60/20 bg-card/50 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    {t("table.method")}
                  </TableHead>
                  <TableHead className="w-[200px]">
                    {t("table.endpoint")}
                  </TableHead>
                  <TableHead className="w-[150px]">
                    {t("table.baseUrl")}
                  </TableHead>
                  <TableHead className="w-[250px]">
                    {t("table.description")}
                  </TableHead>
                  <TableHead className="w-[300px]">
                    {t("table.fieldDescription")}
                  </TableHead>
                  <TableHead className="w-[200px]">
                    {t("table.action")}
                  </TableHead>
                  <TableHead>{t("table.exampleTestCases")}</TableHead>
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
                        placeholder={t("placeholders.endpoint")}
                        className="w-full min-h-[40px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.baseUrl}
                        onChange={(e) =>
                          updateRow(row.id, "baseUrl", e.target.value)
                        }
                        placeholder={t("placeholders.baseUrl")}
                        className="w-full min-h-[40px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={row.api_description}
                        onChange={(e) =>
                          updateRow(row.id, "api_description", e.target.value)
                        }
                        placeholder={t("placeholders.description")}
                        className="w-full min-h-[40px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={row.field_description}
                        onChange={(e) =>
                          updateRow(row.id, "field_description", e.target.value)
                        }
                        placeholder={t("placeholders.fieldDescription")}
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
                            {t("buttons.generate")}
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
                            {t("buttons.testApi")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.testCases.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {row.testCases.length === 1
                                ? t("testCases.count", {
                                    count: row.testCases.length,
                                  })
                                : t("testCases.countPlural", {
                                    count: row.testCases.length,
                                  })}
                            </span>
                            {row.testResult && (
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  row.testResult.passed === row.testResult.total
                                    ? "bg-green-100 text-green-800"
                                    : row.testResult.passed > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {t("testCases.passed", {
                                  passed: row.testResult.passed,
                                  total: row.testResult.total,
                                })}
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
                          {t("testCases.none")}
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
              <p className="text-muted-foreground mb-4">{t("noApisAdded")}</p>
              <Button onClick={addRow} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t("addFirstApi")}
              </Button>
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
