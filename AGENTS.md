# Repository Guidelines

## Project Structure & Module Organization
- `server.js` hosts the Express API and static file serving.
- `public/` contains the frontend: `index.html`, `styles.css`, and `app.js`.
- `data/todos.json` stores persisted todos; the server creates it if missing.
- `package.json` defines runtime dependencies and scripts.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm start`: run the server on `http://localhost:3000`.
- `npm run dev`: same as start (no watcher configured).

## Coding Style & Naming Conventions
- Use 2-space indentation and double quotes in JS (match `server.js`).
- Keep functions small and focused; prefer early returns for error cases.
- API routes live in `server.js`; frontend logic in `public/app.js`.
- Filenames are lowercase with hyphens if needed; avoid new nested dirs unless justified.

## Testing Guidelines
- No automated test framework is configured yet.
- If you add tests, document the runner in `package.json` and update this file with the command.

## Commit & Pull Request Guidelines
- Recent commits are short, sentence-style summaries (e.g., “first todo app setup”).
- Avoid “wip” in shared branches; use descriptive messages like “Add delete todo endpoint”.
- PRs should include: summary, testing notes (even if “not run”), and UI screenshots for frontend changes.

## Configuration & Data Notes
- Data is stored in `data/todos.json`; do not commit user data changes.
- The server reads `PORT` from the environment; default is 3000.
