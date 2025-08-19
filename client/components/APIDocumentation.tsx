/**
 * API Documentation Component
 * Displays comprehensive API documentation
 */

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Code,
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

interface APIDocProps {
  endpoint: {
    id: string;
    name: string;
    method: string;
    url: string;
    description: string;
    auth_required: boolean;
    headers?: { [key: string]: string };
    body_schema?: any;
    response_schema?: any;
    examples?: any[];
    rate_limit?: string;
    status_codes?: { [key: string]: string };
  };
}

const APIDocumentation: React.FC<APIDocProps> = ({ endpoint }) => {
  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-500";
      case "POST":
        return "bg-green-500";
      case "PUT":
        return "bg-yellow-500";
      case "DELETE":
        return "bg-red-500";
      case "PATCH":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const defaultStatusCodes = {
    "200": "OK - Request successful",
    "201": "Created - Resource created successfully",
    "400": "Bad Request - Invalid request format",
    "401": "Unauthorized - Authentication required",
    "403": "Forbidden - Access denied",
    "404": "Not Found - Resource not found",
    "429": "Too Many Requests - Rate limit exceeded",
    "500": "Internal Server Error - Server error",
  };

  const statusCodes = endpoint.status_codes || defaultStatusCodes;

  return (
    <div className="space-y-6">
      {/* Endpoint Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge
                className={`${getMethodColor(endpoint.method)} text-white`}
              >
                {endpoint.method}
              </Badge>
              <div>
                <CardTitle>{endpoint.name}</CardTitle>
                <CardDescription className="font-mono text-sm">
                  {endpoint.url}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {endpoint.auth_required ? (
                <Badge variant="destructive">
                  <Lock className="w-3 h-3 mr-1" />
                  Auth Required
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Unlock className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              )}
              {endpoint.rate_limit && (
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {endpoint.rate_limit}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{endpoint.description}</p>
        </CardContent>
      </Card>

      {/* Documentation Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="errors">Error Codes</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="font-semibold text-2xl">
                    {endpoint.method}
                  </div>
                  <div className="text-sm text-gray-600">HTTP Method</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="font-semibold text-2xl">
                    {endpoint.auth_required ? "🔒" : "🔓"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {endpoint.auth_required ? "Authenticated" : "Public"}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="font-semibold text-2xl">JSON</div>
                  <div className="text-sm text-gray-600">Content Type</div>
                </div>
              </div>

              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                <div className="text-blue-400"># cURL Example</div>
                <div className="mt-2">
                  curl -X {endpoint.method} \<br />
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                  {endpoint.auth_required && (
                    <>
                      &nbsp;&nbsp;-H "Authorization: Bearer YOUR_TOKEN" \<br />
                    </>
                  )}
                  &nbsp;&nbsp;"{endpoint.url}"
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Request Documentation */}
        <TabsContent value="request">
          <div className="space-y-4">
            {/* Headers */}
            <Card>
              <CardHeader>
                <CardTitle>Request Headers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Header</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">Content-Type</TableCell>
                      <TableCell className="font-mono">
                        application/json
                      </TableCell>
                      <TableCell>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </TableCell>
                    </TableRow>
                    {endpoint.auth_required && (
                      <TableRow>
                        <TableCell className="font-mono">
                          Authorization
                        </TableCell>
                        <TableCell className="font-mono">
                          Bearer &lt;token&gt;
                        </TableCell>
                        <TableCell>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </TableCell>
                      </TableRow>
                    )}
                    {endpoint.headers &&
                      Object.entries(endpoint.headers).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-mono">{key}</TableCell>
                          <TableCell className="font-mono">{value}</TableCell>
                          <TableCell>
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Request Body */}
            {endpoint.body_schema && (
              <Card>
                <CardHeader>
                  <CardTitle>Request Body</CardTitle>
                  <CardDescription>
                    JSON schema for request payload
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(endpoint.body_schema, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Response Documentation */}
        <TabsContent value="response">
          <Card>
            <CardHeader>
              <CardTitle>Response Format</CardTitle>
              <CardDescription>Expected response structure</CardDescription>
            </CardHeader>
            <CardContent>
              {endpoint.response_schema ? (
                <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(endpoint.response_schema, null, 2)}
                </pre>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Standard response format for successful requests:
                  </div>
                  <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                    {`{
  "success": true,
  "data": {...},
  "timestamp": "2025-01-15T10:30:00Z"
}`}
                  </pre>
                  <div className="text-sm text-gray-600">
                    Error response format:
                  </div>
                  <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                    {`{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}`}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples */}
        <TabsContent value="examples">
          <div className="space-y-4">
            {endpoint.examples && endpoint.examples.length > 0 ? (
              endpoint.examples.map((example, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>
                      Example {index + 1}: {example.name || "Basic Request"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="request">
                      <TabsList>
                        <TabsTrigger value="request">Request</TabsTrigger>
                        <TabsTrigger value="response">Response</TabsTrigger>
                      </TabsList>
                      <TabsContent value="request">
                        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-sm">
                          {JSON.stringify(
                            example.body || example.params || {},
                            null,
                            2,
                          )}
                        </pre>
                      </TabsContent>
                      <TabsContent value="response">
                        <pre className="bg-gray-900 text-blue-400 p-4 rounded overflow-auto text-sm">
                          {JSON.stringify(
                            example.response || {
                              success: true,
                              data: "Response data here",
                              timestamp: "2025-01-15T10:30:00Z",
                            },
                            null,
                            2,
                          )}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No examples available</p>
                  <p className="text-sm text-gray-400">
                    Try this endpoint in the API Testing tab
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Error Codes */}
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>HTTP Status Codes</CardTitle>
              <CardDescription>
                Possible response status codes and their meanings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(statusCodes).map(([code, description]) => (
                    <TableRow key={code}>
                      <TableCell className="font-mono font-semibold">
                        {code}
                      </TableCell>
                      <TableCell>{description}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            code.startsWith("2")
                              ? "default"
                              : code.startsWith("4")
                                ? "destructive"
                                : code.startsWith("5")
                                  ? "destructive"
                                  : "secondary"
                          }
                        >
                          {code.startsWith("2")
                            ? "Success"
                            : code.startsWith("4")
                              ? "Client Error"
                              : code.startsWith("5")
                                ? "Server Error"
                                : "Info"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIDocumentation;
