# Ticket: Update Profile Edit - Climbing Styles

**Status:** Done
**Priority:** Medium
**Type:** Feature / UX Improvement

## Goal
Update the "Edit Profile" modal in `/profile` to use a multi-select button group for "Climbing Style", replicating the UX from the onboarding flow.

## Context
Currently, the "Edit Profile" modal uses a text input for tags but lacks a dedicated, structured selector for climbing styles. The onboarding flow (`InterestsStep`) has a polished "click-on click-off" UI for this. We want to bring that UI into the profile edit experience.

## Requirements
1.  **UI Component:** Recreate the multi-select grid from `src/app/dab/steps/InterestsStep.tsx` inside the `Edit Profile` modal in `src/app/profile/page.tsx`.
2.  **Options:** Use the same `CLIMBING_STYLES` list as onboarding.
3.  **Behavior:**
    *   Toggle selection on click.
    *   Limit to max 3 selections (same as onboarding).
    *   Show active state visually.
4.  **Persistence:** Implement the `handleSaveProfile` function to actually save these changes (along with Bio, City, Tags) to the `onboardingprofiles` table in Supabase.

## Technical Details
- **Files:** `src/app/profile/page.tsx`
- **Styles:** Reuse `.onb-style-grid`, `.onb-style-btn`, `.onb-style-btn-active` from `globals.css`.
- **Data:**
    - Initialize state from `profile.style` (split string into array).
    - Save as `styles` (or `climbing_style` - verify column) in DB.

## Acceptance Criteria
- [x] "Climbing Style" section appears in "Edit Profile" modal.
- [x] User can select up to 3 styles.
- [x] Selection is visually indicated (active state).
- [x] Clicking "Save Changes" updates the profile in the database.
- [x] Updated styles appear on the profile page after saving.
