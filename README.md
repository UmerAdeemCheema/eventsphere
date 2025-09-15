
Vercel Serverless Adapter
=========================

What I created:
- `api/[...slug].js` — a serverless wrapper that mounts the compiled `dist` route modules and exports a handler for Vercel.
- `dist/` — copied compiled JS files from your uploaded project (routes, middleware, db, etc).
- `package.json` — dependencies required by the serverless function.

How this works:
- The wrapper exposes the same route paths as your original server under `/api/...`.
- Vercel will call the `handler` exported by `api/[...slug].js` for any request to `/api/*`.

Important notes before deploying:
1. Update environment variables in the Vercel dashboard (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, JWT_SECRET, etc).
2. The compiled `dist` code uses `process.env` and `dotenv`. Do NOT upload your `.env` to Vercel.
3. Some code that calls `app.listen(...)` was intentionally not used — the wrapper creates the app without calling `listen`.
4. Keep an eye on MySQL connection usage. The compiled `dist/db.js` creates a connection pool which should work, but serverless providers may need connection pooling configs (or use a serverless-friendly proxy like PlanetScale or Cloud SQL Proxy).
5. To deploy:
   - Initialize a git repo in this folder and push to GitHub (or connect Vercel directly to this directory).
   - On Vercel, set the project root to this repo; Vercel will detect `api` folder and deploy functions.
6. If you prefer a separate function per top-level route, I can split `api/[...slug].js` into `api/auth.js`, `api/events.js`, etc.

Limitations & next steps I can do for you (pick any):
- Remove unnecessary compiled `dist` files and only include needed route modules.
- Convert TypeScript `src` to serverless TS functions and re-use source code directly (instead of compiled `dist`).
- Create one serverless function per route for smaller cold-starts and granular deployments.
- Implement connection reuse via `globalThis` to avoid creating many pools across invocations.

