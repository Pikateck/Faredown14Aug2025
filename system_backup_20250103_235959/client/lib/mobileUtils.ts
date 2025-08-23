// Mobile responsiveness utilities

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < breakpoints.md;
};

export const isTablet = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg
  );
};

export const isDesktop = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= breakpoints.lg;
};

export const getDeviceType = (): "mobile" | "tablet" | "desktop" => {
  if (isMobile()) return "mobile";
  if (isTablet()) return "tablet";
  return "desktop";
};

// Responsive grid configurations
export const getGridCols = (
  items: number,
  options?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  },
): string => {
  const mobile = options?.mobile || 1;
  const tablet = options?.tablet || 2;
  const desktop = options?.desktop || Math.min(items, 3);

  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
};

// Responsive spacing
export const getResponsiveSpacing = (
  size: "xs" | "sm" | "md" | "lg" | "xl",
): string => {
  const spacings = {
    xs: "p-2 sm:p-3",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
    xl: "p-8 sm:p-12",
  };
  return spacings[size];
};

// Responsive text sizes
export const getResponsiveText = (
  size: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl",
): string => {
  const sizes = {
    xs: "text-xs",
    sm: "text-xs sm:text-sm",
    base: "text-sm sm:text-base",
    lg: "text-base sm:text-lg",
    xl: "text-lg sm:text-xl",
    "2xl": "text-xl sm:text-2xl",
    "3xl": "text-2xl sm:text-3xl",
  };
  return sizes[size];
};

// Responsive gap
export const getResponsiveGap = (size: "sm" | "md" | "lg"): string => {
  const gaps = {
    sm: "gap-2 sm:gap-3",
    md: "gap-3 sm:gap-4 lg:gap-6",
    lg: "gap-4 sm:gap-6 lg:gap-8",
  };
  return gaps[size];
};

// Touch-friendly button sizing
export const getTouchFriendlySize = (): string => {
  return "min-h-[44px] min-w-[44px] touch-manipulation";
};

// Mobile-first container
export const getResponsiveContainer = (): string => {
  return "w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8";
};

// Responsive flex direction
export const getResponsiveFlex = (direction: "col" | "row" = "col"): string => {
  return direction === "col" ? "flex flex-col md:flex-row" : "flex flex-row";
};

// Hide/show on different screen sizes
export const hideOnMobile = "hidden md:block";
export const hideOnDesktop = "block md:hidden";
export const showOnMobileOnly = "block sm:hidden";
export const showOnTabletUp = "hidden sm:block";

export default {
  breakpoints,
  isMobile,
  isTablet,
  isDesktop,
  getDeviceType,
  getGridCols,
  getResponsiveSpacing,
  getResponsiveText,
  getResponsiveGap,
  getTouchFriendlySize,
  getResponsiveContainer,
  getResponsiveFlex,
  hideOnMobile,
  hideOnDesktop,
  showOnMobileOnly,
  showOnTabletUp,
};
