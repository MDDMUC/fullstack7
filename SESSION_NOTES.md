## Work Log (last ~8 hours)

### Global ChatMessage component & chat UI improvements (latest)
- **Created global ChatMessage component**:
  - New reusable component `src/components/ChatMessage.tsx` for consistent message display across all chat types
  - Displays user avatar (34px, circular) and first name below avatar for all incoming messages
  - Handles outgoing messages with status indicators (sent/delivered/read)
  - Supports crew "left" status display for users who have left the crew
  - All styling uses design tokens: `var(--space-sm)`, `var(--radius-sm)`, `var(--radius-lg)`, `var(--color-text-default)`, `var(--color-surface-panel)`, `var(--color-primary)`, `var(--shadow-small)`
- **Applied ChatMessage component globally**:
  - Updated `/crew/detail` page to use ChatMessage component (replaced custom message rendering)
  - Updated `/chats/[id]` page to use ChatMessage for both direct chats and group chats (gym/event/crew threads)
  - All chat types now have consistent message display with avatar and first name
- **Profile fetching improvements**:
  - Fixed profile fetching to load all message sender profiles for ALL chat types (direct, gym, event, crew)
  - Added useEffect to fetch missing profiles when messages or otherProfile changes
  - Improved profile lookup to check both profiles map and otherProfile for direct chats
  - Added debug logging to track missing profiles
  - Profiles are fetched for all unique sender IDs from messages, not just group threads
- **TypeScript fixes**:
  - Removed local `Profile` type declaration in `/chats/[id]/page.tsx` that conflicted with imported `Profile` type from `@/lib/profiles`
  - Fixed profile setting to use profile directly from `fetchProfiles` instead of manually constructing object with nullable fields
  - Resolved type error: `Type 'string | null' is not assignable to type 'string'` by using imported Profile type directly
- **CSS implementation**:
  - Added global CSS classes: `.chat-message`, `.chat-message-incoming`, `.chat-message-outgoing`, `.chat-message-avatar-wrapper`, `.chat-message-avatar`, `.chat-message-name`, `.chat-message-content`, `.chat-message-bubble`, `.chat-message-bubble-incoming`, `.chat-message-bubble-outgoing`, `.chat-message-status-row`, `.chat-message-user-left-status`
  - Avatar: 34px width/height, 6px border-radius, positioned above name
  - Name: 12px font size, 500 font weight, centered below avatar, 4px gap, text overflow ellipsis with 50px max-width
  - Message bubbles: 12px padding, 14px border-radius, proper colors and shadows using tokens
  - All spacing, colors, and typography use design tokens
- **Chat card styling updates**:
  - Changed `.chat-gym-card` background from `var(--color-text-white)` to `var(--color-card)` token
  - Changed `.chat-gym-card` shadow from `var(--shadow-base)` to `var(--shadow-small)` token
  - Chat cards now use consistent card color and small shadow across all chat types

### Crew invite system & participant access fixes (latest)
- **Crew invite acceptance functionality**:
  - Implemented full invite request/acceptance flow: users can request to join crews, owners can accept requests
  - Created `accept_crew_invite` RPC function in Supabase to handle invite acceptance and participant addition
  - Updated RLS policies to allow owners to update invite status when accepting requests
  - Updated RLS policies to allow crew owners to add participants to their crew threads via `thread_participants` INSERT
  - When owner accepts an invite request, the requester is automatically added to `thread_participants` table
  - Added success notifications when invites are accepted
  - Invite status is updated to 'accepted' with timestamp when processed
- **Non-member overlay improvements**:
  - Changed overlay from full-screen (`position: fixed`) to content-window-only (`position: absolute`)
  - Overlay now only covers the center content card, not the entire screen
  - Removed MobileNavbar from overlay view (overlay shows without navbar)
  - Overlay doesn't affect mobile navbar layout or positioning
  - Added proper CSS positioning: overlay uses `position: absolute` within `.chats-event-card` container
  - Border radius matches card border-radius (24px)
- **Participant detection fixes**:
  - Fixed participant check query: removed non-existent `created_at` column from `thread_participants` SELECT queries
  - Added comprehensive error handling and logging for participant status checks
  - Fixed overlay condition: changed from `!isParticipant` to `isParticipant === false` to prevent showing overlay when state is `null`
  - Added detailed console logging to debug participant detection issues
  - Fixed thread data access: changed from `threadData?.data?.id` to `threadData?.id` (correct Supabase query response structure)
  - Participant check now properly detects when users are added to crew after invite acceptance
- **SQL scripts created**:
  - `supabase/create_accept_crew_invite_function.sql`: Creates RPC function for accepting invites
  - `supabase/update_crew_invites_update_policy.sql`: Updates RLS policy to allow owners to update invite status
  - `supabase/fix_crew_owner_add_participants.sql`: Updates RLS policy to allow crew owners to add participants

### Crew detail page improvements & FriendTile component (latest)
- **Friend tiles on `/crew/detail` page**:
  - Added friend tiles under the main hero section displaying all participants in the crew group
  - Fetches all thread participants from `thread_participants` table for the crew thread
  - Uses `fetchProfiles` utility to get participant profile data
  - Displays participant avatars with first names below each tile
- **Created global FriendTile component**:
  - New reusable component `src/components/FriendTile.tsx` with `FriendTile` and `FriendTilesContainer` components
  - Reusable across all pages with consistent styling using design tokens
  - Supports optional `isHost` prop to show "owner" indicator badge
  - Cycles through 6 image positioning variants for visual variety
  - All styling uses design tokens: `var(--color-surface-card)`, `var(--space-sm)`, `var(--radius-md)`, etc.
  - CSS classes: `.friend-tiles-container`, `.friend-tile`, `.friend-tile-bg`, `.friend-tile-img-wrapper`, `.friend-tile-img`, `.friend-tile-overlay`, `.friend-tile-name`, `.friend-tile-host-indicator`
- **Owner indicator for crew creator**:
  - Added "owner" indicator badge to FriendTile component (top-left corner)
  - Only displays on crew creator's tile on `/crew/detail` page
  - Badge shows lowercase "owner" text with background color `var(--color-surface-card)`
  - Styled with `var(--font-size-xs)` (10px), bold font weight, tokenized spacing
  - Logic: `isHost={participant.id === crew?.created_by}` passed to FriendTile
- **Sticky input at bottom**:
  - Made "Type a message" input sticky at the bottom of the card window
  - Wrapped messages in `chats-event-messages-container` with custom scrollbar for proper scrolling
  - Input stays within the main content card and floats to bottom while scrolling
  - Uses `position: sticky` within the card container
  - Input wrapper has transparent background (hugs content, no fill color)
- **Styling improvements**:
  - Changed card background from hardcoded `#ffffff` to `var(--color-card)` design token
  - Changed backbar background to `var(--color-text-muted)` (muted color)
  - Updated backbar icon size from `11.977px x 20.789px` to `16px x 16px` to match events page
  - Changed backbar text color from hardcoded `#11141c` to `var(--color-panel)` design token
  - Changed divider color from hardcoded `#8ea0bd` (muted) to `var(--color-text-darker)` design token
  - Removed unnecessary divider after hero section
  - Friend tiles align left horizontally (changed from centered to `justify-content: flex-start`)
  - Removed background fill from sticky input wrapper (transparent background)

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
  - **Added new event wave animation**: Events created today (same day) show pulsating wave animation overlay
  - Uses same `chats-wave` animation from unread chat messages (5.4s infinite loop, left-to-right movement)
  - Simple logic: compares event `created_at` date (start of day) with today's date (start of day)
  - Wave overlay covers entire event tile with primary color gradient mask (90deg horizontal gradient)
  - CSS class: `.events-tile-new` with `::after` pseudo-element for wave effect
  - Animation moves horizontally from left to right across the event tile
- **Chat detail page improvements**:
  - Added "Leave chat" option to gym chats and event chats (removes user from `thread_participants`)
  - Added "Delete Event Chat" option for event creators (deletes the event thread entirely)
  - Three dots menu now conditionally shows creator-only options based on `created_by` field
  - Fixed TypeScript error: added `created_by` field to `EventRow` type and included it in event queries
  - Event queries now fetch `created_by` to determine if current user is the event creator

### Global filter system implementation (latest)
- **Created global DropdownMenu component**:
  - New reusable component `src/components/DropdownMenu.tsx` matching the three-dot options menu style
  - Uses `mh-silver-dropdown-menu` and `mh-silver-dropdown-item` CSS classes for consistency
  - Dropdown trigger button styled with `mh-silver-dropdown-trigger` class (matches three-dot menu button style)
  - Supports click-outside-to-close, keyboard navigation, and proper ARIA attributes
  - Text truncation with ellipsis for long values
- **Applied filters to all list pages**:
  - **`/chats` page**: City and Gym filters
    - City filter: Extracts cities from other user's profile (direct chats) or gym/event location (group chats)
    - Gym filter: Filters gym threads by gym name (matches gym_id to gym name from gyms table)
    - Filter options dynamically extracted from available data
    - Case-insensitive filtering
  - **`/events` page**: City, Style, and Gym filters
    - City filter: Filters by event location
    - Style filter: Filters by event creator's climbing styles (from creator's profile)
    - Gym filter: Filters by event creator's gyms (from creator's profile gym array)
    - Fetches creator profiles to extract style and gym data
    - Handles both gym IDs (UUIDs) and gym names in creator's gym array
  - **`/crew` page**: City, Style, and Gym filters
    - City filter: Filters by crew location
    - Style filter: Filters by crew creator's climbing styles (from creator's profile)
    - Gym filter: Filters by crew creator's gyms (from creator's profile gym array)
    - Same filtering logic as events page
- **Filter UI styling**:
  - Filter containers span full width (100%) with equal-width dropdown buttons
  - Each dropdown wrapped in flex container with `flex: 1 1 0` for equal distribution
  - Removed padding from filter containers to maximize width usage
  - Updated `.chats-topnav` CSS to match `.chats-card` behavior (width: 100%, respects parent padding)
  - Removed `max-width: 358px` constraint from `.chats-topnav` to allow full width
- **Filtering logic improvements**:
  - Case-insensitive matching for all filters (city, style, gym)
  - Gym filtering handles both UUID format (gym IDs) and gym names
  - Creates gym ID to name map for proper matching
  - Filters update in real-time as selections change
  - All filters default to "All" to show everything initially
- **Data fetching**:
  - All pages fetch gyms from `gyms` table using `fetchGymsFromTable` function
  - Creator profiles fetched for events and crews to extract style/gym data
  - Filter options dynamically generated from available data (sorted alphabetically)
  - Separate state for all items vs filtered items for proper filtering

### MobileFilterBar global component (latest)
- **Created global MobileFilterBar component**:
  - New reusable component `src/components/MobileFilterBar.tsx` to replace individual filter implementations
  - Accepts `filters`, `filterOptions`, `onFilterChange`, and `filterKeys` props
  - Renders filter dropdowns with equal width distribution using flexbox
  - Replaced filter implementations on `/chats`, `/events`, `/crew`, and `/home` pages
- **Figma design implementation** (node 765:1754):
  - Background: `var(--color-surface-card)` (#151927) - matches Figma design
  - Padding: `var(--space-xs)` vertical (6px), `var(--space-md)` horizontal (12px)
  - Gap: `var(--space-xs)` (6px) between filter items
  - Full width spanning: Uses negative margins to extend beyond parent padding, matching mobile-topbar approach
  - Positioned directly below mobile-topbar with no gaps (removed parent container gap using negative margin)
- **Animated gradient divider**:
  - 1px height divider between topbar and filterbar
  - Animated gradient transitions from `var(--color-primary)` (#5ce1e6) to `var(--color-secondary)` (#e68fff) in left-to-right motion
  - Continuous infinite loop animation (3s per cycle)
  - Implemented using `::before` pseudo-element with CSS keyframe animation
- **CSS consolidation**:
  - Single `.mobile-filterbar` class replaces `.chats-topnav`, `.events-topnav`, `.home-filters`
  - All styling uses design tokens and CSS variables
  - Legacy classes kept for backward compatibility but no longer used

### MobileTopbar component & notifications system (latest)
- **MobileTopbar component**:
  - Created new `MobileTopbar` component (`src/components/MobileTopbar.tsx`) matching Figma node 764:3056
  - Displays breadcrumb text on left, profile avatar and notifications bell icon on right
  - Top-centered and spans full width on `/home`, `/chats`, `/events`, and `/crew` pages
  - Profile avatar links to `/profile` page via Next.js Link component
  - Styled with design tokens: `var(--color-surface-card)`, `var(--space-md)`, `var(--space-xl)`, `var(--font-size-md)`, `var(--font-weight-extra-bold)`
  - CSS classes: `.mobile-topbar`, `.mobile-topbar-content`, `.mobile-topbar-breadcrumb-text`, `.mobile-topbar-profile-icon`, `.mobile-topbar-notifications-icon`
- **Notifications dropdown**:
  - Bell icon opens notifications menu styled like three-dot options menu (using `mh-silver-dropdown-menu` classes)
  - Menu overlays content without affecting topbar size (absolute positioning, `z-index: 1001`)
  - Fetches real notification data from Supabase:
    - **Recent messages**: Fetches 10 most recent messages from threads where user is a participant (excludes messages from user)
    - **Dabs**: Fetches swipes where `swipee = current user` and `action = 'like'` (shows who dabbed the user)
  - Notification display format:
    - Messages: "{FirstName} sent you a message" with time ago
    - Dabs: "{FirstName} dabbed you" with time ago
  - Clicking notification navigates to relevant page (chat thread or home)
  - Loading state and empty state handling
  - Click-outside-to-close functionality
- **Unread dot indicator**:
  - Shows pulsating dot on bell icon when there are unread notifications
  - Uses `var(--color-primary)` (#5ce1e6) with subtle border effect
  - Positioned at top-right of bell icon (12px x 12px, absolute positioning)
  - CSS class: `.mobile-topbar-notifications-dot` with `z-index: 3`
- **Clear notifications button**:
  - Added "Clear" button at bottom of notifications list
  - Separated from list items with border-top
  - Clears all notifications from local state and closes menu
  - Styled consistently with notification items (hover/active states, design tokens)
  - Only shown when there are notifications to clear
- **Styling**:
  - All styling uses design tokens (colors, spacing, typography)
  - Menu matches three-dot options menu style exactly
  - Responsive width: `min-width: 280px`, `max-width: calc(100vw - (var(--space-lg) * 2))`
  - Max height: 400px with scrollable overflow
  - Time formatting: "Just now", "{X}m ago", "{X}h ago", "{X}d ago", or date string

### MobileTopbar component update & /gyms page implementation (latest)
- **MobileTopbar component update** (Figma node 764:3056):
  - Added new "gyms" icon (bar-chart-square-up) between profile and notifications icons
  - Updated icon gap from 8px to 16px (`var(--space-lg)`) - exact Figma value
  - Updated asset URLs to latest Figma versions
  - Gyms icon links to `/gyms` page
  - All icons use exact sizes: 40px containers, 24px icon sizes
  - Exact border radius values: 10px (profile inner), 14px (gyms/notifications containers)
  - Structure matches Figma design exactly with proper data-node-id attributes

- **/gyms page implementation** (Figma node 768:2698):
  - Created complete `/gyms` page with MobileTopbar and MobileNavbar components
  - Hidden header (DAB logo/logout) on `/gyms` page (added to `HIDDEN_HEADER_ROUTES`)
  - Main card container: "My Gyms" header with "Add Gym" button
  - **Gym detail cards** (Figma node 769:3192) with all sections:
    - **Top row**: "Peaking" pill (red background, exact Figma styling) and "42 online" indicator with live dot
    - **Gym info tile**: 60px gym logo, gym name (15px bold), location (14px medium), city (12px regular muted)
    - **Busy indicator**: Day selector dropdown, "LIVE" chip, bar chart with 16 bars (exact heights from Figma: 18px, 21px, 32px, 44px, 50px, 58px, etc.), time legend (6am, 1pm, 6pm, 12pm), peak indicator overlay, live indicator bar
    - **Friends climbing**: Grid of 6 friend avatars (60px each) with gradient overlays and names below (Anna, Marco, Yara, Finn, Lena, Max)
    - **CTA buttons**: "Unfollow" and "Join Chat" buttons (equal width, full row)
  - All styling uses exact Figma values: padding, spacing, colors, typography, border radius
  - Card uses `custom-scrollbar` class for vertical scrolling
  - Fetches gyms from Supabase `gyms` table with `id, name, avatar_url, area` fields
  - Currently displays placeholder data for online counts, peaking status, bar chart, friends (as requested)

- **Add Gym dropdown functionality**:
  - "Add Gym" button opens centered dropdown menu below button
  - Dropdown uses fixed positioning, centered on screen, overlays everything (z-index: 1000)
  - Styled like three-dot options menu (`mh-silver-dropdown-menu` classes)
  - Filters gyms to Munich only (or shows all if no Munich gyms)
  - **Gym selection tiles** (Figma nodes 484:1225, 484:1233, 484:1241) with 3 states:
    - **Default**: bg `#0c0e12` (surface/bg), no border
    - **Hover**: bg `#151927` (surface/card), shadow `0px 24px 70px rgba(0,0,0,0.45)`
    - **Focus**: bg `#151927` with border `#5ce1e6` (primary) and hover shadow
    - Each tile: 60px gym logo, gym name (15px bold), location (14px medium), city (12px regular muted)
    - Full width tiles in dropdown, rounded corners on first/last items
    - Exact spacing: 12px gap, 10px padding, 2px gap between text elements
  - Click handler adds selected gym to user's gyms list
  - Dropdown closes on selection
  - Click-outside-to-close functionality

- **Unfollow functionality**:
  - "Unfollow" button removes gym from user's list
  - **Confirmation dialog**: Shows `window.confirm('Are you sure you want to unfollow this gym?')` before removing
  - **Persistence**: Unfollowed gym IDs stored in localStorage (`dab_unfollowed_gyms`)
  - On page load, unfollowed gyms are filtered out from user's gyms list
  - Unfollowed gyms persist across page navigations
  - Unfollowed gyms still appear in "Add Gym" dropdown (can be re-added)
  - Re-adding a gym removes it from unfollowed list and adds back to user's gyms

- **CSS implementation**:
  - All gyms page CSS uses exact token values and pixel measurements from Figma
  - `.gyms-screen`, `.gyms-content`, `.gyms-card` structure matches other mobile pages
  - Full-width mobile topbar/navbar support
  - Custom scrollbar applied to gyms card for vertical scrolling
  - All gym detail card components have exact spacing, colors, typography from Figma
  - Bar chart bars use gradient backgrounds with exact heights
  - Friend avatars have individual positioning values from Figma for proper image cropping

### City filter bug fix on /chats page (latest)
- **Fixed city filter logic**:
  - **Issue**: When selecting a city like "Bad Tölz", Munich gym threads were incorrectly showing up in the filtered results
  - **Root cause**: City values from `gym.area` could contain full location strings like "Munich, Germany", and the filter logic wasn't properly normalizing and matching cities
  - **Solution**:
    - Added city normalization function that extracts the first part before comma (e.g., "Munich, Germany" → "Munich")
    - Cities are normalized when stored in `ChatListItem` (for both direct chats from profile city/homebase and gym threads from `gym.area`)
    - Filter options are normalized when extracting cities from items to avoid duplicates in dropdown
    - Filter comparison uses exact matching after normalization and lowercasing both sides
    - Removed partial matching logic that was causing incorrect cross-city matches
  - **Result**: City filter now works correctly - selecting "Bad Tölz" shows only chats from Bad Tölz, selecting "Munich" shows only Munich chats (including Munich gym threads)

### Gym detail card friend tiles fix (latest)
- **Removed Yara's friend tile**:
  - Yara's friend tile (the third friend tile, `data-node-id="769:3184"`) was removed from the gym detail card due to persistent display issues
  - The gym card now displays 5 friend tiles instead of 6 (Anna, Marco, Finn, Lena, Max)
- **Fixed friend tile display issues**:
  - **Issue**: After removing Yara's tile, Finn's tile (now in the third position) inherited the same blue overlay/display issues
  - **Root cause**: Friend image CSS was missing explicit properties to prevent browser default blue borders/backgrounds and ensure proper image visibility
  - **Solution**:
    - Added explicit CSS properties to `.gym-card-friend-img-4` (Finn's image): `z-index: 0`, `position: absolute`, `opacity: 1`, `visibility: visible`, `display: block`, `background: transparent`, `border: none`, `outline: none`, `box-shadow: none`
    - Removed Yara-specific CSS rules (`data-node-id="769:3184"`) and replaced with global rules for all friend tiles
    - Applied global CSS fixes to all friend images (`.gym-card-friend-img-1` through `.gym-card-friend-img-6`) to prevent blue overlays, borders, and display issues
    - Added `onError` handler to Finn's image to hide it if it fails to load (prevents broken image blue placeholder)
    - Ensured all friend image wrappers and backgrounds have `background: transparent`, `border: none`, `outline: none`, `box-shadow: none`
  - **CSS changes**:
    - Global rules applied to `.gym-card-friend .gym-card-friend-bg` and `.gym-card-friend .gym-card-friend-img-wrapper` to prevent blue backgrounds
    - Global rules for all friend image classes to ensure visibility and prevent browser default styling
    - Prevented browser default broken image styling (blue border/background) for all friend images
  - **Result**: All friend tiles now display correctly without blue overlays or display issues, using consistent global CSS rules
