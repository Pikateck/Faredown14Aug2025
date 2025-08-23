/**
 * Test Hotelbeds destinations to find working ones
 */

require("dotenv").config();
const HotelbedsService = require("./services/hotelbedsService");

async function testDestinations() {
  console.log("🧪 Testing Hotelbeds Destinations");
  console.log("=".repeat(50));

  const hotelbedsService = new HotelbedsService();

  const testQueries = [
    "Dubai",
    "Madrid",
    "Barcelona",
    "London",
    "Paris",
    "Rome",
    "Amsterdam",
    "Berlin",
    "Vienna",
    "Prague",
    "Lisbon",
    "Palma",
    "Mallorca",
    "Ibiza",
    "Tenerife",
    "Las Palmas",
  ];

  for (const query of testQueries) {
    try {
      console.log(`\n🔍 Testing: ${query}`);
      const destinations = await hotelbedsService.searchDestinations(query);

      if (destinations.length > 0) {
        console.log(
          `✅ Found ${destinations.length} destinations for "${query}"`,
        );
        destinations.slice(0, 3).forEach((dest) => {
          console.log(`   - ${dest.name} (${dest.code}) - ${dest.countryName}`);
        });

        // Test hotel availability for the first destination
        const destCode = destinations[0].code;
        console.log(`\n🏨 Testing hotel availability for ${destCode}...`);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7); // 1 week from now
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 9); // 9 days from now

        try {
          const hotels = await hotelbedsService.searchHotelAvailability({
            destination: destCode,
            checkIn: tomorrow.toISOString().split("T")[0],
            checkOut: dayAfter.toISOString().split("T")[0],
            rooms: 1,
            adults: 2,
            children: 0,
          });

          if (hotels && hotels.length > 0) {
            console.log(`✅ Found ${hotels.length} available hotels!`);
            hotels.slice(0, 2).forEach((hotel) => {
              console.log(
                `   🏨 ${hotel.name} - ${hotel.categoryName || "N/A"}`,
              );
            });

            console.log(
              `\n🎯 WORKING DESTINATION: "${query}" -> Code: ${destCode}`,
            );
            console.log(`   Use this in your search: ${query}`);
            console.log(`   Destination Code: ${destCode}`);
            break; // Found working destination, exit
          } else {
            console.log(`❌ No hotels available for ${destCode}`);
          }
        } catch (hotelError) {
          console.log(
            `❌ Hotel search failed for ${destCode}: ${hotelError.message}`,
          );
        }
      } else {
        console.log(`❌ No destinations found for "${query}"`);
      }
    } catch (error) {
      console.log(`❌ Error searching "${query}": ${error.message}`);
    }
  }
}

testDestinations().catch(console.error);
