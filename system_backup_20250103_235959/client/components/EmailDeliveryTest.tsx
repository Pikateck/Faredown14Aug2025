import React, { useState } from "react";

interface EmailTest {
  name: string;
  status: "pending" | "running" | "success" | "error";
  data?: any;
  error?: string;
  duration?: number;
}

export function EmailDeliveryTest() {
  const [tests, setTests] = useState<EmailTest[]>([
    { name: "🔧 Email Service Status", status: "pending" },
    { name: "📧 SendGrid Configuration", status: "pending" },
    { name: "📄 Voucher Email Test", status: "pending" },
    { name: "📊 Email Tracking", status: "pending" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState("john.doe@example.com");

  const updateTest = (index: number, updates: Partial<EmailTest>) => {
    setTests((prev) =>
      prev.map((test, i) => (i === index ? { ...test, ...updates } : test)),
    );
  };

  const runEmailTests = async () => {
    setIsRunning(true);

    try {
      // Test 1: Email Service Status
      updateTest(0, { status: "running" });
      const statusStart = Date.now();

      const statusResponse = await fetch("/api/vouchers/status");
      const statusData = await statusResponse.json();

      if (statusData.success && statusData.data) {
        updateTest(0, {
          status: "success",
          duration: Date.now() - statusStart,
          data: {
            provider: statusData.data.emailProvider || "Unknown",
            emailDelivery: statusData.data.features?.emailDelivery || false,
          },
        });
      } else {
        throw new Error("Email service status check failed");
      }

      // Test 2: SendGrid Configuration Check
      updateTest(1, { status: "running" });
      const configStart = Date.now();

      // Check if SendGrid is properly configured by testing provider
      const emailProvider = statusData.data?.emailProvider?.toLowerCase() || "";
      if (emailProvider === "sendgrid") {
        updateTest(1, {
          status: "success",
          duration: Date.now() - configStart,
          data: { provider: "SendGrid", configured: true },
        });
      } else {
        updateTest(1, {
          status: "error",
          duration: Date.now() - configStart,
          error: `Expected SendGrid, got ${statusData.data?.emailProvider || "undefined"}`,
        });
      }

      // Test 3: Mock Voucher Email Test
      updateTest(2, { status: "running" });
      const emailStart = Date.now();

      // Create a mock booking for email testing
      const mockBookingRef = `TEST_${Date.now()}`;

      // First create a mock pre-booking to test email
      const mockBookingData = {
        hotelCode: "TEST_HOTEL_001",
        roomCode: "DBL",
        rateKey: "TEST_RATE_KEY",
        checkIn: "2025-01-26",
        checkOut: "2025-01-28",
        rooms: 1,
        guestDetails: {
          primaryGuest: {
            title: "Mr",
            firstName: "Test",
            lastName: "User",
            email: testEmail,
            phone: "+91-9876543210",
          },
        },
        contactInfo: {
          email: testEmail,
          phone: "+91-9876543210",
        },
        totalAmount: 5000,
        currency: "INR",
      };

      // Note: In production mode, this will use fallback data
      // The email system will still be tested with mock voucher data
      try {
        const prebookResponse = await fetch("/api/bookings/hotels/pre-book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockBookingData),
        });

        const prebookResult = await prebookResponse.json();
        let bookingRef = mockBookingRef;

        if (prebookResult.success && prebookResult.data?.tempBookingRef) {
          bookingRef = prebookResult.data.tempBookingRef;
        }

        // Test voucher email delivery
        const emailResponse = await fetch(
          `/api/vouchers/hotel/${bookingRef}/email`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: testEmail }),
          },
        );

        const emailResult = await emailResponse.json();

        if (emailResult.success) {
          updateTest(2, {
            status: "success",
            duration: Date.now() - emailStart,
            data: {
              provider: emailResult.data.provider,
              emailResults: emailResult.data.emailResults,
              recipient: testEmail,
            },
          });
        } else {
          throw new Error(emailResult.error || "Email sending failed");
        }
      } catch (emailError) {
        // Even if booking fails, we can still test email system
        updateTest(2, {
          status: "error",
          duration: Date.now() - emailStart,
          error:
            emailError instanceof Error
              ? emailError.message
              : "Email test failed",
        });
      }

      // Test 4: Email Tracking
      updateTest(3, { status: "running" });
      const trackingStart = Date.now();

      try {
        const trackingResponse = await fetch("/api/vouchers/email/tracking", {
          headers: {
            Authorization: "Bearer demo_token", // Mock auth for test
          },
        });

        if (trackingResponse.ok) {
          const trackingData = await trackingResponse.json();

          updateTest(3, {
            status: "success",
            duration: Date.now() - trackingStart,
            data: {
              totalEmails: trackingData.data?.totalEmails || 0,
              successful: trackingData.data?.successful || 0,
              failed: trackingData.data?.failed || 0,
            },
          });
        } else {
          updateTest(3, {
            status: "error",
            duration: Date.now() - trackingStart,
            error: "Email tracking not accessible",
          });
        }
      } catch (trackingError) {
        updateTest(3, {
          status: "error",
          duration: Date.now() - trackingStart,
          error: "Email tracking test failed",
        });
      }
    } catch (error) {
      console.error("Email delivery test failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "running":
        return "🔄";
      default:
        return "⭕";
    }
  };

  const getOverallStatus = () => {
    const hasError = tests.some((test) => test.status === "error");
    const allComplete = tests.every(
      (test) => test.status === "success" || test.status === "error",
    );

    if (hasError) return "error";
    if (allComplete) return "success";
    if (isRunning) return "running";
    return "idle";
  };

  const getStatusColor = () => {
    switch (getOverallStatus()) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "running":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className={`border-2 rounded-lg p-4 shadow-lg ${getStatusColor()}`}>
        <div className="font-bold mb-3 text-center">
          📧 SendGrid Email Delivery Test
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium mb-1">Test Email:</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
            placeholder="test@example.com"
          />
        </div>

        <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
          {tests.map((test, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs p-2 bg-white/50 rounded"
            >
              <div className="flex items-center gap-1">
                <span>{getStatusIcon(test.status)}</span>
                <span className="font-medium">{test.name}</span>
              </div>

              <div className="text-xs text-right">
                {test.duration && (
                  <div className="text-gray-600">{test.duration}ms</div>
                )}
                {test.data && (
                  <div className="text-gray-700">
                    {Object.entries(test.data).map(([key, value]) => (
                      <div key={key}>
                        {key}: {String(value)}
                      </div>
                    ))}
                  </div>
                )}
                {test.error && <div className="text-red-600">{test.error}</div>}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={runEmailTests}
          disabled={isRunning}
          className={`w-full px-3 py-2 text-sm rounded font-medium ${
            isRunning
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          {isRunning ? "📧 Testing..." : "🚀 Test SendGrid Delivery"}
        </button>
      </div>
    </div>
  );
}
