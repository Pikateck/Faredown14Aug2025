/**
 * Test Live Hotelbeds API Integration
 */

require("dotenv").config();
const HotelbedsService = require("./services/hotelbedsService");

async function testHotelbedsLive() {
  console.log("🧪 Testing Live Hotelbeds API Integration");
  console.log("=".repeat(50));

  const hotelbedsService = new HotelbedsService();

  try {
    // Test 1: Search destinations for Dubai
    console.log('🌍 Testing destinations search for "Dubai"...');
    const destinations = await hotelbedsService.searchDestinations("Dubai");
    console.log(`✅ Found ${destinations.length} destinations`);

    if (destinations.length > 0) {
      console.log("📍 Sample destinations:");
      destinations.slice(0, 3).forEach((dest) => {
        console.log(`   - ${dest.name} (${dest.code}) - ${dest.countryName}`);
      });
    }

    // Test 2: Hotel availability search (if we have destination codes)
    if (destinations.length > 0) {
      const dubaiCode = destinations[0].code;
      console.log(`\n🏨 Testing hotel search for destination: ${dubaiCode}...`);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const checkIn = tomorrow.toISOString().split("T")[0];
      const checkOut = dayAfter.toISOString().split("T")[0];

      const hotels = await hotelbedsService.searchHotelAvailability({
        destination: dubaiCode,
        checkIn,
        checkOut,
        rooms: 1,
        adults: 2,
        children: 0,
      });

      console.log(`✅ Found ${hotels.length} available hotels`);

      if (hotels.length > 0) {
        console.log("🏨 Sample hotels:");
        hotels.slice(0, 3).forEach((hotel) => {
          console.log(
            `   - ${hotel.name} (${hotel.code}) - ${hotel.categoryName || "N/A"}`,
          );
        });
      }
    }

    console.log("\n🎉 Live Hotelbeds API test SUCCESSFUL!");
    console.log("✅ Real hotel data is accessible");
    console.log("✅ API authentication working");
    console.log("✅ Ready for production integration");
  } catch (error) {
    console.error("\n❌ Live Hotelbeds API test FAILED:");
    console.error(`   Error: ${error.message}`);
    console.error("");

    if (error.message.includes("401")) {
      console.error("💡 Authentication issue - check API credentials");
    } else if (error.message.includes("timeout")) {
      console.error("💡 Network timeout - check connectivity");
    } else if (error.message.includes("404")) {
      console.error("💡 Endpoint not found - check API URLs");
    }

    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testHotelbedsLive();
}

module.exports = { testHotelbedsLive };
