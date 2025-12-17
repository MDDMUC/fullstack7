# MVP To-Do (Priority)

- Reliability hardening: fix chat send/read accuracy, invite/accept flows, unread indicators; add retry/error states.
- Trust & safety: add block/report, host kick/remove, and simple message rate-limiting.
- Notifications: in-app toasts/badges for new messages/invites; scope push if feasible.
- Discovery boost: active/recent sorting, suggested partners (mutual gyms/styles), activity timestamps on cards.
- Onboarding guardrails: require photo + style + gym; prompt user to join at least one crew/event/gym chat at the end.
- Events/crews clarity: host badge, attendee count, last activity/sender in lists; one-tap join/leave.
- Gyms truthfulness: wire real occupancy/online or clearly label placeholders; show friends-in-gym counts from real data.
- UX polish: ensure filters and nav are consistent; single clear entry to chats.

# 2-Day MVP Plan (Logic/Coding Focus)

- Day 1 AM: Reliability sweep (chat send/read, invite/accept edge cases, unread indicators) + add retry/error UI.
- Day 1 PM: Trust/safety (block/report, host kick/remove, basic rate limit on message sends).
- Day 2 AM: Discovery & onboarding (active/recent sort, suggested partners with mutual gyms/styles; require photo/style/gym; end-of-onboarding join prompt).
- Day 2 PM: Events/crews/gyms clarity (host badges, attendee counts, last activity/sender; clear occupancy labels or real feed hookup) + in-app toasts/badges for messages/invites.

# Claude Execution Prompt

You are Claude, acting as an implementation agent. Execute these steps in order and stop on errors:

1) Reliability: audit chat send/read + unread; fix delivery/read status and invite/accept edge cases; add retry/error states in UI.
2) Trust/safety: add block/report, host kick/remove in groups/events/crews, and simple rate limiting on message sends.
3) Notifications: add in-app toasts/badges for new messages and accepted invites; scope push if possible.
4) Discovery/onboarding: add “Active/Recent” sort, suggested partners (mutual gyms/styles), require photo+style+gym, and prompt user to join one crew/event/gym chat after onboarding.
5) Events/crews/gyms clarity: show host badge, attendee count, last activity/last sender in lists; wire real occupancy/online or clearly mark placeholders; show friends-in-gym counts where data is real.
6) UX consistency: keep single clear entry to chats; ensure filters/nav match across pages.
After each step, summarize changes, note tests run, and list any blockers.
