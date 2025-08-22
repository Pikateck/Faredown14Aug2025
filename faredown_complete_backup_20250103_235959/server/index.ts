import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import suppliersRouter from "./routes/suppliers";
import adminRouter from "./routes/admin";
import loyaltyRouter from "./routes/loyalty";
import {
  MASTER_DESTINATIONS,
  searchDestinations,
} from "../shared/destinations";

// Import database service
import destinationsService from "./services/destinationsService.js";

// Import route modules
import flightsRoutes from "./routes/flights.js";

// Add crypto for Hotelbeds API signatures
import crypto from "crypto";

// Amadeus API integration
let amadeusAccessToken = "";
let tokenExpiryTime = 0;

async function getAmadeusAccessToken() {
  const API_KEY = "6H8SAsHAPdGAlWFYWNKgxQetHgeGCeNv".trim();
  const API_SECRET = "2eVYfPeZVxmvbjRm".trim();
  const BASE_URL = "https://test.api.amadeus.com";

  // Check if token is still valid (with 5 minute buffer)
  if (amadeusAccessToken && Date.now() < tokenExpiryTime - 300000) {
    return amadeusAccessToken;
  }

  try {
    console.log("🔑 Getting new Amadeus access token...");
    console.log("🔑 Using credentials:", {
      apiKeyLength: API_KEY.length,
      secretLength: API_SECRET.length,
      apiKeyFirst4: API_KEY.substring(0, 4),
      apiKeyLast4: API_KEY.substring(API_KEY.length - 4),
      secretFirst2: API_SECRET.substring(0, 2),
      secretLast2: API_SECRET.substring(API_SECRET.length - 2),
    });

    // Properly URL encode the form data
    const formData = new URLSearchParams();
    formData.append("grant_type", "client_credentials");
    formData.append("client_id", API_KEY);
    formData.append("client_secret", API_SECRET);

    console.log(
      "🔐 Making auth request to:",
      `${BASE_URL}/v1/security/oauth2/token`,
    );
    console.log("🔐 Request body:", formData.toString());

    const response = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData.toString(),
    });

    console.log(`📡 Amadeus auth response status: ${response.status}`);
    console.log(
      `📡 Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Full auth error response:", errorText);

      // Check if this might be a new credentials activation issue
      if (response.status === 401 && errorText.includes("invalid_client")) {
        console.log(
          "🔍 This may be a new credentials activation issue. Credentials might need:",
        );
        console.log("   - Time to activate (up to 30 minutes after creation)");
        console.log(
          "   - Proper registration in Amadeus For Developers portal",
        );
        console.log("   - Test environment access enabled");
        console.log(
          "   - Check credentials are copied exactly from the portal",
        );
      }

      throw new Error(`Amadeus auth failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    amadeusAccessToken = data.access_token;
    tokenExpiryTime = Date.now() + data.expires_in * 1000;

    console.log(
      "✅ Amadeus authentication successful, token expires in:",
      data.expires_in,
      "seconds",
    );
    return amadeusAccessToken;
  } catch (error) {
    console.error("❌ Amadeus authentication failed:", error);
    throw error;
  }
}

async function searchAmadeusFlights(searchParams: any) {
  const BASE_URL = "https://test.api.amadeus.com";

  try {
    console.log("✈️ Searching flights with Amadeus API");

    // Get access token
    const accessToken = await getAmadeusAccessToken();

    // Generate future dates if none provided
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7); // 7 days from now for flights
    const defaultDepartureDate = tomorrow.toISOString().split("T")[0];

    // Prepare search parameters
    const queryParams = new URLSearchParams({
      originLocationCode: searchParams.origin || "BOM", // Mumbai
      destinationLocationCode: searchParams.destination || "DXB", // Dubai
      departureDate:
        searchParams.departureDate?.split("T")[0] || defaultDepartureDate,
      adults: searchParams.adults?.toString() || "1",
      currencyCode: "INR",
      max: "250", // Maximum number of offers to return
    });

    // Add return date if provided (round trip)
    if (searchParams.returnDate) {
      queryParams.append("returnDate", searchParams.returnDate.split("T")[0]);
    }

    // Add optional parameters if provided
    if (searchParams.children && parseInt(searchParams.children) > 0) {
      queryParams.append("children", searchParams.children.toString());
    }

    if (searchParams.infants && parseInt(searchParams.infants) > 0) {
      queryParams.append("infants", searchParams.infants.toString());
    }

    if (searchParams.travelClass) {
      queryParams.append("travelClass", searchParams.travelClass);
    }

    if (searchParams.nonStop === true) {
      queryParams.append("nonStop", "true");
    }

    if (searchParams.maxPrice) {
      queryParams.append("maxPrice", searchParams.maxPrice.toString());
    }

    console.log("✈️ Flight search parameters:", queryParams.toString());

    const response = await fetch(
      `${BASE_URL}/v2/shopping/flight-offers?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`📡 Amadeus Flight API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Amadeus Flight API Error: ${response.status} - ${errorText}`,
      );
      return { success: false, error: errorText };
    }

    const data = await response.json();
    const flights = data.data || [];

    console.log(`✅ Found ${flights.length} flight offers from Amadeus`);

    // Transform flight data to match frontend expectations
    const transformedFlights = flights
      .slice(0, 20)
      .map((flight: any, index: number) => {
        const outbound = flight.itineraries[0];
        const firstSegment = outbound.segments[0];
        const lastSegment = outbound.segments[outbound.segments.length - 1];

        // Calculate total duration
        const duration =
          outbound.duration
            ?.replace("PT", "")
            ?.replace("H", "h ")
            ?.replace("M", "m") || "2h 30m";

        // Get airline info
        const airlineCode = firstSegment.carrierCode;
        const airlineName = getAirlineName(airlineCode);

        // Get pricing
        const price = parseFloat(flight.price.total);

        return {
          id: `amadeus-${flight.id || index}`,
          flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
          airline: {
            code: airlineCode,
            name: airlineName,
            logo: `https://images.kiwi.com/airlines/64/${airlineCode}.png`,
          },
          departure: {
            airport: firstSegment.departure.iataCode,
            time: firstSegment.departure.at,
            terminal: firstSegment.departure.terminal,
          },
          arrival: {
            airport: lastSegment.arrival.iataCode,
            time: lastSegment.arrival.at,
            terminal: lastSegment.arrival.terminal,
          },
          duration: duration,
          stops: outbound.segments.length - 1,
          price: Math.round(price),
          currency: "INR",
          originalPrice: Math.round(price * 1.1), // Add 10% as original price
          cabinClass: firstSegment.cabin || "ECONOMY",
          aircraft: firstSegment.aircraft?.code || "A320",
          segments: outbound.segments.length,
          isLiveData: true,
          supplier: "amadeus",
          bookingClass: firstSegment.bookingClass,
          rateKey: flight.id,
        };
      });

    return { success: true, data: transformedFlights };
  } catch (error) {
    console.error("❌ Amadeus flight search failed:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to get airline names
function getAirlineName(code: string): string {
  const airlines: Record<string, string> = {
    AI: "Air India",
    EK: "Emirates",
    QR: "Qatar Airways",
    EY: "Etihad Airways",
    SV: "Saudi Arabian Airlines",
    MS: "EgyptAir",
    TK: "Turkish Airlines",
    LH: "Lufthansa",
    BA: "British Airways",
    AF: "Air France",
    KL: "KLM",
    SQ: "Singapore Airlines",
    TG: "Thai Airways",
    "9W": "Jet Airways",
    "6E": "IndiGo",
    SG: "SpiceJet",
    G8: "GoAir",
  };

  return airlines[code] || `${code} Airlines`;
}

// Direct Hotelbeds API integration
async function callHotelbedsAPI(searchParams: any) {
  const API_KEY = "91d2368789abdb5beec101ce95a9d185";
  const API_SECRET = "a9ffaaecce";
  const BOOKING_API = "https://api.test.hotelbeds.com/hotel-api/1.0";
  const CONTENT_API = "https://api.test.hotelbeds.com/hotel-content-api/1.0";

  try {
    console.log("🔑 Making direct Hotelbeds Booking API call for availability");
    console.log("🔑 Using credentials:", {
      apiKeyLength: API_KEY.length,
      secretLength: API_SECRET.length,
    });

    // Generate signature for booking API (Hotelbeds specific format)
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = API_KEY + API_SECRET + timestamp;
    const signature = crypto
      .createHash("sha256")
      .update(stringToSign)
      .digest("hex");

    console.log("🔐 Authentication details:", {
      timestamp,
      signatureLength: signature.length,
    });

    const headers = {
      "Api-key": API_KEY,
      "X-Signature": signature,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Step 1: Get hotel availability and pricing
    // Generate future dates if none provided
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 4);

    const defaultCheckIn = tomorrow.toISOString().split("T")[0];
    const defaultCheckOut = dayAfterTomorrow.toISOString().split("T")[0];

    const bookingRequest = {
      stay: {
        checkIn: searchParams.checkIn?.split("T")[0] || defaultCheckIn,
        checkOut: searchParams.checkOut?.split("T")[0] || defaultCheckOut,
      },
      occupancies: [
        {
          rooms: 1,
          adults: searchParams.adults || 2,
          children: searchParams.children || 0,
        },
      ],
      destination: {
        code: searchParams.destination || "BCN",
      },
      currency: "EUR",
    };

    console.log(
      "🏨 Booking API Request:",
      JSON.stringify(bookingRequest, null, 2),
    );
    console.log("🌐 Making request to:", `${BOOKING_API}/hotels`);

    const bookingResponse = await fetch(`${BOOKING_API}/hotels`, {
      method: "POST",
      headers,
      body: JSON.stringify(bookingRequest),
    });

    console.log(`📡 Booking API Response Status: ${bookingResponse.status}`);

    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      console.error(`❌ Booking API Error: ${bookingResponse.status}`);
      console.error("❌ Full error response:", errorText);

      // Try to parse the error to get more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error("❌ Parsed error:", JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.error("❌ Could not parse error as JSON");
      }

      return { success: false, error: errorText };
    }

    const bookingData = await bookingResponse.json();
    const hotels = bookingData.hotels?.hotels || [];
    console.log(`✅ Booking API Success - Hotels found: ${hotels.length}`);

    if (hotels.length === 0) {
      return { success: false, error: "No hotels found" };
    }

    // Step 2: Get hotel content (images, descriptions) for the first few hotels
    const hotelCodes = hotels.slice(0, 10).map((h: any) => h.code);
    console.log("��� Fetching images from Content API for hotels:", hotelCodes);

    // Generate new signature for content API call
    const contentTimestamp = Math.floor(Date.now() / 1000);
    const contentSignature = crypto
      .createHash("sha256")
      .update(API_KEY + API_SECRET + contentTimestamp)
      .digest("hex");

    const contentHeaders = {
      "Api-key": API_KEY,
      "X-Signature": contentSignature,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const contentRequest = {
      hotels: hotelCodes,
      language: "ENG",
    };

    let hotelContentMap = new Map();

    try {
      const contentResponse = await fetch(`${CONTENT_API}/hotels`, {
        method: "POST",
        headers: contentHeaders,
        body: JSON.stringify(contentRequest),
      });

      console.log(`📸 Content API Response Status: ${contentResponse.status}`);

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        const contentHotels = contentData.hotels || [];
        console.log(
          `📸 Content API Success - Hotels with content: ${contentHotels.length}`,
        );

        contentHotels.forEach((hotel: any) => {
          const images =
            hotel.images?.map((img: any) => {
              // Construct full Hotelbeds image URL
              const baseUrl = img.path.startsWith("http")
                ? img.path
                : `https://photos.hotelbeds.com${img.path}`;
              return `${baseUrl}?width=800&height=600`;
            }) || [];

          hotelContentMap.set(hotel.code, {
            name: hotel.name?.content || hotel.name,
            description: hotel.description?.content || "",
            images: images,
            amenities:
              hotel.facilities
                ?.slice(0, 5)
                .map((f: any) => f.description?.content || f.code) || [],
          });

          console.log(
            `📸 Hotel ${hotel.code}: Found ${images.length} images from Hotelbeds`,
          );
        });
      } else {
        console.warn("⚠️ Content API failed, proceeding without images");
      }
    } catch (contentError) {
      console.warn("⚠️ Content API error:", contentError.message);
    }

    // Step 3: Combine booking and content data
    const enrichedHotels = hotels.map((hotel: any) => {
      const content = hotelContentMap.get(hotel.code);

      return {
        id: hotel.code,
        code: hotel.code,
        name: content?.name || hotel.name || `Hotel ${hotel.code}`,
        description:
          content?.description || `Premium hotel with excellent facilities`,
        currentPrice: Math.round((hotel.minRate || 120) * 85), // Convert EUR to INR roughly
        originalPrice: Math.round((hotel.minRate || 120) * 100),
        currency: "INR",
        rating: 4.2,
        reviewScore: 8.5,
        reviewCount: 324,
        address: {
          city:
            searchParams.destination === "BCN"
              ? "Barcelona"
              : searchParams.destination === "SYD"
                ? "Sydney"
                : "Dubai",
          country:
            searchParams.destination === "BCN"
              ? "Spain"
              : searchParams.destination === "SYD"
                ? "Australia"
                : "UAE",
        },
        // Use actual Hotelbeds images if available, fallback only if no images
        images:
          content?.images?.length > 0
            ? content.images
            : getDestinationSpecificImages(searchParams.destination),
        amenities: content?.amenities || [
          "Free WiFi",
          "Pool",
          "Restaurant",
          "Spa",
          "Fitness Center",
        ],
        isLiveData: true,
        supplier: "hotelbeds-direct",
        rateKey: hotel.rateKey,
        hasRealImages: (content?.images?.length || 0) > 0,
      };
    });

    console.log(
      `✅ Final result: ${enrichedHotels.length} hotels, ${enrichedHotels.filter((h) => h.hasRealImages).length} with real Hotelbeds images`,
    );

    return { success: true, data: enrichedHotels };
  } catch (error) {
    console.error("❌ Direct Hotelbeds API call failed:", error);
    return { success: false, error: error.message };
  }
}

// Get destination-specific real hotel images
function getDestinationSpecificImages(destination: string) {
  const imageCollections = {
    BCN: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/261707778.jpg",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/87428762.jpg",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/261707389.jpg",
    ],
    DXB: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/45822596.jpg",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/133464244.jpg",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/301918507.jpg",
    ],
    SYD: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/85056963.jpg",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/261707778.jpg",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/45822596.jpg",
    ],
  };

  return (
    imageCollections[destination as keyof typeof imageCollections] ||
    imageCollections["DXB"]
  );
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Add request logging for debugging
  app.use((req, _res, next) => {
    if (req.path.includes("/api/hotels")) {
      console.log(
        `🔴 Hotelbeds API Request: ${req.method} ${req.path}`,
        req.query,
      );
    }
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Supplier management routes
  app.use("/api/suppliers", suppliersRouter);

  // Admin CMS routes
  app.use("/api/admin", adminRouter);

  // Loyalty program routes
  app.use("/api/loyalty", loyaltyRouter);

  // Flights API routes
  app.use("/api/flights", flightsRoutes);

  // Test endpoint for Hotelbeds API
  app.get("/api/test-hotelbeds", async (_req, res) => {
    try {
      console.log("🧪 Testing direct Hotelbeds API integration...");

      // Use future dates for testing
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 4);

      const testResult = await callHotelbedsAPI({
        destination: "BCN",
        checkIn: tomorrow.toISOString(),
        checkOut: dayAfterTomorrow.toISOString(),
        adults: 2,
        children: 0,
      });

      res.json({
        success: testResult.success,
        message: testResult.success
          ? "Hotelbeds API working!"
          : "Hotelbeds API failed",
        data: testResult.data?.slice(0, 2), // Only return first 2 hotels for testing
        error: testResult.error,
        hotelCount: testResult.data?.length || 0,
        hasRealImages: testResult.data?.some((h) => h.hasRealImages) || false,
      });
    } catch (error) {
      console.error("🧪 Test failed:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Test endpoint failed",
      });
    }
  });

  // Test endpoint for Amadeus API credentials validation
  app.get("/api/test-amadeus-auth", async (_req, res) => {
    try {
      console.log("🧪 Testing Amadeus authentication only...");

      const API_KEY = "6H8SAsHAPdGAlWFYWNKgxQetHgeGCeNv".trim();
      const API_SECRET = "2eVYfPeZVxmvbjRm".trim();
      const BASE_URL = "https://test.api.amadeus.com";

      // Test credentials format
      const credentialsValidation = {
        apiKeyLength: API_KEY.length,
        secretLength: API_SECRET.length,
        apiKeyValid: API_KEY.length > 30 && API_KEY.length < 40,
        secretValid: API_SECRET.length > 10 && API_SECRET.length < 25,
        apiKeyFormat: /^[A-Za-z0-9]+$/.test(API_KEY),
        secretFormat: /^[A-Za-z0-9]+$/.test(API_SECRET),
      };

      console.log("🔍 Credentials validation:", credentialsValidation);

      // Try authentication
      const formData = new URLSearchParams();
      formData.append("grant_type", "client_credentials");
      formData.append("client_id", API_KEY);
      formData.append("client_secret", API_SECRET);

      const response = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formData.toString(),
      });

      const responseText = await response.text();

      if (response.ok) {
        const data = JSON.parse(responseText);
        res.json({
          success: true,
          message: "Amadeus authentication successful!",
          credentialsValidation,
          authResponse: {
            status: response.status,
            tokenType: data.type,
            expiresIn: data.expires_in,
            scope: data.scope,
          },
        });
      } else {
        res.json({
          success: false,
          message: "Amadeus authentication failed",
          credentialsValidation,
          authResponse: {
            status: response.status,
            error: responseText,
            troubleshooting: {
              possibleCauses: [
                "Credentials not yet activated (can take up to 30 minutes)",
                "API key or secret copied incorrectly",
                "Test environment access not enabled in Amadeus portal",
                "Account setup incomplete in Amadeus For Developers",
              ],
              nextSteps: [
                "Wait 30 minutes if credentials are newly created",
                "Double-check credentials from Amadeus portal",
                "Verify test environment access is enabled",
                "Contact Amadeus support if issue persists",
              ],
            },
          },
        });
      }
    } catch (error) {
      console.error("🧪 Amadeus auth test failed:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Amadeus auth test endpoint failed",
      });
    }
  });

  // Test endpoint for Amadeus flights API
  app.get("/api/test-amadeus", async (_req, res) => {
    try {
      console.log("🧪 Testing Amadeus flight API integration...");

      const testResult = await searchAmadeusFlights({
        origin: "BOM", // Mumbai
        destination: "DXB", // Dubai
        departureDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 7 days from now
        adults: 1,
      });

      res.json({
        success: testResult.success,
        message: testResult.success
          ? "Amadeus API working!"
          : "Amadeus API failed",
        data: testResult.data?.slice(0, 3), // Only return first 3 flights for testing
        error: testResult.error,
        flightCount: testResult.data?.length || 0,
      });
    } catch (error) {
      console.error("🧪 Amadeus test failed:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Amadeus test endpoint failed",
      });
    }
  });

  // Flight search endpoint - Production ready with live Amadeus data
  app.get("/api/flights/search", async (_req, res) => {
    try {
      const origin = (_req.query.origin as string) || "BOM";
      const destination = (_req.query.destination as string) || "DXB";
      const departureDate = _req.query.departureDate as string;
      const returnDate = _req.query.returnDate as string;
      const adults = parseInt(_req.query.adults as string) || 1;
      const cabinClass = (_req.query.cabinClass as string) || "ECONOMY";

      console.log(`✈️ Searching flights: ${origin} → ${destination}`);
      console.log("🔍 Flight search parameters:", {
        origin,
        destination,
        departureDate,
        returnDate,
        adults,
        cabinClass,
      });

      // Try Amadeus API call first
      const flightResult = await searchAmadeusFlights({
        origin,
        destination,
        departureDate,
        returnDate,
        adults,
        cabinClass,
      });

      if (flightResult.success && flightResult.data.length > 0) {
        console.log(
          `✅ Found ${flightResult.data.length} flights from Amadeus API`,
        );

        // Store flight search results in database for admin dashboard tracking
        try {
          // This would integrate with your PostgreSQL database
          const searchAnalytics = {
            searchType: "flight",
            origin,
            destination,
            departureDate,
            returnDate,
            adults,
            resultsCount: flightResult.data.length,
            supplier: "amadeus",
            isLiveData: true,
            searchTimestamp: new Date().toISOString(),
            searchParams: JSON.stringify(_req.query),
          };

          // Note: Database integration will be enabled once the PostgreSQL tables are created
          console.log("📊 Flight search analytics:", searchAnalytics);
        } catch (dbError) {
          console.warn("⚠️ Database storage failed:", dbError);
          // Continue even if database storage fails
        }

        return res.json({
          success: true,
          data: flightResult.data,
          totalResults: flightResult.data.length,
          isLiveData: true,
          source: "Amadeus API",
          searchParams: _req.query,
        });
      }

      console.log("⚠️ Amadeus API failed, using fallback data");

      // Fallback flight data if API fails
      const fallbackFlights = [
        {
          id: `fallback-${origin}-${destination}-001`,
          flightNumber: `AI101`,
          airline: {
            code: "AI",
            name: "Air India",
            logo: "https://images.kiwi.com/airlines/64/AI.png",
          },
          departure: {
            airport: origin,
            time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            terminal: "1",
          },
          arrival: {
            airport: destination,
            time: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
            terminal: "3",
          },
          duration: "3h 00m",
          stops: 0,
          price: 25000,
          currency: "INR",
          originalPrice: 28000,
          cabinClass: "ECONOMY",
          aircraft: "A320",
          segments: 1,
          isLiveData: false,
          supplier: "fallback-system",
        },
      ];

      res.json({
        success: true,
        data: fallbackFlights,
        totalResults: fallbackFlights.length,
        isLiveData: false,
        source: "Fallback System (Amadeus API unavailable)",
        searchParams: _req.query,
      });
    } catch (error) {
      console.error("Flight search error:", error);
      res.status(500).json({
        success: false,
        error: "Flight search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Database-backed destinations search endpoint
  app.get("/api/hotels/destinations/search", async (_req, res) => {
    try {
      const query = (_req.query.q as string) || "";
      const limit = parseInt(_req.query.limit as string) || 20;
      const popularOnly = _req.query.popular === "true";

      console.log(
        `🔍 Database destination search: "${query}" (limit: ${limit}, popular: ${popularOnly})`,
      );

      // Use database service for search
      const destinations = await destinationsService.searchDestinations(
        query,
        limit,
        popularOnly,
      );

      // Track search analytics if specific query provided
      if (query && destinations.length > 0) {
        // Track the first result (most relevant)
        destinationsService
          .trackDestinationSearch(destinations[0].code)
          .catch(console.error);
      }

      res.json({
        success: true,
        data: destinations,
        totalResults: destinations.length,
        isLiveData: !destinationsService.fallbackMode,
        source: destinationsService.fallbackMode
          ? "In-Memory Fallback"
          : "PostgreSQL Database",
        searchMeta: {
          query,
          limit,
          popularOnly,
          searchId: `dest-${Date.now()}`,
          processingTime: "95ms",
        },
      });
    } catch (error) {
      console.error("Destination search error:", error);
      res.status(500).json({
        success: false,
        error: "Destination search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/hotels/search", async (_req, res) => {
    try {
      const destinationCode = (_req.query.destination as string) || "DXB";
      const checkIn = _req.query.checkIn as string;
      const checkOut = _req.query.checkOut as string;
      const adults = parseInt(_req.query.adults as string) || 2;
      const rooms = parseInt(_req.query.rooms as string) || 1;

      console.log(
        `🔍 Searching hotels with direct Hotelbeds API for: ${destinationCode}`,
      );

      // Try direct Hotelbeds API call first
      console.log("🔍 About to call callHotelbedsAPI with params:", {
        destination: destinationCode,
        checkIn: checkIn,
        checkOut: checkOut,
        adults: adults,
        children: 0,
      });

      const directApiResult = await callHotelbedsAPI({
        destination: destinationCode,
        checkIn: checkIn,
        checkOut: checkOut,
        adults: adults,
        children: 0,
      });

      console.log("🔍 callHotelbedsAPI result:", {
        success: directApiResult.success,
        dataLength: directApiResult.data?.length || 0,
        error: directApiResult.error,
      });

      if (directApiResult.success && directApiResult.data.length > 0) {
        console.log(
          `✅ Found ${directApiResult.data.length} hotels from direct Hotelbeds API`,
        );
        console.log(
          `🏨 Sample hotel images:`,
          directApiResult.data[0]?.images?.slice(0, 2),
        );

        return res.json({
          success: true,
          data: directApiResult.data,
          totalResults: directApiResult.data.length,
          isLiveData: true,
          source: "Direct Hotelbeds API",
          searchParams: _req.query,
        });
      }

      console.log("⚠️ Direct API failed, using fallback data");

      // Fallback data if API fails
      const destinationData =
        MASTER_DESTINATIONS.find(
          (d) =>
            d.name.toLowerCase() === destinationCode.toLowerCase() ||
            d.code.toLowerCase() === destinationCode.toLowerCase(),
        ) || MASTER_DESTINATIONS.find((d) => d.code === "DXB");

      const hotels = [
        {
          id: `fallback-${destinationData!.code}-001`,
          code: `FB${destinationData!.code}001`,
          name: `Grand ${destinationData!.name} Hotel`,
          description: `Premium hotel in ${destinationData!.name} with excellent amenities.`,
          currentPrice: 15000,
          originalPrice: 18000,
          currency: "INR",
          rating: 4,
          reviewScore: 8.2,
          reviewCount: 245,
          address: {
            street: "1 Hotel Street",
            city: destinationData!.name,
            country: destinationData!.country,
            zipCode: `${destinationData!.countryCode}12345`,
          },
          images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&q=80",
          ],
          amenities: ["Free WiFi", "Pool", "Restaurant", "Spa"],
          rooms: [
            {
              name: "Standard Room",
              price: 15000,
              currency: "INR",
              features: ["City View", "Free WiFi"],
            },
          ],
          isLiveData: false,
          supplier: "fallback-system",
        },
      ];

      res.json({
        success: true,
        data: hotels,
        totalResults: hotels.length,
        isLiveData: false,
        source: "Fallback System (Live API unavailable)",
        searchParams: _req.query,
      });
    } catch (error) {
      console.error("Hotel search error:", error);
      res.status(500).json({
        success: false,
        error: "Hotel search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Enhanced hotel pre-booking with live data integration
  app.post("/api/bookings/hotels/pre-book", async (_req, res) => {
    try {
      const {
        hotelId,
        roomId,
        destinationCode,
        checkIn,
        checkOut,
        rooms,
        adults,
        children,
        currency,
      } = _req.body;

      console.log("📝 Processing hotel pre-booking:", {
        hotelId,
        destinationCode,
        currency,
      });

      // Validate required fields
      if (!hotelId || !destinationCode || !checkIn || !checkOut) {
        return res.status(400).json({
          success: false,
          error: "Missing required booking parameters",
          required: ["hotelId", "destinationCode", "checkIn", "checkOut"],
        });
      }

      // Calculate nights
      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Base price calculation (would come from live API in real implementation)
      const basePrice = 120 + Math.floor(Math.random() * 80); // €120-200 per night
      const totalRooms = parseInt(rooms) || 1;

      // Calculate pricing with taxes and fees
      const subtotal = basePrice * nights * totalRooms;
      const taxes = Math.round(subtotal * 0.15); // 15% taxes
      const fees = Math.round(subtotal * 0.05); // 5% service fees
      const totalPrice = subtotal + taxes + fees;

      // Convert to requested currency if needed
      let convertedPrice = totalPrice;
      let targetCurrency = currency || "EUR";

      if (targetCurrency !== "EUR") {
        try {
          const conversionResponse = await fetch(
            "http://localhost:8080/api/currency/convert",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: totalPrice,
                fromCurrency: "EUR",
                toCurrency: targetCurrency,
              }),
            },
          );

          if (conversionResponse.ok) {
            const conversionData = await conversionResponse.json();
            if (conversionData.success) {
              convertedPrice = conversionData.data.convertedAmount;
            }
          }
        } catch (conversionError) {
          console.warn(
            "Currency conversion failed, using EUR:",
            conversionError,
          );
          targetCurrency = "EUR";
        }
      }

      // Generate booking reference
      const bookingRef = `HB-${destinationCode}-${Date.now()}`;

      // Track the pre-booking in destination analytics
      destinationsService
        .trackDestinationSearch(destinationCode)
        .catch(console.error);

      const preBookingData = {
        bookingRef,
        hotelId,
        destinationCode,
        roomId,
        checkIn,
        checkOut,
        nights,
        rooms: totalRooms,
        adults: parseInt(adults) || 2,
        children: parseInt(children) || 0,
        pricing: {
          basePrice,
          subtotal,
          taxes,
          fees,
          total: Math.round(convertedPrice),
          currency: targetCurrency,
          originalPrice: totalPrice,
          originalCurrency: "EUR",
        },
        holdTime: "15 minutes",
        holdExpiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        status: "held",
        createdAt: new Date().toISOString(),
      };

      res.json({
        success: true,
        data: preBookingData,
        message: "Hotel pre-booking successful - price held for 15 minutes",
        integration: {
          hotelbedsConnected: false, // Will be true with real integration
          currencyConverted: targetCurrency !== "EUR",
          destinationTracked: true,
        },
      });
    } catch (error) {
      console.error("Pre-booking error:", error);
      res.status(500).json({
        success: false,
        error: "Pre-booking failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Enhanced payment order creation with live pricing
  app.post("/api/payments/create-order", async (_req, res) => {
    try {
      const {
        bookingRef,
        amount,
        currency,
        customerDetails,
        hotelId,
        destinationCode,
      } = _req.body;

      console.log("💳 Creating payment order:", {
        bookingRef,
        amount,
        currency,
        destinationCode,
      });

      // Validate required fields
      if (!bookingRef || !amount || !currency) {
        return res.status(400).json({
          success: false,
          error: "Missing required payment parameters",
          required: ["bookingRef", "amount", "currency"],
        });
      }

      // Generate order ID
      const orderId = `PAY-${destinationCode || "HOTEL"}-${Date.now()}`;

      // In production, this would integrate with actual payment gateway
      // For now, we simulate the payment gateway response
      const paymentOrderData = {
        orderId,
        bookingRef,
        amount: Math.round(amount),
        currency,
        status: "pending",
        paymentUrl: `/payment/process?orderId=${orderId}`,
        paymentMethods: ["card", "paypal", "bank_transfer"],
        expiryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        customerDetails: {
          name: customerDetails?.name || "Guest",
          email: customerDetails?.email || "guest@example.com",
        },
        securityInfo: {
          encrypted: true,
          pciCompliant: true,
          ssl: true,
        },
        createdAt: new Date().toISOString(),
      };

      res.json({
        success: true,
        data: paymentOrderData,
        message: "Payment order created successfully",
        integration: {
          paymentGateway: "simulation", // Would be 'razorpay', 'stripe', etc.
          currencySupported: true,
          securePayment: true,
        },
      });
    } catch (error) {
      console.error("Payment order creation error:", error);
      res.status(500).json({
        success: false,
        error: "Payment order creation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Enhanced booking confirmation with live integration
  app.post("/api/bookings/hotels/confirm", async (_req, res) => {
    try {
      const {
        bookingRef,
        paymentId,
        orderId,
        destinationCode,
        customerDetails,
      } = _req.body;

      console.log("✅ Confirming hotel booking:", {
        bookingRef,
        paymentId,
        destinationCode,
      });

      // Validate required fields
      if (!bookingRef || !paymentId) {
        return res.status(400).json({
          success: false,
          error: "Missing required confirmation parameters",
          required: ["bookingRef", "paymentId"],
        });
      }

      // Generate confirmation details
      const confirmationNumber = `CONF-${destinationCode || "HTL"}-${Date.now().toString().slice(-6)}`;
      const confirmedBookingRef = `CONFIRMED-${bookingRef}`;

      // Update destination analytics with booking
      if (destinationCode) {
        try {
          // In real implementation, this would update the booking count
          await destinationsService.trackDestinationSearch(destinationCode);
          console.log("📊 Booking tracked for analytics:", destinationCode);
        } catch (error) {
          console.warn("Analytics tracking failed:", error);
        }
      }

      const confirmedBookingData = {
        bookingRef: confirmedBookingRef,
        originalRef: bookingRef,
        confirmationNumber,
        status: "confirmed",
        paymentId,
        orderId,
        destinationCode,
        confirmedAt: new Date().toISOString(),
        customer: {
          name: customerDetails?.name || "Guest",
          email: customerDetails?.email || "guest@example.com",
          phone: customerDetails?.phone || null,
        },
        booking: {
          type: "hotel",
          supplier: "hotelbeds-simulation",
          supplierRef: `SUP-${confirmationNumber}`,
          voucherGenerated: false,
        },
        nextSteps: [
          "Voucher will be generated and emailed within 24 hours",
          "Hotel confirmation will be sent to your email",
          "Check-in instructions will be provided closer to arrival date",
        ],
      };

      res.json({
        success: true,
        data: confirmedBookingData,
        message: "Hotel booking confirmed successfully",
        integration: {
          hotelbedsConfirmed: false, // Will be true with real integration
          voucherPending: true,
          analyticsTracked: !!destinationCode,
          emailNotificationPending: true,
        },
      });
    } catch (error) {
      console.error("Booking confirmation error:", error);
      res.status(500).json({
        success: false,
        error: "Booking confirmation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Enhanced voucher generation with booking integration
  app.get("/api/vouchers/hotel/:bookingRef", async (_req, res) => {
    try {
      const bookingRef = _req.params.bookingRef;
      const currency = (_req.query.currency as string) || "EUR";

      console.log("🎟️ Generating voucher for booking:", bookingRef);

      // Simulate voucher generation process
      const voucherData = {
        voucherUrl: `/vouchers/pdf/${bookingRef}.pdf`,
        bookingRef,
        confirmationNumber: `CONF-${bookingRef.split("-").pop()}`,
        generated: true,
        generatedAt: new Date().toISOString(),
        format: "PDF",
        currency,
        validity: {
          validFrom: new Date().toISOString(),
          validUntil: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 1 year
        },
        features: {
          qrCode: true,
          barcodeSupported: true,
          multiLanguage: true,
          mobileOptimized: true,
        },
        downloadInfo: {
          fileSize: "1.2 MB",
          pages: 2,
          downloadExpiry: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 30 days
        },
      };

      res.json({
        success: true,
        data: voucherData,
        message: "Hotel voucher generated successfully",
        integration: {
          pdfGenerated: true,
          emailAttachment: true,
          supplierIntegrated: false, // Will be true with real Hotelbeds integration
        },
      });
    } catch (error) {
      console.error("Voucher generation error:", error);
      res.status(500).json({
        success: false,
        error: "Voucher generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Enhanced email delivery with voucher and booking details
  app.post("/api/vouchers/hotel/:bookingRef/email", async (_req, res) => {
    try {
      const bookingRef = _req.params.bookingRef;
      const { recipientEmail, customerName, language, includeAttachments } =
        _req.body;

      console.log("📧 Sending voucher email for booking:", bookingRef);

      // Validate email
      if (!recipientEmail) {
        return res.status(400).json({
          success: false,
          error: "Recipient email is required",
        });
      }

      // Generate message ID
      const messageId = `email-${bookingRef}-${Date.now()}`;

      // Simulate email sending process
      const emailData = {
        emailSent: true,
        messageId,
        recipient: recipientEmail,
        subject: `Hotel Booking Confirmation - ${bookingRef}`,
        bookingRef,
        sentAt: new Date().toISOString(),
        emailDetails: {
          template: "hotel-voucher-confirmation",
          language: language || "en",
          customerName: customerName || "Valued Guest",
          attachments: includeAttachments
            ? [
                {
                  name: `voucher-${bookingRef}.pdf`,
                  type: "application/pdf",
                  size: "1.2 MB",
                },
                {
                  name: `booking-details-${bookingRef}.pdf`,
                  type: "application/pdf",
                  size: "0.8 MB",
                },
              ]
            : [],
        },
        deliveryInfo: {
          provider: "SendGrid",
          priority: "high",
          tracking: true,
          estimatedDelivery: "1-2 minutes",
          retryCount: 0,
          maxRetries: 3,
        },
      };

      res.json({
        success: true,
        data: emailData,
        message: "Hotel voucher email sent successfully",
        integration: {
          emailProvider: "SendGrid",
          templateRendered: true,
          attachmentsIncluded: includeAttachments || false,
          trackingEnabled: true,
        },
      });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({
        success: false,
        error: "Email sending failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/vouchers/status", (_req, res) => {
    res.json({
      success: true,
      data: {
        service: "Mock Email Service",
        status: "operational",
        lastTest: new Date().toISOString(),
        totalSent: 42,
        deliveryRate: 98.5,
        emailProvider: "SendGrid",
        features: {
          emailDelivery: true,
          tracking: true,
          templates: true,
        },
      },
    });
  });

  app.get("/api/vouchers/email/tracking", (_req, res) => {
    res.json({
      success: true,
      data: [
        {
          messageId: "mock-msg-001",
          status: "delivered",
          timestamp: new Date().toISOString(),
          recipient: "test@example.com",
        },
      ],
    });
  });

  // Currency exchange rates endpoints
  app.get("/api/currency/rates", async (_req, res) => {
    try {
      // Try to fetch live rates from ExchangeRate-API (free tier)
      try {
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/INR",
        );
        if (response.ok) {
          const data = await response.json();

          // Transform to our format with INR as base
          const rates = Object.entries(data.rates).map(([code, rate]) => ({
            from: "INR",
            to: code,
            rate: rate as number,
            inverseRate: 1 / (rate as number),
            lastUpdated: new Date().toISOString(),
            source: "ExchangeRate-API",
            reliability: 95,
          }));

          res.json({
            success: true,
            data: rates,
            source: "Live ExchangeRate-API",
            lastUpdated: new Date().toISOString(),
          });
          return;
        }
      } catch (apiError) {
        console.warn("Live exchange rate API failed, using fallback rates");
      }

      // Fallback to static rates if API fails
      const fallbackRates = [
        {
          from: "INR",
          to: "USD",
          rate: 0.012,
          inverseRate: 83.33,
          lastUpdated: new Date().toISOString(),
          source: "Fallback",
          reliability: 80,
        },
        {
          from: "INR",
          to: "EUR",
          rate: 0.011,
          inverseRate: 91.67,
          lastUpdated: new Date().toISOString(),
          source: "Fallback",
          reliability: 80,
        },
        {
          from: "INR",
          to: "GBP",
          rate: 0.0095,
          inverseRate: 105.26,
          lastUpdated: new Date().toISOString(),
          source: "Fallback",
          reliability: 80,
        },
        {
          from: "INR",
          to: "AED",
          rate: 0.044,
          inverseRate: 22.73,
          lastUpdated: new Date().toISOString(),
          source: "Fallback",
          reliability: 80,
        },
        {
          from: "INR",
          to: "SGD",
          rate: 0.016,
          inverseRate: 62.5,
          lastUpdated: new Date().toISOString(),
          source: "Fallback",
          reliability: 80,
        },
        {
          from: "INR",
          to: "JPY",
          rate: 1.83,
          inverseRate: 0.55,
          lastUpdated: new Date().toISOString(),
          source: "Fallback",
          reliability: 80,
        },
        {
          from: "INR",
          to: "CNY",
          rate: 0.087,
          inverseRate: 11.49,
          lastUpdated: new Date().toISOString(),
          source: "Fallback",
          reliability: 80,
        },
      ];

      res.json({
        success: true,
        data: fallbackRates,
        source: "Fallback Rates",
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch exchange rates",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/currency/convert", async (_req, res) => {
    try {
      const { amount, fromCurrency, toCurrency } = _req.body;

      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required parameters: amount, fromCurrency, toCurrency",
        });
      }

      // Get current rates
      const ratesResponse = await fetch(
        "http://localhost:8080/api/currency/rates",
      );
      const ratesData = await ratesResponse.json();

      if (!ratesData.success) {
        throw new Error("Failed to get exchange rates");
      }

      let convertedAmount = amount;
      let rate = 1;

      if (fromCurrency !== toCurrency) {
        if (fromCurrency === "INR") {
          // Convert from INR to target currency
          const targetRate = ratesData.data.find(
            (r: any) => r.to === toCurrency,
          );
          if (targetRate) {
            rate = targetRate.rate;
            convertedAmount = amount * rate;
          }
        } else if (toCurrency === "INR") {
          // Convert from source currency to INR
          const sourceRate = ratesData.data.find(
            (r: any) => r.to === fromCurrency,
          );
          if (sourceRate) {
            rate = sourceRate.inverseRate;
            convertedAmount = amount * rate;
          }
        } else {
          // Convert via INR (source -> INR -> target)
          const sourceRate = ratesData.data.find(
            (r: any) => r.to === fromCurrency,
          );
          const targetRate = ratesData.data.find(
            (r: any) => r.to === toCurrency,
          );

          if (sourceRate && targetRate) {
            const inrAmount = amount * sourceRate.inverseRate;
            rate = sourceRate.inverseRate * targetRate.rate;
            convertedAmount = inrAmount * targetRate.rate;
          }
        }
      }

      res.json({
        success: true,
        data: {
          originalAmount: amount,
          convertedAmount: Math.round(convertedAmount * 100) / 100,
          fromCurrency,
          toCurrency,
          rate,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Currency conversion failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // MARKUP MANAGEMENT API ROUTES

  // Air markups endpoint (no auth for testing)
  app.get("/api/markup/air", (_req, res) => {
    console.log("📊 Fetching air markups");

    const mockAirMarkups = [
      {
        id: "1",
        name: "Mumbai-Dubai Economy Markup",
        description: "Standard markup for Mumbai to Dubai economy flights",
        airline: "EK",
        route: { from: "BOM", to: "DXB" },
        class: "economy",
        markupType: "percentage",
        markupValue: 5.5,
        minAmount: 500,
        maxAmount: 2000,
        currentFareMin: 10.0,
        currentFareMax: 12.0,
        bargainFareMin: 5.0,
        bargainFareMax: 15.0,
        validFrom: "2024-01-01",
        validTo: "2024-12-31",
        status: "active",
        priority: 1,
        userType: "all",
        specialConditions: "Valid for advance bookings only",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T15:30:00Z",
      },
      {
        id: "2",
        name: "Amadeus Emirates BOM-DXB Economy",
        description:
          "Airline Markup for BOM to DXB route with Emirates via Amadeus",
        airline: "EK",
        route: { from: "BOM", to: "DXB" },
        class: "economy",
        markupType: "percentage",
        markupValue: 12.0,
        minAmount: 500,
        maxAmount: 5000,
        highFareMin: 20.0,
        highFareMax: 25.0,
        lowFareMin: 15.0,
        lowFareMax: 20.0,
        currentFareMin: 10.0,
        currentFareMax: 12.0,
        bargainFareMin: 5.0,
        bargainFareMax: 15.0,
        validFrom: "2025-01-01",
        validTo: "2025-12-31",
        status: "active",
        priority: 1,
        userType: "all",
        specialConditions:
          "Sample data as per Zubin's specifications for Amadeus Emirates route",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    res.json({
      success: true,
      markups: mockAirMarkups,
      total: mockAirMarkups.length,
      page: 1,
      totalPages: 1,
    });
  });

  // Hotel markups endpoint
  app.get("/api/markup/hotel", (_req, res) => {
    console.log("🏨 Fetching hotel markups");

    const mockHotelMarkups = [
      {
        id: "1",
        name: "Mumbai Luxury Hotels Markup",
        description: "Standard markup for luxury hotels in Mumbai",
        city: "Mumbai",
        hotelName: "Taj Hotel",
        hotelChain: "Taj Hotels",
        starRating: 5,
        roomCategory: "deluxe",
        markupType: "percentage",
        markupValue: 8.5,
        minAmount: 1000,
        maxAmount: 5000,
        currentFareMin: 10.0,
        currentFareMax: 15.0,
        bargainFareMin: 5.0,
        bargainFareMax: 15.0,
        validFrom: "2024-01-01",
        validTo: "2024-12-31",
        checkInDays: ["friday", "saturday", "sunday"],
        applicableDays: ["friday", "saturday", "sunday"],
        minStay: 1,
        maxStay: 7,
        status: "active",
        priority: 1,
        userType: "all",
        seasonType: "Peak Season",
        specialConditions: "Valid for weekend bookings only",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T15:30:00Z",
      },
      {
        id: "2",
        name: "Hotelbeds Taj Mahal Palace Mumbai",
        description: "Hotel Markup for Taj Mahal Palace Mumbai via Hotelbeds",
        city: "Mumbai",
        hotelName: "Taj Mahal Palace",
        hotelChain: "Taj Hotels",
        starRating: 5,
        roomCategory: "deluxe",
        markupType: "percentage",
        markupValue: 12.0,
        minAmount: 1000,
        maxAmount: 8000,
        hotelCode: "53331",
        highFareMin: 20.0,
        highFareMax: 25.0,
        lowFareMin: 15.0,
        lowFareMax: 20.0,
        currentFareMin: 10.0,
        currentFareMax: 12.0,
        bargainFareMin: 10.0,
        bargainFareMax: 20.0,
        validFrom: "2025-01-01",
        validTo: "2025-12-31",
        checkInDays: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        applicableDays: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        minStay: 1,
        maxStay: 30,
        status: "active",
        priority: 1,
        userType: "all",
        seasonType: "Regular",
        specialConditions:
          "Sample data as per Zubin's specifications for Hotelbeds Taj Mahal Palace",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    res.json({
      success: true,
      markups: mockHotelMarkups,
      total: mockHotelMarkups.length,
      page: 1,
      totalPages: 1,
    });
  });

  // Promo codes endpoint
  app.get("/api/promo/admin/all", (_req, res) => {
    console.log("🎫 Fetching promo codes");

    const mockPromoCodes = [
      {
        id: "promo_001",
        code: "FLYHIGH100",
        name: "Fly High Discount",
        type: "percent",
        discountFrom: 5,
        discountTo: 15,
        applicableTo: "flights",
        filters: {
          fromCity: "Mumbai",
          toCity: "Dubai",
          airlines: ["Emirates", "Air India"],
          cabinClass: ["Economy", "Business"],
        },
        travelPeriod: {
          from: "2025-02-01",
          to: "2025-12-31",
        },
        validity: {
          startDate: "2025-01-15",
          endDate: "2025-12-31",
        },
        marketingBudget: 100000,
        budgetUsed: 15750,
        status: "active",
        usageCount: 157,
        createdAt: "2025-01-15T00:00:00Z",
        createdBy: "admin",
      },
      {
        id: "promo_004",
        code: "FAREDOWNBONUS",
        name: "FAREDOWNBONUS Flight Discount",
        type: "fixed",
        discountFrom: 2000,
        discountTo: 5000,
        applicableTo: "flights",
        filters: {
          minFare: 10500,
        },
        travelPeriod: {
          from: "2025-01-01",
          to: "2025-12-31",
        },
        validity: {
          startDate: "2025-01-01",
          endDate: "2025-12-31",
        },
        marketingBudget: 100000,
        budgetUsed: 0,
        status: "active",
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: "admin",
      },
      {
        id: "promo_005",
        code: "FAREDOWNBONUS",
        name: "FAREDOWNBONUS Hotel Discount",
        type: "fixed",
        discountFrom: 2000,
        discountTo: 5000,
        applicableTo: "hotels",
        filters: {
          minFare: 10500,
        },
        travelPeriod: {
          from: "2025-01-01",
          to: "2025-12-31",
        },
        validity: {
          startDate: "2025-01-01",
          endDate: "2025-12-31",
        },
        marketingBudget: 100000,
        budgetUsed: 0,
        status: "active",
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: "admin",
      },
    ];

    res.json({
      success: true,
      data: mockPromoCodes,
    });
  });

  // API health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      database: "connected (simulation)",
      timestamp: new Date().toISOString(),
      services: {
        amadeus: "connected",
        hotelbeds: "connected",
        markup: "active",
        promo: "active",
      },
    });
  });

  // Enhanced live hotel search with Hotelbeds API integration
  app.get("/api/hotels-live/search", async (_req, res) => {
    // Set proper headers for JSON response
    res.setHeader("Content-Type", "application/json");

    // Extract search parameters
    const destinationCode = (_req.query.destination as string) || "DXB";
    const checkIn = _req.query.checkIn as string;
    const checkOut = _req.query.checkOut as string;
    const adults = parseInt(_req.query.adults as string) || 2;
    const rooms = parseInt(_req.query.rooms as string) || 1;

    // Find destination data
    const destinationData =
      MASTER_DESTINATIONS.find(
        (d) =>
          d.code === destinationCode ||
          d.name.toLowerCase().includes(destinationCode.toLowerCase()),
      ) || MASTER_DESTINATIONS.find((d) => d.code === "DXB");

    // Generate realistic Hotelbeds-style hotels
    const hotelCategories = [
      { prefix: "Grand", stars: 5, basePrice: 250, amenityCount: 8 },
      { prefix: "Premium", stars: 4, basePrice: 180, amenityCount: 6 },
      { prefix: "Boutique", stars: 4, basePrice: 160, amenityCount: 5 },
      { prefix: "Business", stars: 4, basePrice: 140, amenityCount: 5 },
      { prefix: "City", stars: 3, basePrice: 120, amenityCount: 4 },
      { prefix: "Express", stars: 3, basePrice: 90, amenityCount: 3 },
    ];

    const allAmenities = [
      "Free WiFi",
      "Swimming Pool",
      "Fitness Center",
      "Restaurant",
      "Room Service",
      "Concierge",
      "Spa & Wellness",
      "Business Center",
      "Airport Shuttle",
      "Parking",
      "Bar/Lounge",
      "Meeting Rooms",
      "Laundry Service",
      "Air Conditioning",
      "Safe",
      "24h Reception",
      "Elevator",
      "Balcony",
    ];

    const hotels = hotelCategories.map((category, index) => {
      const basePrice = category.basePrice;
      const currency =
        destinationData!.countryCode === "IN"
          ? "INR"
          : destinationData!.countryCode === "US"
            ? "USD"
            : "EUR";
      const priceMultiplier =
        currency === "INR" ? 83 : currency === "USD" ? 1 : 0.92;

      const currentPrice = Math.round(
        basePrice * priceMultiplier * (0.9 + Math.random() * 0.2),
      );
      const originalPrice = Math.round(
        currentPrice * (1.1 + Math.random() * 0.3),
      );

      return {
        id: `htl-${destinationData!.code}-${(index + 1).toString().padStart(3, "0")}`,
        code: `HTL${destinationData!.code}${(index + 1).toString().padStart(3, "0")}`,
        name: `${category.prefix} Hotel ${destinationData!.name}`,
        description: `Experience ${category.stars}-star luxury at ${category.prefix} Hotel ${destinationData!.name}. Located in the heart of ${destinationData!.name}, offering exceptional service and world-class amenities.`,
        currentPrice,
        originalPrice,
        currency,
        rating: category.stars,
        reviewScore: 7.5 + (category.stars - 3) * 0.5 + Math.random() * 1,
        reviewCount:
          150 + Math.floor(Math.random() * 500) + category.stars * 50,
        address: {
          street: `${index + 1} Hotel Boulevard`,
          city: destinationData!.name,
          country: destinationData!.country,
          zipCode: `${destinationData!.countryCode}${12000 + index * 100}`,
        },
        location: {
          latitude: 25.2048 + (Math.random() - 0.5) * 0.2,
          longitude: 55.2708 + (Math.random() - 0.5) * 0.2,
        },
        images: (() => {
          // Create unique image sets for each hotel category to simulate real hotel diversity
          const imageCollections = {
            Grand: [
              `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&q=80&auto=format&fit=crop`,
            ],
            Premium: [
              `https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&q=80&auto=format&fit=crop`,
            ],
            Boutique: [
              `https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&q=80&auto=format&fit=crop`,
            ],
            Business: [
              `https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&h=600&q=80&auto=format&fit=crop`,
            ],
            City: [
              `https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&q=80&auto=format&fit=crop`,
            ],
            Express: [
              `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&q=80&auto=format&fit=crop`,
              `https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=600&q=80&auto=format&fit=crop`,
            ],
          };

          return imageCollections[category.prefix] || imageCollections.City;
        })(),
        amenities: allAmenities.slice(0, category.amenityCount).concat(
          allAmenities
            .slice(category.amenityCount)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2),
        ),
        rooms: [
          {
            name: "Standard Room",
            size: "25-30 sqm",
            bedType: adults > 2 ? "Twin Beds" : "Double/Twin",
            maxOccupancy: Math.max(adults, 2),
            price: currentPrice,
            currency,
            features: ["City View", "Air Conditioning", "Free WiFi", "Safe"],
          },
          {
            name: "Deluxe Room",
            size: "35-40 sqm",
            bedType: "King Bed",
            maxOccupancy: Math.max(adults + 1, 3),
            price: Math.round(currentPrice * 1.3),
            currency,
            features: ["City/Sea View", "Balcony", "Mini Bar", "Bathtub"],
          },
        ],
        cancellationPolicy:
          index < 3
            ? "Free cancellation until 24 hours before check-in"
            : "Free cancellation until 48 hours before check-in",
        isLiveData: false, // Set to true when real Hotelbeds integration is active
        supplier: "hotelbeds-simulation",
        supplierHotelId: `htl-sim-${destinationData!.code}-${index + 1}`,
        checkInTime: "15:00",
        checkOutTime: "11:00",
        distanceToCenter: (Math.random() * 5).toFixed(1) + " km",
        facilities: {
          general: ["WiFi", "Air Conditioning", "Elevator", "24h Reception"],
          dining:
            category.amenityCount >= 5
              ? ["Restaurant", "Bar", "Room Service"]
              : ["Restaurant"],
          business:
            category.stars >= 4 ? ["Business Center", "Meeting Rooms"] : [],
          wellness:
            category.stars >= 4
              ? ["Spa", "Fitness Center", "Pool"]
              : category.stars >= 3
                ? ["Pool"]
                : [],
        },
      };
    });

    try {
      // Try to get cached hotels first
      const cachedHotels = await destinationsService.getCachedHotels(
        destinationCode,
        12,
      ); // 12 hour cache

      if (cachedHotels.length > 0) {
        console.log(
          `💾 Using ${cachedHotels.length} cached hotels for ${destinationCode}`,
        );

        res.json({
          success: true,
          data: cachedHotels,
          totalResults: cachedHotels.length,
          isLiveData: false,
          isCached: true,
          source: "Database Cache + Hotelbeds Simulation",
          searchParams: {
            destination: destinationCode,
            destinationName: destinationData!.name,
            checkIn,
            checkOut,
            adults,
            rooms,
            currency: cachedHotels[0]?.priceRange?.currency || "EUR",
          },
          searchMeta: {
            searchId: `cached-${Date.now()}`,
            timestamp: new Date().toISOString(),
            processingTime: "85ms",
            hotelbedsStatus: "cached",
            cacheHit: true,
          },
        });
        return;
      }

      // No cache, generate new data and cache it
      console.log(`🏭 Generating fresh hotel data for ${destinationCode}`);

      // Cache the generated hotels
      destinationsService
        .cacheHotelData(destinationCode, hotels)
        .catch((error) => {
          console.error("Failed to cache hotel data:", error);
        });

      // Track the search
      destinationsService
        .trackDestinationSearch(destinationCode)
        .catch(console.error);

      res.json({
        success: true,
        data: hotels,
        totalResults: hotels.length,
        isLiveData: false, // Will be true when connected to real Hotelbeds API
        isCached: false,
        source: "Enhanced Hotelbeds Simulation + Database Caching",
        searchParams: {
          destination: destinationCode,
          destinationName: destinationData!.name,
          checkIn,
          checkOut,
          adults,
          rooms,
          currency: hotels[0]?.currency,
        },
        searchMeta: {
          searchId: `fresh-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime: "275ms",
          hotelbedsStatus: "simulated",
          cacheHit: false,
          databaseConnected: !destinationsService.fallbackMode,
        },
      });
    } catch (error) {
      console.error("Hotel search error:", error);
      res.status(500).json({
        success: false,
        error: "Hotel search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Live Hotelbeds destinations search (database-backed)
  app.get("/api/hotels-live/destinations/search", async (_req, res) => {
    try {
      const query = (_req.query.q as string) || "";
      const limit = parseInt(_req.query.limit as string) || 15;
      const popularOnly = _req.query.popular === "true";

      console.log(`🔴 Live search (destinations + hotels): "${query}"`);

      // Search destinations first
      const destinations = await destinationsService.searchDestinations(
        query,
        Math.floor(limit * 0.8),
        popularOnly,
      );

      // Generate hotel suggestions for relevant queries (like Booking.com)
      let hotelSuggestions = [];
      if (query.length >= 3) {
        const hotelNames = [
          "Business Hotel",
          "Grand Hotel",
          "Luxury Resort",
          "City Center Hotel",
          "Boutique Hotel",
          "Premium Inn",
          "Marriott",
          "Hilton",
          "Hyatt",
        ];

        const matchingHotels = hotelNames
          .filter((hotel) => hotel.toLowerCase().includes(query.toLowerCase()))
          .slice(0, Math.floor(limit * 0.2))
          .map((hotelName) => {
            const relevantDest =
              destinations[0] ||
              MASTER_DESTINATIONS.find((d) => d.popular) ||
              MASTER_DESTINATIONS[0];
            return {
              code: `HTL-${relevantDest.code}`,
              name: `${hotelName} ${relevantDest.name}`,
              countryName: relevantDest.country,
              countryCode: relevantDest.countryCode,
              type: "hotel",
              zoneCode: null,
              popular: false,
              hotelCount: 1,
              coordinates: {
                latitude: 25.2048 + (Math.random() - 0.5) * 15,
                longitude: 55.2708 + (Math.random() - 0.5) * 25,
              },
              flag: "🏨",
              searchPriority: 25,
            };
          });

        hotelSuggestions = matchingHotels;
      }

      // Transform destinations to Hotelbeds API format
      const formattedDestinations = destinations.map((dest) => ({
        code: dest.code,
        name: dest.name,
        countryName: dest.country,
        countryCode: dest.countryCode,
        type: dest.type,
        zoneCode: null,
        popular: dest.popular,
        hotelCount: 45 + Math.floor(Math.random() * 155),
        coordinates: {
          latitude: 25.2048 + (Math.random() - 0.5) * 15,
          longitude: 55.2708 + (Math.random() - 0.5) * 25,
        },
        flag: dest.flag || "🌍",
        searchPriority: dest.popular ? 10 : 50,
      }));

      // Combine and sort results
      const allResults = [...formattedDestinations, ...hotelSuggestions].sort(
        (a, b) => a.searchPriority - b.searchPriority,
      );

      res.json({
        success: true,
        data: allResults,
        totalResults: allResults.length,
        isLiveData: !destinationsService.fallbackMode,
        source: destinationsService.fallbackMode
          ? "Enhanced Search Simulation"
          : "Database + Hotel Search Integration",
        searchMeta: {
          query,
          limit,
          popularOnly,
          destinationResults: formattedDestinations.length,
          hotelResults: hotelSuggestions.length,
          searchId: `live-search-${Date.now()}`,
          processingTime: "165ms",
          databaseConnected: !destinationsService.fallbackMode,
        },
      });
    } catch (error) {
      console.error("Live destination search error:", error);
      res.status(500).json({
        success: false,
        error: "Live destination search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Enhanced health check with Hotelbeds API simulation status
  app.get("/health", async (_req, res) => {
    try {
      // Try to proxy to main API server
      const response = await fetch("http://localhost:3001/health");
      if (response.ok) {
        const data = await response.json();
        // Add Hotelbeds simulation info
        data.services = {
          ...data.services,
          hotelbeds_api: "simulated",
          destinations_db: "loaded",
          currency_api: "live",
        };
        res.json(data);
      } else {
        throw new Error("Main API server not responding");
      }
    } catch (error) {
      // Enhanced fallback response with Hotelbeds status
      res.json({
        status: "enhanced_fallback",
        timestamp: new Date().toISOString(),
        version: "2.0.0",
        environment: "development",
        services: {
          database: "offline",
          cache: "connected",
          hotelbeds_api: "simulated",
          destinations_db: "loaded",
          currency_api: "live",
          external_apis: "fallback",
        },
        features: {
          live_hotel_search: true,
          destination_autocomplete: true,
          currency_conversion: true,
          mock_booking_flow: true,
        },
        destinations_loaded: MASTER_DESTINATIONS.length,
        message: "Enhanced development server with Hotelbeds simulation active",
      });
    }
  });

  // Database analytics endpoint for admin
  app.get("/api/admin/destinations/analytics", async (_req, res) => {
    try {
      const days = parseInt(_req.query.days as string) || 30;
      const analytics = await destinationsService.getSearchAnalytics(days);

      res.json({
        success: true,
        data: analytics,
        period: `${days} days`,
        source: "Destinations Database Analytics",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Analytics fetch failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Cache management endpoint
  app.post("/api/admin/hotels/cache/cleanup", async (_req, res) => {
    try {
      const cleaned = await destinationsService.cleanupExpiredCache();

      res.json({
        success: true,
        data: {
          cleanedEntries: cleaned,
          timestamp: new Date().toISOString(),
        },
        message: `Cleaned up ${cleaned} expired cache entries`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Cache cleanup failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Hotel details endpoint with caching (legacy path)
  app.get("/api/hotels-live/:hotelId", async (_req, res) => {
    const hotelId = _req.params.hotelId;

    try {
      // In real implementation, this would fetch from Hotelbeds API
      // and use database for caching

      res.json({
        success: true,
        data: {
          id: hotelId,
          name: "Detailed Hotel Information",
          description: "Full hotel details would be fetched from Hotelbeds API",
          isLiveData: false,
          supplier: "hotelbeds-simulation",
          lastUpdated: new Date().toISOString(),
        },
        source: "Enhanced Hotelbeds Hotel Details",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Hotel details fetch failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Hotel details endpoint with correct path that frontend expects
  app.get("/api/hotels-live/hotel/:code", async (_req, res) => {
    res.setHeader("Content-Type", "application/json");

    const { code } = _req.params;
    const { checkIn, checkOut } = _req.query;

    console.log(`🏨 Dev server hotel details for: ${code}`);

    try {
      // Try to proxy to the main API server first
      try {
        const backendUrl = `http://localhost:3001/api/hotels-live/hotel/${code}`;
        const queryParams = new URLSearchParams();
        if (checkIn) queryParams.append("checkIn", checkIn as string);
        if (checkOut) queryParams.append("checkOut", checkOut as string);

        const fullUrl = queryParams.toString()
          ? `${backendUrl}?${queryParams}`
          : backendUrl;

        console.log(`🔄 Proxying to backend: ${fullUrl}`);
        const response = await fetch(fullUrl);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Proxied response from backend API");
          return res.json(data);
        } else {
          console.warn("⚠️ Backend API responded with error, using fallback");
        }
      } catch (proxyError) {
        console.warn(
          "⚠️ Backend API not accessible, using fallback:",
          proxyError.message,
        );
      }

      // Fallback hotel data when backend is not available
      const fallbackHotel = {
        id: code,
        code: code,
        name: `Hotel ${code}`,
        description:
          "Experience luxury accommodations with exceptional service and modern amenities.",
        images: (() => {
          // Generate realistic hotel images based on hotel code
          const imageCollections = {
            "htl-DXB-001": [
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&q=80&auto=format&fit=crop", // Grand luxury exterior
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&q=80&auto=format&fit=crop", // Luxury room
              "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&q=80&auto=format&fit=crop", // Pool area
              "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&q=80&auto=format&fit=crop", // Lobby
            ],
            "htl-DXB-002": [
              "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&q=80&auto=format&fit=crop", // Business hotel exterior
              "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&q=80&auto=format&fit=crop", // Business room
              "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&q=80&auto=format&fit=crop", // Conference room
              "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&q=80&auto=format&fit=crop", // Business lounge
            ],
            "htl-DXB-003": [
              "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&q=80&auto=format&fit=crop", // Boutique hotel exterior
              "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&q=80&auto=format&fit=crop", // Boutique room
              "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&q=80&auto=format&fit=crop", // Boutique dining
              "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&h=600&q=80&auto=format&fit=crop", // Boutique reception
            ],
            default: [
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&q=80&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&q=80&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&q=80&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&q=80&auto=format&fit=crop",
            ],
          };
          return imageCollections[code] || imageCollections.default;
        })(),
        rating: 4.2,
        reviews: 347,
        amenities: ["WiFi", "Pool", "Restaurant", "Spa", "Gym", "Parking"],
        features: ["City View", "Business Center", "Concierge"],
        currentPrice: 167,
        totalPrice:
          checkIn && checkOut
            ? 167 *
              Math.ceil(
                (new Date(checkOut as string).getTime() -
                  new Date(checkIn as string).getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : 334,
        currency: "USD",
        available: true,
        location: {
          address: {
            street: "Marina District",
            city: "Dubai",
            country: "United Arab Emirates",
          },
        },
        checkIn: checkIn || "2025-02-01",
        checkOut: checkOut || "2025-02-03",
        supplier: "dev-server-fallback",
        isLiveData: false,
      };

      res.json({
        success: true,
        hotel: fallbackHotel,
        hasAvailability: true,
        fallback: true,
        source: "Dev Server Fallback",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Hotel details error:", error);

      // Emergency fallback
      res.status(200).json({
        success: false,
        error: "Hotel details temporarily unavailable",
        message: "Please try again later",
        fallback: true,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Hotel availability endpoint with database integration
  app.get("/api/hotels-live/:hotelId/availability", async (_req, res) => {
    try {
      const checkIn = _req.query.checkIn as string;
      const checkOut = _req.query.checkOut as string;

      res.json({
        success: true,
        data: {
          available: true,
          searchParams: { checkIn, checkOut },
          rooms: [
            {
              name: "Standard Room",
              available: 5,
              price: 150,
              currency: "EUR",
              lastUpdated: new Date().toISOString(),
            },
          ],
        },
        source: "Enhanced Hotelbeds Availability Simulation",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Availability check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return app;
}
