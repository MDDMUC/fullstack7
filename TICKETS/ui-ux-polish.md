# Ticket: UI/UX Polish + Responsiveness

ID: TICKET-UX-002
Owner: Product/Design/Eng
Status: Proposed
Priority: P0 (activation)
Workflow Path: Fast Lane
Created: 2025-12-22
Last updated: 2025-12-25
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
- Restore chips on the home landing page featured climber card and grid layout cards.
- Fix desktop landing page dab animation glow being clipped by its container.
- Fix broken avatar images in /gym/chat “your walls” list.
- Replace legacy gym status/fullness cards on /gym/chat with the current live-data design; fix broken avatar images on those cards.
- Fix broken MobileTopbar icons for notifications and gyms on logged-in mobile/home.
- Add hover state to the “next” button on user profile cards (desktop).
- Fix MobileNavbar icons: add missing Events icon and correct Crew icon.
- Fix MobileNavbar active icon color on /chats to use primary color.
- Add avatar fallback for users with missing/broken profile images (handle legacy live data).
- Remove extra padding on mobile MobileTopbar (left/right/top) and MobileNavbar (left/right) so content uses full screen.
- Smooth the DAB tap animation (avoid stop-motion/wiggly behavior).
- Replace CSS filter-based recolors with inline assets using tokenized colors.
- Update chat text color styles to align with design tokens.

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
