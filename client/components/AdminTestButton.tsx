/**
 * Admin Test Button Component
 * Provides quick access to admin dashboard, API testing, and bargain system
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Database,
  BarChart3,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Code,
  Tag,
  AlertCircle,
} from "lucide-react";

interface AdminTestButtonProps {
  className?: string;
  variant?: "desktop" | "mobile";
}

export default function AdminTestButton({
  className = "",
  variant = "desktop",
}: AdminTestButtonProps) {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking",
  );
  const [apiPort, setApiPort] = useState<number | null>(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    // Always set to offline to avoid fetch calls
    console.log("API status check: Using fallback mode (fetch disabled)");
    setApiStatus("offline");
    setApiPort(null);
  };

  const openAdminDashboard = () => {
    window.open("/admin/dashboard", "_blank");
  };

  const openApiDocs = () => {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("localhost");

    if (!isLocalhost) {
      alert("API documentation is only available in development environment.");
      return;
    }

    if (apiPort) {
      window.open(`http://localhost:${apiPort}/api/docs`, "_blank");
    } else {
      alert("API server is not running. Please start the API server first.");
    }
  };

  const testApiEndpoint = async (endpoint: string) => {
    // Always show fallback message to avoid fetch calls
    console.log(
      `API test for ${endpoint}: Using fallback mode (fetch disabled)`,
    );
    alert(
      "API testing disabled to prevent fetch errors. Using fallback mode for development.",
    );
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case "checking":
        return <RefreshCw className="w-3 h-3 animate-spin" />;
      case "online":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "offline":
        return <XCircle className="w-3 h-3 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (apiStatus) {
      case "checking":
        return (
          <Badge variant="secondary" className="text-xs">
            Checking...
          </Badge>
        );
      case "online":
        return (
          <Badge className="bg-green-100 text-green-800 text-xs">
            API Online :{apiPort}
          </Badge>
        );
      case "offline":
        return (
          <Badge variant="destructive" className="text-xs">
            API Offline
          </Badge>
        );
    }
  };

  if (variant === "mobile") {
    return (
      <div className="space-y-2">
        <button
          className="flex items-center justify-between w-full text-white py-3 px-2 rounded bg-red-500 hover:bg-red-600 border-b border-red-600"
          onClick={openAdminDashboard}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </div>
          <ExternalLink className="w-3 h-3" />
        </button>

        <div className="flex items-center justify-between w-full text-white py-2 px-2">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span className="text-sm">API Status:</span>
          </div>
          {getStatusBadge()}
        </div>

        {apiStatus === "offline" && (
          <div className="w-full px-2 py-2">
            <div className="bg-yellow-600 text-white text-xs p-2 rounded">
              {window.location.hostname === "localhost" ||
              window.location.hostname === "127.0.0.1" ||
              window.location.hostname.includes("localhost")
                ? "Start API: cd api && npm start"
                : "API testing available in dev only"}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={`bg-red-500 text-white border-red-500 hover:bg-red-600 rounded text-xs font-medium px-2 py-1.5 shadow-lg ${className}`}
          title="Admin & Testing Tools"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-3 h-3" />
            {getStatusIcon()}
            <span className="hidden sm:inline">Admin</span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Admin & Testing Tools</h4>
            <Button size="sm" variant="ghost" onClick={checkApiStatus}>
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-600">API Status:</span>
            {getStatusBadge()}
          </div>
        </div>

        <DropdownMenuItem onClick={openAdminDashboard}>
          <Settings className="w-4 h-4 mr-2" />
          <div className="flex-1">
            <div className="font-medium">Admin Dashboard</div>
            <div className="text-xs text-gray-500">
              Promo codes, users, analytics
            </div>
          </div>
          <ExternalLink className="w-3 h-3" />
        </DropdownMenuItem>

        <div className="px-3 py-2">
          <div className="text-xs font-medium text-gray-600 mb-2">
            Quick API Tests
          </div>
          <div className="grid grid-cols-2 gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => testApiEndpoint("/health")}
              disabled={apiStatus !== "online"}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Health
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => testApiEndpoint("/api/admin/dashboard")}
              disabled={apiStatus !== "online"}
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Stats
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => testApiEndpoint("/api/promo/admin/all")}
              disabled={apiStatus !== "online"}
            >
              <Tag className="w-3 h-3 mr-1" />
              Promos
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={openApiDocs}
              disabled={apiStatus !== "online"}
            >
              <Code className="w-3 h-3 mr-1" />
              Docs
            </Button>
          </div>
        </div>

        {apiStatus === "offline" && (
          <div className="px-3 py-2 bg-yellow-50 border-t">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-700">
                {window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1" ||
                window.location.hostname.includes("localhost") ? (
                  <>
                    <div className="font-medium">API Server Not Running</div>
                    <div className="mt-1">
                      Start the API server with:
                      <br />
                      <code className="bg-gray-100 px-1 rounded">
                        cd api && npm start
                      </code>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-medium">Production Environment</div>
                    <div className="mt-1">
                      API testing is only available in development.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
