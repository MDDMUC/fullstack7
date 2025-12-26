# Ticket: UI/UX Polish + Responsiveness

ID: TICKET-UX-002
Owner: Product/Design/Eng
Status: Done
Priority: P0 (activation)
Workflow Path: Fast Lane
Created: 2025-12-22
Last updated: 2025-12-26
Target window: Pre-launch
Related docs: `PROJECT_CONTEXT.md`

## Problem
Small UI/UX issues and responsive layout breaks can hurt perceived quality and activation during the first cohort.

## Goal
Complete a focused polish pass that also hardens responsiveness across mobile devices so core flows feel stable and fast.

## Non-goals
- No new major features.
- No visual redesign or rebranding.
- No desktop-first layouts.

## Scope
- Review core flows: onboarding, home, chats, events, crews, gyms.
- Fix minor layout, spacing, readability, and tap-target issues.
- Resolve responsive issues across common mobile sizes and notched devices.
- Validate loading and empty states.
- Replace legacy gym status/fullness cards on `/gym/chat` (desktop + mobile) with the current live-data design; fix broken avatar images on those cards.
- Add hover state to the “next” button on user profile cards (desktop).
- Smooth the DAB tap animation (avoid stop-motion/wiggly behavior).
- Replace CSS filter-based recolors with inline assets using tokenized colors.

## Requirements
- Mobile-first (iOS Safari, Android Chrome).
- Use design tokens only.
- No new pages without MobileTopbar and MobileNavbar, except the onboarding flow on mobile (desktop can include).
- No horizontal scrolling or clipped CTAs on 320-430px widths.
- Respect safe-area insets for top/bottom bars.

## Success metrics
- No blocking responsive bugs in QA on target devices.
- Reduced user confusion in test cohort feedback.
- No new UI regressions in QA.

## Dependencies
- QA device coverage for small and tall screens.

## Definition of Done
- Targeted polish items resolved and verified on mobile.
- Responsive checklist passes (no overflow, no overlap with top/bottom nav, no clipped primary actions).
