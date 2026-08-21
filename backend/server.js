const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const { initSocket } = require("./socket/socketServer");
const db = require("./config/db");

const runtimeConfigProvided = Boolean(
  process.env.DB_URL ||
  process.env.MYSQL_URL ||
  process.env.DATABASE_URL ||
  process.env.MYSQLDATABASE_URL ||
  process.env.DB_HOST ||
  process.env.DB_PORT ||
  process.env.DB_USER ||
  process.env.DB_PASSWORD ||
  process.env.DB_NAME ||
  process.env.MYSQLHOST ||
  process.env.MYSQLPORT ||
  process.env.MYSQLUSER ||
  process.env.MYSQLPASSWORD ||
  process.env.MYSQLDATABASE ||
  process.env.JWT_SECRET ||
  process.env.OPENAI_API_KEY ||
  process.env.JUDGE0_API_KEY ||
  process.env.JUDGE0_ENDPOINT ||
  process.env.CORS_ORIGIN ||
  process.env.CLIENT_URL
);

if (!runtimeConfigProvided) {
  dotenv.config({ path: path.resolve(__dirname, ".env") });
}

const app = express();
const server = http.createServer(app);
initSocket(server);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  process.env.CORS_ORIGIN,
  process.env.CLIENT_URL
].filter(Boolean);

// CORS Configuration - Support local development and Vercel production environments
const corsOptions = {
  origin: (origin, callback) => {
    const isLocal = !origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isVercel = /^https:\/\/([a-z0-9-]+\.)?vercel\.app$/.test(origin);
    if (isLocal || allowedOrigins.includes(origin) || isVercel) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for deployment
app.get("/api/health", (req, res) => {
  const database = db.getDatabaseStatus();
  res.status(database.connected ? 200 : 503).json({
    status: database.connected ? "ok" : "degraded",
    database,
    timestamp: new Date().toISOString(),
    service: "backend"
  });
});

app.use(async (req, res, next) => {
  if (!req.path.startsWith("/api/") || req.path === "/api/health") return next();
  try {
    await db.databaseReady;
    return next();
  } catch (error) {
    return res.status(503).json({
      message: "Database is unavailable. Please try again shortly.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message
    });
  }
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// Judge0 Config endpoint
app.get("/api/config/judge0", (req, res) => {
  const apiKey = process.env.JUDGE0_API_KEY;
  const judge0Endpoint = process.env.JUDGE0_ENDPOINT;
  const hasKey = apiKey && apiKey !== "YOUR_RAPIDAPI_KEY_HERE";
  const hasEndpoint = Boolean(judge0Endpoint);

  res.json({
    hasKey,
    hasEndpoint,
    endpoint: judge0Endpoint || null,
    message: hasEndpoint
      ? hasKey
        ? "Judge0 API key configured."
        : "Judge0 endpoint configured; public CE endpoint will be used if no API key is present."
      : "Judge0 endpoint not configured. Set JUDGE0_ENDPOINT in .env file."
  });
});

const PORT = Number(process.env.PORT || 5000);

const startServer = (port) => {
  const listener = server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on ${port}`);
  });

  listener.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const fallbackPort = port + 1;
      console.warn(`Port ${port} is busy. Retrying on ${fallbackPort}...`);
      startServer(fallbackPort);
      return;
    }

    console.error("Server startup error:", error.message || error);
    process.exit(1);
  });
};

startServer(PORT);