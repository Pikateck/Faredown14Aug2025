import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface BargainButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const BargainButton: React.FC<BargainButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "min-h-[36px] px-4 py-2 text-xs",
    md: "min-h-[44px] px-6 py-3 text-sm",
    lg: "min-h-[52px] px-8 py-4 text-base",
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        // Base locked styles - CANNOT be overridden
        "bargain-button-locked",
        "rounded-full", // Pill shape
        "bg-[#febb02]", // Bargain Yellow
        "hover:bg-[#e6a602]", // Slightly darker hover
        "active:bg-[#d19502]", // Active state
        "text-black", // Dark text
        "font-semibold", // Font weight
        "border-0", // No border
        "shadow-sm", // Subtle shadow
        "transition-all duration-200 ease-in-out", // Smooth transitions
        "touch-manipulation", // Touch optimization
        "focus:outline-none focus:ring-2 focus:ring-[#febb02] focus:ring-offset-2", // Focus states
        "disabled:opacity-50 disabled:cursor-not-allowed", // Disabled states
        sizeClasses[size],
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
};
