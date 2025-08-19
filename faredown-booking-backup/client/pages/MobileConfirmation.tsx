import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import MobileTicket from "@/components/MobileTicket";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Mail,
  Home,
  Plane,
  Gift,
  Star,
  Clock,
  ArrowRight,
  Calendar,
  MapPin,
} from "lucide-react";

const MobileConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state;
  const [emailSent, setEmailSent] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  useEffect(() => {
    if (bookingData) {
      // Save to localStorage for trip history
      const existingBookings = JSON.parse(
        localStorage.getItem("faredownBookings") || "[]",
      );
      existingBookings.push(bookingData);
      localStorage.setItem(
        "faredownBookings",
        JSON.stringify(existingBookings),
      );

      // Simulate email sending
      setTimeout(() => {
        setEmailSent(true);
      }, 2000);
    }
  }, [bookingData]);

  const quickActions = [
    {
      icon: Home,
      label: "Home",
      action: () => navigate("/"),
      color: "bg-blue-500",
    },
    {
      icon: Plane,
      label: "Book Again",
      action: () => navigate("/mobile-search"),
      color: "bg-green-500",
    },
    {
      icon: Calendar,
      label: "My Trips",
      action: () => navigate("/mobile-trips"),
      color: "bg-purple-500",
    },
    {
      icon: Gift,
      label: "Deals",
      action: () => navigate("/deals"),
      color: "bg-orange-500",
    },
  ];

  if (!bookingData) {
    return (
      <MobileLayout>
        <div className="p-4 text-center">
          <p>Booking data not found</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      <div className="space-y-6">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full transform -translate-x-12 translate-y-12"></div>

          <div className="relative text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-green-100 mb-3">
              Your flight has been successfully booked
            </p>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 inline-block backdrop-blur-sm">
              <div className="text-xs text-green-100 mb-1">
                Booking Reference
              </div>
              <div className="text-lg font-bold">
                {bookingData.bookingDetails.bookingRef}
              </div>
            </div>
          </div>
        </div>

        {/* Email Notification */}
        {emailSent && (
          <div className="mx-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-blue-800">
                    Email Confirmation Sent
                  </div>
                  <div className="text-sm text-blue-600">
                    Check {bookingData.bookingDetails.contactDetails.email}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bargain Success */}
        {bookingData.bookingDetails.bargainSuccess && (
          <div className="mx-4">
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-orange-800">
                      🎉 Bargain Successful!
                    </div>
                    <div className="text-sm text-orange-600">
                      AI negotiation saved you money
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">
                      Original Price:
                    </span>
                    <span className="text-sm line-through text-gray-500">
                      ₹25,000
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Your Price:</span>
                    <span className="font-bold text-green-600">
                      ₹{bookingData.bookingDetails.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-orange-600">
                      You Saved:
                    </span>
                    <span className="font-bold text-orange-600">
                      ₹
                      {(
                        25000 - bookingData.bookingDetails.totalAmount
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Flight Summary */}
        <div className="mx-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Flight Summary</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">Emirates</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Mumbai (BOM) → Dubai (DXB)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Saturday, August 16, 2024</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">10:15 AM - 11:45 AM (2h 25m)</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Paid:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{bookingData.bookingDetails.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Ticket Button */}
        <div className="mx-4">
          <Button
            onClick={() => setShowTicket(!showTicket)}
            className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-semibold"
          >
            {showTicket ? "Hide" : "View"} Mobile Ticket
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Mobile Ticket */}
        {showTicket && (
          <div className="mx-4">
            <MobileTicket bookingData={bookingData} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mx-4">
          <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-6 hover:bg-gray-50"
              >
                <div
                  className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Travel Tips */}
        <div className="mx-4">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-800 mb-3">Travel Tips</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  <span>Download the Emirates app for easy check-in</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  <span>Check Dubai visa requirements if needed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  <span>Arrive 3 hours early for international flights</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Support */}
        <div className="mx-4 pb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our 24/7 support team is here to assist you
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileConfirmation;
