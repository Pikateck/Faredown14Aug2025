#!/usr/bin/env node

/**
 * Faredown Node.js API Startup Script
 * Handles server initialization, dependency checks, and graceful startup
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ANSI color codes for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
  bright: "\x1b[1m",
};

/**
 * Print colored console messages
 */
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) =>
    console.log(`${colors.cyan}${colors.bright}🎯 ${msg}${colors.reset}`),
  divider: () => console.log(`${colors.cyan}${"=".repeat(50)}${colors.reset}`),
};

/**
 * Check Node.js version
 */
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

  if (majorVersion < 16) {
    log.error(`Node.js 16+ required. Current version: ${nodeVersion}`);
    process.exit(1);
  }

  log.success(`Node.js ${nodeVersion} detected`);
}

/**
 * Check if package.json exists
 */
function checkPackageJson() {
  const packagePath = path.join(__dirname, "package.json");

  if (!fs.existsSync(packagePath)) {
    log.error("package.json not found");
    process.exit(1);
  }

  log.success("package.json found");
}

/**
 * Install dependencies if node_modules doesn't exist
 */
function installDependencies() {
  const nodeModulesPath = path.join(__dirname, "node_modules");

  if (!fs.existsSync(nodeModulesPath)) {
    log.info("Installing dependencies...");
    try {
      execSync("npm install", { stdio: "inherit", cwd: __dirname });
      log.success("Dependencies installed successfully");
    } catch (error) {
      log.error("Failed to install dependencies");
      log.error(error.message);
      process.exit(1);
    }
  } else {
    log.success("Dependencies already installed");
  }
}

/**
 * Check environment configuration
 */
function checkEnvironment() {
  const envPath = path.join(__dirname, ".env");

  if (!fs.existsSync(envPath)) {
    log.warning(".env file not found - using default configuration");
  } else {
    log.success("Environment configuration found");
  }
}

/**
 * Create required directories
 */
function createDirectories() {
  const dirs = ["logs", "uploads", "temp"];

  dirs.forEach((dir) => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log.success(`Created directory: ${dir}`);
    }
  });
}

/**
 * Check port availability
 */
function checkPort() {
  const port = process.env.PORT || 3001;
  const net = require("net");

  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(port, () => {
      server.once("close", () => {
        log.success(`Port ${port} is available`);
        resolve();
      });
      server.close();
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        log.error(`Port ${port} is already in use`);
        log.info("Please stop the existing service or use a different port");
        reject(err);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Display startup banner
 */
function displayBanner() {
  log.divider();
  log.header("FAREDOWN NODE.JS API");
  log.divider();
  console.log(
    `${colors.magenta}🚀 Starting Faredown API Server...${colors.reset}`,
  );
  console.log(`${colors.yellow}📅 ${new Date().toISOString()}${colors.reset}`);
  console.log(
    `${colors.blue}🌍 Environment: ${process.env.NODE_ENV || "development"}${colors.reset}`,
  );
  console.log(
    `${colors.green}📍 Port: ${process.env.PORT || 3001}${colors.reset}`,
  );
  log.divider();
}

/**
 * Display server information
 */
function displayServerInfo() {
  const port = process.env.PORT || 3001;

  console.log("\n🎉 Server started successfully!");
  log.divider();
  console.log(
    `${colors.green}📍 Server URL: http://localhost:${port}${colors.reset}`,
  );
  console.log(
    `${colors.blue}🏥 Health Check: http://localhost:${port}/health${colors.reset}`,
  );
  console.log(`${colors.cyan}📚 API Routes:${colors.reset}`);
  console.log(`   • Auth: http://localhost:${port}/api/auth`);
  console.log(`   • Admin: http://localhost:${port}/api/admin`);
  console.log(`   • Bookings: http://localhost:${port}/api/bookings`);
  console.log(`   • Users: http://localhost:${port}/api/users`);
  console.log(`   • Flights: http://localhost:${port}/api/flights`);
  console.log(`   • Hotels: http://localhost:${port}/api/hotels`);
  log.divider();
  console.log(`${colors.magenta}🔑 Test Credentials:${colors.reset}`);
  console.log(`   • Admin: admin / admin123`);
  console.log(`   • Sales: sales / sales123`);
  log.divider();
  console.log(
    `${colors.yellow}Press Ctrl+C to stop the server${colors.reset}\n`,
  );
}

/**
 * Main startup function
 */
async function startServer() {
  try {
    displayBanner();

    // Run pre-flight checks
    log.info("Running pre-flight checks...");
    checkNodeVersion();
    checkPackageJson();
    checkEnvironment();
    createDirectories();
    await checkPort();

    // Install dependencies if needed
    installDependencies();

    log.success("All pre-flight checks passed");
    log.info("Starting server...");

    // Load environment variables
    require("dotenv").config();

    // Start the server
    const app = require("./server");

    // Display server information after startup
    displayServerInfo();
  } catch (error) {
    log.error("Failed to start server");
    log.error(error.message);
    process.exit(1);
  }
}

/**
 * Handle graceful shutdown
 */
function setupGracefulShutdown() {
  process.on("SIGTERM", () => {
    console.log("\n🛑 SIGTERM received, shutting down gracefully...");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("\n🛑 SIGINT received, shutting down gracefully...");
    process.exit(0);
  });

  process.on("uncaughtException", (error) => {
    log.error("Uncaught Exception:");
    console.error(error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    log.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  });
}

// Setup graceful shutdown handlers
setupGracefulShutdown();

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
