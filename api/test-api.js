const HotelbedsService = require("./services/hotelbedsService");

async function testAPI() {
  console.log("🧪 Testing Hotelbeds API...");

  const service = new HotelbedsService();

  try {
    console.log("1. Testing destination search...");
    const destinations = await service.searchDestinations("Madrid");
    console.log("Destinations result:", destinations);

    if (destinations.length > 0) {
      console.log("2. Testing hotel search...");
      const hotels = await service.searchAvailability({
        destination: destinations[0].code,
        checkIn: "2025-07-30",
        checkOut: "2025-08-01",
        rooms: 1,
        adults: 2,
        children: 0,
      });
      console.log("Hotels result count:", hotels.length);
      if (hotels.length > 0) {
        console.log("Sample hotel:", JSON.stringify(hotels[0], null, 2));
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAPI();
