## Work Log (last ~8 hours)

### Supabase data model and seeding
- Added gyms with slugs/locations/avatars for Munich: Boulderwelt West/Ost, DAV Freimann, DAV Thalkirchen, Einstein Boulderhalle, Heavens Gate. Ensured `avatar_url` is the sole image field.
- Normalized `threads.gym_id` to `uuid`, added FK to `gyms(id)`, enforced unique `(gym_id, title)`.
- Created standard gym threads per gym (`General`, `Beta Center`, `Routesetting`) and enrolled all users into them (thread_participants).
- Cleaned duplicates: repointed threads to canonical gym IDs, deleted duplicate gyms, removed unused slug-null gyms.
- Validation queries were provided to verify counts, titles, and memberships.

### Chats UI & Supabase wiring
- `/chats/page.tsx`: switched from placeholders to live Supabase threads; subscription refresh on messages; fetches counterpart profiles; handles gym threads; fixed null-supabase cleanup.
- `/chats/[id]/page.tsx`: wired 1:1 (and group) chat to Supabase; fetches thread/messages/participants; realtime subscription; sending messages with statuses.
- Replaced `next/image` with `<img>` for Figma-hosted assets to avoid unconfigured-host errors.

### Gyms cleanup (final state)
- Unique slugs with avatar URLs present; no duplicate gyms; six gyms total; each with 3 gym threads.

### Styles/components
- Implemented multiple tokenized mobile components (filter buttons, dropdowns, mobile navbar), special chips (pro/founder/crew), and landing page updates; globals.css is tokenized via tokens.css.
- Recent CSS tweak requested: `GridProfileCard` needs padding 16px (top/bottom/left/right) and width/height to fit-content (pending application if not already done).
- Chat preview (overview) aligned to Figma: avatar hover stroke uses primary, small shadow; overflow visible so stroke isn’t clipped; title/subtitle hover color is primary; text gap 2px; body/sm on preview text; unread badge pulses; unread wave overlay added.
- Chat detail (1:1) header matches Figma: 24px back/dots icons, grid header with centered name, Inter 16px medium, token colors.
- Input bar matches Figma: 38px height, bg `var(--color-text-default)`, radius `var(--radius-lg)`, Inter 14px medium `var(--color-text-darker)`, no border/outline; send icon uses `/icons/send.svg`.
- Status indicator for outgoing messages uses Figma assets (double tick).
- Chat overview unread wave + pulsing badge; event/gym/directed threads show proper avatars (events use `events.image_url`).
- Event page now loads Supabase events and event threads; displays event covers from bucket (`events.image_url`), with date/time/slots and links into the event thread; images object-fit cover with gradient hover overlay.

### Outstanding/notes
- If hosting more external images with `next/image`, add hosts to `next.config.js` or keep using `<img>`.
- Gym names/avatars can be surfaced in chat list for `type='gym'` threads if desired.

### Recent fixes (home/profile, onboarding)
- Profile/home cards now pull images from onboarding `photo` (normalized storage paths to public URLs) and stop showing fallbacks or empty `src`.
- /home deck filters out the logged-in user; synthesized profiles from `onboardingprofiles` show up even without a `profiles` row.
- PRO badge logic fixed: shows only when status or chips include pro; removed duplicate header badge on home.
- Gradient strokes aligned (outer wrapper only; inner image no stroke); filled corner gaps on image wrapper.
- CTA buttons on /profile use tokenized components (`button-navlink` cancel, `onb-cta-btn` save) and full-width layout.
- Profile name shows first name/email prefix only; chevron buttons left-align text/right-align chevron.
- Dab => match => chat: dab button now writes a like swipe and, on reciprocal like, inserts a match and ensures a direct thread between the pair (reuses existing direct threads even if `type` was null).
- Profile fetch scoped to user: onboarding rows are now filtered by requested IDs so a logged-in user never sees another user’s onboarding data on /profile.
- Swipes RLS fixed: select policy now allows swiper OR swipee to read rows (`swipes_select_self_or_target`), enabling reciprocal-like detection; mutual dabs now create matches and direct threads successfully.
- Chats overview: direct threads show first name and real avatar (using merged onboarding/profile data), new matches show as unread and sort to top; unread wave slowed (5.4s) and masked to content; online pill dot set to 12px token size.

### New event create flow
- Built `/events/create` page to match Figma node 755:2440 with tokenized hero/inputs/buttons, live previews, and ButtonCta submit/cancel.
- Form fields: title, location, description, start_at, slots_total, slots_open, image_url; host recorded via `created_by` (current user). Submits stay on page with status/errors and disabled states.
- Added CSS tokens for create hero (160px, gradient overlay), field blocks, cancel button, and CTA height/layout.
- Updated button-cta hover/focus text color (uses `color-surface-bg` token) and ensured hover shadow/border match spec.
- Profile page container constrained to 420px max width to match other main nav pages.

### Supabase updates
- Added SQL to ensure `events.created_by` column, indexes, and RLS policies: select-all for authenticated, insert check `created_by = auth.uid()`, optional self-update; confirmed execution succeeded.

### Crew system implementation (today)
- Created complete crew system: `/crew` (list), `/crew/create`, `/crew/detail` pages mirroring events structure
- Supabase setup:
  - Created `crews` table (mirrors `events` structure: title, location, description, image_url, created_by, etc.)
  - Added `crew_id` column to `threads` table for crew-specific threads
  - Created storage buckets: `crew-cover` and `event-cover` with RLS policies for authenticated uploads
  - Fixed RLS policies for threads table to allow crew/event/gym/direct thread creation
- Crew logic:
  - Crews are unlimited group chats (no time slots, no attendance limits)
  - Removed time and slots fields from crew creation/display
  - Crew threads excluded from main `/chats` page (only appear on `/crew` page)
  - `/crew/detail` functions as full chat interface (mirrors `/chats/event` UI)
  - Real-time messaging, message status indicators, profile avatars
- Crew management:
  - Three dots menu on crew detail: "Invite users to Crew" (creator only), "Delete Crew" (creator only, red), "Leave crew" (all users)
  - Delete crew removes crew and cascades to delete associated thread
  - Leave crew removes user from thread_participants and redirects
- Chat improvements:
  - 1-on-1 chat header now displays actual first name from Supabase (uses `fetchProfiles` to merge `profiles` + `onboardingprofiles`)
  - Added three dots menu to 1-on-1 chats with "Leave chat with {Name}" option
  - Leave chat deletes the direct message thread and redirects to `/chats`
- UI fixes:
  - Hidden header (DAB logo/logout) on `/crew` pages (added to `HIDDEN_HEADER_ROUTES`)
  - Fixed `isDirect` variable definition in chat detail page
 
### Mobile navbar & global UI polish (today)
- Refined `MobileNavbar` to match latest Figma: items are now `Events / Chats / Crew / Dab`, profile removed, crew links to `/crew`, and labels are properly capitalized. Icon assets are wired from Figma; crew uses 24px icons, others 26px, with inactive icons tinted to `color-text-default` via CSS and active icons using their accent color.
- Navbar layout is fully tokenized: sticky full-width bar (`width: 100%`), no top corner radius, card-colored inner (`color-surface-card`) with 12px vertical and 24px horizontal padding (`space-md` / `space-xl`), 100px height, and Inter 12px bold labels (`font-size-sm`, `font-weight-bold`). Content wrappers with horizontal padding (`home-/chats-/events-*/profile-*-content`) now offset the navbar width/margins so the bar visually spans the full mobile width on all pages.
- Chats unread indicator logic moved into `MobileNavbar`: we compute `hasUnreadChats` by fetching latest messages per thread for the current user and subscribing to `messages` changes; the small dot on the Chats icon is shown only when there are unread messages. The dot is positioned top-right inside the icon container and uses `color-primary`.
- `/chats/event` was updated to drop the old `home-bottom-nav` Figma stub and now uses the shared `MobileNavbar` (active="chats"), so all authenticated mobile views share the same bottom nav component.
- Introduced a global `.custom-scrollbar` helper using tokens (`color-text-muted` for the thumb, `radius-full` for rounding) and applied it to scrollable cards like `.chats-card` and `.events-card`. Events list card background now uses `color-surface-card` and scrolls internally, matching chats card behavior and overall dark card styling.

### Chat management & unread indicators (latest)
- **Mobile navbar unread indicators**:
  - Extended unread indicator logic to include crew threads: `MobileNavbar` now tracks `hasUnreadChats` (non-crew threads) and `hasUnreadCrews` (crew threads separately)
  - Chats icon shows unread dot for non-crew unread messages; Crew icon shows unread dot for crew thread unread messages
  - Both indicators update in real-time via Supabase subscriptions to `messages` table changes
  - Logic properly filters crew threads from main chats list and vice versa
  - **Fixed chats unread detection**: Now uses exact same logic as `/chats` page - fetches threads the same way (direct + participant threads), excludes crew threads, filters gym threads to canonical titles, and uses `receiver_id === userId && status !== 'read'` check
- **Global UnreadDot component**:
  - Created reusable `UnreadDot` component (`src/components/UnreadDot.tsx`) for consistent unread indicators across the app
  - Uses global `.unread-dot` CSS class with tokenized spacing (`var(--space-xs)` = 6px from top/right edges)
  - Pulsating animation (`presencePulse`) with `var(--color-primary)` background and shadow
  - Positioned absolutely within relative parent containers (avatars, images)
- **Crew page unread indicators**:
  - Added pulsating dot indicator on crew tiles (`/crew` page) to show which specific crews have unread messages
  - Uses global `UnreadDot` component for consistency
  - Unread detection: checks if user is participant in crew thread, fetches latest message, marks unread if `receiver_id === userId` and `status !== 'read'`
  - Real-time updates via Supabase subscription to message changes
  - **Added "Last message by {Name}" indicator**: Shows who sent the last message in each crew thread, displayed in top-right corner next to unread dot
  - Styled with `var(--color-primary)`, `var(--font-size-sm)` (12px), tokenized spacing (`var(--space-xs)` = 6px)
  - Fetches sender profiles using `fetchProfiles` to get first name from username
- **Chat list unread indicators**:
  - Added pulsating dot indicator on chat avatars (`/chats` page) to show which chats have unread messages
  - Uses global `UnreadDot` component (replaces old unread badge SVG indicator)
  - Removed redundant old unread badge indicator from chat preview items
  - Dot appears in top-right corner of avatar (6px from edges using `--space-xs` token)
  - Unread messages are sorted to the top of the chat list
- **Events page updates**:
  - Removed three dots icon from create event bar (cleaner UI)
  - **Added new event wave animation**: Events created within last 24 hours since returning to app show pulsating wave animation overlay
  - Uses same `chats-wave` animation from unread chat messages (5.4s infinite loop)
  - Tracks last visit time in `localStorage` (`events-last-visit`)
  - Wave overlay covers entire event tile with primary color gradient mask
  - CSS class: `.events-tile-new` with `::after` pseudo-element for wave effect
- **Chat detail page improvements**:
  - Added "Leave chat" option to gym chats and event chats (removes user from `thread_participants`)
  - Added "Delete Event Chat" option for event creators (deletes the event thread entirely)
  - Three dots menu now conditionally shows creator-only options based on `created_by` field
  - Fixed TypeScript error: added `created_by` field to `EventRow` type and included it in event queries
  - Event queries now fetch `created_by` to determine if current user is the event creator
