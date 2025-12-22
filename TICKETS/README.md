# Ticketing System (DAB)

Purpose
- Provide a single, consistent workflow for product, design, engineering, and QA.
- Ensure every task has clear scope, success metrics, and handoffs.

Start here
1. Read `AGENT_START.md`
2. Read `PROJECT_CONTEXT.md`
3. Read `AGENTS.md`
4. Open the relevant ticket in `TICKETS/`

## Where tickets live
- Folder: `TICKETS/`
- Index: `TICKETS/INDEX.md`
- Template: `TICKETS/TEMPLATE_PRODUCT.md`
- Role templates: `TICKETS/TEMPLATE_DESIGN.md`, `TICKETS/TEMPLATE_TECH_LEAD.md`, `TICKETS/TEMPLATE_IMPLEMENTATION.md`, `TICKETS/TEMPLATE_QA.md`, `TICKETS/TEMPLATE_MARKETING.md`
- Starter: `TICKETS/TICKET_STARTER.md`

## Ticket ID and naming
- ID format: `TICKET-<AREA>-<NNN>`
- Example: `TICKET-ONB-001`
- File name: `TICKETS/<short-title>.md`

Area codes (suggested)
- ONB (onboarding)
- CORE (core product)
- CHAT (chat/threads)
- EVT (events)
- CREW (crews)
- GYM (gyms)
- TNS (trust/safety)
- ANA (analytics)
- ADM (admin/tools)

## Status values
- Proposed
- Ready
- In Design
- In Tech Review
- In Implementation
- In QA
- Done
- Parked

## Priority
- P0: activation or blocker
- P1: important improvement
- P2: nice-to-have

## Lifecycle (DAB Loop)
1. Product Strategist drafts the ticket (problem, goal, metrics).
2. Designer adds UI flow and specs (if UI work).
3. Technical Lead validates architecture and schema impacts.
4. Implementation Engineer builds.
5. QA reviews and reports gaps.
6. Implementation fixes and closes.
7. Marketing Lead plans launch and acquisition after build stability.

## Required handoff usage
- Every role must use the AGENTS.md handoff template.
- Each handoff must include the Ticket ID and link to the ticket file.

## Definition of Done
- Apply `DEFINITION_OF_DONE.md` for any shipped work.

## Creating a new ticket
1. Copy `TICKETS/TEMPLATE_PRODUCT.md`
2. Fill out the fields and sections
3. Add the ticket to `TICKETS/INDEX.md`
4. Assign a status and owner
5. If needed, create role addenda using the role templates

## Editing rules
- Keep scope tight; defer nice-to-haves to a new ticket.
- Update "Last updated" when edits are made.
- Log decisions in the ticket, and in `DECISIONS.md` if architectural.
