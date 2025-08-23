import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface ApiStatus {
  isOnline: boolean;
  message: string;
  endpoint: string;
}

export function ApiHealthCheck() {
  const [status, setStatus] = useState<ApiStatus>({
    isOnline: false,
    message: "Checking...",
    endpoint: "/health",
  });

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      console.log("🔍 Checking API health...");

      const data = await apiClient.healthCheck();

      if (data.status && data.status !== "fallback") {
        setStatus({
          isOnline: true,
          message: `API server is running (${data.status})`,
          endpoint: "/health",
        });
        console.log("✅ API health check passed");
      } else {
        setStatus({
          isOnline: false,
          message:
            data.status === "fallback"
              ? "Using fallback mode (API unavailable)"
              : "API server returned unexpected status",
          endpoint: "/health",
        });
        console.warn("⚠️ API in fallback mode");
      }
    } catch (error) {
      // Silently handle failures without throwing errors
      console.warn(
        "⚠️ API health check failed (expected in production):",
        error instanceof Error ? error.message : "Unknown error",
      );
      setStatus({
        isOnline: false,
        message: "API server not accessible (running in fallback mode)",
        endpoint: "/health",
      });
    }
  };

  const getStatusColor = () => {
    return status.isOnline
      ? "bg-green-50 border-green-200 text-green-800"
      : "bg-red-50 border-red-200 text-red-800";
  };

  const getStatusIcon = () => {
    return status.isOnline ? "✅" : "❌";
  };

  return (
    <div className={`p-3 rounded-lg border-2 ${getStatusColor()} mb-4`}>
      <div className="flex items-center gap-2">
        <span>{getStatusIcon()}</span>
        <span className="font-medium">API Server Status</span>
      </div>
      <div className="text-sm mt-1">{status.message}</div>
      {!status.isOnline && (
        <div className="text-xs mt-2 opacity-75">
          Live Hotelbeds data requires the API server to be running.
          <br />
          Falling back to demo data for now.
        </div>
      )}
      <button
        onClick={checkApiHealth}
        className="text-xs mt-2 px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75"
      >
        🔄 Recheck
      </button>
    </div>
  );
}
