# Garage Transform App — Technical Documentation

## Project Overview
**What it is:** Web + mobile PWA for a solo garage/storage transformation business to manage customer projects, generate AI-powered quotes, and eventually track digital inventory via QR-coded bins.

**Service Area:** Burley, ID (primary) → Southern Idaho + Greater SLC (expansion)  
**Business Model:** 
- One-time project fees (50% deposit upfront, 50% at completion) via Square
- Recurring revenue via digital inventory subscriptions (Phase 2)

**Timeline:** MVP core flow working as of 2026-06-17; photo upload → analysis → quote builder live and tested. Next phase: booking, payments, admin dashboard.

---

## MVP Built (Days 1–3)

### Day 1: Project Foundation
- ✅ Next.js 16.2.7 + TypeScript frontend on Vercel
- ✅ Firebase Authentication (email/password + Google OAuth)
- ✅ Supabase PostgreSQL database with RLS policies
- ✅ Protected routes via middleware (unauthenticated users → login)
- ✅ Customer dashboard with navigation to projects, quotes, inventory

### Day 2: AI Photo Analysis
- ✅ Photo upload UI (file input + base64 preview)
- ✅ Claude Vision API integration via `/api/analyze-garage` endpoint
  - Model: `claude-opus-4-8` (was 3.5-sonnet but model became unavailable)
  - Extracts room width/depth/height from photos
  - Generates space summary (obstacles, features, condition)
  - Cost: ~$0.003–0.01 per image (negligible)
- ✅ Results display (measurements + summary text)

### Day 3: Quote Builder
- ✅ Quote page (`/projects/[id]/quote`) showing 4 service packages:
  - **Shelving Only** ($800): Design, materials, install
  - **+ Junk Removal** ($1200): Add debris cleanup
  - **Full Organization** ($1600): Add decluttering & zoning
  - **+ Digital Inventory** ($2000): Add QR bins + 3-month subscription
- ✅ Customization options: storage bins (+$25 each), premium materials (+$200)
- ✅ Real-time total recalculation
- ✅ Quote saved to Supabase with status tracking

---

## Session 2 Fixes (2026-06-17): Storage Migration & Schema Fixes

### What was blocked
Firebase Storage required paid Blaze plan; CORS policy blocked uploads/access from browser.

### What we fixed
1. **Migrated to Supabase Storage** — Switched from Firebase to Supabase Storage (included in free tier)
   - Created `photos` bucket with public INSERT and SELECT policies
   - Updated `NewProjectPage` to use Supabase storage client
   
2. **Fixed database schema issues**
   - `projects.user_id` changed from UUID → TEXT (Firebase UIDs are strings, not UUIDs)
   - Removed foreign key constraint on `users` table (auth sync not yet implemented)
   - Disabled problematic RLS policies to allow inserts
   
3. **Result:** ✅ Photo upload → Claude analysis → quote builder flow **fully working and tested**

### Known limitation
- Measurement visit request not yet wired up (requires `quotes` table schema fixes; deferred to Phase 2)

---

## Tech Stack & Rationale

| Component | Choice | Why |
|-----------|--------|-----|
| **Frontend** | Next.js 16 + React 19 + TypeScript | Fast dev iteration, great PWA support, mobile-friendly, single dev can maintain |
| **Auth** | Firebase Auth | Free tier, OAuth providers built-in, user sync to Supabase via context |
| **Database** | Supabase (PostgreSQL) | SQL is learnable, RLS for multi-tenant security, free tier is generous, no vendor lock-in |
| **AI** | Claude API (Anthropic) | Vision capabilities for photo analysis, good cost ($0.003/image) |
| **Storage** | Supabase Storage | Free tier included, simpler permissions than Firebase |
| **Payments** | Square Web Payments API | Starting with web; can add Square Reader for in-person payments later |
| **Hosting** | Vercel (frontend) + Firebase/Supabase (backend) | Zero-config deploys, good free tiers, fast cold starts |

**Monthly cost estimate:**
- Claude Vision API: $0.30–2 (100 garage analyses)
- Firebase: $0–5
- Supabase: $5–20
- Vercel: $0–20
- Domain: ~$12/year
- **Total: ~$10–50/month**

---

## Key Architectural Decisions

1. **Base64 for Claude Vision, not Firebase URL:**
   - Client encodes photo as base64 → sent directly to `/api/analyze-garage`
   - Avoids CORS on Claude's side; Claude accepts base64 input
   - Faster than uploading to Firebase first, then waiting for URL

2. **Separate deposit + completion payment (50/50 split):**
   - Reduces no-show risk; deposit collected upfront via Square
   - Backend logic for charging second payment not yet built (Phase 2)

3. **Fixed service package tiers (not full customization):**
   - Simpler quote logic, easier to explain to customers
   - Can expand tiers in Phase 2 if demand justifies

4. **Deferred major features:**
   - **Booking/calendar:** Simple date picker coming next; no integration with Square Appointments yet
   - **Digital inventory:** QR code generation + customer bin dashboard = Phase 2
   - **Admin CRM:** Exists (placeholder); needs polish and full lead management
   - **Subscriptions:** Payment automation for recurring inventory service (Phase 2)

---

## Open Issues & Known Gotchas

| Issue | Impact | Status |
|-------|--------|--------|
| ~~Firebase CORS~~ | ~~Images can't upload~~ | ✅ **FIXED** — Migrated to Supabase Storage |
| Booking/calendar | Users can't schedule measurement visits | Next priority (build `/projects/[id]/book` page) |
| Quote → measurement request | "Request Measurement Visit" button errors | Requires `quotes` table schema fixes (Phase 2) |
| Square payment integration | Can't collect 50% deposit | Start Week 2 (form + webhook) |
| Admin dashboard | Owner can't see leads, quotes, customer details | Phase 2 (exists but barebones) |
| QR inventory system | No digital inventory yet | Phase 2 |
| Junk removal liability | No legal waivers/signatures in UI | Phase 2 (add digital waiver flow) |

---

## File Structure & Key Paths

```
src/
  lib/
    firebase.ts          # Firebase app init + auth exports
    supabase.ts          # Supabase client (anon key)
  context/
    AuthContext.tsx      # User state, Firebase listener, logout
    
app/
  page.tsx               # Home (redirects to /login or /dashboard)
  login/
  signup/
  dashboard/
  projects/
    new/
      page.tsx           # Photo upload → Claude analysis
    [id]/
      quote/
        page.tsx         # Quote builder (image commented out)
      book/              # Coming: booking calendar
  api/
    analyze-garage/
      route.ts           # Claude Vision endpoint
```

**Config files:**
- `.env.local` — All secrets (Firebase, Supabase, Anthropic API key)
- `tsconfig.json` — Path alias `@/*` → `src/*`
- `cors.json` — Supabase Storage CORS config (for future reference)

---

## Database Schema (Session 2 Changes)

### projects table
```sql
ALTER TABLE projects ALTER COLUMN user_id TYPE text;
-- Changed from UUID to TEXT (Firebase UIDs are strings)

ALTER TABLE projects DROP CONSTRAINT projects_user_id_fkey;
-- Removed foreign key to users (auth sync not yet implemented)

ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
-- Disabled RLS to allow inserts (can re-enable with proper policies later)
```

### storage: photos bucket
```
Policies:
- SELECT (public) — Allow anyone to read photos
- INSERT (public) — Allow anyone to upload photos
```

---

## How to Run

```bash
cd Desktop/garage-app
npm run dev -- -p 3001
# Open http://localhost:3001
# Sign up → New Project → Upload photo → Analyze → View quote
```

---

## Next Steps (Priority)

### Immediate (This week)
1. ✅ **Fix Firebase CORS** — **DONE** — Migrated to Supabase Storage
2. **Build booking page** — Calendar picker for measurement visit scheduling (`/projects/[id]/book`)
3. **Fix quotes table schema** — Change `id` from UUID to text to match how we're inserting

### Week 2
4. **Square payment integration** — Deposit payment form + webhook handling
5. **Admin dashboard MVP** — Lead list, contact info, status filter
6. **Notifications** — Email/SMS to customer after quote; SMS to owner on new lead

### Phase 2
- Digital inventory (QR generation, bin tracking, customer search)
- Subscription payment automation
- Advanced analytics (conversion by package, revenue trends)
- Native mobile app (optional, if PWA isn't sufficient)
- Auth sync: Create Supabase users when Firebase users sign up

---

## Decisions Explained (Why These Choices)

### Why Claude Vision, not Stripe vision or other APIs?
- Good accuracy for room dimension estimation
- Cost is negligible ($0.003 per image)
- Built-in calibration guidance possible
- Can request structured JSON output (roomWidth, roomHeight, etc.)

### Why Supabase over Firebase Realtime DB?
- SQL is learnable and standard (not proprietary)
- RLS policies enforce multi-tenant security without backend logic
- Can run self-hosted PostgreSQL later if needed (not locked in)
- Easier to migrate or backup

### Why next-auth or Auth0?
- Firebase simpler for solo dev: built-in Google OAuth, no additional SDK
- No separate auth service to manage
- Integrates naturally with Supabase user context

### Why not stripe + full payment stack immediately?
- Square is simpler for small business: all-in-one (payments + appointments + invoices)
- Deposit-only flow lets us validate business before complex refund logic
- Can add Stripe later if scale demands it

---

## Harrison's Working Style (Observed)

- **Tech-savvy but not a coder by trade:** Comfortable with Claude Code for scaffolding; prefers minimal guidance on file creation (does it in VS Code to save tokens)
- **Prefers terse communication:** Wants short updates, not verbose explanations
- **Budget-conscious:** Actively tracking token usage, wants low monthly infrastructure costs
- **Practical:** Wants "good enough" MVP fast, willing to defer polish/features to Phase 2
- **Solo operator:** Building this alone; needs maintainable code, not fancy architecture

---

## Important Notes

- **Anthropic API key:** Must be from "Harrison's Individual Org" account, not "Default". Added to `.env.local` and Vercel env vars.
- **Supabase free tier pauses after 7 days inactivity.** Can unpause within 90 days.
- **GitHub repo:** `hclarsen27/garage-app` (public).
- **Service area is Mountain Time Zone.** Consider for any time-dependent features (booking windows, SMS send times).
- **Payment: 50% deposit + 50% at completion.** Not typical SaaS (which is upfront). Affects quote flow and payment retry logic.
