# Hackathon Auth Hardening — Design

## Context

CuraLink is a hackathon demo project (not handling real patient data — no HIPAA/BAA scope). Current login flow is entirely cosmetic: any email + any password logs in as that patient, and any role can be picked from a dropdown with no password check, because no user model has a password field. Additionally, `GET /api/v1/debug` leaks the live database connection string, and CORS is `allow_origins=["*"]`.

Goal: make the login flow **actually check a password** and close the DB-credential leak, without touching any of the existing dashboard data routes or breaking the judge-facing one-click demo login buttons. This is not a full RBAC/production-security effort — that scope is explicitly out.

## Non-goals

- No auth enforcement on existing dashboard data routes (patients list, patient history, appointments, queue, etc.) — these are called unauthenticated from 5+ dashboard files today; adding hard auth there requires touching every fetch call and risks breaking the demo flow.
- No BAAs, encryption-at-rest, audit logging, or other compliance process work.
- No removal or redesign of the quick-demo login buttons — they must keep working in one click for judges.

## Step 1 — Backend

1. Add `password_hash` column (nullable String) to `Patient` and `Staff` models.
2. Seed demo accounts with `bcrypt` hash of `password123` (the password already shown as the default in the UI — no visible behavior change).
3. Add `passlib[bcrypt]` and `python-jose` (or `PyJWT`) to backend requirements.
4. New endpoint `POST /api/v1/auth/login`:
   - Input: email, password, expected role/session type (patient vs hospital staff + role)
   - Verifies bcrypt hash match against `Patient` or `Staff` table
   - On success: returns a signed JWT (HS256, short expiry e.g. 8h, secret from `JWT_SECRET` env var with a dev fallback) plus the user profile payload the frontend already expects
   - On failure: 401
5. Fix `/api/v1/debug`: remove `db_url` from the JSON response (keep the endpoint and its other fields so nothing depending on it breaks).
6. CORS: read allowed origin(s) from `FRONTEND_ORIGIN` env var; fall back to `*` if unset, so current local/Vercel behavior is unchanged unless explicitly configured.

## Step 2 — Frontend

1. `Login.jsx` manual sign-in forms (patient tab, hospital tab) call `POST /api/v1/auth/login` for real. Wrong password now surfaces a real error instead of always succeeding.
2. Quick-demo buttons (patient quick-login, staff quick-login) call the same real endpoint, passing the known demo password (`password123`) programmatically — still one click for judges, but now a genuine authenticated call instead of a client-side fabrication.
3. Store the returned JWT (e.g., `localStorage`) on successful login for future use. Do not wire it into other dashboards' existing fetch calls — out of scope, zero blast radius on other pages.
4. Update `README.md` §7 "Security & Compliance": replace the "(In Progress)" JWT bullet with an accurate description — bcrypt-hashed passwords, JWT issuance on login, DB credential leak closed.

## Verification

- Existing quick-demo login buttons still log a judge in with one click (patient + every staff role).
- Manual login with the correct demo password succeeds; wrong password is rejected with a 401 / visible error.
- `/api/v1/debug` response no longer contains `db_url`.
- All existing dashboards (Doctor, Nurse, Reception, Admin, Patient, Pharmacist) load and function exactly as before — no new 401s on any existing route.
