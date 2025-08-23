import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const MobileBargain = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <h1 className="font-semibold text-lg text-gray-800">Bargain Center</h1>

        <div className="w-8"></div>
      </div>

      {/* Content */}
      <div className="p-4 text-center">
        <div className="text-6xl mb-4">🔥</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bargain Center
        </h2>
        <p className="text-gray-600 mb-8">
          Advanced bargain features coming soon!
        </p>

        <button
          onClick={() => navigate("/mobile-home")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Back to Search
        </button>
      </div>
    </div>
  );
};

export default MobileBargain;
