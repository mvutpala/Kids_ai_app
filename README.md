# Math Adventure 🧮

A fun, AI-powered math practice app for kids, with per-kid profiles, levels, hints, and daily time limits.

## Local development

```bash
npm install
npm start
```

This runs the app at http://localhost:3000. The AI lesson/feedback calls will fail locally
unless you also run `vercel dev` (see below) or set up your own local API proxy, since the
app calls a `/api/claude` serverless function rather than the Anthropic API directly.

## How the AI integration works

The app does **not** call the Anthropic API directly from the browser (that would expose
your API key and get blocked by CORS). Instead:

- `src/App.jsx` calls `fetch("/api/claude", { ... })`
- `api/claude.js` is a Vercel serverless function that receives the prompt, calls the
  Anthropic API server-side using a secret API key, and returns just the text back to the app.

## Deploying to Vercel

1. Push this repo to GitHub (or your Git provider of choice).
2. Import the repo into Vercel.
3. In your Vercel project, go to **Settings → Environment Variables** and add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key (get one at https://console.anthropic.com)
4. Deploy. Vercel will automatically detect `api/claude.js` as a serverless function — no
   extra config needed.
5. To test locally with the real serverless function, install the Vercel CLI
   (`npm i -g vercel`), run `vercel link`, then `vercel env pull` to get a local `.env`,
   then `vercel dev` instead of `npm start`.

## Project structure

```
Kids_ai_app/
├── api/
│   └── claude.js       # Serverless proxy to the Anthropic API (keeps your key secret)
├── public/
│   └── index.html
├── src/
│   ├── App.jsx          # Main app (profiles, levels, quiz, hints, timer)
│   └── index.js          # React entry point
└── package.json
```

## Notes

- Each kid gets up to **1 hour/day**, tracked client-side (resets on page reload — see
  "Future improvements" below).
- 3 attempts per question, with visual hints and a worked solution after the 3rd miss.
- Difficulty auto-adjusts: score ≥80% levels you up, score <40% levels you down.

## Possible future improvements

- Persist daily time/progress (e.g., localStorage or a small database) so it survives a
  page refresh — currently it resets each time the app reloads.
- Add a parent/admin view to adjust daily time limits or review progress per kid.
