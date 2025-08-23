import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function AdminAuthHelper() {
  const [token, setToken] = useState(localStorage.getItem("auth_token") || "");
  const [isGettingToken, setIsGettingToken] = useState(false);
  const [message, setMessage] = useState("");

  const getTestToken = async () => {
    setIsGettingToken(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/auth/test-token");
      const data = await response.json();

      if (data.success) {
        const newToken = data.data.token;
        setToken(newToken);
        localStorage.setItem("auth_token", newToken);
        setMessage("✅ Test admin token generated and saved to localStorage");
      } else {
        setMessage("❌ Failed to generate test token: " + data.error?.message);
      }
    } catch (error) {
      setMessage("❌ Network error: " + error.message);
    } finally {
      setIsGettingToken(false);
    }
  };

  const clearToken = () => {
    setToken("");
    localStorage.removeItem("auth_token");
    setMessage("🗑️ Token cleared from localStorage");
  };

  const testAuth = async () => {
    if (!token) {
      setMessage("❌ No token available. Generate a test token first.");
      return;
    }

    try {
      const response = await fetch("/api/admin/suppliers/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(
          "✅ Authentication test successful! Admin APIs are working.",
        );
      } else {
        setMessage(
          `❌ Authentication test failed: ${data.error?.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      setMessage("❌ Test request failed: " + error.message);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Admin Authentication Helper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Current Admin Token:</label>
          <Input
            value={token}
            readOnly
            placeholder="No token set"
            className="font-mono text-xs"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={getTestToken}
            disabled={isGettingToken}
            variant="default"
          >
            {isGettingToken ? "Generating..." : "Generate Test Token"}
          </Button>

          <Button onClick={testAuth} disabled={!token} variant="outline">
            Test Authentication
          </Button>

          <Button onClick={clearToken} disabled={!token} variant="destructive">
            Clear Token
          </Button>
        </div>

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Usage:</strong>
          </p>
          <p>1. Click "Generate Test Token" to create an admin JWT token</p>
          <p>2. Click "Test Authentication" to verify the token works</p>
          <p>
            3. The token is automatically saved to localStorage for API calls
          </p>
          <p>4. Now try accessing Admin → Supplier Management</p>
        </div>
      </CardContent>
    </Card>
  );
}
