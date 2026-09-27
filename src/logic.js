// QVAC Synonym Suggester — core logic.
// completion() suggests 5 synonyms for a given word.

import { completion } from "@qvac/sdk";

function looksUnusable(list, word) {
  if (!Array.isArray(list) || list.length === 0) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "i am not able"];
  const joined = list.join(" ").toLowerCase();
  if (bad.some((phrase) => joined.includes(phrase))) return true;
  if (list.some((w) => !w || w.trim().length === 0 || w.split(/\s+/).length > 3)) return true;
  if (list.length === 1 && list[0].toLowerCase() === word.toLowerCase()) return true;
  return false;
}

const FALLBACK_MAP = {
  happy: ["glad", "joyful", "pleased", "cheerful", "content"],
  sad: ["unhappy", "sorrowful", "downcast", "gloomy", "blue"],
  big: ["large", "huge", "sizable", "great", "massive"],
  small: ["little", "tiny", "compact", "minor", "petite"],
  fast: ["quick", "swift", "rapid", "speedy", "brisk"],
};

function fallback(word) {
  const key = word.toLowerCase().trim();
  if (FALLBACK_MAP[key]) return FALLBACK_MAP[key];
  return [`similar to "${word}"`, `like ${word}`, `${word}-ish`, `close to ${word}`, `${word}-like`];
}

function parseList(text) {
  return text
    .split(/[\n,]/)
    .map((line) => line.replace(/^[\s\-*\d.)]+/, "").trim())
    .filter((line) => line.length > 0);
}

export async function generate(modelId, word) {
  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You are a thesaurus. Given a word, reply with exactly 5 synonyms (words or short phrases with a very similar meaning), " +
          "one per line, no numbering, no preamble, no explanation.",
      },
      { role: "user", content: "Word: happy" },
      {
        role: "assistant",
        content: "glad\njoyful\npleased\ncheerful\ncontent",
      },
      { role: "user", content: "Word: difficult" },
      {
        role: "assistant",
        content: "hard\nchallenging\ntough\ndemanding\narduous",
      },
      { role: "user", content: `Word: ${word}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.6, maxTokens: 70 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = text.trim();

  let synonyms = parseList(text).slice(0, 5);
  if (looksUnusable(synonyms, word)) synonyms = fallback(word);

  return { synonyms };
}
