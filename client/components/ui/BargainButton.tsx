import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface BargainButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
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
    sm: "min-h-[40px] px-5 py-2.5 text-sm",
    md: "min-h-[48px] px-7 py-3.5 text-base",
    lg: "min-h-[56px] px-9 py-4 text-lg",
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        // Base locked styles - CANNOT be overridden
        "bargain-button-locked",
        "rounded-full", // Perfect pill shape
        "bg-gradient-to-r from-[#febb02] to-[#f4a902]", // Elegant gradient
        "hover:from-[#e6a602] hover:to-[#d19502]", // Darker gradient on hover
        "active:from-[#d19502] active:to-[#c08902]", // Even darker on active
        "text-black", // Dark text for contrast
        "font-bold", // Bold font weight
        "border-0", // No border
        "shadow-lg", // Nice shadow for depth
        "hover:shadow-xl", // Enhanced shadow on hover
        "transition-all duration-300 ease-out", // Smooth transitions
        "transform hover:scale-[1.02] active:scale-[0.98]", // Subtle scale effects
        "touch-manipulation", // Touch optimization
        "focus:outline-none focus:ring-4 focus:ring-[#febb02]/30 focus:ring-offset-2", // Enhanced focus states
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100", // Disabled states
        "relative overflow-hidden", // For shimmer effect
        // Add a subtle shimmer effect
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        sizeClasses[size],
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        <span className="relative z-10 font-bold tracking-wide">
          {children}
        </span>
      )}
    </Button>
  );
};
