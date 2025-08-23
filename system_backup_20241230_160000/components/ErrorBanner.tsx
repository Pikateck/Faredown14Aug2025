import React from "react";
import { X, AlertCircle } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function ErrorBanner({ message, isVisible, onClose }: ErrorBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-100 border-b-2 border-red-200 px-4 py-3 shadow-sm animate-in slide-in-from-top duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-4 text-red-600 hover:text-red-800 transition-colors"
          aria-label="Close error message"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
