# LEARNEVER – Never too late to Learn

A learning app with an AI coach and an AI agent (LEARNEVER Helper) for adults aged 65+ in the UK.
SEL611 Understanding AI, Regent's University London (Mathis Berard and Anas).

Live app: https://learnever.netlify.app

## Files
- `index.html`: the whole app (HTML, CSS and JavaScript in one file).
- `margaret_en.mp4`: the Margaret welcome video (HeyGen AI avatar).
- `netlify/functions/coach.mjs`: the server function that sends Coach and Helper questions to the AI model. The API key stays on Netlify, never in the browser.

## How to edit
1. Edit `index.html` (on GitHub: open the file, click the pencil, then "Commit changes").
2. Netlify publishes the new version automatically in about a minute.
3. New features go in a new layer near the end of the script, above `load();`, so older layers keep working.

## AI settings (Netlify)
Site configuration > Environment variables:
- `ANTHROPIC_API_KEY` (required): key from console.anthropic.com. Set a monthly spend limit there.
- `MODEL` (optional): defaults to `claude-haiku-5-5`, a small, fast model (cheaper and less energy per answer).

If the key is missing, the app keeps working with its offline helper.
