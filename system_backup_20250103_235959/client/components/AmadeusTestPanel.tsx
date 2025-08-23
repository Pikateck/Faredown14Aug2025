import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

interface FlightResult {
  id: string;
  flightNumber: string;
  airline: {
    code: string;
    name: string;
    logo: string;
  };
  departure: {
    airport: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    time: string;
    terminal?: string;
  };
  duration: string;
  stops: number;
  price: number;
  currency: string;
  cabinClass: string;
  isLiveData: boolean;
  supplier: string;
}

interface AmadeusTestResult {
  success: boolean;
  data?: FlightResult[];
  error?: string;
  message?: string;
  flightCount?: number;
}

export default function AmadeusTestPanel() {
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [isTestingSearch, setIsTestingSearch] = useState(false);
  const [authResult, setAuthResult] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<AmadeusTestResult | null>(
    null,
  );

  const testAmadeusAuth = async () => {
    setIsTestingAuth(true);
    setAuthResult(null);

    try {
      const response = await fetch("/api/test-amadeus-auth");
      const data = await response.json();
      setAuthResult(data);
    } catch (error) {
      setAuthResult({
        success: false,
        error: "Network error: " + error.message,
        message: "Failed to connect to server",
      });
    } finally {
      setIsTestingAuth(false);
    }
  };

  const testFlightSearch = async () => {
    setIsTestingSearch(true);
    setSearchResult(null);

    try {
      // Test the specific route you mentioned: BOM → DXB, Aug 15, 2025
      const searchParams = new URLSearchParams({
        origin: "BOM",
        destination: "DXB",
        departureDate: "2025-08-15",
        adults: "1",
      });

      const response = await fetch(`/api/flights/search?${searchParams}`);
      const data = await response.json();
      setSearchResult(data);
    } catch (error) {
      setSearchResult({
        success: false,
        error: "Network error: " + error.message,
        message: "Failed to connect to server",
      });
    } finally {
      setIsTestingSearch(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg border">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Amadeus API Test Panel
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Test the updated Amadeus sandbox credentials
        </p>
      </div>

      {/* API Keys Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">
          Current API Configuration
        </h3>
        <div className="space-y-1 text-sm text-blue-800">
          <div>API Key: 6H8SAsHAPdGAlWFYWNKgxQetHgeGCeNv</div>
          <div>API Secret: 2eVYfPeZVxmvbjRm</div>
          <div>Base URL: https://test.api.amadeus.com</div>
        </div>
      </div>

      {/* OAuth2 Token Test */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-gray-900">1. OAuth2 Token Test</h3>
          <Button onClick={testAmadeusAuth} disabled={isTestingAuth} size="sm">
            {isTestingAuth ? "Testing..." : "Test Authentication"}
          </Button>
        </div>

        {authResult && (
          <Alert
            className={
              authResult.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <AlertDescription>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={authResult.success ? "default" : "destructive"}
                  >
                    {authResult.success ? "SUCCESS" : "FAILED"}
                  </Badge>
                  <span className="text-sm font-medium">
                    {authResult.message ||
                      (authResult.success
                        ? "Authentication successful"
                        : "Authentication failed")}
                  </span>
                </div>

                {/* Credentials Validation */}
                {authResult.credentialsValidation && (
                  <div className="bg-gray-100 p-2 rounded text-xs">
                    <div className="font-medium mb-1">
                      Credentials Validation:
                    </div>
                    <div className="space-y-1">
                      <div>
                        API Key Length:{" "}
                        {authResult.credentialsValidation.apiKeyLength} ✓
                      </div>
                      <div>
                        Secret Length:{" "}
                        {authResult.credentialsValidation.secretLength} ✓
                      </div>
                      <div>
                        Format Valid:{" "}
                        {authResult.credentialsValidation.apiKeyFormat &&
                        authResult.credentialsValidation.secretFormat
                          ? "✅"
                          : "❌"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Auth Response Details */}
                {authResult.authResponse && (
                  <div className="bg-gray-100 p-2 rounded text-xs">
                    <div className="font-medium mb-1">Response Details:</div>
                    <div>Status: {authResult.authResponse.status}</div>
                    {authResult.authResponse.tokenType && (
                      <div>Token Type: {authResult.authResponse.tokenType}</div>
                    )}
                    {authResult.authResponse.expiresIn && (
                      <div>
                        Expires In: {authResult.authResponse.expiresIn}s
                      </div>
                    )}
                  </div>
                )}

                {/* Error Details */}
                {authResult.error && (
                  <div className="text-xs text-red-600 font-mono bg-red-100 p-2 rounded">
                    {authResult.error}
                  </div>
                )}

                {/* Troubleshooting */}
                {authResult.authResponse?.troubleshooting && (
                  <div className="bg-yellow-50 p-3 rounded text-xs">
                    <div className="font-medium text-yellow-800 mb-2">
                      Troubleshooting:
                    </div>
                    <div className="text-yellow-700 space-y-2">
                      <div>
                        <div className="font-medium">Possible Causes:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {authResult.authResponse.troubleshooting.possibleCauses.map(
                            (cause, index) => (
                              <li key={index}>{cause}</li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium">Next Steps:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {authResult.authResponse.troubleshooting.nextSteps.map(
                            (step, index) => (
                              <li key={index}>{step}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {authResult.success && authResult.flightCount && (
                  <div className="text-xs text-green-600">
                    Found {authResult.flightCount} flight offers
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Flight Search Test */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-gray-900">
            2. Flight Search Test (BOM → DXB, Aug 15, 2025)
          </h3>
          <Button
            onClick={testFlightSearch}
            disabled={isTestingSearch}
            size="sm"
          >
            {isTestingSearch ? "Searching..." : "Test Flight Search"}
          </Button>
        </div>

        {searchResult && (
          <Alert
            className={
              searchResult.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={searchResult.success ? "default" : "destructive"}
                  >
                    {searchResult.success ? "SUCCESS" : "FAILED"}
                  </Badge>
                  <span className="text-sm font-medium">
                    {searchResult.message || "Flight search completed"}
                  </span>
                </div>

                {searchResult.error && (
                  <div className="text-xs text-red-600 font-mono bg-red-100 p-2 rounded">
                    {searchResult.error}
                  </div>
                )}

                {searchResult.success && searchResult.data && (
                  <div className="space-y-2">
                    <div className="text-xs text-green-600">
                      Found {searchResult.data.length} flights | Source:{" "}
                      {searchResult.source || "Unknown"} | Live Data:{" "}
                      {searchResult.isLiveData ? "Yes" : "No"}
                    </div>

                    {/* Show first 2 flights as examples */}
                    {searchResult.data.slice(0, 2).map((flight, index) => (
                      <div
                        key={flight.id}
                        className="text-xs bg-gray-50 p-2 rounded border"
                      >
                        <div className="font-medium">
                          {flight.flightNumber} - {flight.airline.name}
                        </div>
                        <div className="text-gray-600">
                          {flight.departure.airport} → {flight.arrival.airport}{" "}
                          |{flight.duration} | {flight.stops} stops |
                          {flight.price} {flight.currency} |{flight.cabinClass}{" "}
                          | Supplier: {flight.supplier}
                        </div>
                        <div className="text-blue-600">
                          Live Data:{" "}
                          {flight.isLiveData ? "✅ Yes" : "❌ No (Fallback)"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Status Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">
          Expected Results & Troubleshooting
        </h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div>
            ✅ OAuth2 authentication should succeed with new credentials
          </div>
          <div>✅ Flight search should return live Amadeus data</div>

          <div className="mt-3 pt-2 border-t">
            <div className="font-medium text-gray-800 mb-1">
              If authentication is still failing:
            </div>
            <div className="space-y-1">
              <div>
                ⏱️ New credentials can take up to 30 minutes to activate
              </div>
              <div>
                🔑 Verify credentials are copied exactly from Amadeus For
                Developers portal
              </div>
              <div>
                🧪 Ensure test environment access is enabled in your Amadeus
                account
              </div>
              <div>
                📋 Check that your Amadeus application is properly configured
              </div>
              <div>
                📧 Contact Amadeus support if issues persist after 30+ minutes
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t">
            <div className="font-medium text-gray-800 mb-1">
              Current Status:
            </div>
            <div>Credentials: 6H8SAsHAPdGAlWFYWNKgxQetHgeGCeNv (34 chars)</div>
            <div>Secret: 2eVYfPeZVxmvbjRm (17 chars)</div>
            <div>Environment: Test/Sandbox (test.api.amadeus.com)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
