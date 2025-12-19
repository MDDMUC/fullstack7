# MVP To-Do

## Completed

### Day 1 AM - Reliability Sweep バ"
- [x] Unified unread helper (`src/lib/messages.ts`) - `isMessageUnread()`, `isThreadUnread()`
- [x] Chat send/read/unread hardening - status flow `sent -> delivered -> read`
- [x] Send retry/error UI in chat detail page
- [x] Invite/accept error handling in notifications page
- [x] BackBar visibility fix on dark backgrounds
- [x] Group chat read receipts fixed

### Day 1 PM - Trust & Safety バ"
- [x] Block/report functionality
  - `blocks` and `reports` Supabase tables created
  - `src/lib/blocks.ts` and `src/lib/reports.ts` library functions
  - `ReportModal` component with report type selection
  - Block/report menu on home page profile cards
  - Block/report menu in direct chat detail
- [x] Host kick/remove for crews
  - FriendTile component with `canKick`/`onKick` props
  - Kick button appears on hover for host (crew creator)
  - Confirmation dialog before removing
- [x] Message rate limiting
  - 5 messages per 10 seconds limit
  - Error message displayed when rate limited
  - Applied to both chat detail and crew detail pages
- [x] Bug fix: duplicate messages in crew chat (realtime + local insert)

---

### Day 2 AM - Discovery & Onboarding バ"
- [x] Active/recent sorting for profiles on /home (profiles sorted by created_at + match score)
- [x] Suggested partners (mutual gyms/styles matching) - match score prioritizes compatible users
- [x] Require photo + style + gym in onboarding flow
- [x] End-of-onboarding prompt to join crew/event/gym chat

---

### Day 2 PM - Events/Crews/Gyms Clarity + Notifications バ"
- [x] Host badge on event/crew cards
- [x] Attendee count display (member counts on crew cards)
- [x] Last activity/sender in lists (events show "Active X ago")
- [x] Clear occupancy labels for gyms (dynamic % full display)
- [x] In-app toasts/badges for new messages and invites

---

### UX Polish Pass バ"
- [x] Empty states for events and crew pages ("No events/crews found")
- [x] Fixed non-functional "Join Chat" button on gyms page
- [x] Filter consistency review (chats kept with city/gym only - design decision)

---

### Friends in Gym - Phase 1 (MVP) ✓
- [x] Matched users per gym only (permissioned view: mutual likes who list the gym)
- [x] Card content: avatar/name, climbing style (boulder/lead), typical times (morning/evening/weekend), looking-for (belay/partner)
- [x] CTAs: "Invite to climb today" (pre-filled message) and "Message"
- [x] Empty state: "No matches at this gym yet. Keep swiping or explore other gyms."
- [x] Fallback component ready: nearby gyms with matches ("Your people at {gym}")
- [x] Keep visibility permissioned (no open directory, no realtime check-ins yet)
- [x] Debug logging added for gym matching troubleshooting
- [x] Bug fix: gym data format issue (JSON array string vs PostgreSQL array)

---

## Backlog (Post-MVP)
- [ ] Push notifications (scope if feasible)
- [ ] Friends in Gym - Phase 2: opt-in check-ins (matches-only default), coarse "around now" presence, fast expiry, strong privacy guardrails
