/**
 * Utility functions for scroll behavior across navigation
 */

export const scrollToTop = (behavior: ScrollBehavior = "smooth"): void => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior,
  });
};

export const scrollToTopOnRouteChange = (): void => {
  // Use smooth scroll for better UX
  scrollToTop("smooth");
};

export const scrollToElement = (
  elementId: string,
  behavior: ScrollBehavior = "smooth",
): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior, block: "start" });
  }
};
