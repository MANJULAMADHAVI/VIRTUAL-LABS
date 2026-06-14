const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { initSocket } = require("./backend/socket/socketServer");

dotenv.config({ path: path.resolve(__dirname, "backend/.env") });

const app = express();
const server = http.createServer(app);
initSocket(server);

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

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on ${PORT}`);
});