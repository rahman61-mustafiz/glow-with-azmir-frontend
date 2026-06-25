# Glow with Azmir — Admin Frontend

Admin panel for **Glow with Azmir** (a beauty-product shop, part of the *noor-beauty* salon project).
Built with **React + Vite**.

## Tech stack

- **React 18** + **Vite 5**
- **react-router-dom** for tab navigation
- **Open Sans** (Google Fonts) for all text
- Plain CSS with a locked design-token palette (no UI framework)

## Design (locked)

| Token | Value | Use |
| --- | --- | --- |
| `--gold` | `#C2A35B` | primary accent |
| `--gold-dark` | `#8A7233` | text / icons on light |
| `--gold-tint` | `#F5EFE0` | surfaces |
| `--black` | `#141414` | bold header, text |
| `--white` | `#FFFFFF` | content area |

- **Layout:** "Bold header" — black top bar with gold *Glow with Azmir* wordmark + gold primary buttons, white content area.
- **Status pills:** Active = black bg + gold text · Low stock = amber (`#FAEEDA` / `#854F0B`).

## Sections (nav tabs)

1. **Home** — dashboard with stats + quick actions
2. **Account** — admin profile & store settings
3. **Gallery** — image curation grid
4. **Product price** — product / pricing / stock table
5. **Advertise panel** — *the important one* ⤵

### Advertise panel

Controls the **Advertise** section that appears on the **public website home page**.
From this tab the admin changes exactly **two** things:

- a **video** (`.mp4` upload only, validated client-side)
- a **description** (text)

with a **live preview** of how it will look to visitors.

> **Backend not built yet.** API calls are stubbed in `src/api/advertise.js`
> — search for `TODO(backend)` to find every place to wire the real endpoint.
> Proposed endpoints: `GET /api/advertise` and `PUT /api/advertise` (multipart).

## Getting started

```bash
npm install
npm run dev      # starts Vite dev server at http://localhost:5173
```

Other scripts:

```bash
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Project structure

```
glow-with-azmir-frontend/
├── index.html              # loads Open Sans + mounts the app
├── vite.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            # React + Router entry
    ├── App.jsx             # routes
    ├── index.css           # design tokens + base styles
    ├── api/
    │   └── advertise.js    # STUBBED advertise API (TODO(backend))
    ├── components/
    │   ├── Layout.jsx      # top bar + nav (Bold header)
    │   ├── layout.css
    │   ├── PageHeader.jsx
    │   └── StatusPill.jsx
    └── pages/
        ├── Home.jsx
        ├── Account.jsx
        ├── Gallery.jsx
        ├── ProductPrice.jsx
        ├── AdvertisePanel.jsx   # most complete
        └── advertise.css
```
