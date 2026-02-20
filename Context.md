# Project Context: Nexus Intelligence

## 1. Role & Tech Stack
- **Role:** Full-Stack Automation & Systems Architecture.
- **Frontend:** Next.js 15+ (App Router), Tailwind CSS, TypeScript.
- **Backend/Automation:** Node.js scripts in root (`monitor.js`, `broadcast.js`).
- **Database/Auth:** Supabase (using @supabase/ssr).
- **Automation Tools:** Playwright (Stealth), Gemini AI, Resend (Email), Discord Webhooks.

## 2. Security Architecture (CRITICAL)
- **Key Format:** We have moved to the new `sb_` prefixed keys. 
- **Legacy Mitigation:** The default JWT secret is rotated/disabled. We use `sb_publishable_...` as a substitute for `anon_key`.
- **Key Mapping:**
    - `NEXT_PUBLIC_SUPABASE_URL`: Project URL.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Uses the **Publishable Key** (`sb_publishable_...`).
    - `SUPABASE_SECRET_KEY`: Uses the **Service Role Key** (`sb_secret_...`) for backend/bypass RLS.

## 3. Known Constraints & Fixes
- **Vercel Build:** Must use `export const dynamic = 'force-dynamic'` in `page.tsx` to prevent build-time Supabase initialization failures.
- **TypeScript:** `frontend/tsconfig.json` includes `skipLibCheck: true` and explicit `typeRoots` to isolate frontend types from root `node_modules`.
- **Monorepo Structure:** - `/` (Root): Automation scripts and their own `package.json`.
    - `/frontend`: Next.js dashboard application.

## 4. Automation Workflow
- **GitHub Actions:** Runs daily via `.github/workflows/monitor.yml`.
- **Process:** Scrape (Playwright) -> Analyze (Gemini) -> Store (Supabase) -> Notify (Discord/Resend).