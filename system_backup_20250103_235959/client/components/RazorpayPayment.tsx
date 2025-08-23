import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPriceWithSymbol } from "@/lib/pricing";

interface RazorpayPaymentProps {
  amount: number; // Amount in USD
  orderId?: string;
  bookingDetails: {
    hotelName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
  };
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
  onClose?: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  processing: string;
}

// Simulate Razorpay integration (in production, you'd load the actual Razorpay SDK)
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayPayment({
  amount,
  orderId = "order_" + Date.now(),
  bookingDetails,
  customerDetails,
  onSuccess,
  onError,
  onClose,
}: RazorpayPaymentProps) {
  const { selectedCurrency } = useCurrency();
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  // Convert amount to INR for Razorpay (Razorpay primarily works with INR)
  const amountInINR = Math.round(amount * 82.5); // Assuming 1 USD = 82.5 INR
  const amountInPaise = amountInINR * 100; // Razorpay requires amount in paise

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, American Express",
      processing: "Processing card payment...",
    },
    {
      id: "upi",
      name: "UPI",
      icon: Smartphone,
      description: "Google Pay, PhonePe, Paytm",
      processing: "Processing UPI payment...",
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: Wallet,
      description: "All major banks supported",
      processing: "Redirecting to bank...",
    },
    {
      id: "wallet",
      name: "Wallet",
      icon: Wallet,
      description: "Paytm, Mobikwik, Amazon Pay",
      processing: "Processing wallet payment...",
    },
  ];

  useEffect(() => {
    // Load Razorpay SDK
    const loadRazorpay = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setIsRazorpayLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Razorpay SDK");
        // Fallback for demo purposes
        setIsRazorpayLoaded(true);
      };
      document.body.appendChild(script);
    };

    if (!window.Razorpay) {
      loadRazorpay();
    } else {
      setIsRazorpayLoaded(true);
    }

    return () => {
      // Cleanup script if component unmounts
      const script = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleRazorpayPayment = () => {
    if (!isRazorpayLoaded) {
      onError({ message: "Payment gateway not loaded. Please try again." });
      return;
    }

    const options = {
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_demo", // Demo key
      amount: amountInPaise,
      currency: "INR",
      name: "Faredown",
      description: `Hotel booking - ${bookingDetails.hotelName}`,
      order_id: orderId,
      customer: {
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.phone,
      },
      prefill: {
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.phone,
      },
      theme: {
        color: "#2563eb", // Blue theme
      },
      method: {
        card: selectedMethod === "card",
        upi: selectedMethod === "upi",
        netbanking: selectedMethod === "netbanking",
        wallet: selectedMethod === "wallet",
      },
      handler: function (response: any) {
        // Payment successful
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          amount: amountInINR,
          currency: "INR",
          method: selectedMethod,
          customer: customerDetails,
          booking: bookingDetails,
        });
      },
      modal: {
        ondismiss: function () {
          if (onClose) onClose();
        },
        escape: true,
        animation: true,
      },
      retry: {
        enabled: true,
        max_count: 3,
      },
      timeout: 300, // 5 minutes timeout
      remember_customer: true,
    };

    // Create Razorpay instance and open
    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        onError({
          error: response.error,
          metadata: response.error.metadata,
        });
      });
      rzp.open();
    } else {
      // Fallback simulation for demo
      simulatePayment();
    }
  };

  const simulatePayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulate random success/failure for demo
      if (Math.random() > 0.1) {
        // 90% success rate
        onSuccess({
          razorpay_payment_id: "pay_" + Math.random().toString(36).substr(2, 9),
          razorpay_order_id: orderId,
          razorpay_signature: "sig_" + Math.random().toString(36).substr(2, 9),
          amount: amountInINR,
          currency: "INR",
          method: selectedMethod,
          customer: customerDetails,
          booking: bookingDetails,
        });
      } else {
        onError({
          error: {
            code: "PAYMENT_FAILED",
            description: "Payment was declined by the bank",
            reason: "payment_failed",
          },
        });
      }
    } catch (error) {
      onError({ error });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (
      selectedMethod === "card" &&
      (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)
    ) {
      alert("Please fill in all card details");
      return;
    }

    if (window.Razorpay) {
      handleRazorpayPayment();
    } else {
      simulatePayment();
    }
  };

  const selectedMethodData = paymentMethods.find(
    (m) => m.id === selectedMethod,
  );

  return (
    <div className="space-y-6">
      {/* Security Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-green-600 mr-2" />
          <div>
            <div className="font-medium text-green-900">Secure Payment</div>
            <div className="text-sm text-green-700">
              Your payment is protected with bank-level security and SSL
              encryption
            </div>
          </div>
        </div>
      </div>

      {/* Payment Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Hotel: {bookingDetails.hotelName}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Check-in:{" "}
                {new Date(bookingDetails.checkIn).toLocaleDateString()}
              </span>
              <span>
                Check-out:{" "}
                {new Date(bookingDetails.checkOut).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {bookingDetails.guests} guests, {bookingDetails.rooms} room(s)
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPriceWithSymbol(amount, selectedCurrency.code)}
                  </div>
                  <div className="text-sm text-gray-600">
                    (≈ ₹{amountInINR.toLocaleString()})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                    className="mr-3"
                  />
                  <method.icon className="w-5 h-5 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-600">
                      {method.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card Details (if card is selected) */}
      {selectedMethod === "card" && (
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) =>
                  setCardDetails((prev) => ({
                    ...prev,
                    number: e.target.value,
                  }))
                }
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) =>
                    setCardDetails((prev) => ({
                      ...prev,
                      expiry: e.target.value,
                    }))
                  }
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) =>
                    setCardDetails((prev) => ({ ...prev, cvv: e.target.value }))
                  }
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="Name as on card"
                value={cardDetails.name}
                onChange={(e) =>
                  setCardDetails((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Button */}
      <div className="space-y-4">
        <Button
          onClick={handlePayment}
          disabled={isProcessing || !isRazorpayLoaded}
          className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              {selectedMethodData?.processing || "Processing..."}
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Pay {formatPriceWithSymbol(amount, selectedCurrency.code)}
            </>
          )}
        </Button>

        {!isRazorpayLoaded && (
          <div className="flex items-center justify-center text-yellow-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Loading payment gateway...
          </div>
        )}

        <div className="text-center text-xs text-gray-600 space-y-1">
          <div className="flex items-center justify-center">
            <Lock className="w-3 h-3 mr-1" />
            Secured by Razorpay
          </div>
          <div>Your payment information is encrypted and secure</div>
        </div>
      </div>

      {/* Payment Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
        <div className="flex flex-col items-center">
          <Shield className="w-6 h-6 text-green-600 mb-1" />
          <span className="font-medium">Secure</span>
          <span className="text-gray-600">256-bit SSL</span>
        </div>
        <div className="flex flex-col items-center">
          <CheckCircle className="w-6 h-6 text-blue-600 mb-1" />
          <span className="font-medium">Instant</span>
          <span className="text-gray-600">Real-time confirmation</span>
        </div>
        <div className="flex flex-col items-center">
          <Smartphone className="w-6 h-6 text-purple-600 mb-1" />
          <span className="font-medium">Convenient</span>
          <span className="text-gray-600">Multiple payment options</span>
        </div>
      </div>
    </div>
  );
}
