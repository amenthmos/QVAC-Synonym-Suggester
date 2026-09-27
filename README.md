# QVAC Synonym Suggester

Enter a word and an on-device AI suggests 5 synonyms. No cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:32033

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown.

Type a word into the form and submit it. The server sends the model a short system prompt plus two few-shot examples so it learns to reply with one synonym per line instead of prose. The streamed reply is split into a list, checked for refusal phrases or a synonym that's just the input word repeated back, and shown as a list. If the model output looks unusable, a small built-in lookup table (or a generic "similar to X" phrasing) is shown instead so the page never comes back empty.

**Example**

- Input: `happy`
- Output: `glad`, `joyful`, `pleased`, `cheerful`, `content`

## License

MIT
