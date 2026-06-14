const OpenAI = require("openai");

let openai = null;

const normalizeApiKey = (value) => (typeof value === "string" ? value.trim() : "");

const isPlaceholderApiKey = (value) => {
  const normalized = normalizeApiKey(value).toLowerCase();
  return (
    !normalized ||
    normalized === "your_openai_api_key" ||
    normalized === "your_openai_api_key_here" ||
    normalized === "your_api_key_here" ||
    normalized.includes("your_") ||
    normalized.includes("replace") ||
    normalized.includes("changeme")
  );
};

try {
  const apiKey = normalizeApiKey(process.env.OPENAI_API_KEY);
  if (!isPlaceholderApiKey(apiKey)) {
    openai = new OpenAI({ apiKey });
  }
} catch (err) {
  console.warn("OpenAI client initialization failed:", err.message);
}

const systemPrompt = `You are an AI Learning Assistant for JNTUA Labs, a virtual programming lab platform. Your role is to:

1. Help students understand programming concepts without directly solving their problems
2. Guide them through problem-solving with hints and explanations
3. Suggest debugging approaches for common errors
4. Recommend learning resources and practice problems
5. Be encouraging and supportive

Important guidelines:
- Never write complete solutions for students
- Focus on teaching methodology and problem-solving skills
- Ask guiding questions to help students reach their own solutions
- Explain concepts clearly with examples when helpful
- Keep responses concise and focused
- Acknowledge when a student has made progress

Subjects you help with: Python, JavaScript, Java, C, C++, DSA, Web Development, and general programming concepts.`;

const getFallbackReply = (message) => {
  const text = (message || "").toLowerCase();
  if (text.includes("recursion")) {
    return "Recursion is easier to reason about when you isolate the base case first. Try: what is the smallest input I can solve directly, and how does a larger input shrink toward that case?";
  }
  if (text.includes("big-o") || text.includes("time complexity")) {
    return "Think about how the work grows as the input grows. Count the loops, especially nested loops, and describe the growth in terms of input size rather than exact operations.";
  }
  if (text.includes("binary search")) {
    return "Binary search only works on sorted data. Repeatedly cut the search space in half and compare the target with the middle element to decide which half to inspect next.";
  }
  if (text.includes("pointer") || text.includes("c")) {
    return "In C, a pointer holds an address. Before changing anything, picture where the variable lives and what value the pointer is currently referencing.";
  }
  if (text.includes("error") || text.includes("debug")) {
    return "A good debugging loop is: reproduce the issue, test a tiny input, trace the values step by step, and check the edge cases before changing the logic.";
  }
  if (text.includes("loop") || text.includes("array")) {
    return "Start by writing down the expected output for one small example. That gives you a concrete checkpoint while you build the loop or array logic.";
  }
  return "I can guide you through this step by step. Start by naming the input, the expected output, and one small edge case you need to handle first.";
};

const buildMessages = (message, conversationHistory = []) => [
  { role: "system", content: systemPrompt },
  ...conversationHistory.map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.text || msg.content || ""
  })),
  { role: "user", content: message }
];

const createNonStreamingReply = async (message, conversationHistory = []) => {
  if (!openai) {
    return {
      message: getFallbackReply(message),
      source: "local"
    };
  }

  try {
    const messages = buildMessages(message, conversationHistory);
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return {
      message: response.choices?.[0]?.message?.content || getFallbackReply(message),
      source: "openai",
      tokens_used: response.usage?.total_tokens || 0
    };
  } catch (error) {
    console.warn("OpenAI request failed, using local fallback:", error.message);
    return {
      message: getFallbackReply(message),
      source: "local",
      error: error.message
    };
  }
};

const streamReply = async (res, message, conversationHistory = []) => {
  if (!openai) {
    const fallback = getFallbackReply(message);
    res.write(`data: ${JSON.stringify({ type: "done", text: fallback })}\n\n`);
    res.end();
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const messages = buildMessages(message, conversationHistory);
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.7,
      stream: true
    });

    let fullText = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || "";
      if (delta) {
        fullText += delta;
        res.write(`data: ${JSON.stringify({ type: "chunk", text: delta })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: "done", text: fullText })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Streaming AI Error:", error.message);
    const fallback = getFallbackReply(message);
    res.write(`data: ${JSON.stringify({ type: "error", text: fallback })}\n\n`);
    res.end();
  }
};

module.exports = {
  createNonStreamingReply,
  streamReply,
  getFallbackReply,
  buildMessages
};
