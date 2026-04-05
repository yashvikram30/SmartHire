import 'dotenv/config';
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import seedAdmin from "./src/utils/seedAdmin.js";

let server;

// Validate environment variables (production-safe)
const checkEnv = () => {
  const required = [
    "MONGO_URI",           
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "FRONTEND_URL",
    "ADMIN_NAME",
    "ADMIN_PASSWORD",
    "ADMIN_EMAIL",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASS"
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error("CRITICAL ERROR: Missing environment variables:");
    console.error(missing.join(", "));
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    checkEnv();

    await connectDB();
    await seedAdmin();

    const PORT = process.env.PORT || 10000; 

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  console.error("Unexpected error:", error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  }
});

startServer();