# AGENTS.md

Purpose: Define roles and the collaboration workflow for DAB.

Start here: read AGENT_START.md first.

## Roles (files)
- Product Strategist: `role-product-strategist.md`
- Experience Designer: `role-experience-designer.md`
- Technical Lead / Architect: `role-technical-lead.md`
- Implementation Engineer: `role-implementation-engineer.md`
- Quality and Testing Reviewer: `role-quality-testing.md`
- Marketing Lead: `role-marketing-lead.md` (post-build)

Definition of Done: see `DEFINITION_OF_DONE.md`.
Ticketing system: see `TICKETS/README.md` and `TICKETS/INDEX.md`.

## Model assignment matrix (primary, fallback)
- Product Strategist: GPT-5.2 Thinking, Claude 3.5 Sonnet
- Experience Designer: Gemini Flash (latest), GPT-5.2 Thinking
- Technical Lead / Architect: GPT-5.2 Thinking, Claude 3.5 Sonnet
- Implementation Engineer: Claude Code, Claude 3.5 Sonnet (terminal)
- Quality and Testing Reviewer: GPT-5.2 Thinking, Gemini Flash (latest)
- Marketing Lead: GPT-5.2 Thinking, Gemini Flash (latest)

## Workflow: DAB Loop
1. Strategy writes a scoped ticket with success metrics.
2. Design produces UI flows and specs.
3. Technical Lead validates architecture, data model, and API contracts.
4. Implementation builds the change and updates notes/tests.
5. Quality reviews for regressions, security, and test gaps.
6. Implementation resolves issues and finalizes.
7. Marketing plans launch and acquisition after build is stable.

## Sign-off gates
- QA sign-off required for every change.
- Technical Lead sign-off required for schema, RLS, API contracts, or performance changes.
- Strategy sign-off required for scope, metrics, or roadmap shifts.
- Design sign-off required for new or revised user-facing flows.

## Required Handoff Template
Use this exact template for every handoff:

Model:
- Name and version used

Ticket:
- ID and file path

Context:
- Goal and current status
- Files touched or links

Decisions:
- New decisions or assumptions

Task:
- Next actions to take

Constraints:
- Do-not-do rules for this task

Definition of Done:
- Pass/fail criteria and tests (or test plan)

Risks and Questions:
- Open items with owner

Artifacts/Links:
- Designs, screenshots, tables, queries, notes

## Global Constraints (non-negotiable)
- No monetization features in H1 2026.
- No realtime check-ins (Friends in Gym Phase 2).
- New pages must include MobileTopbar and MobileNavbar.
- Use design tokens only (no hard-coded colors/spacing/sizes).
- New tables must have RLS policies.

