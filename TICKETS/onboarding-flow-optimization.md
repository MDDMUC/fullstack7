# Ticket: Onboarding Flow Optimization (22-35)

ID: TICKET-ONB-001
Owner: Product
Status: In Tech Review
Priority: P0 (activation)
Created: 2025-12-22
Last updated: 2025-12-23
Target window: After Step 1 analytics instrumentation, or in parallel if resourced
Related docs: `STRATEGY_RESEARCH_DEMOGRAPHICS.md`, `PROJECT_CONTEXT.md`

## Problem
The current onboarding flow is longer than necessary for the primary audience (22-35 indoor climbers). Friction and early drop-off likely reduce activation and time-to-value. We need a shorter, ordered flow that gets users into relevant local matches fast.

## Goal
Reduce onboarding time to first useful screen (<90 seconds) while preserving enough data for safe and relevant matching.

## Non-goals
- Do not introduce monetization or paywalls.
- Do not add real-time check-ins (Phase 2).
- Do not expand long preference questionnaires in v1.

## Target user
- Primary: 22-35 indoor bouldering and roped gym climbers
- Secondary: 36-44 indoor climbers

## Proposed flow (4-5 steps)
1. Account + age gate
   - Auth (email/Apple/Google)
   - Age confirmation
   - Name (or use auth profile name)
2. Intent + climbing
   - Looking for: climbing partner / crew / meet climbers
   - Top styles: 1-3 (hard max with clear UI feedback)
   - Grade optional
3. Location + home gym
   - Homebase (city) required (auto-detect if possible)
   - Home gym optional ("not sure yet") + "I climb outside" toggle
4. Pledge (safety/culture)
   - Single-tap opt-in (no multi-confirm)
5. Success (reward screen)
   - Clear CTA to first value (/home) + optional next actions (gyms/events/crew)

## Requirements
- Mandatory fields for match relevance: age >= 18, homebase (city), looking_for, climbing_style (1-3), 1 photo.
- Optional fields: home gym, grade, phone, longer bio, advanced preferences, notifications.
- Step indicators must match the live step count.
- Enforce "three max" on climbing styles with clear UI feedback.
- Align profile photo storage bucket across onboarding upload and profile fetch (use one canonical bucket).
- Pledge step must be a single interaction to opt-in (1 tap/click), not multiple required pledge confirmations.
- User-facing copy must not explicitly position DAB as a dating app (no "dating" language); frame as meeting climbers / making connections.
- Remove background videos from onboarding steps (static backgrounds only) to improve load reliability and completion time.
- No schema changes unless approved by Tech Lead.
- Mobile-first UI with existing MobileTopbar and MobileNavbar.

## Success metrics (instrument via analytics_events)
- Onboarding completion rate (start -> completed)
- Onboarding completion rate >80% (test cohort)
- Time to completion (median <= 90s)
- Drop-off by step
- First action within 24h: match_created or message_sent

## Analytics instrumentation
- Phase 1 (no schema changes): emit only `signup` with onboarding metadata inside `properties` (e.g., `onboarding_version`, `step_durations_ms`, `total_duration_ms`).
- Phase 2 (requires Tech Lead approval): add onboarding step-level events (`onboarding_step_started`, `onboarding_step_completed`, `onboarding_abandoned`) to `analytics_events.event_name` allowed values and instrument per-step drop-off.

## Dependencies
- Design spec for step layout and copy
- Tech Lead review if any schema changes are needed
- QA pass on mobile flows (iOS Safari, Android Chrome)

## Risks
- Lower profile completeness -> lower match quality
  - Mitigation: post-onboarding prompts for photo/bio
- Safety/abuse risk if phone verification remains optional
  - Mitigation: rate limiting + report/block flows already in place

## Open questions
- Minimum photos: 1 or 2? (Owner: Product) -> Proposed decision: 1 (require), prompt for more post-onboarding.
- Is bio optional or required? (Owner: Product/Design) -> Proposed decision: optional (prompt later).
- Any actions to require phone verification before? (Owner: Product/QA) -> Proposed decision: keep optional in v1; revisit gating if abuse/spam appears.
- Pledge step UX: single-tap opt-in vs multi-confirm cards? (Owner: Product/Design/Eng) -> Proposed decision: single-tap opt-in (reduce friction).

## Decision log
- Date: 2025-12-22
- Decision: Target demographic 22-35 primary, 36-44 secondary for onboarding optimization.
- Rationale: DAV gym user age distribution and membership data indicate strongest indoor-climbing activity in 20-49 with average age ~35.
