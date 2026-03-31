import OpenAI from "openai";

// External AI provider credentials should be in .env.local:
// OPENAI_API_KEY=xxx
const apiKey = process.env.OPENAI_API_KEY;

export const aiProvider = new OpenAI({
  apiKey: apiKey || "TODO_REPLACE_WITH_ACTUAL_KEY",
});

export const DEFAULT_MODEL = "gpt-4-turbo-preview"; // Fast and capable for structured intake
