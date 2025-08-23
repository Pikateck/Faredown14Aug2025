import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MobileSplash = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setIsVisible(true);

    // Auto-redirect after 2 seconds
    const timer = setTimeout(() => {
      navigate("/mobile-home");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleEnterNow = () => {
    navigate("/mobile-home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 to-fuchsia-700 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-2/3 left-1/3 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div
        className={`text-center z-10 transition-all duration-1000 transform ${
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
      >
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-2xl font-bold text-fuchsia-600">✈️</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
            Faredown
          </h1>
          <div className="w-16 h-1 bg-white mx-auto rounded-full"></div>
        </div>

        {/* Tagline */}
        <div className="mb-12">
          <h2 className="text-xl text-white/90 font-medium mb-2">
            Upgrade. Bargain. Book.
          </h2>
          <p className="text-white/70 text-sm">
            Your mobile gateway to smarter travel
          </p>
        </div>

        {/* Loading spinner */}
        <div className="mb-8">
          <div className="inline-block w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>

        {/* Enter button (appears after 1 second) */}
        <div
          className={`transition-all duration-500 delay-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            onClick={handleEnterNow}
            className="bg-white text-fuchsia-600 px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 active:scale-95"
          >
            Enter Now
          </button>
        </div>
      </div>

      {/* Bottom branding */}
      <div
        className={`absolute bottom-8 left-0 right-0 text-center transition-all duration-1000 delay-1500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-white/60 text-sm">
          Powered by AI • Instant Bargains
        </p>
      </div>
    </div>
  );
};

export default MobileSplash;
