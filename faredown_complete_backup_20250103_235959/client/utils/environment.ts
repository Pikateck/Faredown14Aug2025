/**
 * Environment detection utilities
 */

export const isProduction = () => {
  return (
    typeof window !== "undefined" && window.location.hostname !== "localhost"
  );
};

export const isDevelopment = () => {
  return !isProduction();
};

export const getEnvironmentInfo = () => {
  if (typeof window === "undefined") {
    return { env: "server", hostname: "unknown" };
  }

  return {
    env: isProduction() ? "production" : "development",
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
  };
};
