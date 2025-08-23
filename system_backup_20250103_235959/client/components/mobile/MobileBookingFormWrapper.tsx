import React, { useEffect, useState } from "react";
import { BookingSearchForm } from "@/components/BookingSearchForm";
import MobileCurrencySelector from "./MobileCurrencySelector";
import { useNavigate } from "react-router-dom";
import { isMobileDevice } from "@/utils/mobileDetection";

interface MobileBookingFormWrapperProps {
  className?: string;
  showCurrencySelector?: boolean;
  redirectToMobileResults?: boolean;
}

const MobileBookingFormWrapper: React.FC<MobileBookingFormWrapperProps> = ({
  className = "",
  showCurrencySelector = true,
  redirectToMobileResults = true,
}) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());

    // Add mobile-specific CSS classes
    const formElement = document.querySelector(".booking-search-form");
    if (formElement && isMobile) {
      formElement.classList.add("mobile-optimized");
    }

    // Override form submission to redirect to mobile results
    if (redirectToMobileResults && isMobile) {
      const handleFormSubmit = (event: any) => {
        event.preventDefault();
        // Extract form data and navigate to mobile results
        navigate("/mobile-hotel-results", {
          state: {
            searchData: {
              // Form data would be extracted here
              destination: "Dubai",
              checkIn: new Date(),
              checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              guests: { adults: 2, children: 0, rooms: 1 },
            },
          },
        });
      };

      const searchButton = document.querySelector(".search-hotels-btn");
      if (searchButton) {
        searchButton.addEventListener("click", handleFormSubmit);
        return () => {
          searchButton.removeEventListener("click", handleFormSubmit);
        };
      }
    }
  }, [navigate, redirectToMobileResults, isMobile]);

  return (
    <div className={`mobile-booking-wrapper ${className}`}>
      {/* Currency Selector for Mobile */}
      {showCurrencySelector && isMobile && (
        <div className="mb-4">
          <MobileCurrencySelector compact />
        </div>
      )}

      {/* Enhanced Booking Form */}
      <div className="mobile-form-container">
        <BookingSearchForm />
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-booking-wrapper {
          position: relative;
        }

        .mobile-form-container {
          /* Mobile optimizations for the booking form */
        }

        .mobile-booking-wrapper :global(.booking-search-form.mobile-optimized) {
          /* Mobile-specific overrides */
          padding: 1rem;
          border-radius: 0.75rem;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .mobile-booking-wrapper
          :global(.booking-search-form.mobile-optimized input) {
          font-size: 16px !important; /* Prevent zoom on iOS */
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          background: white;
        }

        .mobile-booking-wrapper
          :global(.booking-search-form.mobile-optimized input:focus) {
          border-color: #3b82f6;
          ring-color: #3b82f6;
          ring-width: 2px;
          outline: none;
        }

        .mobile-booking-wrapper
          :global(.booking-search-form.mobile-optimized button) {
          min-height: 44px;
          touch-action: manipulation;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: all 0.2s ease-out;
        }

        .mobile-booking-wrapper
          :global(.booking-search-form.mobile-optimized .search-hotels-btn) {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
          border: none;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }

        .mobile-booking-wrapper
          :global(
            .booking-search-form.mobile-optimized .search-hotels-btn:hover
          ) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
        }

        .mobile-booking-wrapper
          :global(
            .booking-search-form.mobile-optimized .search-hotels-btn:active
          ) {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }

        /* Calendar popup optimizations */
        .mobile-booking-wrapper :global(.calendar-popup) {
          position: fixed !important;
          left: 1rem !important;
          right: 1rem !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 9999;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        /* Guest selector optimizations */
        .mobile-booking-wrapper :global(.guest-popup) {
          position: fixed !important;
          left: 1rem !important;
          right: 1rem !important;
          bottom: 2rem !important;
          top: auto !important;
          max-height: 60vh;
          overflow-y: auto;
          z-index: 9999;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        /* Destination dropdown optimizations */
        .mobile-booking-wrapper :global(.destination-dropdown) {
          position: fixed !important;
          left: 1rem !important;
          right: 1rem !important;
          top: 20% !important;
          max-height: 60vh;
          overflow-y: auto;
          z-index: 9999;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          background: white;
          border: 1px solid #e5e7eb;
        }

        /* Form field layout for mobile */
        .mobile-booking-wrapper :global(.form-fields) {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mobile-booking-wrapper :global(.form-row) {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        @media (min-width: 640px) {
          .mobile-booking-wrapper :global(.form-row) {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* Loading states */
        .mobile-booking-wrapper :global(.loading) {
          opacity: 0.7;
          pointer-events: none;
        }

        /* Error states */
        .mobile-booking-wrapper :global(.error input) {
          border-color: #ef4444;
          background-color: #fef2f2;
        }

        /* Success states */
        .mobile-booking-wrapper :global(.success input) {
          border-color: #10b981;
          background-color: #f0fdf4;
        }

        /* Accessibility improvements */
        .mobile-booking-wrapper :global([aria-label]) {
          position: relative;
        }

        .mobile-booking-wrapper :global(.sr-only) {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .mobile-booking-wrapper
            :global(.booking-search-form.mobile-optimized) {
            background: #1f2937;
            border-color: #374151;
          }

          .mobile-booking-wrapper
            :global(.booking-search-form.mobile-optimized input) {
            background: #374151;
            border-color: #4b5563;
            color: white;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .mobile-booking-wrapper
            :global(.booking-search-form.mobile-optimized input) {
            border-width: 2px;
          }

          .mobile-booking-wrapper
            :global(.booking-search-form.mobile-optimized button) {
            border: 2px solid;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .mobile-booking-wrapper :global(*) {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileBookingFormWrapper;
