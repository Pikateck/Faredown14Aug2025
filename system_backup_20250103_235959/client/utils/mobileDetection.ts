/**
 * Mobile Detection Utilities
 * Used to detect mobile devices and redirect to mobile version
 */

export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  return (
    mobileRegex.test(userAgent) ||
    window.innerWidth <= 768 ||
    "ontouchstart" in window
  );
};

export const shouldRedirectToMobile = (currentPath: string): boolean => {
  // Don't redirect if already on mobile version
  if (currentPath.startsWith("/mobile")) return false;

  // Don't redirect admin pages
  if (currentPath.startsWith("/admin")) return false;

  // Don't redirect API test pages
  if (
    currentPath.includes("/api-test") ||
    currentPath.includes("/backend-test")
  )
    return false;

  // Redirect other pages if on mobile device
  return isMobileDevice();
};

export const getMobileRedirectPath = (currentPath: string): string => {
  // Map desktop paths to mobile equivalents
  const pathMappings: { [key: string]: string } = {
    "/": "/mobile-splash",
    "/flights": "/mobile-search",
    "/hotels": "/mobile-home",
    "/booking-flow": "/mobile-booking",
    "/booking-confirmation": "/mobile-confirmation",
    "/account": "/mobile-trips",
    "/my-trips": "/mobile-trips",
    "/bookings": "/mobile-trips",
  };

  return pathMappings[currentPath] || "/mobile-home";
};

export const getDesktopRedirectPath = (currentPath: string): string => {
  // Map mobile paths to desktop equivalents
  const pathMappings: { [key: string]: string } = {
    "/mobile-splash": "/",
    "/mobile-home": "/",
    "/mobile-search": "/flights",
    "/mobile-booking": "/booking-flow",
    "/mobile-confirmation": "/booking-confirmation",
    "/mobile-trips": "/account",
    "/mobile-profile": "/account",
  };

  return pathMappings[currentPath] || "/";
};

export const isTouchDevice = (): boolean => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

export const getDeviceType = (): "mobile" | "tablet" | "desktop" => {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (
    width <= 768 ||
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  ) {
    return "mobile";
  } else if (width <= 1024 || /ipad/i.test(userAgent)) {
    return "tablet";
  }

  return "desktop";
};
