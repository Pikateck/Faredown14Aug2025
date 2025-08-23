import React from "react";
import {
  Plane,
  TrendingDown,
  Handshake,
  Target,
  Zap,
  DollarSign,
  ArrowDown,
  Compass,
  Globe,
  Award,
} from "lucide-react";

const LogoDesignOptions = () => {
  const logoOptions = [
    {
      id: 1,
      name: "Current Style Enhanced",
      description: "Enhanced version of current logo with bargain symbol",
      component: (
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="w-10 h-10 bg-[#febb02] rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-[#003580]" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingDown className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-[#003580]">faredown</span>
        </div>
      ),
    },
    {
      id: 2,
      name: "Bargain Badge",
      description: "Badge-style logo emphasizing the bargain aspect",
      component: (
        <div className="flex items-center space-x-2">
          <div className="relative w-12 h-8 bg-gradient-to-r from-[#003580] to-[#0056b3] rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#febb02] rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-[#003580]">%</span>
            </div>
          </div>
          <span className="text-xl font-bold text-[#003580]">faredown</span>
        </div>
      ),
    },
    {
      id: 3,
      name: "Handshake Deal",
      description: "Emphasizes the negotiation and deal-making aspect",
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[#febb02] rounded-lg flex items-center justify-center relative">
            <Handshake className="w-5 h-5 text-[#003580]" />
            <Plane className="w-3 h-3 text-[#003580] absolute top-0 right-0" />
          </div>
          <span className="text-xl font-bold text-[#003580]">faredown</span>
        </div>
      ),
    },
    {
      id: 4,
      name: "Target Price",
      description: "Target symbol showing precision in getting the right price",
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[#003580] rounded-lg flex items-center justify-center relative">
            <Target className="w-5 h-5 text-[#febb02]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Plane className="w-3 h-3 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-[#003580]">faredown</span>
        </div>
      ),
    },
    {
      id: 5,
      name: "Lightning Deal",
      description: "Energetic design showing quick, powerful deals",
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#febb02] to-[#ffcc33] rounded-lg flex items-center justify-center relative">
            <Zap className="w-5 h-5 text-[#003580]" />
            <Plane className="w-3 h-3 text-[#003580] absolute bottom-1 right-1 opacity-70" />
          </div>
          <span className="text-xl font-bold text-[#003580]">faredown</span>
        </div>
      ),
    },
    {
      id: 6,
      name: "Down Arrow Dynamic",
      description: "Arrow pointing down with plane, showing price reduction",
      component: (
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="w-10 h-10 bg-[#003580] rounded-lg flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-[#febb02]" />
            </div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <Plane className="w-4 h-4 text-[#febb02]" />
            </div>
          </div>
          <span className="text-xl font-bold text-[#003580]">faredown</span>
        </div>
      ),
    },
    {
      id: 7,
      name: "Compass Explorer",
      description: "Travel exploration theme with bargain indicator",
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[#febb02] rounded-lg flex items-center justify-center relative">
            <Compass className="w-5 h-5 text-[#003580]" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#003580] rounded-full flex items-center justify-center">
              <DollarSign className="w-2.5 h-2.5 text-[#febb02]" />
            </div>
          </div>
          <span className="text-xl font-bold text-[#003580]">faredown</span>
        </div>
      ),
    },
    {
      id: 8,
      name: "Globe Bargain",
      description: "Worldwide travel with integrated bargain symbol",
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#003580] to-[#004a9c] rounded-lg flex items-center justify-center relative">
            <Globe className="w-5 h-5 text-[#febb02]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#febb02] rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-[#003580]">↓</span>
            </div>
          </div>
          <span className="text-xl font-bold text-[#003580]">faredown</span>
        </div>
      ),
    },
    {
      id: 9,
      name: "Award Winner",
      description: "Premium badge showing best deals and quality service",
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[#febb02] rounded-lg flex items-center justify-center relative">
            <Award className="w-5 h-5 text-[#003580]" />
            <Plane className="w-3 h-3 text-[#003580] absolute top-1 right-1 opacity-80" />
          </div>
          <span className="text-xl font-bold text-[#003580]">faredown</span>
        </div>
      ),
    },
    {
      id: 10,
      name: "Typography Focus",
      description: "Clean typography with subtle bargain indicator",
      component: (
        <div className="flex items-center space-x-1">
          <span className="text-xl font-bold text-[#003580]">fare</span>
          <div className="flex flex-col items-center">
            <TrendingDown className="w-3 h-3 text-[#febb02]" />
            <Plane className="w-3 h-3 text-[#003580] -mt-1" />
          </div>
          <span className="text-xl font-bold text-[#003580]">down</span>
        </div>
      ),
    },
    {
      id: 11,
      name: "Stacked Badge",
      description: "Compact stacked design for tight spaces",
      component: (
        <div className="flex flex-col items-center">
          <div className="w-12 h-6 bg-[#003580] rounded-t-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-[#febb02]" />
          </div>
          <div className="w-12 h-6 bg-[#febb02] rounded-b-lg flex items-center justify-center">
            <span className="text-xs font-bold text-[#003580]">FARE↓</span>
          </div>
        </div>
      ),
    },
    {
      id: 12,
      name: "Minimalist Modern",
      description: "Ultra-clean modern approach",
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-8 bg-[#febb02] rounded-full"></div>
          <span className="text-xl font-light text-[#003580]">fare</span>
          <div className="flex flex-col items-center">
            <div className="w-1 h-1 bg-[#003580] rounded-full"></div>
            <ArrowDown className="w-3 h-3 text-[#003580] -mt-0.5" />
          </div>
          <span className="text-xl font-light text-[#003580]">down</span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#003580] mb-4">
            Faredown Logo Design Options
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            The World's First Bargain Platform in Travel
          </p>
          <p className="text-sm text-gray-500">
            Maintaining brand colors: Blue (#003580) and Yellow (#febb02)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {logoOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-[#003580] mb-2">
                  {option.name}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {option.description}
                </p>
              </div>

              <div className="flex justify-center items-center h-20 bg-gray-50 rounded-lg mb-4">
                {option.component}
              </div>

              <div className="flex justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-[#003580] rounded"></div>
                  <span>Primary Blue</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-[#febb02] rounded"></div>
                  <span>Accent Yellow</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-[#003580] mb-6 text-center">
            Logo Usage Examples
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Header Usage
              </h3>
              <div className="bg-[#003580] p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#febb02] rounded-lg flex items-center justify-center">
                      <Plane className="w-4 h-4 text-[#003580]" />
                    </div>
                    <span className="text-white font-bold">faredown.com</span>
                  </div>
                  <div className="text-white text-sm">
                    Bargain • Book • Travel
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                App Icon Style
              </h3>
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-[#003580] rounded-xl flex items-center justify-center shadow-lg">
                  <Plane className="w-8 h-8 text-[#febb02]" />
                </div>
                <div className="w-16 h-16 bg-[#febb02] rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="w-8 h-8 text-[#003580]" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#003580] to-[#febb02] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#003580] mb-2">
              Brand Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div>
                <strong>Primary Color:</strong>
                <br />
                Blue #003580
                <br />
                Authority, Trust, Travel
              </div>
              <div>
                <strong>Accent Color:</strong>
                <br />
                Yellow #febb02
                <br />
                Energy, Deals, Savings
              </div>
              <div>
                <strong>Core Message:</strong>
                <br />
                Bargain Platform
                <br />
                Control Your Price
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoDesignOptions;
