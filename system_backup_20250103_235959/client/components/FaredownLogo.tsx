import React from "react";
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";

interface FaredownLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  textColor?: string;
  className?: string;
  linkTo?: string;
  onClick?: () => void;
}

const FaredownLogo: React.FC<FaredownLogoProps> = ({
  size = "md",
  showText = true,
  textColor = "text-current",
  className = "",
  linkTo = "/",
  onClick,
}) => {
  const sizeClasses = {
    sm: {
      icon: "w-6 h-6",
      plane: "w-3 h-3",
      text: "text-sm",
    },
    md: {
      icon: "w-8 h-8",
      plane: "w-4 h-4",
      text: "text-lg",
    },
    lg: {
      icon: "w-10 h-10",
      plane: "w-5 h-5",
      text: "text-xl",
    },
  };

  const logoContent = (
    <div
      className={`flex items-center space-x-2 ${className}`}
      onClick={onClick}
    >
      <div
        className={`${sizeClasses[size].icon} bg-[#febb02] rounded-lg flex items-center justify-center`}
      >
        <Plane className={`${sizeClasses[size].plane} text-[#003580]`} />
      </div>
      {showText && (
        <span className={`${sizeClasses[size].text} font-bold ${textColor}`}>
          faredown.com
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default FaredownLogo;
