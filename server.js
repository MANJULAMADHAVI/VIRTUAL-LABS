const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { initSocket } = require("./backend/socket/socketServer");

const runtimeConfigProvided = Boolean(
  process.env.DB_URL ||
  process.env.MYSQL_URL ||
  process.env.DATABASE_URL ||
  process.env.DB_HOST ||
  process.env.DB_PORT ||
  process.env.DB_USER ||
  process.env.DB_PASSWORD ||
  process.env.DB_NAME ||
  process.env.JWT_SECRET ||
  process.env.OPENAI_API_KEY ||
  process.env.JUDGE0_API_KEY ||
  process.env.JUDGE0_ENDPOINT ||
  process.env.CORS_ORIGIN ||
  process.env.CLIENT_URL
);

if (!runtimeConfigProvided) {
  dotenv.config({ path: path.resolve(__dirname, "backend/.env") });
}

const app = express();
const server = http.createServer(app);
initSocket(server);

const APP_PORT = Number(process.env.APP_PORT || 5001);

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index (2).html"));
});

app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "index (2).html"));
});

app.use("/api/auth", require("./backend/routes/authRoutes"));
app.use("/api/questions", require("./backend/routes/questionRoutes"));
app.use("/api/submissions", require("./backend/routes/submissionRoutes"));
app.use("/api/progress", require("./backend/routes/progressRoutes"));
app.use("/api/chatbot", require("./backend/routes/chatbotRoutes"));
app.use("/api/ai", require("./backend/routes/aiRoutes"));
app.use("/api/analytics", require("./backend/routes/analyticsRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/config/judge0", (req, res) => {
  const apiKey = process.env.JUDGE0_API_KEY;
  const judge0Endpoint = process.env.JUDGE0_ENDPOINT;
  const hasKey = Boolean(apiKey && apiKey !== "YOUR_RAPIDAPI_KEY_HERE");
  const hasEndpoint = Boolean(judge0Endpoint);

  res.json({
    hasKey,
    hasEndpoint,
    endpoint: judge0Endpoint || null,
    message: hasEndpoint
      ? hasKey
        ? "Judge0 API key configured."
        : "Judge0 endpoint configured; public CE endpoint will be used if no API key is present."
      : "Judge0 endpoint not configured. Set JUDGE0_ENDPOINT in environment variables."
  });
});

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

startServer(APP_PORT);