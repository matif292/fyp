# Tripzo UI Upgrade — Booking.com-style flow

## What changed

### New file
- `src/components/SearchDock.jsx` — the combined search bar (destination + check-in + check-out + guests).
  Used on the Landing hero and as a sticky compact bar on /hostels. Everything it collects goes into
  URL params, so search context travels through the entire journey.

### Rewritten (old versions had dead inputs + commented-out cruft removed)
- `src/pages/Landing.jsx` — hero with one job (search), trust strip (verified owners/reviews/mapped +
  live stats), destination cards with cover photos & stay counts, AI Trip Planner banner (/trips),
  top-rated featured stays, footer.
- `src/pages/Hostels.jsx` — sticky search dock (prefilled from URL), working sidebar filters
  (price range, property type chips, guest-rating chips, amenity chips — instant client-side),
  sorting (recommended / price / rating), list & grid views, loading skeletons, helpful empty states.
- `src/components/HostelCard.jsx` — booking.com-style card: photo left, blue score plate with
  score word ("Excellent · 12 reviews"), amenity chips, "From Rs X per night", "See availability" CTA.
- `src/pages/HostelDetail.jsx` — sticky key-info bar (name, your dates/guests, from-price, Reserve),
  gallery + 360° kept, rooms redesigned as reservation rows — each "Reserve" pre-selects that room
  in the booking card and scrolls to it.
- `src/components/BookingForm.jsx` — prefills check-in/check-out/guests from your search, syncs with
  room "Reserve" buttons, itemized breakdown (rate × nights, taxes, total), CTA shows the total,
  "no payment taken now" reassurance. Same API calls as before.
- `src/components/PublicNavbar.jsx` — sticky navy header, "List your property" link, cleaner auth states.

### CSS
- Appended a namespaced `tz-*` design layer to `src/index.css` (navy/blue/amber palette, score plates,
  chips, dock, cards, responsive breakpoints). Existing dashboard/admin styles untouched.

## The seamless flow
Landing search → `/hostels?city=&checkIn=&checkOut=&guests=` → card links carry the params →
`/hostels/:id?checkIn=…` → BookingForm arrives pre-filled → Reserve → `/account/bookings`.

## Note
`node_modules` in your zip was built on Windows; on Linux/CI run `npm ci` (or
`npm install esbuild --force`) before `npm run build`.

## Dashboard shell (admin / owner / traveler) — added in pass 2
Old `DashboardLayout` used classes (`trail-sidebar`, `trail-nav`, `dashboard-shell`) that had
**no CSS at all**, so every dashboard page rendered a broken, unstyled sidebar. Rebuilt:
- Same props API (`stops`, `roleLabel`, `children`) — all 11 pages work with zero changes.
- Desktop: sticky navy sidebar matching the public navbar; active link highlighted in blue;
  role badge; "View public site" shortcut; user avatar + email; clean logout button.
- Mobile (<860px): sticky top bar with hamburger → slide-in drawer with overlay; drawer closes
  on any navigation.
- Fixed legacy CSS bug: `.dashboard-main` had a stray `margin-left: 260px` that assumed a fixed
  sidebar that didn't exist; the new `.tz-dash-main` overrides it.

## Pass 3 — Report-mockup UI (Figures 5.2–5.19 of the FYP report)
Design system shifted to the clean white/blue style shown in the report screenshots,
plus interactivity upgrades. No API contracts changed — everything still calls the same backend.

- **OTP screen (Fig 5.4):** 6 separate digit boxes with auto-advance, backspace/arrow
  navigation and paste support; live "OTP will expire in mm:ss" countdown (3 min);
  "Didn't receive the code? Resend OTP" link; email shown with a "Change" action;
  "never share your OTP" security note.
- **Negotiation modal (Fig 5.8):** listed price with strike-through vs your offer, live
  green "% Off" badge (turns red past ~25%), quick-offer chips (−5% / −10% / −15%),
  trip summary bar, tips strip, "Your offers are secure and private" footer.
- **Booking form (Fig 5.7):** numbered sections (1. Room, 2. Stay, 3. Requests,
  4. Payment method), payment-preference chips (Pay at property / Card / EasyPaisa /
  JazzCash — preference is appended to special requests), Free Cancellation card with
  the actual cut-off date, "Why book with Tripzo?" trust checklist.
- **Weather widget (Fig 5.13):** blue gradient "Live" hero card (temp, condition,
  feels-like, humidity, wind, sunrise/sunset) + hoverable multi-day forecast strip.
- **Dashboards (Fig 5.14/5.17):** sidebar restyled white with a rounded blue active
  pill; stat cards now have colored icon tiles + trend captions; owner overview gets a
  "Rooms by property" animated bar chart; admin gets a Sentiment Overview with
  positive/neutral/negative progress bars and a conic-gradient donut.
- **Micro-interactions everywhere:** button hover lift, card hover shadows, staggered
  fade-up reveals, focus rings, animated bars/donut/OTP boxes.

CSS lives in a namespaced layer appended to `src/index.css`
(`tzk-`, `otp-`, `wx-`, `ngx-`, `bk-`, `snt-`). Older layers untouched.

Run: `npm install` then `npm run dev` (backend on :5000 as before).
