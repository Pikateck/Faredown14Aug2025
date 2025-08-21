import React, { useState } from "react";

interface FlowStep {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "error";
  duration?: number;
  data?: any;
  error?: string;
}

export function BookingFlowTest() {
  const [steps, setSteps] = useState<FlowStep[]>([
    { id: "search", name: "🔍 Hotel Search", status: "pending" },
    { id: "select", name: "🏨 Hotel Selection", status: "pending" },
    { id: "prebook", name: "📝 Pre-booking Creation", status: "pending" },
    { id: "payment", name: "💳 Payment Processing", status: "pending" },
    { id: "confirm", name: "✅ Booking Confirmation", status: "pending" },
    { id: "voucher", name: "📄 Voucher Generation", status: "pending" },
    { id: "email", name: "📧 Email Delivery", status: "pending" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<
    "idle" | "running" | "success" | "error"
  >("idle");
  const isProduction =
    typeof window !== "undefined" && window.location.hostname !== "localhost";

  const updateStep = (stepId: string, updates: Partial<FlowStep>) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, ...updates } : step)),
    );
  };

  const runCompleteFlow = async () => {
    setIsRunning(true);
    setOverallStatus("running");

    try {
      // Step 1: Hotel Search
      updateStep("search", { status: "running" });
      const searchStart = Date.now();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const searchParams = new URLSearchParams({
        destination: "Dubai",
        checkIn: tomorrow.toISOString().split("T")[0],
        checkOut: dayAfter.toISOString().split("T")[0],
        rooms: "1",
        adults: "2",
        children: "0",
      });

      const searchResponse = await fetch(`/api/hotels/search?${searchParams}`);
      const searchData = await searchResponse.json();

      if (searchData.success && searchData.data?.length > 0) {
        updateStep("search", {
          status: "success",
          duration: Date.now() - searchStart,
          data: { hotelCount: searchData.data.length },
        });
      } else {
        throw new Error("No hotels found");
      }

      // Step 2: Hotel Selection (simulate selection)
      updateStep("select", { status: "running" });
      const selectStart = Date.now();

      const selectedHotel = searchData.data[0];
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate selection

      updateStep("select", {
        status: "success",
        duration: Date.now() - selectStart,
        data: { hotelName: selectedHotel.name || "Sample Hotel" },
      });

      // Step 3: Pre-booking Creation
      updateStep("prebook", { status: "running" });
      const prebookStart = Date.now();

      const prebookData = {
        hotelCode: selectedHotel.code || "SAMPLE001",
        roomCode: "DBL",
        rateKey: "SAMPLE_RATE_KEY",
        checkIn: tomorrow.toISOString().split("T")[0],
        checkOut: dayAfter.toISOString().split("T")[0],
        rooms: 1,
        guestDetails: {
          primaryGuest: {
            title: "Mr",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "+91-9876543210",
          },
        },
        contactInfo: {
          email: "john.doe@example.com",
          phone: "+91-9876543210",
        },
        totalAmount: 5000,
        currency: "INR",
      };

      const prebookResponse = await fetch("/api/bookings/hotels/pre-book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prebookData),
      });

      const prebookResult = await prebookResponse.json();

      if (prebookResult.success) {
        updateStep("prebook", {
          status: "success",
          duration: Date.now() - prebookStart,
          data: { tempRef: prebookResult.data.tempBookingRef },
        });
      } else {
        throw new Error("Pre-booking failed");
      }

      // Step 4: Payment Processing (mock)
      updateStep("payment", { status: "running" });
      const paymentStart = Date.now();

      const paymentData = {
        tempBookingRef: prebookResult.data.tempBookingRef,
        amount: 5000,
        currency: "INR",
        customerDetails: prebookData.guestDetails.primaryGuest,
        hotelDetails: { name: selectedHotel.name || "Sample Hotel" },
      };

      const paymentResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        updateStep("payment", {
          status: "success",
          duration: Date.now() - paymentStart,
          data: { orderId: paymentResult.data.orderId },
        });
      } else {
        throw new Error("Payment order creation failed");
      }

      // Step 5: Booking Confirmation (simulate payment success)
      updateStep("confirm", { status: "running" });
      const confirmStart = Date.now();

      const confirmData = {
        tempBookingRef: prebookResult.data.tempBookingRef,
        paymentId: "pay_mock_success_123",
        razorpay_order_id: paymentResult.data.orderId,
        razorpay_payment_id: "pay_mock_success_123",
        razorpay_signature: "mock_signature_hash",
      };

      const confirmResponse = await fetch("/api/bookings/hotels/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(confirmData),
      });

      const confirmResult = await confirmResponse.json();

      if (confirmResult.success) {
        updateStep("confirm", {
          status: "success",
          duration: Date.now() - confirmStart,
          data: { bookingRef: confirmResult.data.bookingRef },
        });
      } else {
        throw new Error("Booking confirmation failed");
      }

      // Step 6: Voucher Generation
      updateStep("voucher", { status: "running" });
      const voucherStart = Date.now();

      const voucherResponse = await fetch(
        `/api/vouchers/hotel/${confirmResult.data.bookingRef}`,
      );

      if (voucherResponse.ok) {
        updateStep("voucher", {
          status: "success",
          duration: Date.now() - voucherStart,
          data: { size: voucherResponse.headers.get("content-length") },
        });
      } else {
        throw new Error("Voucher generation failed");
      }

      // Step 7: Email Delivery
      updateStep("email", { status: "running" });
      const emailStart = Date.now();

      const emailResponse = await fetch(
        `/api/vouchers/hotel/${confirmResult.data.bookingRef}/email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "john.doe@example.com",
          }),
        },
      );

      const emailResult = await emailResponse.json();

      if (emailResult.success) {
        updateStep("email", {
          status: "success",
          duration: Date.now() - emailStart,
          data: { provider: emailResult.data.provider },
        });
      } else {
        throw new Error("Email delivery failed");
      }

      setOverallStatus("success");
      console.log("🎉 Complete booking flow test successful!");
    } catch (error) {
      console.error("❌ Booking flow test failed:", error);
      setOverallStatus("error");

      // Mark current running step as failed
      setSteps((prev) =>
        prev.map((step) =>
          step.status === "running"
            ? {
                ...step,
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : step,
        ),
      );
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

  const getOverallStatusColor = () => {
    switch (overallStatus) {
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

  const getTotalDuration = () => {
    return steps.reduce((total, step) => total + (step.duration || 0), 0);
  };

  const getSuccessCount = () => {
    return steps.filter((step) => step.status === "success").length;
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className={`border-2 rounded-lg p-4 shadow-lg ${getOverallStatusColor()}`}
      >
        <div className="font-bold mb-3 text-center">
          🔄 Complete Booking Flow Test
          {isProduction && (
            <div className="text-xs font-normal mt-1">
              🏭 PRODUCTION (Mock Data)
            </div>
          )}
        </div>

        <div className="space-y-1 mb-3 max-h-64 overflow-y-auto">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center justify-between text-sm p-2 bg-white/50 rounded"
            >
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(step.status)}</span>
                <span className="font-medium">{step.name}</span>
              </div>

              <div className="text-xs text-right">
                {step.duration && (
                  <div className="text-gray-600">{step.duration}ms</div>
                )}
                {step.data && (
                  <div className="text-gray-700">
                    {Object.entries(step.data).map(([key, value]) => (
                      <div key={key}>
                        {key}: {String(value)}
                      </div>
                    ))}
                  </div>
                )}
                {step.error && <div className="text-red-600">{step.error}</div>}
              </div>
            </div>
          ))}
        </div>

        {overallStatus !== "idle" && (
          <div className="text-xs text-center border-t pt-2 mb-3">
            <div>
              Progress: {getSuccessCount()}/{steps.length} steps
            </div>
            {getTotalDuration() > 0 && (
              <div>Total time: {getTotalDuration()}ms</div>
            )}
          </div>
        )}

        <button
          onClick={runCompleteFlow}
          disabled={isRunning}
          className={`w-full px-3 py-2 text-sm rounded font-medium ${
            isRunning
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {isRunning ? "🔄 Running Flow..." : "🚀 Test Complete Flow"}
        </button>
      </div>
    </div>
  );
}
