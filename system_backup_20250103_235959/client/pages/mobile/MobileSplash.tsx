import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MobileSplash = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [logoScale, setLogoScale] = useState(0.8);

  useEffect(() => {
    // Start animations
    setIsVisible(true);

    // Logo scale animation
    const scaleTimer = setTimeout(() => {
      setLogoScale(1);
    }, 200);

    // Auto-redirect after 2.5 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/mobile-home");
    }, 2500);

    return () => {
      clearTimeout(scaleTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  const handleEnterNow = () => {
    navigate("/mobile-home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-600 via-fuchsia-500 to-purple-600 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white rounded-full animate-ping delay-700"></div>
        <div className="absolute top-2/3 left-1/3 w-16 h-16 bg-white rounded-full animate-ping delay-1000"></div>
      </div>

      {/* Main content */}
      <div
        className={`text-center z-10 transition-all duration-1000 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Logo Container */}
        <div className="mb-8">
          <div
            className={`w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-2xl transition-transform duration-700 ${
              logoScale === 1 ? "scale-100" : "scale-80"
            }`}
            style={{ transform: `scale(${logoScale})` }}
          >
            {/* Airplane Icon */}
            <svg
              className="w-12 h-12 text-fuchsia-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1L15 22v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>

          {/* Brand Name */}
          <h1 className="text-4xl font-bold text-white mb-3 tracking-wide">
            Faredown
          </h1>
          <div className="w-20 h-1 bg-white mx-auto rounded-full opacity-80"></div>
        </div>

        {/* Tagline */}
        <div className="mb-12">
          <h2 className="text-xl text-white font-medium mb-3 leading-relaxed">
            Upgrade. Bargain. Book.
          </h2>
          <p className="text-white/80 text-sm px-4">
            Your mobile gateway to smarter travel deals
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Enter Button */}
        <div
          className={`transition-all duration-500 delay-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            onClick={handleEnterNow}
            className="bg-white text-fuchsia-600 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 active:scale-95 min-w-[140px]"
          >
            Enter App
          </button>
        </div>
      </div>

      {/* Bottom Branding */}
      <div
        className={`absolute bottom-8 left-0 right-0 text-center transition-all duration-1000 delay-1500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-white/70 text-sm">
          Powered by AI • Instant Bargains • Secure Booking
        </p>
      </div>

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default MobileSplash;
