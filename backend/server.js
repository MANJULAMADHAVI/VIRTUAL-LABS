const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { initSocket } = require("./socket/socketServer");

dotenv.config();

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

// CORS Configuration - Support both local and production environments
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
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
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on ${PORT}`);
});