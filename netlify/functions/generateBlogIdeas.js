
const fetch = require("node-fetch");

const rateLimitMap = new Map();

exports.handler = async (event) => {
  const allowOrigin = "https://www.rythmworks.com";

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders(allowOrigin),
      body: "OK",
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return errorResponse(500, "OPENAI_API_KEY is not set", allowOrigin);
  }

  const userIP = event.headers["x-nf-client-connection-ip"] || "unknown";
  const usage = rateLimitMap.get(userIP) || { count: 0, lastUsed: Date.now() };
  const today = new Date().toDateString();
  const lastUsedDay = new Date(usage.lastUsed).toDateString();

  if (usage.count >= 5 && today === lastUsedDay) {
    return {
      statusCode: 429,
      headers: corsHeaders(allowOrigin),
      body: JSON.stringify({
        error: "⛔ You’ve reached your daily limit of 5 blog idea lists. Please come back tomorrow.",
      }),
    };
  }

  let keyword = "";
  try {
    const parsed = JSON.parse(event.body || "{}");
    keyword = parsed.keyword;
    if (!keyword) throw new Error("Keyword is required.");
  } catch (err) {
    return errorResponse(400, "Invalid input: " + err.message, allowOrigin);
  }

  const prompt = `Generate 10 unique, SEO-friendly blog post title ideas based on the keyword: "${keyword}".
Return only a plain text list, each title on a new line.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error("No content returned from OpenAI.");

    const ideas = raw
      .split(/\n+/)
      .map(item => item.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    rateLimitMap.set(userIP, {
      count: today === lastUsedDay ? usage.count + 1 : 1,
      lastUsed: Date.now(),
    });

    return {
      statusCode: 200,
      headers: corsHeaders(allowOrigin),
      body: JSON.stringify({ ideas }),
    };
  } catch (err) {
    return errorResponse(500, "OpenAI error: " + err.message, allowOrigin);
  }
};

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function errorResponse(status, message, origin) {
  return {
    statusCode: status,
    headers: corsHeaders(origin),
    body: JSON.stringify({ error: message }),
  };
}
