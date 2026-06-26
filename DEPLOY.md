# Deploying Glow with Azmir (backend + panel) and linking it into Noor

This is the **step-by-step** guide. You run the deploys on your own accounts —
nothing here needs me to touch your credentials or payment.

The result is **one live link** to the Glow admin SaaS panel, which you'll add
into your existing Noor admin so you can open it without a separate login.

```
┌─────────────────────────┐      ┌──────────────────────────┐
│  Glow panel (frontend)  │ ───► │  Glow backend (this repo) │ ───► MongoDB Atlas
│  React + Vite (Netlify) │ API  │  Node/Express (Railway)   │
└─────────────────────────┘      └──────────────────────────┘
        ▲
        │  link added in Noor admin nav  →  opens the Glow panel
```

---

## 1) Database — MongoDB Atlas (free tier)

1. Create a free cluster at https://www.mongodb.com/atlas
2. Database Access → add a user (username + password).
3. Network Access → allow `0.0.0.0/0` (or Railway's IPs).
4. Copy the connection string:
   `mongodb+srv://<user>:<pass>@<cluster>/glow_with_azmir?retryWrites=true&w=majority`

(You already use Railway+Mongo for Noor — you can reuse the same Atlas account,
just a **new database name** `glow_with_azmir`.)

## 2) Backend — Railway

1. Push this repo to GitHub (see "Pushing the repos" below).
2. On https://railway.app → New Project → Deploy from GitHub → pick
   `glow-with-azmir-backend`.
3. Set **Variables**:
   - `MONGODB_URI` = your Atlas string
   - `PUBLIC_URL` = the Railway URL it gives you (e.g. `https://glow-backend-production.up.railway.app`)
   - `CORS_ORIGIN` = your panel URL (from step 3), or `*` to start
   - `API_KEY` = (optional) a random string if you want light write-protection
4. Railway runs `npm start`. Confirm `https://<your-backend>/health` returns `{"status":"ok"}`.
5. (Optional) Run the seed once: Railway shell → `npm run seed`. The server also
   auto-seeds if the DB is empty.

> ⚠️ Railway disk is ephemeral — uploaded `.mp4`/images can be lost on redeploy.
> For permanent media, switch to S3/Cloudinary (the upload layer is isolated in
> `src/middleware/upload.js`). For getting started, local disk is fine.

## 3) Frontend (Glow panel) — Netlify or Vercel

In the **glow-with-azmir-frontend** repo:

1. Build command: `npm run build` · Publish dir: `dist`
2. Environment variable:
   - `VITE_API_BASE` = `https://<your-backend>.up.railway.app/api`
   - `VITE_API_KEY` = same as backend `API_KEY` (only if you set one)
3. Deploy. You now have your **panel link**, e.g.
   `https://glow-with-azmir.netlify.app`
4. SPA routing: add a redirect so refreshes work —
   Netlify: a `public/_redirects` file containing `/*  /index.html  200`
   Vercel: handled automatically.

## 4) Link it into the Noor admin (no separate login)

In `noor-beauty-website`, add a nav item / button in the admin panel that opens
the Glow panel URL in a new tab. Example (adjust to your admin nav component):

```tsx
<a
  href="https://glow-with-azmir.netlify.app"
  target="_blank"
  rel="noopener noreferrer"
  className="nav-item"
>
  Glow with Azmir ↗
</a>
```

Because you're already logged into the Noor admin, clicking it opens the Glow
panel directly (the Glow panel itself has no login).

---

## Pushing the repos

Backend (this folder) — create an empty GitHub repo `glow-with-azmir-backend`, then:

```bash
git init -b main
git add -A
git commit -m "Glow with Azmir backend"
git remote add origin https://github.com/<you>/glow-with-azmir-backend.git
git push -u origin main
```

Frontend already lives at `glow-with-azmir-frontend` on GitHub.

## Optional: protect the panel later

Currently there's no login (as requested). If you later want to lock it down,
the cleanest options are: (a) set `API_KEY` on the backend + `VITE_API_KEY` on
the panel, or (b) put the panel behind Netlify/Vercel password protection, or
(c) build the panel into the Noor admin so Noor's login guards it.
