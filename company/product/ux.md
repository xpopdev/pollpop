# UX — PollPop MVP

> DRAFT — contingent on H-001 PASS (CTR ≥0.08). Do not build until validation passes per `company/decisions/approved.md`.

## Principle

Mobile-first, 15-second creation, tap-to-vote, sticky CTA. Every screen answers "what do I do next?" in one thumb zone. No signup walls, no tutorial, no feed to learn. Reference `pollpop-validation/data/polls.json` (8 shapes: 2-option picks like fit-check/sneaker-drop through 4-option group decisions like brunch-crew) for layout stress cases.

Responsive breakpoints: 375px (primary), 768px, 1024px. All flows tested at 375px first.

---

## Flow 1 — Create (≤15s, P0)

**Entry:** `GET /` — hero with headline "Which one?" + two buttons: "Create poll — 15s" (primary) and "See example" (secondary → random `p/{id}`).

**Steps (single page, no wizard):**
1. **Title** — input, placeholder "Which fit for date night?" (from fit-check), counter 0/80, autofocus.
2. **Context (optional, collapsed)** — one-line, placeholder "Help me not embarrass myself…" — expand link, not a required field.
3. **Options 2–4** — grid of cards (2 columns on mobile, 2 on desktop). Each card:
   - Image area: tap to pick — sheet offers "Take photo / Choose from library / Paste image URL." Drag to reorder on desktop, tap reorder on mobile (INFERRED interaction). Default shows 2 cards; "+ Add option" adds 3rd then 4th; max 4 disables button with tooltip.
   - Label input under image: placeholder "Fit A — Street + Gold", 0/24 counter.
   - Remove (X) on cards 3–4; cards 1–2 cannot be removed (min 2).
4. **Create** — sticky bottom bar button "Create & get link" (disabled until title + ≥2 images + ≥2 labels valid). Shows compressing spinner for <1s (ESTIMATE).

**Success state:** Bottom sheet / full-screen card: "Your poll is live!" + prominent share row (Copy link + Share) + preview of `p/{id}`. Event `poll_create_complete` fires.

**Errors / edge:**
- No title → inline "Add a title" under field, button disabled (not a toast).
- <2 images → "Add at least 2 images" banner.
- >5 MB or bad URL → inline "Image failed — try another" on that card, other cards unaffected.
- Duplicate labels → allowed (not an error).
- Network fail → "Couldn't create — retry" keeps form state, no data loss.

**Instrumentation:** `poll_create_start` (page view), `poll_create_complete` (success), validation errors counted locally (optional `poll_create_error` events).

---

## Flow 2 — Vote (tap image, no auth, P0)

**Entry:** `GET p/{id}` — poll header (title + context + creator "Maya · NYC" + total votes) + image grid (same 2–4 card layout as create, but tappable). No login, no interstitial.

**Interaction:**
- Tap an image → card shows selected ring + check, optimistic `vote` event fires immediately, count animates. Haptic tick on mobile where supported (INFERRED polish).
- Change vote → tap another image → previous selection clears, new one selected, count moves (last vote wins, one counted per voter — see Architecture soft dedup).
- "See results without voting" link below grid (small, not prominent — HYPOTHESIS: offering this increases `poll_view`→`cta_view` even from non-voters; measure both paths).

**States:**
- 0 votes → "Be the first to vote" empty header (no 0% bars).
- 1–2 votes → bars show but with "Just started" label (avoid misleading 100%/0% dominance).
- Voted → grid transitions to results (see Flow 3) with bars sliding in.

**Errors:** Vote 429 (rate limit) → toast "Too many votes — try again in a bit" + selection reverts. Network fail → "Vote didn't send — tap to retry" on the selected card.

---

## Flow 3 — Results (animated bars + sticky CTA, P0)

**Layout:**
- Poll header + total votes ("122 votes" — sum from `pollpop-validation/data/polls.json`-style vote maps).
- Per-option row: thumbnail + label + bar (width = percentage, color per option) + count + percentage. Bars animate from previous value (CSS transition ~400ms, ESTIMATE). Leading option gets subtle crown/badge.
- Below results: **CTA card** — see Flow 5.

**Live updates:**
- While results page is open, incoming votes animate bars without flicker. New total updates. If user hasn't voted, bars stay but "Vote to weigh in" nudges (INFERRED copy).

**Edge:**
- Tie → no crown, label "It's a tie."
- 0 votes → no bars, CTA still visible (the viral bet: even 0-vote viewers can convert).

---

## Flow 4 — Share (copy link + Web Share API + OG unfurl, P0)

**Share row (on `p/{id}` and on create success):**
- Primary: "Copy link" button → clipboard write → toast "Link copied!" + `share_copy` event.
- Secondary (mobile, if `navigator.share` available): "Share" button → Web Share API sheet (title + URL) → `share_native` event on success. Gracefully hidden if unsupported.
- Tertiary: URL is selectable text field (long-press to copy as fallback).

**OG preview (not a user flow but a UX contract):**
- Share URL is `https://pollpop.app/p/{id}` (canonical) + crawler fallback `p/{id}.html` with static OG tags (see Architecture). Sender pastes link into WhatsApp/iMessage/Discord → unfurls as 1200×630 collage + title. No extra step for user.
- Validation pre-pass: `pollpop-validation/data/polls.json` poll pages already serve `p/{id}.html`-style static previews — MVP preserves this contract.

**Metrics to watch:** Share-driven `poll_view` volume; unfurl suppression rate (diagnoses platform throttling flagged by contrarian).

---

## Flow 5 — Results CTA "Create your own →" (THE metric, P0)

**Component — CTA card:**
- Headline: "Create your own — 15s"
- Subhead: "Turn any 'which one?' into a poll" (HYPOTHESIS copy — A/B variant queued for retry if CTR 0.03–0.08).
- Button: "Create your poll →" (large, high-contrast, thumb-zone).
- Attribution: link is `/?ref=poll_{id}` so `poll_create` can be joined to the poll that sourced it.
- Social proof (optional, ESTIMATE): "47 people made one today" — only if count is VERIFIED from `poll_create` events; otherwise omit (don't fabricate).

**Placement:**
- Mobile: sticky bottom card (fixed, 16px padding, shadow, safe-area inset) always visible without scrolling past results. Also an inline card below results for discoverability.
- Desktop: inline below results + sticky header variant on scroll.

**Instrumentation:**
- `cta_view` fires once when card enters viewport (IntersectionObserver, threshold 0.5, once per `poll_view`).
- `cta_click` fires on button tap, with `ref=poll_{id}`. Binding CTR is `cta_click / poll_view` (primary) and `cta_click / cta_view` (diagnostic).

**States:**
- If user arrived via `?ref=...` and just created a poll, CTA on their new poll's results is suppressed for one view (avoid self-loop noise — INFERRED heuristic).

---

## Metrics — hidden page (P0)

**Route:** `GET /metrics.html` (hidden, no nav link — same as validation site). Shows live:
- Counters: `poll_view`, `vote`, `cta_view`, `cta_click`, `poll_create`, totals.
- Derived: **CTR** (`cta_click / poll_view` — large, binding), `cta_click / cta_view`, `vote / poll_view`, `voters_per_poll`, `polls_created`, K-factor (`polls_created_via_cta / poll_view`), referred retention (creators with 2nd poll in 7d). All labeled ESTIMATE until H-001 resolves.
- Source breakdown: top `ref` poll_ids driving creates.
- Evidence labels per §29 on every derived number.

---

## Design tokens (concrete, not vague)

- Type: system font stack (San Francisco / Roboto) for MVP — no custom font load (INFERRED performance).
- Colors: per-option `color` field (from `polls.json` palette) drives bar + selection ring — 8 seeds give visual variety; fallback palette of 6 high-contrast colors (ESTIMATE).
- Radius: 12px cards, 8px buttons (ESTIMATE).
- Motion: 200ms tap feedback, 400ms bar animate, no layout shift on vote (INFERRED polish).
- A11y: tap targets ≥44px, image `alt` = option label, keyboard navigable (1–4 keys to vote — INFERRED), screen-reader announces "X votes, Y percent."

## What we don't design for MVP

Discovery feed, templates gallery, profile pages, auth modals, paywalls, leaderboard, onboarding tour. One creation page, one poll page with vote/results/share/CTA, one hidden metrics page. That's the product.
