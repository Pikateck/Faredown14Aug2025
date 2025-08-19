import React from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import { Heart, Plane, Hotel, User, Search, Bookmark, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Saved() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header />

      {/* Main Content */}
      <div className="pt-20 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Your Saved Items
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save flights, hotels, and destinations you're interested in to
              easily find them later.
            </p>

            <div className="space-y-4 mb-8">
              <Button asChild>
                <Link to="/">
                  <Search className="w-4 h-4 mr-2" />
                  Search Flights
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/hotels">
                  <Hotel className="w-4 h-4 mr-2" />
                  Browse Hotels
                </Link>
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Bookmark className="w-4 h-4" />
                <span>Tip: Look for the heart icon to save items</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="block md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Plane className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Flights</span>
          </Link>
          <Link
            to="/hotels"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Hotel className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Hotels</span>
          </Link>
          <Link
            to="/sightseeing"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Camera className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Sightseeing</span>
          </Link>
          <Link
            to="/saved"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Heart className="w-5 h-5 text-[#003580]" />
            <span className="text-xs text-[#003580] font-medium">Saved</span>
          </Link>
          <Link
            to="/account"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Account</span>
          </Link>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
}
