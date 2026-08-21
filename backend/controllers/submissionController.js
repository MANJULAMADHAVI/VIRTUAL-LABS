const db = require("../config/db");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const languageMap = {
  C: 50,
  "C++": 54,
  Java: 62,
  Python: 71,
  JavaScript: 63,
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
  js: 63
};

const judge0Request = (endpoint, apiKey, body) => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const payload = JSON.stringify(body);
    const isHttps = url.protocol === "https:";
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "Accept": "application/json"
      }
    };

    if (apiKey) {
      requestOptions.headers["x-rapidapi-key"] = apiKey;
      if (url.hostname.includes("rapidapi")) {
        requestOptions.headers["x-rapidapi-host"] = url.hostname;
      }
    }

    const client = isHttps ? https : http;
    const req = client.request(requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Judge0 response parse failed: ${err.message}`));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(payload);
    req.end();
  });
};

exports.submitCode = async (req, res) => {
  const {
    userId,
    questionId,
    code,
    language,
    stdin = "",
    judge0Key: userProvidedKey
  } = req.body;

  if (!userId || !questionId || !code) {
    return res.status(400).json({
      message: "Missing required fields: userId, questionId, code"
    });
  }

  const judge0Key = process.env.JUDGE0_API_KEY;
  const judge0Endpoint = process.env.JUDGE0_ENDPOINT;
  let output = "";
  let status = "Pending";

  if (judge0Endpoint) {
    const languageId = languageMap[language] || languageMap[language?.toLowerCase()] || languageMap[language?.toUpperCase()];

    if (!languageId) {
      return res.status(400).json({ message: "Unsupported language for execution." });
    }

    try {
      const payload = {
        source_code: Buffer.from(code).toString("base64"),
        language_id: languageId,
        stdin: Buffer.from(stdin || "").toString("base64"),
        base64_encoded: true
      };
      const endpoint = judge0Endpoint.replace(/\/?$/, "") + "/submissions?wait=true&base64_encoded=true";
      const apiKey = userProvidedKey || (judge0Key && judge0Key !== "YOUR_RAPIDAPI_KEY_HERE" ? judge0Key : null);
      const result = await judge0Request(endpoint, apiKey, payload);

      const decode = (value) => value ? Buffer.from(value, "base64").toString("utf8") : "";
      const stdout = decode(result.stdout);
      const stderr = decode(result.stderr);
      const compileOutput = decode(result.compile_output);
      const message = decode(result.message);

      output = "";
      if (compileOutput) output += `Compile Output:\n${compileOutput}\n`;
      if (stderr) output += `Runtime Error:\n${stderr}\n`;
      if (stdout) output += stdout;
      if (!output) output = message || "No output returned from execution.";

      if (result.status && result.status.id === 3) {
        status = "Accepted";
      } else if (result.status && [1, 2].includes(result.status.id)) {
        status = "Pending";
      } else {
        status = "Rejected";
      }
    } catch (err) {
      console.error("Judge0 execution error:", err);
      output = `Execution service error: ${err.message}`;
      status = "Rejected";
    }
  } else {
    output = "Code execution is disabled because JUDGE0_ENDPOINT is not configured.";
    status = "Skipped";
  }

  const sql = `
        INSERT INTO submissions
        (student_id, question_id, code, output, status, marks_obtained)
        VALUES(?, ?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [userId, questionId, code, output, status, 0],
    (err, result) => {
      if (err) {
        console.error("Submission error:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      db.query(
        `
          UPDATE student_progress
          SET solved_questions = (
            SELECT COUNT(*) FROM submissions WHERE student_id = ? AND status = 'Accepted'
          ),
          total_marks = (
            SELECT COALESCE(SUM(marks_obtained), 0) FROM submissions WHERE student_id = ?
          ),
          total_questions = (
            SELECT COUNT(*) FROM questions
          )
          WHERE student_id = ?
        `,
        [userId, userId, userId],
        (progressErr) => {
          if (progressErr) {
            console.error("Progress update error:", progressErr);
          }
          res.json({
            message: "Code submitted successfully!",
            submissionId: result.insertId,
            output,
            status
          });
        }
      );
    }
  );
};

exports.getSubmissions = (req, res) => {
  db.query(
    "SELECT * FROM submissions",
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json(result);
    }
  );
};