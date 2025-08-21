import React from "react";
import {
  TrendingDown,
  Eye,
  Star,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
} from "lucide-react";

interface SimpleCardProps {
  onBargainClick: () => void;
  onViewDetails: () => void;
}

export function SightseeingCardSimple({
  onBargainClick,
  onViewDetails,
}: SimpleCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Image */}
        <div className="h-48 bg-gray-200">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fadc752b547864028b3c403d353c64fe5?format=webp&width=800"
            alt="Test attraction"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                Test Attraction: Burj Khalifa
              </h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Dubai, UAE</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded text-sm">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  4.6
                </div>
                <span className="text-sm text-gray-600">45,879 reviews</span>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  1-2 hours
                </div>
              </div>
            </div>
            <div className="text-right ml-3">
              <div className="text-xl font-bold text-gray-900">$298</div>
              <div className="text-xs text-gray-600">$149 per person</div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Free cancellation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>360-degree views of Dubai</span>
            </div>
          </div>

          {/* MOBILE BUTTONS - FORCED TO BE VISIBLE */}
          <div
            className="border-t border-gray-200 pt-4 -mx-4 px-4 bg-gray-50"
            style={{
              marginLeft: "-1rem",
              marginRight: "-1rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
            }}
          >
            <div className="flex gap-3">
              <button
                onClick={onBargainClick}
                style={{
                  backgroundColor: "#febb02",
                  color: "#000000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "14px",
                  minHeight: "48px",
                  width: "calc(50% - 6px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#e6a602";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#febb02";
                }}
              >
                <TrendingDown size={16} />
                Bargain Now
              </button>
              <button
                onClick={onViewDetails}
                style={{
                  backgroundColor: "#003580",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "14px",
                  minHeight: "48px",
                  width: "calc(50% - 6px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#002a66";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#003580";
                }}
              >
                <Eye size={16} />
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-52">
        {/* Image */}
        <div className="w-80 h-full">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fadc752b547864028b3c403d353c64fe5?format=webp&width=800"
            alt="Test attraction"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          <div className="flex-1 p-6">
            <h3 className="font-semibold text-gray-900 text-xl mb-2">
              Test Attraction: Burj Khalifa
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Dubai, UAE</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded text-sm">
                <Star className="w-3 h-3 mr-1 fill-current" />
                4.6
              </div>
              <span className="text-sm text-gray-600">45,879 reviews</span>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                1-2 hours
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>360-degree views of Dubai</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>High-speed elevator experience</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-64 border-l border-gray-200 bg-gray-50 p-6">
            <div className="text-right mb-4">
              <div className="text-2xl font-bold text-gray-900 mb-1">$298</div>
              <div className="text-sm text-gray-600">$149 per person</div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Free cancellation</span>
              </div>
            </div>

            {/* DESKTOP BUTTONS - FORCED TO BE VISIBLE */}
            <div className="space-y-3">
              <button
                onClick={onBargainClick}
                style={{
                  backgroundColor: "#febb02",
                  color: "#000000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "14px",
                  minHeight: "44px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#e6a602";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#febb02";
                }}
              >
                <TrendingDown size={16} />
                Bargain Now
              </button>
              <button
                onClick={onViewDetails}
                style={{
                  backgroundColor: "#003580",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "14px",
                  minHeight: "44px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#002a66";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#003580";
                }}
              >
                <Eye size={16} />
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
