/**
 * Razorpay Test Configuration Verification
 */

require("dotenv").config();
const RazorpayService = require("./services/razorpayService");

async function testRazorpayConfig() {
  console.log("🧪 Testing Razorpay Configuration");
  console.log("================================");

  // Check environment variables
  console.log("📋 Environment Check:");
  console.log(
    `  Key ID: ${process.env.RAZORPAY_KEY_ID ? "✅ Set" : "❌ Missing"}`,
  );
  console.log(
    `  Key Secret: ${process.env.RAZORPAY_KEY_SECRET ? "✅ Set" : "❌ Missing"}`,
  );

  try {
    // Initialize service
    const razorpayService = new RazorpayService();
    console.log("✅ RazorpayService initialized successfully");

    // Test order creation
    const testOrder = {
      amount: 100000, // ₹1000 in paise
      currency: "INR",
      bookingRef: "TEST_BOOKING_001",
      customerDetails: {
        name: "Test Customer",
        email: "test@faredown.com",
        phone: "+919876543210",
      },
      hotelDetails: {
        hotelName: "Test Hotel",
        checkIn: "2025-02-01",
        checkOut: "2025-02-03",
      },
    };

    console.log("\n🔨 Testing Order Creation...");
    const orderResult = await razorpayService.createBookingOrder(testOrder);

    if (orderResult.success) {
      console.log("✅ Test order created successfully");
      console.log(`  Order ID: ${orderResult.orderId}`);
      console.log(`  Key ID: ${orderResult.keyId}`);
    } else {
      console.log("❌ Order creation failed:", orderResult.error);
    }
  } catch (error) {
    console.log("❌ Error testing Razorpay:", error.message);
  }
}

// Available test cards for testing
console.log("\n💳 Test Cards Available:");
console.log("========================");
console.log("✅ Success Card: 4111 1111 1111 1111 (Visa)");
console.log("❌ Failure Card: 4000 0000 0000 0002 (Visa)");
console.log("🔒 CVV: Any 3 digits");
console.log("📅 Expiry: Any future date");

// Run the test
testRazorpayConfig();
