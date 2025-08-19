import React, { useEffect } from "react";
import { initializeBargainPlatform } from "./services/bargainAppInit";
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

// Original pages
import Index from "./pages/Index";
import FlightResults from "./pages/FlightResults";
import FlightDetails from "./pages/FlightDetails";
import BookingFlow from "./pages/BookingFlow";
import BookingConfirmation from "./pages/BookingConfirmation";
import Account from "./pages/Account";
import Booking from "./pages/Booking";
import Hotels from "./pages/Hotels";
import HotelResults from "./pages/HotelResults";
import HotelDetails from "./pages/HotelDetails";
import HotelBooking from "./pages/HotelBooking";
import ReservationPage from "./pages/ReservationPage";
import HotelBookingConfirmation from "./pages/HotelBookingConfirmation";
import BookingVoucher from "./pages/BookingVoucher";
import BookingInvoice from "./pages/BookingInvoice";
import Bookings from "./pages/Bookings";
import SightseeingResults from "./pages/SightseeingResults";
import SightseeingDetails from "./pages/SightseeingDetails";
import SightseeingBooking from "./pages/SightseeingBooking";
import SightseeingBookingConfirmation from "./pages/SightseeingBookingConfirmation";
import SportsEvents from "./pages/SportsEvents";
import Transfers from "./pages/Transfers";
import TransferResults from "./pages/TransferResults";
import TransferDetails from "./pages/TransferDetails";
import TransferBooking from "./pages/TransferBooking";
import TransferConfirmation from "./pages/TransferConfirmation";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import Saved from "./pages/Saved";
import NotFound from "./pages/NotFound";
import MembershipCard from "./pages/MembershipCard";

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
      <AuthProvider>
        <CurrencyProvider>
          <DateProvider>
            <LoyaltyProvider>
              <Router>
                <Routes>
                  {/* Original Web Routes */}
                  <Route path="/" element={<Index />} />
                  <Route
                    path="/flights"
                    element={<Navigate to="/?tab=flights" replace />}
                  />
                  <Route path="/flights/results" element={<FlightResults />} />
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
                  <Route path="/hotels/results" element={<HotelResults />} />
                  <Route path="/hotels/:hotelId" element={<HotelDetails />} />
                  <Route path="/hotels/booking" element={<HotelBooking />} />
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
                  <Route path="/booking-voucher" element={<BookingVoucher />} />
                  <Route path="/booking-invoice" element={<BookingInvoice />} />
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
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
                  <Route path="/amadeus-test" element={<AmadeusTestPanel />} />
                  <Route
                    path="/api-integration-test"
                    element={<ApiIntegrationTest />}
                  />
                  <Route
                    path="/bargain-error-test"
                    element={<BargainErrorTest />}
                  />
                  <Route path="/logo-designs" element={<LogoDesignOptions />} />
                  <Route
                    path="/color-palette"
                    element={<FaredownColorPalette />}
                  />

                  {/* Admin CMS Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/bargain" element={<BargainEngine />} />
                  <Route
                    path="/admin/payments"
                    element={<PaymentDashboard />}
                  />
                  <Route
                    path="/admin/testing"
                    element={<AdminTestingDashboard />}
                  />
                  <Route path="/admin/api" element={<APITestingDashboard />} />
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
                  <Route path="/mobile-bargain" element={<MobileBargain />} />
                  <Route path="/mobile-booking" element={<MobileBooking />} />
                  <Route
                    path="/mobile-confirmation"
                    element={<MobileConfirmation />}
                  />
                  <Route path="/mobile-trips" element={<MobileTrips />} />
                  <Route path="/mobile-profile" element={<MobileTrips />} />

                  {/* Loyalty Routes */}
                  <Route path="/membership-card" element={<MembershipCard />} />

                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </LoyaltyProvider>
          </DateProvider>
        </CurrencyProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
