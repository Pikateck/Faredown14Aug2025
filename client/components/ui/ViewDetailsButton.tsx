import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ViewDetailsButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const ViewDetailsButton: React.FC<ViewDetailsButtonProps> = ({
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
        // Base locked styles - SAME as BargainButton but white
        "view-details-button-locked",
        "rounded-full", // Perfect pill shape - SAME as bargain button
        "bg-white", // White background
        "hover:bg-gray-50", // Light gray on hover
        "active:bg-gray-100", // Slightly darker on active
        "text-gray-900", // Dark text
        "font-bold", // Bold font weight - SAME as bargain button
        "border-2 border-gray-300", // Border for outline style
        "hover:border-gray-400", // Darker border on hover
        "shadow-lg", // Nice shadow for depth - SAME as bargain button
        "hover:shadow-xl", // Enhanced shadow on hover
        "transition-all duration-300 ease-out", // Smooth transitions
        "transform hover:scale-[1.02] active:scale-[0.98]", // Subtle scale effects - SAME as bargain button
        "touch-manipulation", // Touch optimization
        "focus:outline-none focus:ring-4 focus:ring-gray-300/30 focus:ring-offset-2", // Focus states
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100", // Disabled states
        "relative overflow-hidden", // For consistency
        sizeClasses[size],
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-900 rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <span className="relative z-10 font-bold tracking-wide">
          {children}
        </span>
      )}
    </Button>
  );
};
