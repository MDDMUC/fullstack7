# Ticket: Push Notification Infrastructure (Ready State)

ID: TICKET-NOT-001
Owner: Eng
Status: Proposed
Priority: P0
Created: 2025-12-22
Last updated: 2025-12-22
Target window: Pre-launch
Related docs: `PROJECT_CONTEXT.md`

## Problem
Push notification infrastructure must be ready even if not enabled at launch.

## Goal
Implement push infra: provider setup, device tokens, opt-in UI, and delivery test.

## Scope
- Provider selection and setup.
- Device token registration.
- Settings UI for opt-in/opt-out.
- Test delivery on iOS/Android.

## Requirements
- No notifications sent by default unless enabled.

## Dependencies
- None.

## Definition of Done
- Push infra live with successful test sends.
