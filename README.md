# ContextBridge

> Your AI context shouldn't be locked to one AI. **Start anywhere. Continue anywhere.**

ContextBridge is a SaaS platform that lets you carry AI conversation context across ChatGPT, Claude, Gemini, and Grok — without losing decisions, requirements, or progress.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS Modules |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth v5 (Google OAuth + Email/Password) |
| AI Processing | Google Gemini 1.5 Flash |

---

## Setup

### 1. Clone & Install

```bash
git clone <repo>
cd context-bridge
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Where to get |
|----------|-------------|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | [console.cloud.google.com](https://console.cloud.google.com) → Credentials → OAuth 2.0 |
| `DATABASE_URL` + `DIRECT_URL` | [neon.tech](https://neon.tech) → Project → Connection Details |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API Key |

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: **Web application**
5. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

---

## Project Structure

```
context-bridge/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/                       # Sign in / Sign up
│   ├── dashboard/                  # Protected dashboard
│   │   ├── page.tsx                # Dashboard home
│   │   ├── contexts/               # Context management
│   │   ├── projects/               # Projects
│   │   ├── shared/                 # Shared contexts
│   │   └── settings/               # Account settings
│   ├── shared/[token]/             # Public shared context page
│   └── api/                        # API routes
│       ├── contexts/               # Context CRUD + analyze + share
│       ├── projects/               # Projects API
│       └── shared/                 # Shared context public API
├── extension/                      # Chrome extension (Sprint 4)
│   ├── manifest.json
│   ├── popup/
│   ├── content/
│   └── background/
├── lib/
│   ├── ai/processor.ts             # Gemini 1.5 Flash context extractor
│   ├── prompts/generators.ts       # Provider-specific prompt generators
│   ├── prisma.ts                   # Prisma client singleton
│   └── types.ts                    # Shared TypeScript types
├── prisma/
│   └── schema.prisma               # Database schema
└── types/
    └── next-auth.d.ts              # NextAuth type augmentation
```

---

## Chrome Extension

The extension lives in `/extension/`. To load it in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `/extension/` directory

The extension detects AI provider pages (ChatGPT, Claude, Gemini, Grok) and allows one-click conversation saving to ContextBridge.

---

## MVP User Journey

```
Landing page → Sign up → Dashboard → New Context
→ Paste ChatGPT conversation → Analyze with Gemini
→ Review structured context → Edit if needed
→ "Continue with AI" → Select Gemini
→ Copy generated prompt → Open Gemini → Paste → Continue
```

---

## Architecture

```
Browser
  ↓
Next.js App Router
  ↓
API Routes (server-side)
  ↓
Gemini 1.5 Flash (context extraction)
  ↓
Neon PostgreSQL (via Prisma)
```

API keys never reach the browser.
