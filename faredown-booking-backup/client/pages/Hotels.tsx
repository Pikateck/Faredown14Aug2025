import React from "react";
import { Header } from "@/components/Header";
import { BookingSearchForm } from "@/components/BookingSearchForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Heart } from "lucide-react";

export default function Hotels() {
  const recentSearches = [
    {
      destination: "Dubai",
      dates: "Aug 1 - Aug 5 people",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100",
    },
  ];

  const interestedProperty = {
    name: "Grand Hyatt Dubai",
    location: "Dubai - Deira Creek",
    rating: 8.1,
    ratingText: "Excellent",
    reviews: 234,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300",
  };

  return (
    <div className="min-h-screen bg-[#003580]">
      <Header />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">
            Find your next stay
          </h1>
          <p className="text-white/90 text-sm sm:text-base">
            Search low prices on hotels, homes and much more...
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-6 sm:mb-8">
          <BookingSearchForm />
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column - Recent Searches */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Recent Searches */}
            <div className="bg-white rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                Your recent searches
              </h2>

              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer touch-manipulation"
                >
                  <img
                    src={search.image}
                    alt={search.destination}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {search.destination}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {search.dates}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Still Interested Section */}
            <div className="bg-white rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                Still interested in this property?
              </h2>

              <Card
                className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow touch-manipulation cursor-pointer"
                onClick={() => (window.location.href = "/hotels/3")}
              >
                <div className="relative">
                  <img
                    src={interestedProperty.image}
                    alt={interestedProperty.name}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  <button
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full transition-colors touch-manipulation"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                </div>

                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1">
                    {interestedProperty.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">
                      {interestedProperty.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm font-bold">
                        {interestedProperty.rating}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs sm:text-sm">
                          {interestedProperty.ratingText}
                        </div>
                        <div className="text-xs text-gray-600">
                          {interestedProperty.reviews} reviews
                        </div>
                      </div>
                    </div>
                    <button
                      className="bg-[#003580] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#002a66] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = "/hotels/3";
                      }}
                    >
                      View Rooms
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Placeholder for additional content */}
          <div className="space-y-4 sm:space-y-6">
            {/* This space could be used for promotions, deals, etc. */}
            <div className="bg-white rounded-lg p-4 sm:p-6">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">
                Special Offers
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Discover amazing deals and exclusive discounts on hotels
                worldwide.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 sm:p-6">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">
                Travel Tips
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Get insider tips and recommendations for your next adventure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
