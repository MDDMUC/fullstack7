# DAB Strategy Index

**Last updated:** 2026-01-04
**Current Phase:** Pre-Launch (MVP Complete, Activation Readiness Next)

---

## Quick Navigation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** | **COMPLETE PROJECT BRAIN** | **AI AGENTS: Read this FIRST** |
| **[THIS FILE]** STRATEGY_INDEX.md | Master index & quick reference | Start here for overview |
| **[strategy.md](./strategy.md)** | Go-to-market strategy & vision | Product decisions, launch planning |
| **[STRATEGY_RESEARCH_DEMOGRAPHICS.md](./STRATEGY_RESEARCH_DEMOGRAPHICS.md)** | Demographic research and target segment | Positioning, onboarding, acquisition |
| **[TICKETS/README.md](./TICKETS/README.md)** | Ticketing system guide | Creating and running tickets |
| **[TICKETS/INDEX.md](./TICKETS/INDEX.md)** | Ticket index and execution backlog | Current work in flight |
| **[pricingstrategy.md](./pricingstrategy.md)** | Pricing framework & revenue model | Monetization questions, B2B deals |
| **[SESSION_NOTES.md](./SESSION_NOTES.md)** | Detailed implementation log | Technical reference, debugging |

**🤖 For AI Agents:** Read [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) first - it contains everything you need in one file.

---

## Current Status (At-a-Glance)

### ✅ What's Done
- **MVP Complete** - All Day 1 & 2 features shipped
- Core features: Dab/matching, chats (direct/gym/event/crew), events, crews, gyms
- Trust & safety: Block/report, kick, rate limiting
- Discovery: Match scoring, filters, suggested partners
- Engagement: Toast notifications, unread indicators, Friends in Gym Phase 1

### 🎯 Current Focus
- **Pre-launch activation & launch readiness** (see TICKETS/INDEX.md)
- Pre-launch QA, content seeding, legal readiness

### dY". Next Up
1. Content seeding + legal readiness
2. Pre-launch product readiness QA
3. Week 1 launch monitoring plan

---

## H1 2026 North Star

**Goal:** Invite as many users as possible and maximize active users

**Strategy:** Growth-first, partnerships-first, monetization-later

**Success Metrics:**
- 200-500 engaged users in launch city (Munich)
- Day 7 retention >40%
- >60% match within 24h
- Close first B2B partnership (gym or brand)

---

## Document Relationships

```
┌─────────────────────────────────────────────────────────┐
│  STRATEGY_INDEX.md (you are here)                       │
│  ↓ Master overview & quick reference                    │
└─────────────────────────────────────────────────────────┘
           │
           ├──→ strategy.md
           │    Vision, GTM, launch plan, retention loops
           │    READ FIRST for "why" questions
           │
           ├──→ pricingstrategy.md
           │    Pricing framework, revenue model, B2B path
           │    READ FIRST for monetization questions
           │
           ├──→ TICKETS/INDEX.md
           │    Execution tasks, progress tracking, next steps
           │    READ FIRST for "what's next" questions
           │
           └──→ SESSION_NOTES.md
                Implementation history, technical decisions
                READ FIRST for "how we built X" questions
```

---

## Quick Reference: Strategy

### Phase Roadmap

| Phase | Timeline | Focus | Revenue |
|-------|----------|-------|---------|
| **A - MVP Launch** | Now - Week 4 | Free only, activation loops | $0 (growth focus) |
| **B - Partnerships** | Week 4 - Month 3 | B2B deals, co-marketing | €500-€2k (validation) |
| **C - Subscription** | Month 3+ | Pro tier (€8-€15/mo) | Recurring B2C |
| **D - Hybrid** | Month 6+ | Credits for boosts | B2C + usage |
| **E - Outcome** | Month 12+ | B2B outcome pricing | High-margin B2B |

### Launch Cities (Priority Order)
1. **Munich** (Phase A target) - 6 gyms seeded, strong climbing culture
2. Berlin (Phase B expansion)
3. Hamburg (Phase B expansion)

---

## Quick Reference: KPIs

### Tier 1 (Weekly Tracking)
- **Day 1/7/30 retention** - % of cohort with ≥1 app_open
- **Match within 24h** - % of new users matched <24h after signup
- **Chat start rate** - % of matches with ≥1 message within 24h
- **DAU/MAU** - Daily/Monthly active users

### Tier 2 (Partnership Readiness)
- **Event browse → RSVP** - % who viewed event and RSVP'd within 7d
- **Invite conversion** - % of invitees who sign up within 7d
- **2-way message rate** - % of matches with both users messaging

### North Star
- **Verified attendance rate** (future) - Real-world climb completion

**See:** strategy.md §5.1 for exact definitions

---

## Quick Reference: Pricing

### Current (Phase A)
- **Free only** - No paywalls, no friction
- **Target:** 200-500 engaged users before monetization

### Next (Phase B)
- **B2B Partnerships** - Gyms, gear brands (€500-€2k deals)
- **Dashboard required** - Metrics for sponsor decks

### Future (Phase C+)
- **Pro subscription** - €8-€15/mo (filters, boosts, badges)
- **Credits** - Boosts, event promotion, priority intros
- **Outcome pricing** - Hosts/gyms pay per verified outcome

**See:** pricingstrategy.md §5 for full phase breakdown

---

## Quick Reference: Execution

### Step 1 (Current) - Activation & Safety Readiness
**Goal:** Improve activation and prepare for live user launch
**Duration:** 2-3 weeks
**Owner:** Product + Eng + Ops
**Deliverables:**
- Onboarding flow optimized for 22-35
- Safety and moderation readiness complete
- Push notification infrastructure ready
- Pre-launch QA pass on mobile
- Seed content present across gyms/events/crews
- Legal docs live and linked

**See:** TICKETS/INDEX.md for task breakdown

### Step 2 - Location-first Discovery
**Goal:** Reduce friction, improve activation
**Duration:** 1-2 weeks
**Features:** Auto-location gym suggestions, "Near you" sections

### Step 3 - Notifications & Engagement
**Goal:** Habit formation
**Duration:** 2-3 weeks
**Features:** Push notifications (messages, invites, events)

**See:** TICKETS/INDEX.md for Steps 4-5

---

## Decision Log

| Date | Decision | Rationale | Document |
|------|----------|-----------|----------|
| 2025-12-22 | H1 2026 = Growth-first, no B2C monetization | Charging early kills network effects | strategy.md §1.2 |
| 2025-12-22 | First monetization via B2B partnerships | Lower user-count threshold, validation | strategy.md §2 |
| 2025-12-22 | Step 1 = Activation & Safety (P0) | Focus on live-user readiness before analytics | TICKETS/INDEX.md |
| 2025-12-22 | Launch city-by-city (Munich first) | Avoid empty states, local density | strategy.md §1.3 |

---

## Pre-Launch Checklist (Quick View)

**See TICKETS/INDEX.md for full checklist**

### P0 (Blocker)
- [x] Onboarding flow optimized (22-35)
- [x] Safety and moderation readiness completed
- [x] Push infrastructure tested end-to-end
- [ ] Pre-launch QA pass on mobile
- [ ] Seed content created (profiles, gyms, events, crews)
- [ ] Legal docs live and linked

### P1 (High Priority)
- [ ] Local gym partnerships confirmed
- [ ] Landing page live
- [ ] Invite system tested

**Full checklist:** TICKETS/INDEX.md → Pre-Launch tickets

---

## Who Owns What

| Area | Owner | Document |
|------|-------|----------|
| Product strategy & roadmap | Product | strategy.md |
| Pricing & monetization | Product + Eng | pricingstrategy.md |
| Engineering execution | Eng | TICKETS/INDEX.md |
| Analytics & metrics | Eng + Data | strategy.md §5.2 |
| Partnership deals | Biz Dev | strategy.md §2 |
| Launch city activation | Product + Marketing | strategy.md §3 |

---

## Common Questions

**Q: What should we build next?**
→ See TICKETS/INDEX.md → Current Status → Next Up

**Q: When do we charge users?**
→ See pricingstrategy.md §5 (Phase A: not yet; Phase C: post-density)

**Q: What metrics do we track?**
→ See strategy.md §5.1 (definitions) + §5.2 (dashboard spec)

**Q: How do we get our first users?**
→ See strategy.md §11 (First 100 Users Plan)

**Q: What's the revenue model?**
→ See pricingstrategy.md §6 (math + examples)

**Q: Which city do we launch in?**
→ Munich (6 gyms seeded, strong density)

---

## External Links

- **Figma Design System:** [Link to Figma project]
- **Supabase Dashboard:** [Link to Supabase]
- **Analytics (later):** /admin/metrics (post-launch/B2B readiness)
- **Production App:** [Link to deployed app]

---

**Last reviewed:** 2025-12-22
**Next review:** After pre-launch activation and safety readiness
