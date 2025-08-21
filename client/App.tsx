import React, { useEffect, Suspense, lazy } from "react";
import { initializeBargainPlatform } from "./services/bargainAppInit";
import "./styles/performance-optimizations.css";
import "./styles/bargain-button.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { AuthProvider } from "./contexts/AuthContext";
import { DateProvider } from "./contexts/DateContext";
import { LoyaltyProvider } from "./contexts/LoyaltyContext";
import { ErrorBoundary } from "./utils/errorBoundary";

// Core pages - loaded immediately for better initial experience
import Index from "./pages/Index";

// Loading component for Suspense fallback
const PageLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-[#003580] rounded-lg flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <span className="text-[#003580] font-medium">Loading...</span>
    </div>
  </div>
);

// Lazy-loaded pages - code-split for better performance
const FlightResults = lazy(() => import("./pages/FlightResults"));
const FlightDetails = lazy(() => import("./pages/FlightDetails"));
const BookingFlow = lazy(() => import("./pages/BookingFlow"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const Account = lazy(() => import("./pages/Account"));
const Booking = lazy(() => import("./pages/Booking"));
const Hotels = lazy(() => import("./pages/Hotels"));
const HotelResults = lazy(() => import("./pages/HotelResults"));
const HotelDetails = lazy(() => import("./pages/HotelDetails"));
const HotelBooking = lazy(() => import("./pages/HotelBooking"));
const ReservationPage = lazy(() => import("./pages/ReservationPage"));
const HotelBookingConfirmation = lazy(
  () => import("./pages/HotelBookingConfirmation"),
);
const BookingVoucher = lazy(() => import("./pages/BookingVoucher"));
const BookingInvoice = lazy(() => import("./pages/BookingInvoice"));
const Bookings = lazy(() => import("./pages/Bookings"));
const SightseeingResults = lazy(() => import("./pages/SightseeingResults"));
const SightseeingDetails = lazy(() => import("./pages/SightseeingDetails"));
const SightseeingBooking = lazy(() => import("./pages/SightseeingBooking"));
const SightseeingBookingConfirmation = lazy(
  () => import("./pages/SightseeingBookingConfirmation"),
);
const SportsEvents = lazy(() => import("./pages/SportsEvents"));
const Transfers = lazy(() => import("./pages/Transfers"));
const TransferResults = lazy(() => import("./pages/TransferResults"));
const TransferDetails = lazy(() => import("./pages/TransferDetails"));
const TransferBooking = lazy(() => import("./pages/TransferBooking"));
const TransferConfirmation = lazy(() => import("./pages/TransferConfirmation"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Saved = lazy(() => import("./pages/Saved"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MembershipCard = lazy(() => import("./pages/MembershipCard"));

// Mobile pages
import MobileSplash from "./pages/mobile/MobileSplash";
import MobileHome from "./pages/mobile/MobileHome";
import MobileHotelResults from "./pages/mobile/MobileHotelResults";
import MobileSearch from "./pages/MobileSearch";
import MobileBargain from "./pages/MobileBargain";
import MobileBooking from "./pages/MobileBooking";
import MobileConfirmation from "./pages/MobileConfirmation";
import MobileTrips from "./pages/MobileTrips";
import MyTrips from "./pages/MyTrips";
import ApiTestPanel from "./components/ApiTestPanel";
import BackendTestDashboard from "./components/BackendTestDashboard";
import AmadeusTestPanel from "./components/AmadeusTestPanel";
import ApiIntegrationTest from "./components/ApiIntegrationTest";
import BargainErrorTest from "./components/BargainErrorTest";
import LogoDesignOptions from "./components/LogoDesignOptions";
import FaredownColorPalette from "./components/FaredownColorPalette";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import UserManagement from "./pages/admin/UserManagement";
import BargainEngine from "./pages/admin/BargainEngine";
import PaymentDashboard from "./pages/admin/PaymentDashboard";
import AdminTestingDashboard from "./pages/admin/AdminTestingDashboard";
import AIBargainingDashboard from "./pages/admin/AIBargainingDashboard";
import APITestingDashboard from "./pages/admin/APITestingDashboard";

function App() {
  // Initialize bargain platform on app startup
  useEffect(() => {
    initializeBargainPlatform();
  }, []);

  return (
    <div className="App">
      <ErrorBoundary>
        <AuthProvider>
          <CurrencyProvider>
            <DateProvider>
              <LoyaltyProvider>
                <Router>
                  <Suspense fallback={<PageLoadingSpinner />}>
                    <Routes>
                      {/* Original Web Routes */}
                      <Route path="/" element={<Index />} />
                      <Route
                        path="/flights"
                        element={<Navigate to="/?tab=flights" replace />}
                      />
                      <Route
                        path="/flights/results"
                        element={<FlightResults />}
                      />
                      <Route
                        path="/flight-details/:flightId"
                        element={<FlightDetails />}
                      />
                      <Route path="/booking-flow" element={<BookingFlow />} />
                      <Route path="/booking" element={<Booking />} />
                      <Route
                        path="/booking-confirmation"
                        element={<BookingConfirmation />}
                      />
                      <Route path="/account" element={<Account />} />
                      <Route path="/my-account" element={<Account />} />
                      <Route path="/account/trips" element={<MyTrips />} />
                      <Route path="/account/payment" element={<Account />} />
                      <Route path="/saved" element={<Saved />} />
                      <Route path="/hotels" element={<Hotels />} />
                      <Route
                        path="/hotels/results"
                        element={<HotelResults />}
                      />
                      <Route
                        path="/hotels/:hotelId"
                        element={<HotelDetails />}
                      />
                      <Route
                        path="/hotels/booking"
                        element={<HotelBooking />}
                      />
                      <Route
                        path="/booking/hotel"
                        element={<HotelBookingConfirmation />}
                      />
                      <Route path="/reserve" element={<ReservationPage />} />
                      <Route
                        path="/booking-confirmation"
                        element={<HotelBookingConfirmation />}
                      />
                      <Route
                        path="/booking/confirmation/:bookingRef"
                        element={<BookingConfirmation />}
                      />
                      <Route
                        path="/booking-voucher"
                        element={<BookingVoucher />}
                      />
                      <Route
                        path="/booking-invoice"
                        element={<BookingInvoice />}
                      />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route
                        path="/sightseeing"
                        element={<Navigate to="/?tab=sightseeing" replace />}
                      />
                      <Route
                        path="/sightseeing/results"
                        element={<SightseeingResults />}
                      />
                      <Route
                        path="/sightseeing/:attractionId"
                        element={<SightseeingDetails />}
                      />
                      <Route
                        path="/sightseeing/booking"
                        element={<SightseeingBooking />}
                      />
                      <Route
                        path="/sightseeing/booking/confirmation"
                        element={<SightseeingBookingConfirmation />}
                      />
                      <Route path="/sports" element={<SportsEvents />} />
                      <Route path="/sports-events" element={<SportsEvents />} />
                      <Route path="/transfers" element={<Transfers />} />
                      <Route
                        path="/transfer-results"
                        element={<TransferResults />}
                      />
                      <Route
                        path="/transfer-details/:id"
                        element={<TransferDetails />}
                      />
                      <Route
                        path="/transfer-booking"
                        element={<TransferBooking />}
                      />
                      <Route
                        path="/transfer-confirmation"
                        element={<TransferConfirmation />}
                      />
                      <Route path="/help" element={<HelpCenter />} />
                      <Route path="/help-center" element={<HelpCenter />} />
                      <Route path="/support" element={<HelpCenter />} />
                      <Route
                        path="/privacy-policy"
                        element={<PrivacyPolicy />}
                      />
                      <Route
                        path="/terms-conditions"
                        element={<TermsConditions />}
                      />
                      <Route path="/refund-policy" element={<RefundPolicy />} />
                      <Route path="/cookie-policy" element={<CookiePolicy />} />
                      <Route path="/my-trips" element={<MyTrips />} />

                      {/* Development/Testing Routes */}
                      <Route path="/api-test" element={<ApiTestPanel />} />
                      <Route
                        path="/backend-test"
                        element={<BackendTestDashboard />}
                      />
                      <Route
                        path="/amadeus-test"
                        element={<AmadeusTestPanel />}
                      />
                      <Route
                        path="/api-integration-test"
                        element={<ApiIntegrationTest />}
                      />
                      <Route
                        path="/bargain-error-test"
                        element={<BargainErrorTest />}
                      />
                      <Route
                        path="/logo-designs"
                        element={<LogoDesignOptions />}
                      />
                      <Route
                        path="/color-palette"
                        element={<FaredownColorPalette />}
                      />

                      {/* Admin CMS Routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                      />
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route
                        path="/admin/bargain"
                        element={<BargainEngine />}
                      />
                      <Route
                        path="/admin/payments"
                        element={<PaymentDashboard />}
                      />
                      <Route
                        path="/admin/testing"
                        element={<AdminTestingDashboard />}
                      />
                      <Route
                        path="/admin/api"
                        element={<APITestingDashboard />}
                      />
                      <Route
                        path="/admin/AIBargainingDashboard"
                        element={<AIBargainingDashboard />}
                      />
                      <Route
                        path="/admin/ai-bargaining"
                        element={<AIBargainingDashboard />}
                      />
                      <Route
                        path="/admin/api-testing"
                        element={<APITestingDashboard />}
                      />
                      <Route
                        path="/admin/APITestingDashboard"
                        element={<APITestingDashboard />}
                      />

                      {/* Mobile App Routes */}
                      <Route path="/mobile" element={<MobileSplash />} />
                      <Route path="/mobile-splash" element={<MobileSplash />} />
                      <Route path="/mobile-home" element={<MobileHome />} />
                      <Route
                        path="/mobile-hotels"
                        element={<MobileHotelResults />}
                      />
                      <Route
                        path="/mobile-hotel-results"
                        element={<MobileHotelResults />}
                      />
                      <Route path="/mobile-search" element={<MobileSearch />} />
                      <Route
                        path="/mobile-bargain"
                        element={<MobileBargain />}
                      />
                      <Route
                        path="/mobile-booking"
                        element={<MobileBooking />}
                      />
                      <Route
                        path="/mobile-confirmation"
                        element={<MobileConfirmation />}
                      />
                      <Route path="/mobile-trips" element={<MobileTrips />} />
                      <Route path="/mobile-profile" element={<MobileTrips />} />

                      {/* Loyalty Routes */}
                      <Route
                        path="/membership-card"
                        element={<MembershipCard />}
                      />

                      {/* Fallback */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Router>
              </LoyaltyProvider>
            </DateProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
