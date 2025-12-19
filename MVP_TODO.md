# MVP To-Do

## Completed

### Day 1 AM - Reliability Sweep ✓
- [x] Unified unread helper (`src/lib/messages.ts`) - `isMessageUnread()`, `isThreadUnread()`
- [x] Chat send/read/unread hardening - status flow `sent -> delivered -> read`
- [x] Send retry/error UI in chat detail page
- [x] Invite/accept error handling in notifications page
- [x] BackBar visibility fix on dark backgrounds
- [x] Group chat read receipts fixed

### Day 1 PM - Trust & Safety ✓
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

### Day 2 AM - Discovery & Onboarding ✓
- [x] Active/recent sorting for profiles on /home (profiles sorted by created_at + match score)
- [x] Suggested partners (mutual gyms/styles matching) - match score prioritizes compatible users
- [x] Require photo + style + gym in onboarding flow
- [x] End-of-onboarding prompt to join crew/event/gym chat

---

### Day 2 PM - Events/Crews/Gyms Clarity + Notifications ✓
- [x] Host badge on event/crew cards
- [x] Attendee count display (member counts on crew cards)
- [x] Last activity/sender in lists (events show "Active X ago")
- [x] Clear occupancy labels for gyms (dynamic % full display)
- [x] In-app toasts/badges for new messages and invites

---

## Backlog (Post-MVP)
- [ ] Push notifications (scope if feasible)
- [ ] Friends-in-gym counts from real data
- [ ] UX polish: ensure filters and nav are consistent
