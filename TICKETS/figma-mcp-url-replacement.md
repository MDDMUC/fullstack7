# Ticket: Replace Figma MCP URLs with Local Assets

ID: TICKET-UX-003
Title: Replace Figma MCP URLs with Local Assets
Owner: Eng
Status: Proposed
Priority: P1
Workflow Path: Fast Lane
Created: 2025-12-25
Last updated: 2025-12-25
Target window: Pre-launch
Related docs: `PROJECT_CONTEXT.md`

## Problem
Some UI icons and images are referenced via Figma/MCP URLs, which are brittle, slower, and not suitable for production use.

## Goal
Replace Figma/MCP and external design URLs with local assets to improve reliability and load performance.

## Non-goals
- No visual redesign.
- No new icon set beyond current designs.
- No changes to user-generated media handling.

## Target user
All users; reduce broken assets and improve perceived quality.

## Scope
- Scan the codebase for Figma/MCP/external design URLs in UI components.
- Export the required assets and store them locally in `public/` or `src/assets/`.
- Update references to use local assets.
- Verify key screens render icons correctly.

## Requirements
- No Figma or external design URLs in production UI code.
- Use local assets only for UI icons and illustrations.
- Keep file names and paths consistent and documented.

## Success metrics
- Zero Figma/MCP URLs remaining in the codebase.
- No broken icons on the landing page, MobileTopbar, or MobileNavbar.

## Analytics / instrumentation
- N/A

## Dependencies
- Access to exported icon assets from the latest design source.

## Risks
- Missing or mismatched icons if assets are not exported correctly.

## Open questions
- Which components still reference Figma/MCP URLs (scan needed)?

## Definition of Done
- Reference `DEFINITION_OF_DONE.md`
- All icon references use local assets.
- Manual spot-check of landing page and mobile nav/topbar.

## Role addenda

### Design
- Provide exported icon assets if any are missing locally.

### Technical Lead
- N/A (no schema/API changes).

### Implementation
- Scan paths and replace external URLs with local assets.
- Keep local assets under `public/` or `src/assets/`.
- Test plan: manual spot-check of landing + mobile nav/topbar.

### QA
- Verify no broken icons on key pages.

## Decision log
- Date: 2025-12-25
- Decision: Replace Figma/MCP URLs with local assets for production reliability.
- Rationale: External design URLs are brittle and slow; local assets are stable and cacheable.
