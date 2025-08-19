/**
 * API Test Panel Component
 * Real-time testing of backend API integration
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  apiTester,
  runFullApiTest,
  TestResult,
  TestSuite,
} from "@/utils/apiTest";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
  RotateCcw,
  Wifi,
  WifiOff,
} from "lucide-react";

export function ApiTestPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestSuite[]>([]);
  const [summary, setSummary] = useState<{
    totalSuites: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    totalDuration: number;
  } | null>(null);
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults([]);
    setSummary(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const results = await runFullApiTest();

      clearInterval(progressInterval);
      setProgress(100);

      setTestResults(results.overallResults);
      setSummary(results.summary);
    } catch (error) {
      console.error("Error running tests:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleSuiteExpansion = (suiteName: string) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteName)) {
      newExpanded.delete(suiteName);
    } else {
      newExpanded.add(suiteName);
    }
    setExpandedSuites(newExpanded);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Faredown API Integration Test Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? "Running Tests..." : "Run Full API Test"}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setTestResults([]);
                setSummary(null);
                setProgress(0);
                apiTester.clearResults();
              }}
              disabled={isRunning}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Results
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Testing API endpoints...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {summary.successRate === 100 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : summary.successRate >= 50 ? (
                <WifiOff className="w-5 h-5 text-yellow-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              Test Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.totalSuites}</div>
                <div className="text-sm text-gray-600">Test Suites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.totalTests}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {summary.passedTests}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {summary.failedTests}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {summary.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
              Total Duration: {summary.totalDuration}ms
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results by Suite</h3>

          {testResults.map((suite) => (
            <Card key={suite.name}>
              <Collapsible
                open={expandedSuites.has(suite.name)}
                onOpenChange={() => toggleSuiteExpansion(suite.name)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {expandedSuites.has(suite.name) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span>{suite.name}</span>
                        {getStatusBadge(suite.failedTests === 0)}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600">
                          {suite.passedTests} passed
                        </span>
                        <span className="text-red-600">
                          {suite.failedTests} failed
                        </span>
                        <span className="text-gray-600">
                          {suite.totalDuration}ms
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {suite.results.map((test, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(test.success)}
                            <span className="font-medium">{test.testName}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {test.duration}ms
                            </span>
                            {!test.success && test.error && (
                              <Badge variant="outline" className="text-red-600">
                                {test.error}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            1. <strong>Make sure the backend is running</strong> on{" "}
            <code>http://localhost:8000</code>
          </p>
          <p>
            2. <strong>Click "Run Full API Test"</strong> to test all endpoints
          </p>
          <p>
            3. <strong>Check the results</strong> - Green means working, Red
            means issues
          </p>
          <p>
            4. <strong>Expand test suites</strong> to see detailed results for
            each endpoint
          </p>
          <p>
            5. <strong>Open browser console</strong> for detailed logs and error
            messages
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ApiTestPanel;
