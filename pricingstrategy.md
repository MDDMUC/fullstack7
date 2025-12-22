# DAB Pricing Strategy (Autonomy × Attribution Framework)

**Last updated:** 2025-12-22
**Owner:** Ghost Signal / DAB
**See also:** [STRATEGY_INDEX.md](./STRATEGY_INDEX.md) | [strategy.md](./strategy.md) | [TICKETS/INDEX.md](./TICKETS/INDEX.md)

---

## TL;DR

**Current Phase:** Phase A (Bottom-left quadrant: Freemium + Pro)
**Current Position:** Pre-Launch (Free-only, no monetization yet)

**Pricing Evolution Path:**
- **Now:** Free only (growth focus, no paywalls)
- **Next:** B2B Partnerships (€500-€2k, after 200-500 users)
- **Later:** Pro subscription (€8-€15/mo, post-density)
- **Future:** Credits (boosts, event promo) + Outcome-based B2B

**Key Insight:** DAB starts bottom-left (low autonomy, low attribution) and moves right as we verify outcomes, eventually reaching top-right for B2B.

---

## Current Phase Status

**Where We Are:** Phase A Launch (Bottom-left quadrant)
- **Autonomy:** Low (humans do the work)
- **Attribution:** Low-Medium (in-app actions tracked, real-world outcomes weak)
- **Pricing Model:** Freemium (no paywalls yet)

**Next Transition:** Phase A → Phase B
**Trigger:** 200-500 engaged users + Day 7 retention >40%
**Action:** Pursue first B2B partnership (gym or brand)
**Timeline:** Month 1-2

---

## 1) Framework: Autonomy × Attribution (2×2)

**Axes**
- **Autonomy (Y):** low → high (how much work the product does without humans)
- **Attribution (X):** low → high (how well value maps to a measurable outcome)

**Quadrants → pricing archetypes**
- **Low autonomy + low attribution:** Seat-based / subscription (often freemium + Pro)
- **Low autonomy + high attribution:** Hybrid (subscription + usage/credits for high-value actions)
- **High autonomy + low attribution:** Usage-based (infra-like; metered)
- **High autonomy + high attribution:** Outcome-based (pay per verified success)

---

## 2) Where DAB sits today (and where it can go)

### 2.1 Current DAB (today)
- **Autonomy:** Low  
- **Attribution:** Low–Medium (we measure in-app actions; real-world “climbed together” is weak unless verified)
- **Quadrant:** **Bottom-left** → **Freemium + Pro (seat-based)**

### 2.2 Next (without AI agents)
- **Autonomy:** Still low  
- **Attribution:** Medium–High **if** we verify outcomes (attendance, filled spots)
- **Quadrant:** **Bottom-right** → **Hybrid: Pro + Credits**

### 2.3 Long-term (with automation)
- **Autonomy:** Medium–High (auto-match, auto-plan, auto-fill, auto-remind)
- **Attribution:** High (verified outcomes)
- **Quadrant:** **Top-right** → **Outcome-based** (best fit for hosts/gyms)

---

## 3) Pricing must match the payer (split the product)

### 3.1 Climbers (B2C)
- **Now:** Bottom-left (freemium + Pro)
- **Next:** Bottom-right (Pro + credits for boosts/promo)
- **Outcome-based:** generally hard/controversial for consumers unless optional and transparent

### 3.2 Hosts / event organizers (prosumer)
- Attribution is naturally stronger: **“filled X of Y spots”**
- Best path: Bottom-right → Top-right

### 3.3 Gyms (B2B)
- Strongest pricing power once outcomes are verifiable
- Natural metrics: visits, class/event fill-rate, retention proxies

---

## 4) Move right on attribution (instrumentation plan)

### 4.1 Define the verified funnel
Track + store timestamps for each stage:
1. Profile view
2. Like / Dab
3. Match
4. Messages exchanged (2-way threshold)
5. **Plan created** (in-app)
6. **Attendance verified** (key step)

### 4.2 Verification methods (stackable)
- Dual confirmation: both users tap “we climbed”
- Event host check-in list
- Gym check-in: QR / partner code / geofence
- Calendar integration + prompt for confirmation

**Goal:** Make “real-world success” measurable to unlock hybrid and outcome pricing.

---

## 5) Phase-based pricing strategy

### Phase A — Launch (Bottom-left)
**H1 2026 focus**
- Invite as many users as possible and maximize active users (growth > monetization)

**Free**
- Limits on likes/dabs, messages, or filters (choose 1–2 levers; avoid over-restriction early)

**Partnerships (pre-subscription)**
- After ~200-500 engaged users in a launch city, pursue gym/brand/event sponsorships
- Use these for early validation and co-marketing before adding B2C paywalls

**Pro (subscription)**
- Proposed price band: **€8–€15 / month**
- Features (examples):
  - Advanced filters (gym, availability, style)
  - Higher daily dabs/likes
  - Rewind / second chance
  - “See who dabbed” (if aligned with safety/UX)
  - Radius + gym-specific discovery
  - Profile badge (optional; avoid status toxicity)

### Phase B — Growth (Bottom-right hybrid)
Keep **Pro**, add **Credits** for high-value actions:
- Boost visibility (city / specific gym / time window)
- Promote an event
- Priority intro (rate-limited to prevent spam)
- Limited “Super dab” style action (scarce)

### Phase C — Monetize outcomes (Top-right, primarily B2B/B2Prosumer)
**Hosts**
- Pay per **filled attendee spot** (only when verified)

**Gyms**
- Pay per **verified visit driven** or similar verified outcomes
- Alternative (simpler early B2B): subscription per location with outcome reporting

---

## 6) Revenue model & user-count math (numbers)

### 6.1 Core formula (B2C subscription)
**MRR ≈ MAU × conversion_to_paid × ARPPU**

**Worked examples**
- **20,000 MAU × 5% × €10 = €10,000 MRR**
- **50,000 MAU × 4% × €12 = €24,000 MRR**
- **100,000 MAU × 3% × €10 = €30,000 MRR**

**Rule of thumb**
- Subscription-only tends to feel thin below **~20k–50k MAU** unless hyper-local + dominant.

### 6.2 Hybrid add-on formula (credits)
**MRR ≈ subscription_MRR + (MAU × %buyers_of_credits × avg_credit_spend)**

Example:
- **50,000 MAU × 8% × €4 = €16,000 extra MRR** (on top of subs)  
(Assumes boosts/events are valuable and well-designed.)

### 6.3 B2B gym subscription math (fewer customers, higher ARPA)
Examples:
- **50 gyms × €199/mo = €9,950 MRR**
- **200 gyms × €149/mo = €29,800 MRR**

**Implication**
- Gyms/hosts can reach meaningful MRR at far lower user scale if attribution is strong.

---

## 7) What to build next to support pricing

### 7.1 For Phase A (now)
- Solid onboarding → match → chat loop
- Basic events + RSVP
- Safety: reporting, blocks, moderation primitives

### 7.2 For Phase B (hybrid)
- Boost inventory + pricing controls
- Event promotion inventory
- Anti-spam + rate limits + quality scoring

### 7.3 For Phase C (outcome)
- Verified attendance/check-ins
- Host dashboards: fill-rate, no-show, repeat attendance
- Gym dashboards: visits driven, conversion proxies

---

## 8) KPIs to monitor
- MAU, DAU/MAU
- Day 1, Day 7, Day 30 retention
- % of users who match within 24h
- Chat start rate (first message after match) and 2-way message rate
- Event browse -> RSVP funnel
- Invite conversion rate
- Plans created per active user
- Verified attendance rate (north-star for attribution)
- Paid conversion (B2C), credit attach rate (hybrid)
- Event fill-rate (hosts), verified visits driven (gyms)
- Churn (logo churn for gyms, user churn for B2C)

### 8.1 KPI definitions (partner-ready reporting)
- Day 1/7/30 retention: cohort retention based on >=1 app_open on day+1/7/30
- Match within 24h: % of new users with match_created <= 24h after signup
- Chat start rate: % of matches with >=1 message within 24h
- Event browse -> RSVP: % of users who viewed an event and RSVP'd within 7 days
- Invite conversion rate: % of invitees who sign up within 7 days using an invite token


---

## 9) Risks / pitfalls
- Outcome pricing without strong verification → disputes + churn
- Boosts can degrade community quality if not rate-limited
- Consumer outcome-based pricing can feel punitive; keep it B2B-first
- Over-gating free tier can kill growth; keep early friction low

---

## 10) Recommendation (current decision)
- **Launch with Freemium + Pro** (bottom-left).
- **Prioritize verified outcomes** (attendance/check-in) to move right on attribution.
- Add **Credits** once there is clear utility (bottom-right).
- Pursue **Outcome pricing first for Hosts/Gyms** (top-right) once verification is reliable.

---

## 11) Phase Transition Criteria (Decision Framework)

**When to move from Phase A → Phase B (Free → Partnerships)**

**Minimum Requirements:**
- ✅ 200-500 MAU in launch city (Munich)
- ✅ Day 7 retention >40%
- ✅ Match within 24h >60%
- ✅ Chat start rate >40%
- ✅ Analytics dashboard live (CSV export functional)

**Go/No-Go Decision:**
- **GO:** All 5 criteria met → pursue first B2B partnership
- **NO-GO:** Any criterion fails → iterate product, pause partnerships

**First Partnership Targets:**
- Gyms: Boulderwelt, DAV, Einstein (Munich)
- Gear brands: Edelrid, Scarpa, Black Diamond (EU distributors)
- Event organizers: Local climbing festivals/competitions

---

**When to move from Phase B → Phase C (Partnerships → Pro Subscription)**

**Minimum Requirements:**
- ✅ 1,000+ MAU across 2+ cities
- ✅ 1+ B2B partnership closed (validation)
- ✅ Day 30 retention >30%
- ✅ Daily matches flowing (>100/day network-wide)
- ✅ Event RSVPs consistent (>50/week)

**Pro Subscription Readiness:**
- Demand signal: Users asking for features ("How do I filter by gym?")
- Network density: Empty states <10% of user sessions
- Retention proof: Churn <5% per month for free users

**Pricing:**
- Start with €8/mo (safe floor)
- Test €12/mo after 1 month if conversion >5%
- Cap at €15/mo (psychological barrier for climbing community)

---

**When to move from Phase C → Phase D (Pro → Pro + Credits)**

**Minimum Requirements:**
- ✅ 5,000+ MAU
- ✅ Pro subscriber base >200 users (4% conversion)
- ✅ MRR >€2,000 from subscriptions
- ✅ Clear demand for boosts (qualitative feedback)

**Credits Readiness:**
- Feature demand: "How do I get more matches?" or "How do I promote my event?"
- Willingness to pay: Survey shows >30% would pay for boosts
- Infrastructure: Boost inventory + anti-spam ready

---

**When to move to Phase E (Outcome-based for B2B)**

**Minimum Requirements:**
- ✅ 10,000+ MAU
- ✅ Verified attendance system live (dual confirmation or check-in)
- ✅ >80% verification accuracy (no disputes)
- ✅ Host dashboards showing fill-rate, no-show rate
- ✅ Gym dashboards showing visits driven

**Outcome Pricing Readiness:**
- Attribution strong: Can prove "X users attended because of DAB"
- Trust established: Gyms/hosts trust verification system
- Volume sufficient: >1,000 verified outcomes/month

**Pricing Models:**
- Hosts: €2-€5 per filled spot (outcome-based)
- Gyms: €99-€299/mo subscription + usage reporting (hybrid)
- Gyms (outcome): €1-€3 per verified visit driven (pure outcome)

---

## 12) Decision Log (Pricing)

| Date | Decision | Rationale | Phase |
|------|----------|-----------|-------|
| 2025-12-22 | No B2C monetization in H1 2026 | Growth >> revenue, avoid friction | Phase A |
| 2025-12-22 | First revenue via B2B partnerships | Lower user threshold, validation focus | Phase B |
| 2025-12-22 | Pro price band: €8-€15/mo | Matches climbing gym membership % | Phase C |
| 2025-12-22 | Outcome pricing for B2B only (not B2C) | Consumers don't like pay-for-outcomes | Phase E |

---
