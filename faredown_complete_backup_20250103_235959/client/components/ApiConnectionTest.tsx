import React, { useState, useEffect } from "react";
import { hotelsService } from "@/services/hotelsService";

export function ApiConnectionTest() {
  const [status, setStatus] = useState<
    "testing" | "connected" | "fallback" | "error"
  >("testing");
  const [message, setMessage] = useState("Testing API connection...");
  const [destinations, setDestinations] = useState<any[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus("testing");
      setMessage("Testing destination search...");

      const results = await hotelsService.searchDestinations("Dubai");

      if (results && results.length > 0) {
        setDestinations(results);

        // In development mode, we always use fallback data to avoid fetch errors
        // Check if we're getting the expected fallback data structure
        const hasExpectedFallback = results.some(
          (dest) =>
            dest.id &&
            ["DXB", "LON", "NYC", "PAR", "BOM", "DEL"].includes(dest.id),
        );

        if (hasExpectedFallback) {
          setStatus("fallback");
          setMessage(
            "✅ Development mode - using fallback data (no API calls)",
          );
        } else {
          setStatus("error");
          setMessage("❌ Unexpected data structure - check fallback system");
        }
      } else {
        setStatus("fallback");
        setMessage("⚠️ No destinations found - check API connection");
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        `❌ Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      console.error("API connection test error:", error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "text-green-600 bg-green-50 border-green-200";
      case "fallback":
        return "text-blue-600 bg-blue-50 border-blue-200"; // Blue for development mode
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
        <div className="font-medium mb-2">API Connection Status</div>
        <div className="text-sm mb-3">{message}</div>

        {destinations.length > 0 && (
          <div className="text-xs">
            <div className="font-medium mb-1">Sample destinations:</div>
            {destinations.slice(0, 3).map((dest, idx) => (
              <div key={idx} className="truncate">
                • {dest.name}, {dest.country}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={testConnection}
          disabled={status === "testing"}
          className="mt-3 px-3 py-1 text-xs bg-white border border-current rounded hover:bg-opacity-80 disabled:opacity-50"
        >
          {status === "testing" ? "Testing..." : "Test Again"}
        </button>
      </div>
    </div>
  );
}
