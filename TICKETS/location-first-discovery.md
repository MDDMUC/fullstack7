# Ticket: Location-First Discovery

ID: TICKET-LOC-001
Owner: Design
Status: In Design
Priority: P1
Created: 2025-12-22
Last updated: 2026-01-04
Target window: Step 2
Related docs: `PROJECT_CONTEXT.md`

## Problem
Location is the strongest driver of activation, but discovery is not location-first yet.

## Goal
Implement location-based discovery to reduce onboarding friction and improve relevance.

## Scope
- Auto-location for gym suggestions during onboarding.
- "Near you" section on /events with distances.
- "Climbing nearby" section on /home with coarse distance.

## Design

### User Flow
1. **Onboarding: Auto-location**
   - LocationStep.tsx: Displays "Use my current location" primary action.
   - User grants permission → City is auto-resolved; Nearest 3 gyms are auto-selected.
2. **Home Discovery**
   - Swipe deck on /home: Profile cards now include a distance badge (e.g., "3 km away").
   - Discovery logic: Sort by proximity (coarse: <1km, 1-5km, 5-10km, 10km+).
3. **Event Discovery**
   - Event tiles on /events: Show distance from user's primary gym or current location.
   - MobileFilterBar: Add "Near You" (sort by distance) as a primary filter option.

### Screen-by-screen Spec

**1. LocationStep.tsx (Onboarding)**
- **Button**: `button-ghost` style with `MapPinIcon` (Heroicons).
- **Label**: "Find my location"
- **State**: Loading state shows "Locating..." with a subtle pulse.
- **Success**: Auto-fills the "Your City" input and triggers gym search.

**2. Profile Card (/home)**
- **Badge**: Positioned below the location text (e.g., "Munich, Germany").
- **Style**: Text `var(--font-size-xs)`, color `var(--color-text-muted)`.
- **Icon**: `MapPinIcon` (12px height).
- **Format**: "X km away" (Round to nearest integer).

**3. Event Tile (/events)**
- **Badge**: Overlay on the bottom-left or bottom-right of the event image.
- **Style**: Small semi-transparent pill: `background: rgba(0,0,0,0.4)`, `backdrop-filter: blur(4px)`.
- **Text**: `var(--color-text-default)`, `var(--font-size-xs)`.

### Components and Reuse
- Reuse `MobileFilterBar` for "Near You" sorting.
- Reuse `ButtonCta` or `button-ghost` for location triggers.
- New component: `DistanceBadge` (stateless, takes `distance` prop).

### States and Empty States
- **Permission Denied**: Fallback to manual city input (existing flow).
- **No Results Nearby**: Show "Nothing nearby yet. Expand your range?" message.
- **Loading Location**: Show skeleton or pulse on the "Find my location" button.

### Copy Guidance
- Use "X km away" for proximity.
- Use "Find my location" for the trigger.
- Avoid precise distances (e.g., "3.42km") for privacy; always round to whole numbers.

## Dependencies
- TICKET-ANA-002 and TICKET-ANA-003 for tracking.

## Definition of Done
- Location-based sections live and validated.

