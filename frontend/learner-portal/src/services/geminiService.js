/**
 * geminiService.js
 * Real Google Gemini API integration.
 * Uses the REST API directly (no SDK) for maximum compatibility in the browser.
 *
 * Set your API key in .env: VITE_GEMINI_API_KEY=...
 * Or in localStorage: localStorage.setItem("GEMINI_API_KEY", "your_key")
 */

const MODEL = "gemini-3.8-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

function getApiKey() {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem("GEMINI_API_KEY") ||
    ""
  );
}

/** Convert our message format to Gemini's content format */
function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
}

/**
 * Core Gemini generate call.
 * @param {object} opts
 * @param {Array<{role: string, content: string}>} opts.messages
 * @param {string} [opts.systemInstruction]
 * @param {Array} [opts.tools] - Gemini function declarations
 * @param {number} [opts.temperature]
 * @param {number} [opts.maxOutputTokens]
 * @returns {Promise<{text: string, functionCalls: Array, raw: object}>}
 */
export async function geminiGenerate({
  messages,
  systemInstruction = "",
  tools = [],
  temperature = 0.7,
  maxOutputTokens = 2048,
}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "Gemini API key not set. Add VITE_GEMINI_API_KEY to your .env file or run: localStorage.setItem('GEMINI_API_KEY', 'your_key')"
    );
  }

  const body = {
    contents: toGeminiContents(messages),
    generationConfig: {
      temperature,
      maxOutputTokens,
      topP: 0.95,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  if (tools.length > 0) {
    body.tools = [{ functionDeclarations: tools }];
    body.toolConfig = { functionCallingConfig: { mode: "AUTO" } };
  }

  const url = `${BASE_URL}/models/${MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message || `Gemini API error ${response.status}`
    );
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts || [];

  const textParts = parts.filter((p) => p.text).map((p) => p.text);
  const functionCalls = parts
    .filter((p) => p.functionCall)
    .map((p) => p.functionCall);

  return {
    text: textParts.join(""),
    functionCalls,
    raw: data,
    finishReason: candidate?.finishReason,
  };
}

/**
 * Gemini generate with function calling loop.
 * Automatically executes tool calls and feeds results back.
 * @param {object} opts
 * @param {string} opts.systemInstruction
 * @param {Array} opts.messages
 * @param {Array} opts.tools - { declaration, handler }
 * @param {number} [opts.maxToolRounds]
 * @returns {Promise<{text: string, toolLog: Array}>}
 */
export async function geminiWithTools({
  systemInstruction,
  messages,
  tools = [],
  maxToolRounds = 5,
}) {
  const declarations = tools.map((t) => t.declaration);
  const handlerMap = Object.fromEntries(tools.map((t) => [t.declaration.name, t.handler]));

  const conversationMessages = [...messages];
  const toolLog = [];
  let finalText = "";

  for (let round = 0; round < maxToolRounds; round++) {
    const result = await geminiGenerate({
      messages: conversationMessages,
      systemInstruction,
      tools: declarations,
      temperature: 0.3,
    });

    if (result.functionCalls.length === 0) {
      finalText = result.text;
      break;
    }

    // Execute all function calls in parallel
    const toolResults = await Promise.all(
      result.functionCalls.map(async (fc) => {
        const handler = handlerMap[fc.name];
        let output;
        try {
          output = handler ? await handler(fc.args || {}) : { error: "Unknown tool" };
        } catch (e) {
          output = { error: e.message };
        }
        toolLog.push({ name: fc.name, args: fc.args, output, round });
        return { name: fc.name, response: output };
      })
    );

    // Append function call + results to conversation
    conversationMessages.push({
      role: "model",
      content: JSON.stringify(result.functionCalls.map((fc) => ({ functionCall: fc }))),
    });
    conversationMessages.push({
      role: "user",
      content: JSON.stringify(
        toolResults.map((tr) => ({
          functionResponse: { name: tr.name, response: { content: JSON.stringify(tr.response) } },
        }))
      ),
    });

    if (result.finishReason === "STOP" && result.text) {
      finalText = result.text;
      break;
    }
  }

  return { text: finalText, toolLog };
}

/** Simple single-turn text generation */
export async function geminiChat(userMessage, systemInstruction = "", history = []) {
  const messages = [
    ...history,
    { role: "user", content: userMessage },
  ];
  const result = await geminiGenerate({ messages, systemInstruction, temperature: 0.7 });
  return result.text;
}

/** Generate embeddings via Gemini embedding model */
export async function geminiEmbed(text) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Gemini API key not configured.");

  const url = `${BASE_URL}/models/gemini-embedding-001:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Embedding API error ${response.status}`);
  }

  const data = await response.json();
  return data.embedding?.values || [];
}

export function isApiKeySet() {
  return Boolean(getApiKey());
}
