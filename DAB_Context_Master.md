# DAB Master Context (Project-Only)

Generated: 2025-12-22  
Scope: **DAB-only** summary of the DAB-related discussions available in this chat history.  
Note: I **cannot** access your local project folder or any unshared/exported chats. If there were additional DAB conversations outside what’s present here, they will not be reflected.

---

## 1) Product definition

### 1.1 One-liner
**DAB** is a climbing-first social app that combines:
- **Community + group messaging** to organize gym sessions/outdoor meetups
- A light **match/dating layer** using “dab” (mutual like) logic as a subtle romantic signal

### 1.2 Core positioning
- Built for climbers as a community utility first
- Dating is intentionally **light** (opt-in vibe), not the whole identity
- “Chats is the hub”: everything becomes a thread (events, gyms, groups, DMs)

---

## 2) Target audience & wedge

### 2.1 Target users
- Younger, city-based climbers
- People who already rely on apps to coordinate social life
- Users who want partners, friends, sessions, and crews with low friction

### 2.2 Growth wedge
- **Local density** wins. DAB must launch **city-by-city**, not “global-first”
- Empty states kill retention; local critical mass matters more than total signups

---

## 3) Current product structure (as discussed)

### 3.1 Navigation (current)
Bottom navigation:
- **Events**
- **Chats** (central inbox)
- **DAB** (matching)

### 3.2 Chats as the central system
Chats lists *everything*:
- Event chats
- Group chats
- Gym threads
- DMs

---

## 4) Core loops

### 4.1 Matching loop (B2C)
1. Onboarding (gyms + preferences)
2. Browse → “dab”
3. Mutual dab → match
4. Chat
5. Plan a session
6. (Future) Verify attendance/check-in → stronger retention + better attribution

### 4.2 Community/Gym loop
1. Select gym(s)
2. Enter GymChat/threads
3. Discover people/sessions
4. Join thread / RSVP / plan
5. (Future) check-in

### 4.3 Events loop
1. Discover events (filter by location/gym/type)
2. RSVP
3. Event thread/chat
4. Attend
5. Share/invite → growth

---

## 5) Feature discussions and decisions

### 5.1 “Friends in Gym” feature (3 options)
Option A — **Matched users at this gym** (recommended early)
- Shows people you’ve mutually matched with who list this gym
- Low complexity, immediate value, uses existing data

Option B — **Real-time check-ins**
- New “I’m here” system; shows who is there now
- High value, higher complexity (new table, UI, anti-spam, privacy/safety)

Option C — **All gym members**
- Shows everyone who lists the gym
- Risk: noise + privacy concerns; needs strong filtering/moderation

**Direction:** Start with **Option A**, instrument usage, then evolve toward Option B once safety + attribution are ready.

### 5.2 “Crew” as a fourth navigation item
Debate: Do we add a dedicated “Crew” tab for small private groups?
- Pro: identity + retention + social glue
- Con: nav complexity; can be handled as a group type within Chats

**Lean decision:** Treat “Crew” as a **group type** inside Chats first; only promote to nav if usage proves it’s a primary behavior.

---

## 6) Build context (what’s already in place)
- Architecture direction: **Next.js** (frontend + backend) + **Supabase** (auth, DB, realtime)
- Progress noted:
  - Full onboarding flow built and wired to Supabase
  - Demo profiles to populate experience
  - Matching + messaging + gym threads/events functionality mentioned as integrated/functional
  - Broad multi-page layout already established

---

## 7) Pricing & strategy framework used: Autonomy × Attribution

### 7.1 The 2×2 framework (applied to DAB)
Axes:
- **Autonomy:** low → high (how much DAB does without humans)
- **Attribution:** low → high (how well outcomes can be measured/verified)

Where DAB sits:
- **Now:** low autonomy, low–medium attribution → **Bottom-left**
- **Next (better measurement, still human-driven):** low autonomy, medium–high attribution → **Bottom-right**
- **Long-term (automation + verified outcomes):** higher autonomy + high attribution → **Top-right**

### 7.2 What that means for pricing
- **Bottom-left:** seat-based / freemium + Pro (value exists, but outcomes are hard to prove)
- **Bottom-right:** hybrid (subscription + credits/usage for high-value actions)
- **Top-right:** outcome-based (pay per verified success) — best fit for **hosts/gyms**, not individual users

---

## 8) Monetization path (phased)

### Phase A — Launch
- **Free MVP**; prioritize adoption and retention
- Do not add B2C monetization friction early

### Phase B — First monetization (before subscriptions)
- **Partnerships/sponsorships** with:
  - Gyms (local activation, deals, co-marketing)
  - Gear brands (giveaways, co-branded drops)
  - Event organizers (featured listings)
- Goal: credibility + distribution + small validation revenue

### Phase C — Pro + Credits (after density)
- Pro subscription for power features
- Credits for boosts/promotions that are clearly valuable

### Phase D — B2B tools + outcomes
- Verified attendance/check-ins
- Host/gym dashboards
- Outcome-based pricing where verification is reliable

---

## 9) Numbers used in planning (from our discussion)

### 9.1 B2C subscription model
Formula:
- **MRR ≈ MAU × conversion_to_paid × ARPPU**

Examples:
- **20,000 MAU × 5% × €10 = €10,000 MRR**
- **50,000 MAU × 4% × €12 = €24,000 MRR**
- **100,000 MAU × 3% × €10 = €30,000 MRR**

Rule-of-thumb:
- Subscription-only tends to be thin below **~20k–50k MAU** unless hyper-local + dominant.

### 9.2 Hybrid credits add-on
- Extra MRR ≈ MAU × %credit_buyers × avg_credit_spend
- Example: **50,000 MAU × 8% × €4 = €16,000 extra MRR** (on top of subs)

### 9.3 B2B gym subscription math
- **50 gyms × €199/mo = €9,950 MRR**
- **200 gyms × €149/mo = €29,800 MRR**

Implication:
- B2B can reach meaningful MRR with far fewer customers if outcomes are measurable.

---

## 10) Onboarding & engagement strategy (MVP growth)

### 10.1 Activation priorities
- Avoid empty states (seed city-by-city)
- Deliver a first “win” fast:
  - match, chat, RSVP, or thread engagement
- Onboarding should push users into an **active local graph** immediately (gyms, events, people)

### 10.2 Retention loops
- “Who’s at your gym today” / “popular session tonight” prompts
- Weekly planning nudges (weekend sessions)
- Post-session confirmation prompts (also boosts attribution later)

### 10.3 Metrics to track
- D1/D7/D30 retention
- Match-within-24h rate
- 2-way messaging rate after match
- RSVP rate + event attendance rate
- Invite conversion rate
- (Future) verified attendance/check-in rate (north-star for attribution)

---

## 11) Conclusions (where we’re going)

### 11.1 Strategy conclusions
- **Win local density first** (city-by-city)
- **Keep MVP free** to maximize adoption and reduce friction
- Monetize early via **partnerships** (gyms/brands/events) before user paywalls
- Build toward **measurable outcomes** (attendance verification) to unlock hybrid + B2B monetization

### 11.2 Feature conclusions
- Keep **Chats** as the central hub
- “Friends in Gym” should start as **Matched users at this gym**, then evolve to check-ins later
- “Crew” should start as a **group type**, not a new nav tab (until proven)

### 11.3 Pricing conclusions
- Today: **Freemium + Pro** (bottom-left)
- Next: **Pro + credits/boosts** once density and value exist (bottom-right)
- Long-term: **Outcome pricing for hosts/gyms** when verification is reliable (top-right)

---

## 12) Recommended next actions (execution)

### 12.1 Product build (next 4–8 weeks)
1. Harden onboarding → pick gyms → immediate people/events feed
2. Ensure Chat hub is clean: DMs, gym threads, event chats unified
3. Implement “Friends in Gym” Option A (matched-at-gym) + instrumentation
4. Add RSVP + simple planning primitives (time/place)
5. Add attendance confirmation prompts (dual confirm) for early attribution

### 12.2 Growth (launch plan)
- Pick 1–2 launch cities
- Seed with demo profiles + real ambassadors
- Weekly recurring events per gym to maintain activity
- Partnership outreach to gyms for co-marketing + deals

### 12.3 Monetization (timing gates)
- Start partnership deals after **~200–500 engaged users** in a launch city
- Launch Pro/credits only after:
  - strong D7 retention
  - consistent matches/messages per user
  - event RSVPs are flowing

