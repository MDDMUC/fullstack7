# Ticket: Onboarding Flow Optimization (22-35)

ID: TICKET-ONB-001
Owner: Product
Status: Proposed
Priority: P0 (activation)
Created: 2025-12-22
Last updated: 2025-12-22
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
2. Location + home gym
   - Auto-detect city
   - Select home gym (or "not sure yet")
3. Climbing intent
   - Looking for: partner / crew / dating
   - Style: bouldering / top-rope / lead
4. Profile essentials
   - 1 photo minimum
   - Short bio optional (prompt later)
5. Safety + optional add-ons
   - Safety pledge
   - Phone verify (optional)
   - Notifications (optional)

## Requirements
- Mandatory fields for match relevance: city, home gym (or "none"), looking_for, climbing_style, 1 photo.
- Optional fields: phone, longer bio, advanced preferences.
- Step indicators must match the live step count.
- Enforce "three max" on climbing styles with clear UI feedback.
- Align profile photo storage bucket across onboarding upload and profile fetch (use one canonical bucket).
- No schema changes unless approved by Tech Lead.
- Mobile-first UI with existing MobileTopbar and MobileNavbar.

## Success metrics (instrument via analytics_events)
- Onboarding completion rate (start -> completed)
- Onboarding completion rate >80% (test cohort)
- Time to completion (median <= 90s)
- Drop-off by step
- First action within 24h: match_created or message_sent

## Analytics instrumentation
- onboarding_step_started (step_name, step_index)
- onboarding_step_completed (step_name, step_index, duration_ms)
- onboarding_completed (total_duration_ms)
- onboarding_abandoned (last_step)

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
- Minimum photos: 1 or 2? (Owner: Product)
- Is bio optional or required? (Owner: Product/Design)
- Any actions to require phone verification before? (Owner: Product/QA)

## Decision log
- Date: 2025-12-22
- Decision: Target demographic 22-35 primary, 36-44 secondary for onboarding optimization.
- Rationale: DAV gym user age distribution and membership data indicate strongest indoor-climbing activity in 20-49 with average age ~35.
