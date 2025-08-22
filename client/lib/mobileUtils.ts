// Mobile utility functions for better mobile experience

export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) || window.innerWidth <= 768
  );
};

export const isIOS = (): boolean => {
  if (typeof window === "undefined") return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  if (typeof window === "undefined") return false;

  return /Android/.test(navigator.userAgent);
};

export const isTouchDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

export const getViewportHeight = (): number => {
  if (typeof window === "undefined") return 0;

  // Use visual viewport API if available (better for mobile keyboards)
  if (window.visualViewport) {
    return window.visualViewport.height;
  }

  return window.innerHeight;
};

export const preventZoomOnInput = (element: HTMLInputElement): void => {
  if (!isIOS()) return;

  // Prevent zoom on iOS by ensuring font-size is at least 16px
  element.style.fontSize = "16px";
};

export const addMobileTouchOptimizations = (element: HTMLElement): void => {
  if (!isTouchDevice()) return;

  // Add touch optimizations
  element.style.touchAction = "manipulation";
  element.style.webkitTapHighlightColor = "transparent";
  element.style.webkitTouchCallout = "none";
  element.style.webkitUserSelect = "none";
  element.style.userSelect = "none";
};

export const getMobileKeyboardHeight = (): number => {
  if (typeof window === "undefined") return 0;

  const initialHeight = window.innerHeight;
  const currentHeight = getViewportHeight();

  // If viewport height is significantly smaller, keyboard is likely open
  const keyboardHeight = initialHeight - currentHeight;
  return keyboardHeight > 150 ? keyboardHeight : 0;
};

export const addMobileScrollOptimizations = (element: HTMLElement): void => {
  element.style.webkitOverflowScrolling = "touch";
  element.style.overscrollBehavior = "contain";
  element.style.scrollBehavior = "smooth";
};

export const vibrate = (pattern: number | number[] = 50): void => {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    // Silently fail if vibration is not supported
  }
};

export const hapticFeedback = (
  type: "light" | "medium" | "heavy" = "light",
): void => {
  // For iOS devices with haptic feedback
  if (isIOS() && "navigator" in window && "vibrate" in navigator) {
    const patterns = {
      light: 50,
      medium: 100,
      heavy: 200,
    };
    vibrate(patterns[type]);
  }
};

export const getMobileCSS = (): string => {
  return `
    /* Mobile-specific CSS optimizations */
    .mobile-optimized * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .mobile-no-select {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    .mobile-touch-action {
      touch-action: manipulation;
    }
    
    .mobile-tap-transparent {
      -webkit-tap-highlight-color: transparent;
    }
    
    /* Prevent zoom on form inputs for iOS */
    @supports (-webkit-touch-callout: none) {
      input, textarea, select {
        font-size: 16px !important;
      }
    }
    
    /* Safe area support */
    .mobile-safe-area {
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }
  `;
};

export const injectMobileCSS = (): void => {
  if (typeof document === "undefined") return;

  const existingStyle = document.getElementById("mobile-optimizations");
  if (existingStyle) return;

  const style = document.createElement("style");
  style.id = "mobile-optimizations";
  style.textContent = getMobileCSS();
  document.head.appendChild(style);
};

// Initialize mobile optimizations when module loads
if (typeof window !== "undefined" && isMobileDevice()) {
  injectMobileCSS();
}
