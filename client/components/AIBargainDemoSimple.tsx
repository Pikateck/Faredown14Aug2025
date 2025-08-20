import React, { useState } from 'react';
import { FlightStyleBargainModal } from './FlightStyleBargainModal';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { TrendingDown, Plane, Building } from 'lucide-react';

export function AIBargainDemoSimple() {
  const [showFlightBargain, setShowFlightBargain] = useState(false);
  const [showHotelBargain, setShowHotelBargain] = useState(false);

  // Demo flight data
  const demoFlight = {
    id: 'demo-flight-1',
    name: 'IndiGo 6E-123',
    location: 'BOM → DEL',
    totalPrice: 8500,
    features: ['Direct Flight', 'Economy Class', 'Refundable'],
    maxOccupancy: 1,
    bedType: 'Economy Seat',
    size: '32" pitch',
    cancellation: 'Free cancellation up to 24h',
    description: 'Mumbai to Delhi direct flight',
    image: 'https://example.com/flight.jpg'
  };

  const demoHotel = {
    id: 'demo-hotel-1',
    name: 'The Taj Hotel',
    location: 'Mumbai',
    checkIn: '2024-02-15',
    checkOut: '2024-02-17'
  };

  const demoRoom = {
    id: 'demo-room-1',
    name: 'Deluxe Room',
    description: 'Spacious room with city view',
    image: 'https://example.com/room.jpg',
    totalPrice: 12000,
    marketPrice: 15000,
    features: ['Free WiFi', 'Room Service', 'City View'],
    maxOccupancy: 2,
    bedType: 'King Bed',
    size: '400 sq ft',
    cancellation: 'Free cancellation'
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          🚀 AI Bargain Demo
        </h1>
        <p className="text-gray-600">
          Click "Bargain Now" to see the live chat negotiation with AI emotional intelligence
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Flight Demo */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{demoFlight.name}</h3>
                  <p className="text-sm text-gray-600">{demoFlight.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">₹{demoFlight.totalPrice.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Base Price</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {demoFlight.features.map((feature, idx) => (
                <div key={idx} className="text-sm text-gray-600">• {feature}</div>
              ))}
            </div>

            <Button 
              onClick={() => setShowFlightBargain(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Bargain Now
            </Button>
          </CardContent>
        </Card>

        {/* Hotel Demo */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{demoRoom.name}</h3>
                  <p className="text-sm text-gray-600">{demoHotel.name} • {demoHotel.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">₹{demoRoom.totalPrice.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Per Night</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {demoRoom.features.map((feature, idx) => (
                <div key={idx} className="text-sm text-gray-600">• {feature}</div>
              ))}
            </div>

            <Button 
              onClick={() => setShowHotelBargain(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Bargain Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">✨ What You'll See:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Live chat beats</strong> with timed AI responses (≤10s total)</li>
          <li>• <strong>Emotional intelligence</strong> - AI adapts based on your offer</li>
          <li>• <strong>"Negotiated in X.Xs"</strong> badge when complete</li>
          <li>• <strong>30s countdown timer</strong> for accepted offers</li>
          <li>• <strong>Bargain Again</strong> option with FOMO messaging</li>
          <li>• <strong>Module-specific icons</strong> for suppliers (✈️🏨📍🚗)</li>
        </ul>
      </div>

      {/* Flight Bargain Modal */}
      <FlightStyleBargainModal
        roomType={demoFlight}
        hotel={demoHotel}
        isOpen={showFlightBargain}
        onClose={() => setShowFlightBargain(false)}
        checkInDate={new Date('2024-02-15')}
        checkOutDate={new Date('2024-02-17')}
        roomsCount={1}
        type="hotel" // Using hotel type for demo
        onBookingSuccess={(finalPrice) => {
          console.log('Flight bargain success:', finalPrice);
          setShowFlightBargain(false);
          alert(`Flight booked for ₹${finalPrice.toLocaleString()}!`);
        }}
      />

      {/* Hotel Bargain Modal */}
      <FlightStyleBargainModal
        roomType={demoRoom}
        hotel={demoHotel}
        isOpen={showHotelBargain}
        onClose={() => setShowHotelBargain(false)}
        checkInDate={new Date('2024-02-15')}
        checkOutDate={new Date('2024-02-17')}
        roomsCount={1}
        type="hotel"
        onBookingSuccess={(finalPrice) => {
          console.log('Hotel bargain success:', finalPrice);
          setShowHotelBargain(false);
          alert(`Hotel booked for ₹${finalPrice.toLocaleString()}!`);
        }}
      />
    </div>
  );
}
