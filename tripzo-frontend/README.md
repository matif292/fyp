# Tripzo — Frontend

React frontend for the real Tripzo hostel-booking backend. This version has
been checked line-by-line against your uploaded backend's controllers,
models, and middleware — every field name, status enum, and route below is
taken directly from that source, not from the earlier written API docs.

## Setup

```bash
npm install
npm run dev
```

`.env` is set to:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend

- Start it with `node server.js` (or your usual script) — it auto-creates a
  MySQL `tripzo_db` connection via `src/config/database.js`, and **auto-seeds
  an admin account** on first boot (login credentials come from
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` in the backend's `.env`).
- Uploaded files (hostel photos, CNIC/bank documents) are saved to disk and
  served statically at `http://localhost:5000/uploads/...`. This frontend's
  `resolveUploadUrl()` helper (in `src/api/client.js`) turns the relative
  paths the API returns (e.g. `uploads/hostel/photos-123.jpg`) into full URLs
  against that origin.
- Registration sends real emails via `src/utils/email.js` — if SMTP isn't
  configured, check the backend console for the OTP instead of your inbox.

## Corrections made against the real backend

A few things in the original build didn't match the actual API and have been
fixed:

- **No room type edit/delete** — the backend only exposes `GET`/`POST` for
  room types, no `PUT`/`DELETE`. The room management page now only lists and
  adds; editing/removing calls were removed from `src/api/hostels.js`.
- **Booking status enum** — real values are `pending`, `confirmed`,
  `checked_in`, `checked_out`, `cancelled`. There is no `completed` status;
  it's been removed everywhere it was referenced.
- **Review eligibility** — the backend blocks reviews only when a booking is
  `pending` or `cancelled` (so `confirmed`, `checked_in`, and `checked_out`
  are all reviewable) — the traveler bookings page now matches that instead
  of gating on a `completed` status that doesn't exist.
- **Cancel eligibility** — blocked only once a booking is `checked_in`.
- **Payment status** — `PUT /bookings/:id/payment` (`pending`/`paid`/
  `refunded`) is a separate field from booking status; both traveler and
  owner booking views now show and (for owners) update it.
- **Hostel list has no price field** — `GET /hostels` returns hostel rows
  plus `owner_name` and `review_count`, but no minimum room price. The browse
  card no longer shows a fabricated "from Rs. X" — it shows the owner name
  instead.
- **Photo field name** — the API returns `photo_url`, not `url`. The hostel
  detail page now renders a real photo strip using that field.
- **Review rating source** — `GET /reviews/hostel/:id` returns
  `{ count, stats: { average_rating, total_reviews, ... }, data }`; the
  detail page was reading a `rating_avg` field that doesn't exist.
- **Added `/account/reviews`** — a "My reviews" page using the previously
  unused `GET /reviews/my-reviews` (edit/delete your own reviews from one
  place, matches `PUT`/`DELETE /reviews/:id`).
- **City filter is an exact match**, not a partial search (`WHERE city = ?`)
  — noted in the search form.

## Traveler experience — complete

Everything a traveler needs is wired up end to end against the real API:

- **Discover**: landing page, browse/search all hostels (`/hostels`, exact-match
  city filter + keyword search + price range), hostel detail with room
  selection, amenities, real photo strip, and reviews.
- **Book**: pick a room type, submit check-in/out + guest count, see the real
  server-calculated total and booking number back.
- **Manage**: `/account/bookings` — cancel (blocked once checked in), leave a
  review on any confirmed/checked-in/checked-out stay, see status + payment
  status per booking.
- **Review**: `/account/reviews` — edit or delete your own reviews in one
  place (`GET/PUT/DELETE /reviews/...`).
- **Account**: `/account/profile` — read-only view of your account
  (`GET /auth/me`); there's no update-profile endpoint on the backend yet, so
  this doesn't pretend to offer editing.
- **Auth**: register → OTP verification (with resend) → login, all against
  the real `/auth/*` routes, no invented steps.

The navbar and traveler sidebar are consistent throughout — same three links
(bookings, reviews, profile) wherever you are in the traveler area.

## Structure

```
src/
  api/          one file per resource, matching src/controllers/*.js exactly
  context/      AuthContext (user, token, string role: traveler/owner/admin)
  components/   PublicNavbar, DashboardLayout (sidebar), HostelCard, StatusStamp
  pages/
    (public: Landing, Hostels, HostelDetail, auth pages)
    traveler/   MyBookings, MyReviews, Profile, travelerStops (shared sidebar nav)
    owner/      OwnerDashboard, OwnerHostels, CreateHostel, HostelRoomsManage, HostelBookings
    admin/      AdminDashboard, PendingApprovals, AllUsers
  App.jsx       route tree with role-based guards
```
