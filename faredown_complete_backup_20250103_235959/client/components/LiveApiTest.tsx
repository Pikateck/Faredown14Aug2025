import React, { useState } from "react";

export function LiveApiTest() {
  const [status, setStatus] = useState<string>("Ready to test");
  const [isLoading, setIsLoading] = useState(false);
  const isProduction = window.location.hostname !== "localhost";

  const testLiveConnection = async () => {
    setIsLoading(true);
    setStatus("Testing...");

    try {
      // Check if we're in production
      if (isProduction) {
        setStatus(
          "⚠️ Production Mode\nLive API testing disabled\nUsing fallback data",
        );
        return;
      }

      // Test the exact endpoint our API client will use
      const apiUrl = "http://localhost:3001/health";
      console.log(`🧪 Testing live API: ${apiUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setStatus(
          `✅ LIVE API CONNECTED!\nStatus: ${data.status}\nDatabase: ${data.database}\nTime: ${data.timestamp}`,
        );
        console.log("🎉 Live API response:", data);
      } else {
        setStatus(`⚠️ API responded with status: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setStatus("⏰ Connection timeout - API may not be running");
        } else if (error.message.includes("fetch")) {
          setStatus(
            "❌ Cannot connect to API server\nEnsure server is running on port 3001",
          );
        } else {
          setStatus(`❌ Connection error: ${error.message}`);
        }
        console.error("API test error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 max-w-sm">
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 shadow-lg">
        <div className="font-bold mb-3 text-center">🔌 Live API Test</div>

        <div className="text-xs mb-3 whitespace-pre-line">{status}</div>

        <button
          onClick={testLiveConnection}
          disabled={isLoading || isProduction}
          className={`w-full px-3 py-2 text-sm rounded font-medium ${
            isLoading || isProduction
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isLoading
            ? "🔄 Testing..."
            : isProduction
              ? "🚫 Production"
              : "🧪 Test Live API"}
        </button>
      </div>
    </div>
  );
}
