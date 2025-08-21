/**
 * Install PostgreSQL dependency for Faredown API
 */

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

async function installPostgreSQL() {
  console.log("📦 Installing PostgreSQL driver (pg)...");

  return new Promise((resolve, reject) => {
    exec("npm install pg", { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Failed to install PostgreSQL driver:", error);
        reject(error);
        return;
      }

      console.log("✅ PostgreSQL driver installed successfully");
      console.log(stdout);

      // Check if pg is now available
      try {
        require("pg");
        console.log("✅ PostgreSQL driver is working");
        resolve();
      } catch (err) {
        console.error("❌ PostgreSQL driver not working:", err);
        reject(err);
      }
    });
  });
}

// Run installation
if (require.main === module) {
  installPostgreSQL()
    .then(() => {
      console.log("🎉 PostgreSQL setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Installation failed:", error);
      process.exit(1);
    });
}

module.exports = { installPostgreSQL };
