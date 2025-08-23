import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface DebugLog {
  timestamp: string;
  level: "info" | "error" | "success";
  message: string;
  data?: any;
}

export function TransfersBargainDebug() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const addLog = (
    level: "info" | "error" | "success",
    message: string,
    data?: any,
  ) => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        data,
      },
    ]);
  };

  const testBargainAPI = async () => {
    addLog("info", "🚀 Starting transfers bargain API test");

    const sampleTransferData = {
      id: "test_transfer_1",
      vehicleType: "sedan",
      vehicleClass: "economy",
      vehicleName: "Economy Sedan",
      totalPrice: 1380,
      maxPassengers: 3,
      estimatedDuration: 45,
      pricing: { totalPrice: 1380, basePrice: 1200 },
    };

    try {
      // Test 1: Health Check
      addLog("info", "🔍 Testing health endpoint");
      const healthResponse = await fetch("/api/transfers-bargain/health");
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        addLog("success", "✅ Health check passed", healthData);
      } else {
        addLog("error", "❌ Health check failed", {
          status: healthResponse.status,
        });
      }

      // Test 2: Start Session
      addLog("info", "🚀 Starting bargain session");
      const startResponse = await fetch(
        "/api/transfers-bargain/session/start",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transferData: sampleTransferData,
            userProfile: { tier: "standard" },
            searchDetails: {
              pickupLocation: "Mumbai Airport",
              dropoffLocation: "Hotel Taj Mahal",
              pickupDate: "2024-12-25",
            },
          }),
        },
      );

      if (startResponse.ok) {
        const startData = await startResponse.json();
        setSessionId(startData.sessionId);
        addLog("success", "✅ Session started", startData);

        // Test 3: Make Offer
        addLog("info", "💰 Making test offer: ₹1200");
        const offerResponse = await fetch(
          "/api/transfers-bargain/session/offer",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: startData.sessionId,
              userOffer: 1200,
              message: "Test offer",
            }),
          },
        );

        if (offerResponse.ok) {
          const offerData = await offerResponse.json();
          addLog("success", "✅ Offer processed", offerData);
        } else {
          addLog("error", "❌ Offer failed", { status: offerResponse.status });
        }
      } else {
        addLog("error", "❌ Session start failed", {
          status: startResponse.status,
        });
      }
    } catch (error) {
      addLog("error", "❌ API Error", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const testFallbackLogic = () => {
    addLog("info", "🔄 Testing fallback bargain logic");

    const originalPrice = 1380;
    const userOffer = 1200;
    const costPrice = originalPrice * 0.7;
    const minSellingPrice = costPrice * 1.08;

    addLog("info", "💰 Pricing calculation", {
      originalPrice,
      userOffer,
      costPrice,
      minSellingPrice,
      isProfitable: userOffer >= minSellingPrice,
    });

    if (userOffer >= minSellingPrice) {
      const counterOffer = Math.round(originalPrice * 0.9);
      addLog("success", "✅ Counter offer generated", { counterOffer });
    } else {
      addLog("error", "❌ Offer rejected - below minimum", {
        minRequired: minSellingPrice,
      });
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setSessionId(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">
        Transfers Bargain Debug Console
      </h3>

      <div className="flex gap-2 mb-4">
        <Button onClick={testBargainAPI} size="sm">
          Test API
        </Button>
        <Button onClick={testFallbackLogic} variant="outline" size="sm">
          Test Fallback
        </Button>
        <Button onClick={clearLogs} variant="ghost" size="sm">
          Clear Logs
        </Button>
      </div>

      {sessionId && (
        <div className="mb-4 p-2 bg-blue-50 rounded">
          <strong>Session ID:</strong> {sessionId}
        </div>
      )}

      <div className="max-h-96 overflow-y-auto space-y-2">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`p-2 rounded text-sm font-mono ${
              log.level === "success"
                ? "bg-green-50 text-green-800"
                : log.level === "error"
                  ? "bg-red-50 text-red-800"
                  : "bg-gray-50 text-gray-800"
            }`}
          >
            <div className="flex justify-between">
              <span>{log.message}</span>
              <span className="text-xs opacity-60">{log.timestamp}</span>
            </div>
            {log.data && (
              <pre className="mt-1 text-xs opacity-75 overflow-x-auto">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
