import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface FaredownButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const FaredownButton: React.FC<FaredownButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  className,
  variant = "primary",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "min-h-[40px] py-2.5 text-sm",
    md: "min-h-[44px] py-3 text-sm",
    lg: "min-h-[48px] py-4 text-base",
  };

  const variantClasses = {
    primary: "bg-[#febb02] hover:bg-[#e6a602] active:bg-[#d19900] text-black",
    secondary:
      "border-2 border-[#003580] bg-transparent hover:bg-[#003580] text-[#003580] hover:text-white",
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        // Base standardized styles from Transfers page
        "faredown-button-locked",
        "w-full",
        "font-semibold",
        "rounded-xl",
        "shadow-sm",
        "active:scale-95",
        "touch-manipulation",
        "transition-all duration-200",
        "flex items-center justify-center gap-2",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 border-2 rounded-full animate-spin ${
              variant === "primary"
                ? "border-black/30 border-t-black"
                : "border-current/30 border-t-current"
            }`}
          />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
};
