/**
 * Mobile Performance Optimizations
 * Collection of utilities to enhance mobile app performance
 */

// Lazy loading for images
export const lazyLoadImage = (
  src: string,
  placeholder?: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Touch gesture detection
export interface SwipeDetection {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export const useSwipeDetection = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: SwipeDetection) => {
  let startX: number | null = null;
  let startY: number | null = null;

  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!startX || !startY) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    startX = null;
    startY = null;
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit,
) => {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: "10px",
    threshold: 0.1,
    ...options,
  });
};

// Local storage with expiry
export const setStorageWithExpiry = (key: string, value: any, ttl: number) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getStorageWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload fonts
  const fontLinks = [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  ];

  fontLinks.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    document.head.appendChild(link);
  });
};

// Optimize images for mobile
export const optimizeImageForMobile = (
  src: string,
  width: number,
  quality: number = 80,
): string => {
  // This would integrate with image optimization service in production
  // For now, return original src
  return src;
};

// Memory management
export const clearUnusedCaches = () => {
  // Clear expired localStorage items
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith("temp_") || key.startsWith("cache_")) {
      getStorageWithExpiry(key); // This will auto-remove expired items
    }
  });
};

// Network optimization
export const getConnectionSpeed = (): "slow" | "fast" | "unknown" => {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (!connection) return "unknown";

  const effectiveType = connection.effectiveType;
  return ["slow-2g", "2g", "3g"].includes(effectiveType) ? "slow" : "fast";
};

// Battery optimization
export const getBatteryLevel = async (): Promise<number | null> => {
  try {
    const battery = await (navigator as any).getBattery?.();
    return battery ? battery.level : null;
  } catch {
    return null;
  }
};

// Reduce animations on low battery
export const shouldReduceAnimations = async (): Promise<boolean> => {
  const batteryLevel = await getBatteryLevel();
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  return prefersReducedMotion || (batteryLevel !== null && batteryLevel < 0.2);
};

// Service Worker registration for offline support
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("SW registered: ", registration);
      return registration;
    } catch (error) {
      console.log("SW registration failed: ", error);
      return null;
    }
  }
  return null;
};

// Haptic feedback for mobile
export const hapticFeedback = (
  type: "light" | "medium" | "heavy" = "light",
) => {
  if ("vibrate" in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 50,
    };
    navigator.vibrate(patterns[type]);
  }
};

// Mobile-specific CSS optimizations
export const injectMobileCSS = () => {
  const style = document.createElement("style");
  style.textContent = `
    /* Mobile optimizations */
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    input, textarea, [contenteditable] {
      -webkit-user-select: text;
      -khtml-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
    
    /* Smooth scrolling */
    html {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    
    /* Hide scrollbars on mobile */
    ::-webkit-scrollbar {
      display: none;
    }
    
    /* Optimize touch targets */
    button, a, [role="button"] {
      min-height: 44px;
      min-width: 44px;
    }
  `;
  document.head.appendChild(style);
};

export default {
  lazyLoadImage,
  debounce,
  throttle,
  useSwipeDetection,
  createIntersectionObserver,
  setStorageWithExpiry,
  getStorageWithExpiry,
  preloadCriticalResources,
  optimizeImageForMobile,
  clearUnusedCaches,
  getConnectionSpeed,
  getBatteryLevel,
  shouldReduceAnimations,
  registerServiceWorker,
  hapticFeedback,
  injectMobileCSS,
};
