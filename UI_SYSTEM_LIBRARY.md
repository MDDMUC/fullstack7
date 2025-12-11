---

## 🚨 CRITICAL RULE: NEVER IMPROVISE BUTTONS

**PRIORITY #1 RULE**: NEVER improvise, guess, or make up button components. ALWAYS:
1. Get the exact component from Figma using `get_design_context` with the Figma node ID
2. Use ONLY the code structure and classes from Figma
3. Convert Tailwind classes to CSS exactly as they appear in Figma
4. Use exact tokens and values - no approximations
5. If you don't have the Figma component, ASK the user - never create your own

**This applies to ALL buttons**: DAB, CTA, navlink, chip, tag, pill, field, etc.

### 🎯 DAB BUTTON SPECIFIC RULE

**CRITICAL**: The DAB button for mobile MUST use the exact SVG files from `/public/icons/`:
- **Default state**: `/icons/button.dab-default.svg` (117×38px)
- **Hover state**: `/icons/button.dab-hover.svg` (121×42px)
- **Focus state**: `/icons/button.dab-focus.svg` (117×38px)

**NEVER**:
- ❌ Create your own DAB button design
- ❌ Use `/dab-logo.svg` or any other logo file
- ❌ Build the button with CSS/borders - use the SVG files directly
- ❌ Improvise or approximate the button appearance

**ALWAYS**:
- ✅ Use the three SVG files listed above
- ✅ Implement hover and focus states using these exact SVGs
- ✅ Check `/public/icons/` folder for button SVG files

---

## 📱 Mobile Home Screen (node 633:14303) — Supersedes prior usercard/mobile docs

- **Figma Frame**: `/ home` `633:14303` (02_COMPONENTS)
- **Code**: `src/app/home/page.tsx`
- **Styles**: `src/app/globals.css` (`.home-*`), uses new tokenized button classes (`.button-cta`, `.button-ghost`, `.button-dab`, etc.)
- **Extraction**: `get_variable_defs`, `get_design_context` (forceCode:true), `get_screenshot`

### ⚠️ CRITICAL: Special Chips Display Rules

**ALWAYS display climbing style and grade from Supabase onboarding profiles:**
- **Climbing Styles**: Always displayed from `profile.style` field (comma-separated or array)
- **Climbing Grade**: Always displayed from `profile.grade` field when available
- These are displayed as tags (`.button-tag` and `.button-tag-grade`)

**Special Chips with Unique Styling:**
The `Button.Chip` component in Figma has special variants that MUST use their specific styling:

1. **PRO Chip** (`.button-chip-pro`):
   - Background: `#0c0e12` (color/bg)
   - Border: `1px solid #ff7b7b` (color/red)
   - Text: `#ff7b7b` (color/red)
   - Detected by: chip text contains "pro" (but not "founder" or "crew")

2. **Founder Chip** (`.button-chip-founder`):
   - Background: `#0c0e12` (color/bg)
   - Border: `1px solid #ff9500` (color/special)
   - Text: **Gradient** `linear-gradient(90deg, #ffd166, #ff7b7b)` (gold to red)
   - Text must be wrapped in `<span>` for gradient to work
   - Detected by: chip text contains "founder"

3. **Crew Chip** (`.button-chip-crew`):
   - Background: `#0c0e12` (color/bg)
   - Border: `1px solid #ff9500` (color/special)
   - Text: **Gradient** `linear-gradient(90deg, #ffd166, #ff7b7b)` (gold to red)
   - Text must be wrapped in `<span>` for gradient to work
   - Detected by: chip text contains "crew"

4. **Belay Certified Chip** (`.button-chip-belay`):
   - Background: `#0c0e12` (color/bg)
   - Border: `1px solid #5ce1e6` (color/primary)
   - Text: `#5ce1e6` (color/primary)
   - Border-radius: `999px` (pill shape, not chip shape)
   - Detected by: chip text contains "belay"

**Implementation Notes:**
- Check chips in this order: PRO → Founder → Crew → Belay Certified → default/focus
- Founder and Crew chips require wrapping text in `<span>` for gradient effect
- All special chips use `#0c0e12` background (color/bg), not card or panel color
- See `Button.Chip` component in Figma (02_COMPONENTS) for all variants

### Key Token Values (exact)

| Element | Value |
| --- | --- |
| Page padding | 16px |
| Filters | bg `#e9eef7`, border `1px solid #8ea0bd`, radius `10px`, padding `10px 12px`, text `15px 400` muted |
| Card | bg `#0c0e12`, border `4px solid #5ce1e6`, radius `14px`, padding `24px`, gap `12px`, shadow `0px 20px 60px rgba(0,0,0,0.4)` |
| Image wrapper | height `500px`, padding `4px`, border `4px solid #5ce1e6`, radius `14px` |
| Overlay | gradient to bottom (`rgba(0,0,0,0)` → `rgba(0,0,0,0.75)`), padding `32px 12px 12px 12px`, gap `6px`, radius `14px` |
| Name/age | `32px` heading/md, weights 800/400, color `#fff`, gap `8px` |
| Location | `16px 500`, color `#e9eef7` |
| Tags | `.button-tag` bg `rgba(92,225,230,0.08)`, text `#5ce1e6`, radius `999px`, padding `6px 10px`, min-width 88px; grade text `#e68fff` |
| Chips | `.fc-chip` family (panel/card/stroke tokens), padding uses spacing tokens, radius `var(--radius-sm)`, text `var(--font-pill-size)` |
| Bio | bg `#1f2633`, padding `12px 16px`, radius `14px`, text `14px 500` color `#8ea0bd`, inset shadow `inset 4px 4px 4px rgba(0,0,0,0.5)` |
| CTA row | gap `12px` |
| Next button | bg `#151927`, radius `10px`, padding `10px 16px`, text `15px 700` color `#e9eef7` |
| Dab button | border `1px solid #5ce1e6`, radius `10px`, height `38px`, padding `10px 16px`, logo 22×36.5 rotated 180° + flipY |
| Bottom nav | bg `#e9eef7`, radius top `14px`, padding `12px 24px`, icon `26px`, label `10px 400` color `#1f2633`, active color `#5ce1e6`, unread dot `6px` cyan |

### CSS Classes (home)

`home-screen`, `home-content`, `home-filters`, `filter-pill`, `home-card`, `home-card-header`, `home-image-wrapper`, `home-image-overlay`, `home-name-row`, `home-name`, `home-age`, `home-location`, `home-chips-row`, `home-bio`, `home-bio-text`, `home-bio-shadow`, `home-cta-row`, `home-btn-next`, `home-btn-dab`, `home-bottom-nav`, `home-bottom-row`, `home-bottom-item`, `home-bottom-active`, `home-bottom-icon`, `home-bottom-label`, `home-bottom-dot`.

### Structure

```
home-screen
└─ home-content (max-w 420, gap 16)
   ├─ home-filters (city, style, gym, time)
   ├─ home-card (bg #0c0e12, border 4px #5ce1e6, radius 14, p24, gap 12)
   │  ├─ header: PRO chip, Online pill
   │  ├─ main:
   │  │  ├─ image wrapper h500, p4, border 4px cyan, radius 14
   │  │  │   └─ overlay gradient, pt32 pb12 px12 gap6, name/age, location, chips
   │  │  └─ bio bg stroke, p12x16, inset shadow
   │  └─ cta row gap12: next (panel), dab (border)
   └─ bottom nav bg #e9eef7 radius-top 14 p12x24: profile, events, chats (dot), dab active
```

---

## 💬 Chats Home Screen (node 633:14116)

- **Figma Frame**: `/ chats` `633:14116` (02_COMPONENTS)
- **Code**: `src/app/chats/page.tsx`
- **Styles**: `src/app/globals.css` (`.chats-*`), uses tokenized chips/pills/buttons (no megabtn references)
- **Extraction**: `get_variable_defs`, `get_design_context` (forceCode:true), `get_screenshot`

### Key Token Values (exact)

| Element | Value |
| --- | --- |
| Page bg | `#e9eef7` (color/text) |
| Page padding | 16px (space/lg) |
| Top nav filters | gap `6px`, width `358px`, pills: bg `#e9eef7`, border `1px solid #8ea0bd`, radius `10px`, padding `10px 12px`, text `15px 400` muted |
| Chat card | bg `#ffffff`, radius `24px`, padding `24px`, gap `12px`, shadow `0px 20px 60px rgba(0,0,0,0.4)` |
| Chat preview | height `60px`, gap `0px` |
| Avatar | size `60px`, radius `10px`, bg `#e9eef7` |
| Title | `16px 800` (heading/xs), color `#11141c` (color/panel) |
| Subtitle | `14px 500` (body/sm), color `#8ea0bd` (color/muted) |
| Text gap | `6px` (space/xs) |
| Unread badge | `12px`, position `left: 43px, top: 6px`, cyan `#5ce1e6` |
| Divider | height `0px`, line color `#8ea0bd` |
| Bottom nav | Same as home screen, chats active (cyan icon + label) |

### CSS Classes (chats)

`chats-screen`, `chats-content`, `chats-topnav`, `chats-filter-pill`, `chats-filter-pill-inner`, `chats-filter-text`, `chats-filter-chevron`, `chats-chevron-img`, `chats-card`, `chats-preview`, `chats-preview-cont`, `chats-avatar-wrapper`, `chats-avatar-bg`, `chats-avatar-img`, `chats-text`, `chats-title`, `chats-subtitle`, `chats-unread-badge`, `chats-badge-img`, `chats-divider`, `chats-divider-img`, `chats-bottom-nav`, `chats-bottom-row`, `chats-bottom-item`, `chats-bottom-active`, `chats-bottom-icon-container`, `chats-nav-icon-wrapper`, `chats-nav-icon-inner-*`, `chats-nav-icon-img`, `chats-bottom-dot`, `chats-bottom-label`.

### Structure

```
chats-screen (bg #e9eef7)
└─ chats-content (gap 16, p16, pb0)
   ├─ chats-topnav (gap 6, w358): gym, event, personal filters
   ├─ chats-card (bg #ffffff, radius 24, p24, gap 12, shadow)
   │  ├─ chats-preview (h60, gap 0)
   │  │  ├─ avatar (60px, radius 10)
   │  │  ├─ text (gap 6): title (16px 800), subtitle (14px 500)
   │  │  └─ unread-badge (12px, left 43px, top 6px) [optional]
   │  └─ divider (h0, line #8ea0bd)
   │  └─ [repeat previews...]
   └─ chats-bottom-nav (same as home, chats active)
```

### Navigation

- All navbar items use Next.js `Link` components:
  - Profile → `/profile`
  - Events → `/events`
  - Chats → `/chats` (active on chats page)
  - Dab → `/home` (active on home page)

### SVG Files Used

- `/icons/Color.svg` - Chevron down icon for filters (12×8px)
- `/icons/divider-line.svg` - Horizontal divider line (310×1px)
- `/icons/unread-badge.svg` - Unread notification badge (52×38px, clipped to 12px)
- Navbar icons: same as home screen (`face-content.svg`, `announcement-01.svg`, `message-chat-square.svg`, `flash.svg`)

---

# DAB UI System Library

This document serves as a comprehensive reference for the DAB design system, with **EXACT values extracted directly from Figma**.

---

## 🚨 CRITICAL: NEVER CREATE YOUR OWN ICONS OR SVGs

**ABSOLUTE RULE - NO EXCEPTIONS:**

- ❌ **NEVER** create, design, or improvise icons or SVG graphics
- ❌ **NEVER** use placeholder SVGs or guessed icon paths
- ❌ **NEVER** use icon libraries (Heroicons, etc.) unless explicitly specified in Figma
- ✅ **ALWAYS** use exact SVG files provided by the user (typically in `/public/icons/`)
- ✅ **ALWAYS** ask the user to provide SVG files if they're not available
- ✅ **ALWAYS** reference SVG files directly: `<img src="/icons/filename.svg" />`

**If you don't find a component or don't know how it looks:**
1. **STOP** - Do not create anything
2. **ASK** the user to provide the SVG file locally
3. **WAIT** for the user to provide the exact file
4. **USE** only the provided file

**This rule applies to:**
- Navigation icons
- Button icons
- Status indicators
- Decorative elements
- Any visual graphic element

---

## 🚨 CRITICAL: Figma Implementation Workflow

**READ THIS FIRST.** This workflow ensures pixel-perfect implementation from Figma designs.

### The Problem

Screenshots and visual inspection lead to "translation errors" - approximating values instead of using exact ones. This creates UI that looks "close" but never matches the design.

### The Solution: Direct Extraction Method

**NEVER** interpret or estimate values from screenshots. **ALWAYS** extract exact values using these tools:

### Step 1: Get Design Tokens

```
mcp_Figma_Desktop_get_variable_defs({ nodeId: "XXX-XXXX" })
```

**Returns exact token values:**
```json
{
  "color/accent": "#5ce1e6",
  "space/md": "12",
  "radius/lg": "14",
  "button/padding/md": "10"
}
```

### Step 2: Get Design Context (Tailwind Output)

```
mcp_Figma_Desktop_get_design_context({ 
  nodeId: "XXX-XXXX",
  forceCode: true 
})
```

**Returns exact Tailwind classes with pixel values:**
```jsx
<div className="bg-[#151927] border border-[#1f2633] rounded-[14px] w-[420px]">
  <div className="flex flex-col gap-[12px] p-[20px]">
    <div className="px-[10px] py-[6px] rounded-[999px] text-[12px]">
```

### Step 3: Screenshot (Visual Reference ONLY)

```
mcp_Figma_Desktop_get_screenshot({ nodeId: "XXX-XXXX" })
```

**Use ONLY to verify final result matches** - NOT as source for measurements.

### Step 4: Transcribe (Not Translate)

Extract values directly from the Tailwind output:

| Tailwind Class | CSS Property |
|----------------|--------------|
| `bg-[#151927]` | `background: #151927` |
| `border-[#1f2633]` | `border-color: #1f2633` |
| `rounded-[14px]` | `border-radius: 14px` |
| `gap-[12px]` | `gap: 12px` |
| `p-[20px]` | `padding: 20px` |
| `px-[10px]` | `padding-left: 10px; padding-right: 10px` |
| `py-[6px]` | `padding-top: 6px; padding-bottom: 6px` |
| `text-[12px]` | `font-size: 12px` |
| `font-bold` | `font-weight: 700` |
| `font-normal` | `font-weight: 400` |
| `basis-0 grow` | `flex: 1 0 0` |

### Step 5: Store in Library

Save the Tailwind classes in this document for future reference:

```tailwind
/* COMPONENT NAME (node XXX:XXXX) */
bg-[#value] border border-[#value] rounded-[Xpx] ...
```

### Step 6: Write CSS with Exact Values

```css
/* WRONG - using variables or approximations */
.component {
  background: var(--color-card);
  padding: 8px 12px;  /* "close enough" */
}

/* RIGHT - exact values from Figma */
.component {
  background: #151927;
  padding: 6px 10px;  /* exact from py-[6px] px-[10px] */
}
```

### Common Figma-to-CSS Mappings

| Figma Token | CSS Variable | Exact Value |
|-------------|--------------|-------------|
| color/bg | --color-bg | #0c0e12 |
| color/panel | --color-panel | #11141c |
| color/card | --color-card | #151927 |
| color/stroke | --color-stroke | #1f2633 |
| color/accent | --color-accent | #5ce1e6 |
| color/accent2 | --color-accent2 | #e68fff |
| color/muted | --color-muted | #8ea0bd |
| color/text | --color-text | #e9eef7 |
| space/xxs | 4px | 4px |
| space/xs | 6px | 6px |
| space/sm | 8px | 8px |
| space/md | 12px | 12px |
| space/lg | 16px | 16px |
| space/xxl | 32px | 32px |
| button/padding/xs | 6px | 6px |
| button/padding/sm | 8px | 8px |
| button/padding/md | 10px | 10px |
| button/padding/xxl | 16px | 16px |
| button/padding/xxxxl | 20px | 20px |
| radius/sm | 6px | 6px |
| space/sm (as radius) | 8px | 8px (chips use this) |
| radius/md | 10px | 10px |
| radius/lg | 14px | 14px |
| radius/circle | 999px | 999px |

### Checklist Before Implementation

- [ ] Called `get_variable_defs` for the node
- [ ] Called `get_design_context` with `forceCode: true`
- [ ] Extracted exact pixel values from Tailwind classes
- [ ] NOT using approximations or "close enough" values
- [ ] Stored Tailwind classes in this library
- [ ] CSS uses exact hex colors (not variables unless verified)

---

## Source of Truth

All values in this document are extracted from Figma file `DAB-Build` using the Figma MCP tools.

**RULE: Always use these exact values. No interpretation or "close enough" values.**

## Table of Contents
- [Figma Implementation Workflow](#-critical-figma-implementation-workflow)
- [Design Tokens (Exact from Figma)](#design-tokens-exact-from-figma)
- [Typography](#typography)
- [Components](#components)
- [Patterns](#patterns)
- [Tailwind Classes from Figma](#tailwind-classes-from-figma-store-for-reference)
- [CSS Conventions](#css-conventions)

---

## Design Tokens (Exact from Figma)

**All values extracted directly from Figma file `DAB-Build` using `get_variable_defs`**

- Token naming is now `--color-primary` / `--color-secondary` (old `accent`/`accent2` aliases were removed). Compatibility aliases that remain: `--color-bg`, `--color-panel`, `--color-card`, `--color-stroke`, `--color-text`, `--color-muted`, `--color-text-dark`, `--color-yellow`, `--color-special`, `--color-red`. New tokens: `--color-accent-warm-cream` (events gradients) and `--radius-card` (24px). Shorthand aliases (`--text`, `--stroke`, `--bg`, `--panel`, `--card`) have been removed after migration.

---

### Colors (Complete Palette)

#### Background Colors
| Token | Value | Usage |
|-------|-------|-------|
| `color/bg` | `#0c0e12` | Main app background |
| `color/bg/base` | `#0C0E12` | Base background |
| `color/panel` | `#11141c` | Panel backgrounds, chip backgrounds |
| `color/bg/panel` | `#11141C` | Panel backgrounds (alias) |
| `color/card` | `#151927` | Card backgrounds |
| `color/bg/card` | `#151927` | Card backgrounds (alias) |
| `greys/100` | `#FAFAFA` | Light/silver backgrounds |

#### Text Colors
| Token | Value | Usage |
|-------|-------|-------|
| `color/text` | `#e9eef7` | Primary text (light) |
| `color/text/base` | `#E9EEF7` | Primary text (alias) |
| `color/text/highlight` | `#FFFFFF` | Highlighted/white text |
| `color/text/muted` | `#8EA0BD` | Secondary/muted text |
| `color/muted` | `#8ea0bd` | Muted text (alias) |
| `color/text/dark` | `#5B687C` | Dark/inactive text |

#### Accent Colors
| Token | Value | Usage |
|-------|-------|-------|
| `color/accent` | `#5ce1e6` | Primary accent (cyan) |
| `color/primary` | `#5ce1e6` | Primary color (alias for accent) |
| `color/brand/primary` | `#5CE1E6` | Brand primary (alias) |
| `color/accent2` | `#e68fff` | Secondary accent (pink/purple) |
| `color/secondary` | `#e68fff` | Secondary color (alias for accent2) |
| `color/special` | `#ff9500` | Special/founder (orange) |
| `color/red` | `#ff7b7b` | Error/PRO badge/peaking state (red) |
| `color/yellow` | `#ffd166` | Warning/busy state (gold/yellow) |
| `color/white` | `#ffffff` | White text/backgrounds |
| `color/darker` | `#5b687c` | Darker text (inactive states) |

#### Border/Stroke Colors
| Token | Value | Usage |
|-------|-------|-------|
| `color/stroke` | `#1f2633` | Default borders and dividers |
| `color/button/stroke` | `#1F2633` | Button borders (alias) |

```css
/* CSS Variables - Complete Color Palette */
:root {
  /* Backgrounds */
  --color-bg: #0c0e12;
  --color-panel: #11141c;
  --color-card: #151927;
  --color-silver: #FAFAFA;
  
  /* Text */
  --color-text: #e9eef7;
  --color-text-highlight: #FFFFFF;
  --color-text-muted: #8ea0bd;
  --color-text-dark: #5b687c;
  
  /* Accents */
  --color-accent: #5ce1e6;
  --color-primary: #5ce1e6;  /* alias */
  --color-accent2: #e68fff;
  --color-secondary: #e68fff;  /* alias */
  --color-special: #ff9500;
  --color-red: #ff7b7b;
  --color-yellow: #ffd166;
  --color-white: #ffffff;
  --color-darker: #5b687c;
  
  /* Borders */
  --color-stroke: #1f2633;
}
```

---

### Spacing (Complete Scale)

| Token | Value | CSS Variable | Usage |
|-------|-------|--------------|-------|
| `space/xxxs` | `2px` | `--space-xxxs` | Micro spacing |
| `space/xxs` | `4px` | `--space-xxs` | Tiny gaps |
| `space/xs` | `6px` | `--space-xs` | Small gaps, bio gap |
| `space/sm` | `8px` | `--space-sm` | CTA row gap, default gap |
| `space/md` | `12px` | `--space-md` | Inner container gap |
| `space/lg` | `16px` | `--space-lg` | Content padding, section gap |
| `space/xl` | `24px` | `--space-xl` | Large section padding |
| `space/xxl` | `32px` | `--space-xxl` | Extra large padding |
| `space/mobilesafezonetop` | `44px` | `--space-safe-top` | Mobile safe area |

```css
:root {
  --space-xxxs: 2px;
  --space-xxs: 4px;
  --space-xs: 6px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-xxl: 32px;
  --space-safe-top: 44px;
}
```

---

### Button Padding (Complete Scale)

| Token | Value | CSS Variable | Usage |
|-------|-------|--------------|-------|
| `button/padding/xs` | `6px` | `--btn-pad-xs` | Vertical for pills/chips |
| `button/padding/sm` | `8px` | `--btn-pad-sm` | Horizontal for chips |
| `button/padding/md` | `10px` | `--btn-pad-md` | Vertical for buttons |
| `button/padding/xxl` | `16px` | `--btn-pad-xxl` | Horizontal for buttons |
| `button/padding/xxxl` | `18px` | `--btn-pad-xxxl` | Large CTA button horizontal |
| `button/padding/xxxxl` | `20px` | `--btn-pad-xxxxl` | Card/container inner padding |

**CTA Large Button (button.cta-lg)**: Uses `py-[12px]` (space/md) + `px-[18px]` (button/padding/xxxl)

```css
:root {
  --btn-pad-xs: 6px;
  --btn-pad-sm: 8px;
  --btn-pad-md: 10px;
  --btn-pad-xxl: 16px;
  --btn-pad-xxxl: 18px;
  --btn-pad-xxxxl: 20px;
}
```

---

### Border Radius (Complete Scale)

| Token | Value | CSS Variable | Usage |
|-------|-------|--------------|-------|
| `radius/sm` | `6px` | `--radius-sm` | Small radius (from token) |
| `space/sm` (as radius) | `8px` | `--radius-chip` | Chips use space/sm as radius |
| `radius/md` | `10px` | `--radius-md` | Buttons, inputs |
| `radius/lg` | `14px` | `--radius-lg` | Cards, images |
| `radius/circle` | `999px` | `--radius-circle` | Pills, tags, avatars |

**Note**: Chips use `space/sm` (8px) as their border radius, not `radius/sm` (6px).

```css
:root {
  --radius-sm: 6px;
  --radius-chip: 8px;  /* space/sm used as radius for chips */
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-circle: 999px;
}
```

---

### Shadows & Effects (Complete Set)

| Token | Type | Value | Usage |
|-------|------|-------|-------|
| `shadow/base` | DROP_SHADOW | `0px 20px 60px rgba(0,0,0,0.4)` | Card shadows |
| `shadow/hover` | DROP_SHADOW | `0px 24px 70px rgba(0,0,0,0.45)` | Hover state |
| `shadow/small` | DROP_SHADOW | `0px 2px 2px rgba(0,0,0,0.4)` | Small elements, button hover |
| `shadow/glow` | DROP_SHADOW | `0px 0px 20px rgba(92,225,230,0.4)` | Accent glow |
| `shadow/superglow` | DROP_SHADOW | `0px 0px 10px 10px rgba(92,225,230,0.4)` | Accent super glow |
| `shadow/inner` | INNER_SHADOW | `inset 4px 4px 4px rgba(0,0,0,0.5)` | Inset effects |
| `shadow/navbarmobile` | DROP_SHADOW | `0px -4px 4px rgba(0,0,0,0.25)` | Mobile navbar |
| `inner/lightfill` | INNER_SHADOW | `inset 0px 0px 0px 4px rgba(92,225,230,0.08)` | Light fill inner effect |

```css
:root {
  /* Drop Shadows */
  --shadow-base: 0px 20px 60px 0px rgba(0, 0, 0, 0.4);
  --shadow-hover: 0px 24px 70px 0px rgba(0, 0, 0, 0.45);
  --shadow-small: 0px 2px 2px 0px rgba(0, 0, 0, 0.4);
  --shadow-navbar-mobile: 0px -4px 4px 0px rgba(0, 0, 0, 0.25);
  
  /* Glow Effects */
  --shadow-glow: 0px 0px 20px 0px rgba(92, 225, 230, 0.4);
  --shadow-superglow: 0px 0px 10px 10px rgba(92, 225, 230, 0.4);
  --shadow-dab-glow: 0px 0px 20px 0px rgba(92, 225, 230, 0.4);
  --shadow-dab-glow-hover: 0px 0px 30px 0px rgba(92, 225, 230, 0.6);
  
  /* Inner Shadows */
  --shadow-inner: inset 4px 4px 4px 0px rgba(0, 0, 0, 0.5);
  --inner-lightfill: inset 0px 0px 0px 4px rgba(92, 225, 230, 0.08);
}
```

---

### Gradients (Complete Set from Figma)

#### Brand Gradients

| Name | CSS Value | Angle | Usage |
|------|-----------|-------|-------|
| Brand CTA | `linear-gradient(120deg, #5ce1e6, #e68fff)` | 120° | CTA buttons |
| Brand Horizontal | `linear-gradient(90deg, #5ce1e6, #e68fff)` | 90° | DAB button fill |
| Brand Modal | `linear-gradient(140deg, rgba(92,225,230,0.3), rgba(230,143,255,0.3))` | 140° | Modal backgrounds |
| Brand Hero | `linear-gradient(130deg, rgba(92,225,230,0.08), rgba(230,143,255,0.08))` | 130° | Hero sections |

#### Overlay Gradients

| Name | CSS Value | Direction | Usage |
|------|-----------|-----------|-------|
| Card Overlay | `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.75))` | Top→Bottom | Profile image overlay |
| Match Card | `linear-gradient(180deg, transparent, rgba(0,0,0,0.55))` | Top→Bottom | Match card meta overlay |
| Hero Overlay | `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7))` | Top→Bottom | Hero image fade |

#### Silver/Gray Colors (Tier Styling)

| Name | Value | Usage |
|------|-------|-------|
| Silver Border | `#e6e6e6` | Silver tier card borders (4px) |
| Silver Background | `#FAFAFA` | Silver tier card background (greys/100) |
| Dark Silver Text | `#11141c` | Bio text on silver backgrounds |

#### Decorative Radial Gradients

| Name | CSS Value | Usage |
|------|-----------|-------|
| Page Background | `radial-gradient(circle at 25% 20%, rgba(92,225,230,0.14), transparent 36%), radial-gradient(circle at 78% 12%, rgba(230,143,255,0.12), transparent 32%), radial-gradient(circle at 60% 82%, rgba(230,143,255,0.1), transparent 45%)` | Main page glow effects |
| Swipe Layout | `radial-gradient(circle at 20% 20%, rgba(92,225,230,0.08), transparent 32%), radial-gradient(circle at 80% 10%, rgba(230,143,255,0.08), transparent 28%)` | Swipe view background |

#### Special Text Gradients

| Name | CSS Value | Usage |
|------|-----------|-------|
| Founder/Crew | `linear-gradient(90deg, #ffd166, #ff7b7b)` | Gold→Red text for founder badges |

#### Activity Bar Gradients

| Name | CSS Value | Usage |
|------|-----------|-------|
| Busy Bar | `linear-gradient(180deg, rgba(92,225,230,0.12), rgba(92,225,230,0.32))` | Activity level bars |
| Busy Bar Live | `linear-gradient(180deg, rgba(230,143,255,0.2), rgba(92,225,230,0.6))` | Live activity indicator |

```css
:root {
  /* Brand Gradients */
  --gradient-brand: linear-gradient(120deg, #5ce1e6, #e68fff);
  --gradient-brand-horizontal: linear-gradient(90deg, #5ce1e6, #e68fff);
  --gradient-brand-modal: linear-gradient(140deg, rgba(92,225,230,0.3), rgba(230,143,255,0.3));
  --gradient-brand-hero: linear-gradient(130deg, rgba(92,225,230,0.08), rgba(230,143,255,0.08));
  
  /* Overlay Gradients */
  --gradient-overlay: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.75));
  --gradient-overlay-hero: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7));
  --gradient-overlay-match: linear-gradient(180deg, transparent, rgba(0,0,0,0.55));
  
  /* Silver/Gray */
  --color-silver-border: #e6e6e6;
  --color-silver-bg: #FAFAFA;
  --color-dark-silver-text: #11141c;
  
  /* Text Gradients */
  --gradient-founder: linear-gradient(90deg, #ffd166, #ff7b7b);
  
  /* Activity Gradients */
  --gradient-busy-bar: linear-gradient(180deg, rgba(92,225,230,0.12), rgba(92,225,230,0.32));
  --gradient-busy-bar-live: linear-gradient(180deg, rgba(230,143,255,0.2), rgba(92,225,230,0.6));
  
  /* Page Background Glows */
  --gradient-page-glow: radial-gradient(circle at 25% 20%, rgba(92,225,230,0.14), transparent 36%),
                        radial-gradient(circle at 78% 12%, rgba(230,143,255,0.12), transparent 32%),
                        radial-gradient(circle at 60% 82%, rgba(230,143,255,0.1), transparent 45%);
}
```

---

## Typography

### Font Families

| Token | Value |
|-------|-------|
| Primary | `'Inter', sans-serif` |
| Display | `'Metal Mania', cursive` |

```css
:root {
  --font-inter: 'Inter', sans-serif;
  --font-display: 'Metal Mania', cursive;
}
```

### Text Styles (Complete Set from Figma)

#### Body Text
| Token | Font | Size | Weight | Line-Height | Usage |
|-------|------|------|--------|-------------|-------|
| `body/xxs` | Inter | 10px | 400 (Regular) | 100% | Nav labels, tiny text |
| `body/xs` | Inter | 12px | 400 (Regular) | 100% | Pills, chips, tags |
| `body/sm` | Inter | 14px | 500 (Medium) | 100% | Bio text, descriptions |
| `body/base` | Inter | 16px | 500 (Medium) | 100% | Body text, location |
| `body/lg` | Inter | 18px | 600 (Semi Bold) | 100% | Subheadings, card titles |
| `body/xl` | Inter | 20px | 700 (Bold) | 100% | Section headers |

#### Headings
| Token | Font | Size | Weight | Line-Height | Letter-Spacing | Usage |
|-------|------|------|--------|-------------|----------------|-------|
| `heading/sm` | Inter | 20px | 800 (Extra Bold) | 100% | 0 | Small headings, names |
| `heading/md` | Inter | 32px | 800 (Extra Bold) | 100% | -0.16px | Medium headings |
| `heading/xl` | Inter | 52px | 800 (Extra Bold) | 100% | -0.16px | Hero titles |

#### Special Text
| Token | Font | Size | Weight | Line-Height | Usage |
|-------|------|------|--------|-------------|-------|
| `age` | Inter | 18px | 400 (Regular) | 100% | Age display next to name |
| `pill/base` | Inter | 12px | 700 (Bold) | 100% | Pill/tag text |
| `button/base` | Inter | 15px | 700 (Bold) | 100% | Button text |
| `field/base` | Inter | 15px | 400 (Regular) | 100% | Input field text/placeholder |

#### Uppercase Text
| Usage | Font | Size | Weight | Transform |
|-------|------|------|--------|-----------|
| Eyebrow text | Inter | 14px | 700 (Bold) | uppercase |

```css
/* Typography CSS */
.text-xxs { font-size: 10px; font-weight: 400; }
.text-xs { font-size: 12px; font-weight: 400; }
.text-sm { font-size: 14px; font-weight: 500; }
.text-base { font-size: 16px; font-weight: 500; }
.text-lg { font-size: 18px; font-weight: 600; }
.text-xl { font-size: 20px; font-weight: 700; }
.text-age { font-size: 18px; font-weight: 400; }
.heading-sm { font-size: 20px; font-weight: 800; }
.heading-md { font-size: 32px; font-weight: 800; letter-spacing: -0.16px; }
.heading-xl { font-size: 52px; font-weight: 800; letter-spacing: -0.16px; }
.text-pill { font-size: 12px; font-weight: 700; }
.text-button { font-size: 15px; font-weight: 700; }
.text-field { font-size: 15px; font-weight: 400; }
.text-eyebrow { font-size: 14px; font-weight: 700; text-transform: uppercase; }
```

---

### Font Families (From Figma)

| Token | Value |
|-------|-------|
| Primary | `'Inter', sans-serif` |
| Display | `'Metal Mania', cursive` |

```css
--font-inter: 'Inter', sans-serif;
--font-metalmania: 'Metal Mania', cursive;
```

### Text Styles (Exact from Figma get_variable_defs)

| Token | Font | Size | Weight | Line-Height |
|-------|------|------|--------|-------------|
| `body/xs` | Inter | 12px | 400 (Regular) | 100% |
| `body/base` | Inter | 16px | 500 (Medium) | 100% |
| `pill/base` | Inter | 12px | 700 (Bold) | 100% |
| `button/base` | Inter | 15px | 700 (Bold) | 100% |
| `heading/sm` | Inter | 20px | 800 (Extra Bold) | 100% |
| `age` | Inter | 18px | 400 (Regular) | 100% |

---

## Megabutton Component System

**Unified button/pill/tag/chip system extracted from Figma `megabutton` component**

All interactive elements use the `.megabtn` base class with variant modifiers.

### Button Variants (Large - 15px font)

| Class | Figma Node | Description | Padding | Radius | States |
|-------|------------|-------------|---------|--------|--------|
| `.button-cta` | button.cta (node 633:13958) | Gradient fill accent2→accent, dark text | 10px 16px | 10px | Default: gradient fill, Hover: border #5ce1e6 + shadow/small, Focus: border #5ce1e6 |
| `.button-ghost` | button.ghost (node 633:13977) | Transparent, muted border (default), stroke hover, primary focus + inner lightfill | 10px 16px | 10px | Default border: #8ea0bd, Hover border: #1f2633, Focus: border #5ce1e6 + inset 0 0 0 4px rgba(92,225,230,0.08) |
| `.button-navlink` | button.navlink (node 633:13974) | Transparent default, card hover, cyan focus | 10px 16px | 10px | Default: text #8ea0bd; Hover: bg #151927 text #e9eef7; Focus: bg rgba(92,225,230,0.5) text #5ce1e6 + inset 0 0 0 4px rgba(92,225,230,0.08) |
| `.button-activitylog` | button.activitylog (node 633:13980) | Card bg, muted text; focus adds primary border + inner lightfill | 10px 16px | 10px | Default: bg #151927 text #8ea0bd border #1f2633; Hover: text #e9eef7; Focus: bg #0c0e12 text #5ce1e6 border #5ce1e6 + inset 4px rgba(92,225,230,0.08) |
| `.button-radio` | button.radio (node 633:13983) | Radio row with icon + label | 10px 16px | 10px | Default: bg #0c0e12 text #8ea0bd border #1f2633; Hover: bg #151927 text #e9eef7; Focus: bg #0c0e12 text #5ce1e6 border #5ce1e6 + inset 4px rgba(92,225,230,0.08) |
| `.button-footerlink` | button.footerlink (node 633:13962) | Footer text link | 10px 16px | 10px | Default: text #8ea0bd; Hover: text #e9eef7; Focus: text #5ce1e6 + inset 4px rgba(92,225,230,0.08) |
| `.button-dab` | button.dab (node 633:13997) | Gradient outline + DAB mark | 10px 16px | 10px | Default/focus: gradient accent2→accent, border #5ce1e6; Hover: gradient accent→accent2 + shadow/small; Focus: border #5ce1e6 |
| `.megabtn-cardaction` | button.cardaction | Icon-only action button | 0px | 14px | 42px × 38px, bg: #11141c |
| `.megabtn-cardaction-cancel` | button.cardaction cancel | Cancel/X icon variant | 0px | 14px | Same as base |
| `.megabtn-cardaction-addfriend` | button.cardaction addfriend | Add friend icon variant | 0px | 14px | Same as base |
| `.megabtn-cardaction-message` | button.cardaction message | Message icon variant | 0px | 14px | Same as base |

```css
/* CTA Button (button.cta — node 633:13958) */
.button-cta {
  min-width: 117px;
  padding: 10px 16px; /* py: button/padding/md, px: button/padding/xxl */
  border: none;
  border-radius: 10px; /* radius/md */
  background-image: linear-gradient(247.35416303387024deg, #e68fff 11.557%, #5ce1e6 87.691%);
  font-size: 15px; /* button/base */
  font-weight: 700;
  color: #0c0e12; /* color/bg */
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}

.button-cta:hover:not(:disabled) {
  border: 1px solid #5ce1e6; /* color/primary */
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.4); /* shadow/small */
}

.button-cta:focus-visible {
  outline: none;
  border: 1px solid #5ce1e6; /* color/primary */
}

.button-cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tailwind extract (exact from get_design_context 633:13958)
   Default: content-stretch flex flex-col items-start relative w-[117px] ; inner: px-[var(---xxl,16px)] py-[var(---md,10px)] rounded-[var(---md,10px)] bg gradient accent2→accent
   Hover: container adds shadow-[0px_2px_2px_0px_rgba(0,0,0,0.4)] ; inner adds border-[var(---primary,#5ce1e6)]
   Focus: inner adds border-[var(---primary,#5ce1e6)]
*/

/* Tailwind extract (exact from get_design_context 633:13997)
   Container: h-[38px] w-[117px]
   Default/Focus: border-[var(---primary,#5ce1e6)] rounded-[var(---md,10px)] px-[16px] py-[10px] bg linear-gradient(247.35deg, accent2 11.557%, accent 87.691%)
   Hover: shadow-[0px_2px_2px_0px_rgba(0,0,0,0.4)] bg linear-gradient(247.35deg, accent 11.557%, accent2 82.2%)
   Icon: w-[36.498px] h-[22px]; hover uses alt asset
*/

/* Tailwind extract (exact from get_design_context 633:13989)
   Container: w-[88px]
   Default (style): bg-[rgba(92,225,230,0.08)] px-[10px] py-[6px] rounded-[999px] text-[12px] text-[color:var(---primary,#5ce1e6)]
   Grade: text-[color:var(---secondary,#e68fff)]
*/

/* Tailwind extract (exact from get_design_context 633:13968)
   Base: px-[10px] py-[6px] rounded-[999px] bg-[rgba(92,225,230,0.2)] text-[12px] text-[color:var(---primary,#5ce1e6)] w-[88px]
   Hover: bg-[rgba(92,225,230,0.4)]
   Focus: bg-[rgba(92,225,230,0.2)] border-[var(---primary,#5ce1e6)]
   Busy: bg-[rgba(255,209,102,0.08)] border-[var(---yellow,#ffd166)] text-[color:var(---yellow,#ffd166)]
   Warning: bg-[rgba(255,123,123,0.08)] border-[var(---special,#ff9500)] text-[color:var(---special,#ff9500)]
   Pink: bg-[rgba(230,143,255,0.08)] border-[var(---secondary,#e68fff)] text-[color:var(---secondary,#e68fff)]
*/

/* Tailwind extract (exact from get_design_context 633:13980)
   Container: h-[38px] w-[117px]
   Default: bg-[var(---card,#151927)] border-[var(---stroke,#1f2633)] text-[color:var(---muted,#8ea0bd)] px-[16px] py-[10px] rounded-[10px]
   Hover: text-[color:var(---text,#e9eef7)]
   Focus: bg-[var(---bg,#0c0e12)] border-[var(---primary,#5ce1e6)] text-[color:var(---primary,#5ce1e6)] shadow-[inset_0px_0px_0px_4px_rgba(92,225,230,0.08)]
*/

/* Tailwind extract (exact from get_design_context 633:13983)
   Container: px-[16px] py-[10px] rounded-[10px] h-[38px] min-w-[117px] gap-[8px]
   Default: bg-[var(---bg,#0c0e12)] border-[var(---stroke,#1f2633)] text-[color:var(---muted,#8ea0bd)]
   Hover: bg-[var(---card,#151927)] text-[color:var(---text,#e9eef7)] border stroke
   Focus: bg-[var(---bg,#0c0e12)] text-[color:var(---primary,#5ce1e6)] border-[var(---primary,#5ce1e6)] shadow-[inset_0px_0px_0px_4px_rgba(92,225,230,0.08)]
   Icon: size-[20px]; default/hover/focus SVG assets swap per state
*/

/* Tailwind extract (exact from get_design_context 633:13962)
   Container: px-[16px] py-[10px] rounded-[10px]
   Default: text-[color:var(---muted,#8ea0bd)]
   Hover: text-[color:var(---text,#e9eef7)]
   Focus: text-[color:var(---primary,#5ce1e6)] shadow-[inset_0px_0px_0px_4px_rgba(92,225,230,0.08)]
*/

/* Ghost Button (button.ghost — node 633:13977) */
.button-ghost {
  height: 38px;
  min-width: 117px;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid #8ea0bd; /* color/muted */
  border-radius: 10px; /* radius/md */
  font-size: 15px; /* button/base */
  font-weight: 700;
  color: #e9eef7; /* color/text */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: border-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
}

.button-ghost:hover:not(:disabled) {
  border-color: #1f2633; /* color/stroke */
}

.button-ghost:focus-visible {
  outline: none;
  border-color: #5ce1e6; /* color/primary */
  color: #5ce1e6;
  box-shadow: inset 0 0 0 4px rgba(92, 225, 230, 0.08); /* inner/lightfill */
}

.button-ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tailwind extract (exact from get_design_context 633:13977)
   Container: content-stretch flex flex-col h-[38px] items-start relative w-[117px]
   Default: border border-solid px-[var(---xxl,16px)] py-[var(---md,10px)] rounded-[var(---md,10px)] border-[var(---muted,#8ea0bd)]
   Hover: border-[var(---stroke,#1f2633)]
   Focus: border-[var(---primary,#5ce1e6)] text-[color:var(---primary,#5ce1e6)] shadow-[inset_0px_0px_0px_4px_rgba(92,225,230,0.08)]
*/

/* Navlink Button (button.navlink — node 633:13974) */
.button-navlink {
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #8ea0bd;
  min-width: 117px;
  height: 38px;
  line-height: 1;
  text-align: center;
}

.button-navlink-hover {
  background: #151927;
  color: #e9eef7;
}

.button-navlink:focus-visible {
  outline: none;
  background: rgba(92, 225, 230, 0.5);
  color: #5ce1e6;
  box-shadow: inset 0 0 0 4px rgba(92, 225, 230, 0.08);
}

/* DAB Button (button.dab — node 633:13997) */
.button-dab {
  width: 100%;
  min-width: 117px;
  height: 38px;
  padding: 10px 16px;
  border: 1px solid #5ce1e6; /* color/primary */
  border-radius: 10px; /* radius/md */
  background-image: linear-gradient(247.35416303387024deg, #e68fff 11.557%, #5ce1e6 87.691%);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 120ms ease, box-shadow 120ms ease, background-image 120ms ease;
}

.button-dab:hover:not(:disabled) {
  background-image: linear-gradient(247.35416303387024deg, #5ce1e6 11.557%, #e68fff 82.2%);
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.4); /* shadow/small */
}

.button-dab:focus-visible:not(:disabled) {
  outline: none;
  border: 1px solid #5ce1e6; /* color/primary */
}

.button-dab:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-dab-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36.498px;
  height: 22px;
  display: block;
  pointer-events: none;
  object-fit: contain;
}

.button-dab-hover,
.button-dab-focus {
  opacity: 0;
}

.button-dab:hover:not(:disabled) .button-dab-default {
  opacity: 0;
}

.button-dab:hover:not(:disabled) .button-dab-hover {
  opacity: 1;
}

.button-dab:focus-visible:not(:disabled) .button-dab-default,
.button-dab:active:not(:disabled) .button-dab-default {
  opacity: 0;
}

.button-dab:focus-visible:not(:disabled) .button-dab-hover,
.button-dab:active:not(:disabled) .button-dab-hover {
  opacity: 0;
}

.button-dab:focus-visible:not(:disabled) .button-dab-focus,
.button-dab:active:not(:disabled) .button-dab-focus {
  opacity: 1;
}
```

### Cardaction Variants (Icon-only - 42px × 38px, 14px radius)

**Cardaction buttons are icon-only action buttons used in card CTA rows. Each variant has 3 states: default, hover, and active/disabled.**

| Class | Figma Node | Description | Size | Icon Size |
|-------|------------|-------------|------|-----------|
| `.megabtn-cardaction` | button.cardaction | Base cardaction button | 42px × 38px | 24px × 24px |
| `.megabtn-cardaction-cancel` | button.cardaction cancel | Cancel/XCircle icon | 42px × 38px | 24px × 24px |
| `.megabtn-cardaction-addfriend` | button.cardaction addfriend | UserPlus icon | 42px × 38px | 24px × 24px |
| `.megabtn-cardaction-message` | button.cardaction message | MessageTextSquare icon | 42px × 38px | 24px × 24px |

```css
/* Cardaction Base - All cardaction buttons share this base
   Figma: bg-[#11141c] h-[38px] w-[42px] rounded-[14px] */
.megabtn-cardaction {
  width: 42px;
  height: 38px;
  background: #11141c; /* var(--color-panel) */
  border: none;
  border-radius: 14px; /* var(--radius-lg) */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background 120ms ease, transform 120ms ease;
}

/* Cardaction Hover State */
.megabtn-cardaction:hover:not(:disabled) {
  background: #1a1f2a; /* Slightly lighter panel color */
  transform: translateY(-1px);
}

/* Cardaction Active State */
.megabtn-cardaction:active:not(:disabled) {
  transform: scale(0.98);
}

/* Cardaction Disabled State */
.megabtn-cardaction:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Cardaction Icon - All icons are 24px × 24px
   Figma: size-[24px] */
.megabtn-cardaction svg,
.megabtn-cardaction img {
  width: 24px;
  height: 24px;
  display: block;
}

/* Cardaction Variants - All use same base styles, differentiated by icon */
.megabtn-cardaction-cancel {
  /* Uses base cardaction styles */
}

.megabtn-cardaction-addfriend {
  /* Uses base cardaction styles */
}

.megabtn-cardaction-message {
  /* Uses base cardaction styles */
}
```

**Usage Example:**
```jsx
// Cancel Button
<button className="megabtn megabtn-cardaction megabtn-cardaction-cancel" data-name="button.cardaction.cancel">
  <XCircleIcon color="#5B687C" />
</button>

// AddFriend Button
<button className="megabtn megabtn-cardaction megabtn-cardaction-addfriend" data-name="button.cardaction.addfriend">
  <UserPlusIcon color="#5B687C" />
</button>

// Message Button
<button className="megabtn megabtn-cardaction megabtn-cardaction-message" data-name="button.cardaction.message">
  <MessageTextSquareIcon color="#5B687C" />
</button>
```

### Pill Variants (Small - 12px font, 999px radius)

| Class | Figma State | Description | Background | Border |
|-------|-------------|-------------|------------|--------|
| `.button-pill` | default | Default pill | `rgba(92,225,230,0.2)` | none |
| `.button-pill-hover` | hover | Hover pill | `rgba(92,225,230,0.4)` | none |
| `.button-pill-focus` | focus | Online status/focus | `rgba(92,225,230,0.2)` | 1px `#5ce1e6` |

```css
/* Pill Base (button.pill — node 633:13968) */
.button-pill {
  padding: 6px 10px;
  background: rgba(92, 225, 230, 0.2);
  border-radius: 999px;
  font-size: 12px; /* pill/base */
  font-weight: 700;
  color: #5ce1e6; /* color/primary */
  min-width: 88px;
  line-height: 1;
  text-align: center;
  border: none;
}

/* Pill Hover */
.button-pill-hover {
  padding: 6px 10px;
  background: rgba(92, 225, 230, 0.4);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #5ce1e6;
  border: none;
}

/* Pill Focus */
.button-pill-focus {
  padding: 6px 10px;
  background: rgba(92, 225, 230, 0.2);
  border: 1px solid #5ce1e6;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #5ce1e6;
}

/* Pill Busy */
.button-pill-busy {
  padding: 6px 10px;
  background: rgba(255, 209, 102, 0.08);
  border: 1px solid #ffd166; /* color/yellow */
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #ffd166;
}

/* Pill Warning (special) */
.button-pill-warning {
  padding: 6px 10px;
  background: rgba(255, 123, 123, 0.08);
  border: 1px solid #ff9500; /* color/special */
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #ff9500;
}

/* Pill Pink */
.button-pill-pink {
  padding: 6px 10px;
  background: rgba(230, 143, 255, 0.08);
  border: 1px solid #e68fff; /* color/secondary */
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #e68fff;
}
```

### Tag Variants (Small - 12px font, 999px radius)

| Class | Figma Node | Description | Text Color |
|-------|------------|-------------|------------|
| `.button-tag` | button.tag (node 633:13989) | Style tags | `#5ce1e6` |
| `.button-tag-grade` | button.tag (grade) | Grade tags | `#e68fff` |

```css
/* Style Tag (button.tag — node 633:13989) */
.button-tag {
  padding: 6px 10px;
  background: rgba(92, 225, 230, 0.08);
  border-radius: 999px;
  font-size: 12px; /* pill/base */
  font-weight: 700;
  color: #5ce1e6; /* color/primary */
  min-width: 88px;
  line-height: 1;
  text-align: center;
  border: none;
}

/* Grade Tag (modifier) */
.button-tag-grade {
  color: #e68fff; /* color/secondary */
}
```

### Chip Variants (Small - 12px font, 8px radius)

| Class | Figma State | Description | Background | Border Color | Text Color |
|-------|-------------|-------------|------------|--------------|------------|
| `.megabtn-chip-muted` | default | Standard chips | `#0c0e12` | `#8ea0bd` | `#e9eef7` |
| `.megabtn-chip-hover` | hover | Hover state | `#11141c` | `#8ea0bd` | `#e9eef7` |
| `.megabtn-chip-accent` | focus | Belay Certified | `#0c0e12` | `#5ce1e6` | `#5ce1e6` |
| `.megabtn-chip-busy` | busy | Busy/away status | `#0c0e12` | `#ffd166` | `#ffd166` |
| `.megabtn-chip-pink` | pink | Pink accent | `#0c0e12` | `#e68fff` | `#e68fff` |
| `.megabtn-chip-peaking` | peaking | Peak activity | `#0c0e12` | `#ff7b7b` | `#ff7b7b` |
| `.megabtn-chip-pro` | pro | PRO badge | `#0c0e12` | `#ff7b7b` | `#ff7b7b` |
| `.megabtn-chip-founder` | founder | Founder badge | `#0c0e12` | `#ff9500` | gradient text |
| `.megabtn-chip-crew` | crew | Crew badge | `#0c0e12` | `#ff9500` | gradient text |

```css
/* Chip Base */
.megabtn-chip {
  padding: 6px 8px;
  background: #0c0e12;  /* bg color, not panel */
  border-radius: 8px;  /* space/sm used as radius */
  font-size: 12px;
  font-weight: 400;
}

/* Default/Muted Chip */
.megabtn-chip-muted {
  background: #0c0e12;
  border: 1px solid #8ea0bd;  /* muted border, not stroke */
  color: #e9eef7;  /* white text, not muted */
}

/* Hover State */
.megabtn-chip-hover {
  background: #11141c;  /* panel bg on hover */
  border: 1px solid #8ea0bd;
  color: #e9eef7;
}

/* Accent/Focus Chip (Belay Certified) */
.megabtn-chip-accent {
  background: #0c0e12;
  border: 1px solid #5ce1e6;
  color: #5ce1e6;
}

/* Busy Chip */
.megabtn-chip-busy {
  border: 1px solid #ffd166;
  color: #ffd166;
}

/* Pink Chip */
.megabtn-chip-pink {
  border: 1px solid #e68fff;
  color: #e68fff;
}

/* Peaking Chip */
.megabtn-chip-peaking {
  border: 1px solid #ff7b7b;
  color: #ff7b7b;
}

/* Pro Chip */
.megabtn-chip-pro {
  border: 1px solid #ff7b7b;
  color: #ff7b7b;
}

/* Founder Chip (gradient text) */
.megabtn-chip-founder {
  border: 1px solid #ff9500;
}
.megabtn-chip-founder span {
  background: linear-gradient(90deg, #ffd166, #ff7b7b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Crew Chip (gradient text) */
.megabtn-chip-crew {
  border: 1px solid #ff9500;
}
.megabtn-chip-crew span {
  background: linear-gradient(90deg, #ffd166, #ff7b7b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Input Field Styles

| Element | Figma Style | Description |
|---------|-------------|-------------|
| `button.field` | Field input | Text input with placeholder |
| `button.activitylog` | Activity log item | Read-only activity display |

```css
/* Input Field (button.field — node 633:13986) */
.button-field {
  width: 100%;
  padding: 10px 16px;
  background: #0c0e12;
  border: 1px solid #1f2633;
  border-radius: 10px;
  font-size: 15px; /* field/base */
  font-weight: 400;
  color: #e9eef7;
  line-height: 1;
  text-align: left;
}

.button-field:hover:not(:disabled) {
  background: #11141c; /* color/panel */
  border-color: #1f2633;
  color: #e9eef7;
}

.button-field:focus-visible:not(:disabled) {
  outline: none;
  background: #0c0e12; /* color/bg */
  border-color: #5ce1e6; /* color/primary */
  color: #5ce1e6;
  box-shadow: inset 0 0 0 4px rgba(92, 225, 230, 0.08); /* inner/lightfill */
}

.button-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### Google Sign-In Button (Special)

```css
/* Google button wrapper */
.google-signin-btn {
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #747775;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1f1f1f;
}
```

### Size Modifiers

| Class | Description |
|-------|-------------|
| `.megabtn-full` | Full width (100%) |

### Usage Examples

```jsx
// Ghost Button
<button className="button-ghost">Browse</button>

// Navlink Button
<button className="button-navlink">Browse</button>

// Activity Log Button
<button className="button-activitylog">Activity Log</button>

// Radio Button
<button className="button-radio">
  <span className="button-radio-icon">
    <img src="https://www.figma.com/api/mcp/asset/afee668a-3cc6-449b-b728-6424e7ad2d64" alt="" className="button-radio-icon-default" />
    <img src="https://www.figma.com/api/mcp/asset/5fd8706e-7dda-418c-b75e-67e9d4d6e3f9" alt="" className="button-radio-icon-hover" />
    <img src="https://www.figma.com/api/mcp/asset/9d845333-1f45-490f-b0f9-e5119bec8faf" alt="" className="button-radio-icon-focus" />
  </span>
  <span className="button-radio-label">Get Started</span>
</button>

// Footer Link
<button className="button-footerlink">Footer link</button>

// CTA Button
<button className="button-cta">Get Started</button>

// DAB Button
<button className="button-dab">
  <img src="https://www.figma.com/api/mcp/asset/e81702c8-3827-4b22-8f9e-b00469a24e8d" alt="" className="button-dab-img button-dab-default" />
  <img src="https://www.figma.com/api/mcp/asset/d8ce190e-692f-48e3-b842-dbf79aece79d" alt="" className="button-dab-img button-dab-hover" />
  <img src="https://www.figma.com/api/mcp/asset/e81702c8-3827-4b22-8f9e-b00469a24e8d" alt="" className="button-dab-img button-dab-focus" />
</button>

// DAB Button (CTA variant) - Used in card CTA rows
<div className="fc-cta-wrapper">
  <button className="megabtn megabtn-dab" data-name="button.dab">
    <img src="/dab-logo.svg" alt="DAB" />
  </button>
</div>

// Cardaction Buttons
<button className="megabtn megabtn-cardaction megabtn-cardaction-cancel" data-name="button.cardaction.cancel">
  <XCircleIcon color="#5B687C" />
</button>
<button className="megabtn megabtn-cardaction megabtn-cardaction-addfriend" data-name="button.cardaction.addfriend">
  <UserPlusIcon color="#5B687C" />
</button>
<button className="megabtn megabtn-cardaction megabtn-cardaction-message" data-name="button.cardaction.message">
  <MessageTextSquareIcon color="#5B687C" />
</button>

// Status Pill
<span className="button-pill button-pill-focus">Online</span>

// Style Tag
<span className="button-tag">Boulder</span>

// Grade Tag
<span className="button-tag button-tag-grade">Advanced</span>

// Chip
<span className="megabtn megabtn-chip megabtn-chip-accent">Belay Certified</span>
```

---

## Components (Exact from Figma node 470:1116)

### Featured Climber Card Structure

```
fc-card (420px, bg: #151927, border: 1px #1f2633, radius: 14px)
└── fc-inner (padding: 20px, gap: 12px)
    ├── fc-pills-row (justify-between)
    │   ├── fc-pill fc-pill-joined
    │   └── fc-pill fc-pill-status [fc-pill-online]
    ├── fc-content-row (height: 260px, gap: 16px)
    │   ├── fc-image-wrapper (flex: 1, radius: 14px)
    │   │   ├── fc-image (absolute, cover)
    │   │   └── fc-image-overlay (gradient bottom, padding: 32px 12px 12px 12px)
    │   │       ├── fc-info-row (gap: 8px)
    │   │       │   ├── fc-name (20px, 800 weight, white)
    │   │       │   └── fc-age (18px, 400 weight, white)
    │   │       └── fc-location-row
    │   │           └── fc-location (16px, 500 weight, muted)
    │   └── fc-tags-wrapper (flex: 1, gap: 8px, align-items: flex-end)
    │       └── fc-tags-row (flex-wrap, gap: 4px, justify-end)
    │           ├── fc-tag fc-tag-style (Boulder, Sport)
    │           ├── fc-tag fc-tag-grade (7a)
    │           ├── fc-chip fc-chip-founder (🤘Founder)
    │           ├── fc-chip fc-chip-belay (Belay Certified)
    │           └── fc-chip fc-chip-standard (chips...)
    ├── fc-bio (padding: 10px 0)
    │   └── p (16px, 500 weight, muted)
    └── fc-cta-row (gap: 8px)
        ├── fc-cta-wrapper > fc-btn-pass
        └── fc-cta-wrapper > fc-btn-dab
```

### Pills (Exact CSS)

```css
/* Base Pill - padding: 6px 10px, radius: 999px, font: 12px */
.fc-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;                    /* py: btn-pad-xs, px: btn-pad-md */
  border-radius: 999px;                 /* radius-circle */
  font-size: 12px;                      /* body/xs size */
  font-family: 'Inter', sans-serif;
  line-height: normal;
  white-space: nowrap;
}

/* Joined Pill - bg: rgba(92,225,230,0.08), no border, weight: 400 */
.fc-pill-joined {
  background: rgba(92, 225, 230, 0.08);
  color: #5ce1e6;                       /* color/accent */
  font-weight: 400;                     /* Regular */
}

/* Online Pill - bg: rgba(92,225,230,0.12), border: 1px #5ce1e6, weight: 700 */
.fc-pill-online {
  background: rgba(92, 225, 230, 0.12);
  border: 1px solid #5ce1e6;            /* color/accent */
  font-weight: 700;                     /* Bold */
}
```

### Tags (Exact CSS)

```css
/* Base Tag - same padding as pill, bold, rounded pill */
.fc-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;                    /* py: btn-pad-xs, px: btn-pad-md */
  border-radius: 999px;                 /* radius-circle */
  font-size: 12px;                      /* body/xs size */
  font-weight: 700;                     /* Bold */
  font-family: 'Inter', sans-serif;
  line-height: normal;
  white-space: nowrap;
  background: rgba(92, 225, 230, 0.08);
}

/* Style Tag (Boulder, Sport) - accent color */
.fc-tag-style {
  color: #5ce1e6;                       /* color/accent */
}

/* Grade Tag (7a) - accent2 color */
.fc-tag-grade {
  color: #e68fff;                       /* color/accent2 */
}
```

### Chips (Exact CSS)

```css
/* Base Chip - padding: 6px 8px, radius: 8px, weight: 400 */
.fc-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;                     /* py: btn-pad-xs, px: btn-pad-sm */
  border-radius: 8px;                   /* space/sm as radius */
  font-size: 12px;                      /* body/xs size */
  font-weight: 400;                     /* Regular */
  font-family: 'Inter', sans-serif;
  line-height: normal;
  white-space: nowrap;
}

/* Founder Chip - bg: #11141c, border: 1px #ff9500, gradient text */
.fc-chip-founder {
  background: #11141c;                  /* color/panel */
  border: 1px solid #ff9500;            /* orange */
}

.fc-chip-founder .fc-chip-text {
  background: linear-gradient(90deg, #ffd166, #ff7b7b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Belay Certified - bg: #11141c, border: 1px #5ce1e6, cyan text */
.fc-chip-belay {
  background: #11141c;                  /* color/panel */
  border: 1px solid #5ce1e6;            /* color/accent */
  color: #5ce1e6;                       /* color/accent */
}

/* Standard Chip - bg: #11141c, border: 1px #1f2633, muted text */
.fc-chip-standard {
  background: #11141c;                  /* color/panel */
  border: 1px solid #1f2633;            /* color/stroke */
  color: #8ea0bd;                       /* color/muted */
}
```

### Buttons (Exact CSS)

```css
/* Pass Button - ghost style, padding: 10px 16px, radius: 10px */
.fc-btn-pass {
  width: 100%;
  padding: 10px 16px;                   /* py: btn-pad-md, px: btn-pad-xxl */
  border: 1px solid #1f2633;            /* color/stroke */
  background: transparent;
  color: #e9eef7;                       /* color/text */
  font-size: 15px;                      /* button/base size */
  font-weight: 700;                     /* Bold */
  font-family: 'Inter', sans-serif;
  border-radius: 10px;                  /* radius/md */
  line-height: normal;
  text-align: center;
  cursor: pointer;
}

/* Navlink Button (Next/Skip) - solid gray fill
   Figma: button.navlink - bg-[#1f2633] */
.fc-btn-navlink {
  width: 100%;
  padding: 10px 16px;                   /* py: btn-pad-md, px: btn-pad-xxl */
  background: #1f2633;                  /* color/stroke as fill */
  border: none;
  color: #e9eef7;                       /* color/text */
  font-size: 15px;                      /* button/base size */
  font-weight: 700;                     /* Bold */
  font-family: 'Inter', sans-serif;
  border-radius: 10px;                  /* radius/md */
  line-height: normal;
  text-align: center;
  cursor: pointer;
}

/* DAB Button (state=dab) - Figma node 476:13447
   Outer: shadow-[0px_0px_20px_0px_rgba(92,225,230,0.4)]
   Inner: border border-[#5ce1e6] h-[38px] px-[16px] py-[10px] rounded-[10px]
   Contains DAB logo icon (h-[22px]) */
.fc-btn-dab {
  width: 100%;
  height: 38px;
  padding: 10px 16px;                   /* py: btn-pad-md, px: btn-pad-xxl */
  border: 1px solid #5ce1e6;            /* cyan border */
  background: transparent;
  border-radius: 10px;                  /* radius/md */
  box-shadow: 0px 0px 20px 0px rgba(92, 225, 230, 0.4); /* cyan glow */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
}

.fc-btn-dab:hover {
  transform: translateY(-1px);
  box-shadow: 0px 0px 30px 0px rgba(92, 225, 230, 0.6);
  border-color: #e68fff;                /* accent2 on hover */
}

.fc-btn-dab img {
  height: 22px;
  width: auto;
  object-fit: contain;
}

/* DAB Button Gradient - filled gradient variant
   Figma: button.dab with gradient fill (silver tier cards) */
.fc-btn-dab-gradient {
  width: 100%;
  height: 38px;
  padding: 10px 16px;
  background: linear-gradient(90deg, #5ce1e6 0%, #e68fff 100%);
  border: 1px solid #5ce1e6;
  border-radius: 10px;                  /* radius/md */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Glow state for DAB buttons */
.fc-btn-dab-glow {
  box-shadow: 0px 0px 30px 0px rgba(92, 225, 230, 0.6);
}
```

---

## 🎴 Silver Card Component

**Quick Reference for Mobile/Desktop Swipe Card (Silver Tier)**

### Component Location
- **Figma Node**: `571:506`
- **Component File**: `src/components/MobileSwipeCardSilver.tsx`
- **CSS Classes**: All prefixed with `.mh-silver-*`

### Key Design Tokens

| Element | Value | Usage |
|---------|-------|-------|
| **Container Background** | `#FAFAFA` | Full viewport background (greys/100) |
| **Card Border** | `4px solid #e6e6e6` | Silver border on card and bio container |
| **Card Radius** | `24px` | Main card border radius |
| **Card Shadow** | `0px 20px 60px 0px rgba(0, 0, 0, 0.4)` | Card drop shadow |
| **Bio Container** | `4px solid #e6e6e6` border, `14px` radius | Bio section styling |
| **Bio Background** | `#FAFAFA` (inherits from container) | Bio text container |
| **Bio Text Color** | `#11141c` | Dark text on light background |
| **Bio Inset Shadow** | `inset 4px 4px 4px 0px rgba(0, 0, 0, 0.5)` | Inner shadow effect |

### Desktop Responsive Behavior

```css
@media (min-width: 768px) {
  /* Card sizing - 6:9 aspect ratio while filling available height */
  .mh-silver-container {
    padding: 0 var(--space-xl) var(--space-xl); /* No top padding - spacing handled by content margin */
    min-height: 100vh;
    justify-content: center;
  }

  .mh-silver-content {
    max-width: 600px;
    height: min(calc(100vh - (var(--space-xl) * 2)), 960px); /* subtract top/bottom spacing */
    aspect-ratio: 6 / 9;
    width: auto;
    justify-content: center;
    /* Top margin accounts for navbar bottom padding (16px) + desired spacing (8px) = 24px total */
    margin: var(--space-sm) auto 0; /* space-sm = 8px, navbar has 16px bottom padding = 24px total */
  }
  
  .mh-silver-card {
    height: 100%;
    align-items: stretch;
  }
  
  /* Hide mobile navbar on desktop */
  .mh-silver-navbar {
    display: none !important;
  }
}
```

### Main CSS Classes

| Class | Purpose | Key Styles |
|-------|---------|------------|
| `.mh-silver-container` | Full viewport wrapper | `bg: #FAFAFA`, full height |
| `.mh-silver-content` | Content wrapper | `gap: 16px`, `padding: 16px` |
| `.mh-silver-card` | Main card container | `border: 4px #e6e6e6`, `radius: 24px`, `padding: 24px` |
| `.mh-silver-bio` | Bio text container | `border: 4px #e6e6e6`, `radius: 14px`, `padding: 12px 16px` |
| `.mh-silver-bio-text` | Bio text | `font-size: 14px`, `color: #11141c` |
| `.mh-silver-navbar` | Mobile navbar | Hidden on desktop (`@media min-width: 768px`) |

### Gradient Usage

- **DAB Logo**: `linear-gradient(90deg, #5ce1e6, #e68fff)` (brand horizontal gradient)
- **DAB Button**: `linear-gradient(90deg, #5ce1e6, #e68fff)` (filled variant)
- **Image Overlay**: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.75))`

### Component Structure

```
.mh-silver-container
└── .mh-silver-content
    ├── .mh-silver-card
    │   ├── .mh-silver-header (logo + status chips)
    │   ├── .mh-silver-main
    │   │   ├── .mh-silver-image-section
    │   │   └── .mh-silver-bio (with silver border)
    │   └── .mh-silver-cta-row (Next + DAB buttons)
    └── .mh-silver-navbar (hidden on desktop)
```

### Implementation Notes

1. **Card fills vertically on desktop** - Desktop media query sets `.mh-silver-content` height to `calc(100vh - 96px)` and `.mh-silver-card` to `height: 100%` while preserving the `6 / 9` aspect ratio
2. **Silver border consistency** - Both card container (`.mh-silver-card`) and bio container (`.mh-silver-bio`) use `4px solid #e6e6e6`
3. **Background color** - Card uses `transparent` background, inheriting `#FAFAFA` from container
4. **Bio container** - Has both silver border AND inset shadow for depth effect
5. **Desktop navbar** - Automatically hidden via CSS media query
6. **CTA Row overflow** - `.fc-cta-row` **must** use `overflow: visible` (not `clip`) so the DAB button hover lift/box-shadow is never cut off on desktop

### Full Documentation

See detailed section: [Mobile Home Swipe Card - Silver Tier](#mobile-home-swipe-card---silver-tier-node-571506)

---

## Patterns

### Status Dot (Pulsating)

```css
.fc-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #5ce1e6;                  /* color/accent */
  box-shadow: 0 0 0 4px rgba(92, 225, 230, 0.12);
  display: inline-block;
  margin-right: 6px;                    /* space/xs */
  flex-shrink: 0;
}

.fc-status-dot-live {
  animation: presencePulse 2.4s ease-in-out infinite;
}

@keyframes presencePulse {
  0%   { box-shadow: 0 0 0 4px rgba(92, 225, 230, 0.12); transform: scale(1); }
  50%  { box-shadow: 0 0 0 10px rgba(92, 225, 230, 0.04); transform: scale(1.08); }
  100% { box-shadow: 0 0 0 4px rgba(92, 225, 230, 0.12); transform: scale(1); }
}
```

### Tag/Chip Order

Display order (left to right, top to bottom):
1. **Style Tags** - Boulder, Sport (cyan accent)
2. **Grade Tag** - 7a (purple accent)
3. **Special Chips** - 🤘Founder, 🤘Crew, Belay Certified
4. **Standard Chips** - Edelrid Ohm, Community, etc.

### Image Gradient Overlay

```css
.fc-image-overlay {
  background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.75));
  padding: 32px 12px 12px 12px;         /* pt: space/xxl, px/pb: space/md */
  gap: 6px;                             /* space/xs */
  border-radius: 14px;                  /* radius-lg */
}
```

---

## Figma-to-CSS Extraction Process

### Step 1: Get Token Values
```
mcp_Figma_Desktop_get_variable_defs({ nodeId: "470-1116" })
```

### Step 2: Get Design Context
```
mcp_Figma_Desktop_get_design_context({ nodeId: "470-1116", forceCode: true })
```

### Step 3: Extract Exact Values

From Tailwind output, extract exact pixel values:
- px with button padding md = 10px → padding-left: 10px; padding-right: 10px;
- py with button padding xs = 6px → padding-top: 6px; padding-bottom: 6px;
- rounded with radius lg = 14px → border-radius: 14px;
- text 12px → font-size: 12px;

### Step 4: Map to CSS Variables

Map Figma tokens to CSS custom properties:
- color/card (#151927) → --color-card defined as #151927
- space/md (12px) → --space-md defined as 12px

---

## CSS Class Reference

| Class | Purpose |
|-------|---------|
| `.fc-card` | Featured card container |
| `.fc-inner` | Inner flex container |
| `.fc-pills-row` | Pills row (joined + status) |
| `.fc-pill` | Base pill style |
| `.fc-pill-joined` | Joined time pill |
| `.fc-pill-status` | Status pill |
| `.fc-pill-online` | Online modifier |
| `.fc-status-dot` | Pulsating dot |
| `.fc-status-dot-live` | Live animation |
| `.fc-content-row` | Image + tags row |
| `.fc-image-wrapper` | Image container |
| `.fc-image` | Profile image |
| `.fc-image-overlay` | Gradient overlay |
| `.fc-info-row` | Name + age row |
| `.fc-name` | Name text |
| `.fc-age` | Age text |
| `.fc-location-row` | Location container |
| `.fc-location` | Location text |
| `.fc-tags-wrapper` | Tags side container |
| `.fc-tags-row` | Wrapping tag/chip row |
| `.fc-tag` | Base tag style |
| `.fc-tag-style` | Style tag (Boulder, Sport) |
| `.fc-tag-grade` | Grade tag (7a) |
| `.fc-chip` | Base chip style |
| `.fc-chip-founder` | Founder chip |
| `.fc-chip-crew` | Crew chip |
| `.fc-chip-belay` | Belay Certified chip |
| `.fc-chip-standard` | Standard chips |
| `.fc-chip-text` | Inner text for gradient |
| `.fc-bio` | Bio section |
| `.fc-cta-row` | Button row |
| `.fc-cta-wrapper` | Button wrapper |
| `.fc-btn-pass` | Pass button (ghost) |
| `.fc-btn-dab` | DAB button (cyan border, glow, contains logo icon) |

---

## Notes

- **Source of truth:** Figma file `DAB-Build`
- **All values are exact** - no interpretation
- **CSS Variables defined in:** `src/app/globals.css` under `:root`
- **Featured Card Component:** `src/components/LandingPage.tsx` → `FeaturedClimberCard`

---

## Tailwind Classes from Figma (Store for Reference)

These are the EXACT Tailwind classes output by Figma's `get_design_context`. Store here for future use.

### Chat Event Screen (node 634:15364)

```tailwind
/* SCREEN */
bg-[#e9eef7] flex flex-col items-center justify-center relative size-full

/* CONTENT */
flex flex-[1_0_0] flex-col gap-[16px] items-center justify-end px-[16px] pt-[16px] pb-0 w-full max-w-[420px]

/* CARD */
bg-[#ffffff] flex flex-col gap-[8px] p-[24px] rounded-[24px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.4)]

/* BACKBAR */
flex items-center justify-between h-[44px] w-full

/* HERO */
relative h-[160px] p-[16px] rounded-[14px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.4)] overflow-hidden
bg-cover bg-center bg-gradient-to-b from-40% from-[rgba(17,20,28,0)] to-[#0c0e12]

/* MESSAGES */
gap-[12px]; incoming: px-[12px] py-[8px] rounded-[14px] bg-[#e9eef7] text-[12px]
outgoing: px-[12px] py-[8px] rounded-bl-[16px] rounded-br-[4px] rounded-tl-[16px] rounded-tr-[16px] bg-[#5ce1e6] text-[14px]

/* INPUT */
bg-[#e9eef7] rounded-[14px] px-[12px] py-[8px] text-[14px]
```

### Home Screen (node 633:14303)

```tailwind
/* SCREEN */
bg-[#e9eef7] flex flex-col items-center justify-center relative size-full

/* CONTENT */
flex flex-col gap-[16px] items-center justify-end px-[16px] pt-[16px] pb-0 w-full max-w-[420px]

/* FILTERS */
flex gap-[6px] w-[358px]; pill: bg-[#e9eef7] border border-[#8ea0bd] rounded-[10px] px-[12px] py-[10px] h-[44px] text-[15px] text-[#8ea0bd] gap-[12px]

/* CARD */
bg-[#0c0e12] border-[4px] border-[#5ce1e6] rounded-[14px] p-[24px] gap-[12px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.4)]

/* IMAGE WRAPPER */
p-[4px] border-[4px] border-[#5ce1e6] rounded-[14px] shadow-[inset_4px_4px_4px_rgba(0,0,0,0.5)]

/* OVERLAY */
pt-[32px] pb-[12px] px-[12px] gap-[6px] bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.75)] rounded-[14px]

/* NAME */
text-[32px] text-white gap-[8px]

/* LOCATION */
text-[16px] text-[#e9eef7]

/* TAGS */
default tag: bg-[rgba(92,225,230,0.08)] px-[10px] py-[6px] rounded-[999px] text-[12px] text-[#5ce1e6]
grade tag: same padding/radius text-[12px] text-[#e68fff]
belay chip: bg-[#0c0e12] border border-[#5ce1e6] rounded-[999px] px-[8px] py-[6px] text-[12px] text-[#5ce1e6]
default chip: bg-[#151927] border border-[#1f2633] rounded-[8px] px-[8px] py-[6px] text-[12px] text-[#8ea0bd]

/* BIO */
bg-[#1f2633] px-[16px] py-[12px] rounded-[14px] text-[14px] text-[#8ea0bd] shadow-[inset_4px_4px_4px_rgba(0,0,0,0.5)]

/* CTA ROW */
gap-[12px]; next button bg-[#11141c] rounded-[10px] h-[38px] px-[16px] py-[10px] text-[15px] text-[#e9eef7]
dab button border border-[#5ce1e6] rounded-[10px] h-[38px] px-[16px] py-[10px]

/* BOTTOM NAV */
bg-[#e9eef7] h-[100px] px-[24px] py-[12px] rounded-t-[14px]
```

### Featured Climber Card (node 470:1116)

```tailwind
/* CARD CONTAINER */
bg-[#151927] border border-[#1f2633] border-solid rounded-[14px] w-[420px]

/* INNER CONTAINER */
flex flex-col gap-[12px] items-start overflow-clip p-[20px] rounded-[inherit] w-[420px]

/* PILLS ROW */
flex items-start justify-between overflow-clip w-full

/* JOINED PILL */
bg-[rgba(92,225,230,0.08)] px-[10px] py-[6px] rounded-[999px]
font-normal text-[12px] text-[#5ce1e6]

/* ONLINE PILL */
bg-[rgba(92,225,230,0.12)] border border-[#5ce1e6] px-[10px] py-[6px] rounded-[999px]
font-bold text-[12px] text-[#5ce1e6]

/* CONTENT ROW */
flex gap-[16px] h-[260px] items-start w-full

/* LEFT (IMAGE WRAPPER) */
basis-0 grow h-full items-end overflow-clip rounded-[14px]

/* IMAGE */
absolute inset-0 max-w-none object-cover object-[50%_50%] pointer-events-none rounded-[14px] w-full h-full

/* GRADIENT OVERLAY */
basis-0 grow bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.75)]
flex flex-col gap-[6px] items-start justify-end
pb-[12px] pt-[32px] px-[12px] rounded-[14px]

/* NAME */
font-extrabold text-[20px] text-white

/* AGE */
font-normal text-[18px] text-white

/* LOCATION */
font-medium text-[16px] text-[#8ea0bd]

/* RIGHT (TAGS WRAPPER) */
basis-0 grow flex-col gap-[8px] h-full items-end overflow-clip

/* TAG ROW */
flex flex-wrap gap-[4px] items-start justify-end overflow-clip w-full

/* STYLE TAG (Boulder, Sport) */
bg-[rgba(92,225,230,0.08)] px-[10px] py-[6px] rounded-[999px]
font-bold text-[12px] text-[#5ce1e6]

/* GRADE TAG (7a) */
bg-[rgba(92,225,230,0.08)] px-[10px] py-[6px] rounded-[999px]
font-bold text-[12px] text-[#e68fff]

/* FOUNDER CHIP */
bg-[#11141c] border border-[#ff9500] px-[8px] py-[6px] rounded-[8px]
font-normal text-[12px] bg-clip-text webkit-text-fill-color-transparent

/* BELAY CERTIFIED CHIP */
bg-[#11141c] border border-[#5ce1e6] px-[8px] py-[6px] rounded-[8px]
font-normal text-[12px] text-[#5ce1e6]

/* STANDARD CHIP */
bg-[#11141c] border border-[#1f2633] px-[8px] py-[6px] rounded-[8px]
font-normal text-[12px] text-[#8ea0bd]

/* BIO */
gap-[6px] px-0 py-[10px] w-full
font-medium text-[16px] text-[#8ea0bd]

/* CTA ROW */
flex gap-[8px] items-center overflow-clip w-full

/* PASS BUTTON */
border border-[#1f2633] px-[16px] py-[10px] rounded-[10px] w-full
font-bold text-[15px] text-[#e9eef7]

/* GET STARTED BUTTON */
px-[16px] py-[10px] rounded-[10px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.4)] w-full
font-bold text-[15px] text-[#0c0e12]
background: linear-gradient(120deg, #5ce1e6, #e68fff)
```

### Landing Page Full (node 465:38)

```tailwind
/* LANDING PAGE CONTAINER */
bg-black flex flex-col items-center justify-center relative size-full

/* NAVBAR */
bg-[#0c0e12] px-[32px] py-[16px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.4)] w-full

/* NAVBAR CENTER */
max-w-[1200px] px-[24px] py-0 w-[1200px]
flex items-center justify-between

/* LOGO */
font-['Metal_Mania'] text-[52px] text-white

/* NAVLINKS */
flex flex-wrap gap-[12px] items-center justify-center

/* NAVLINK */
px-[16px] py-[10px] rounded-[10px]
font-bold text-[15px] text-[#8ea0bd]

/* CTA BUTTONS */
/* Ghost: border border-[#1f2633] */
/* CTA: gradient background, shadow */

/* CONTENT */
flex flex-col gap-[24px] p-[24px] w-[1200px]

/* HERO */
flex flex-wrap gap-[24px] items-center w-full

/* HERO LEFT */
flex flex-col gap-[8px] min-w-[300px]

/* EYEBROW */
font-bold text-[14px] text-[#5ce1e6] uppercase

/* HERO TITLE */
font-extrabold text-[52px] text-white tracking-[-0.16px]

/* HERO DESCRIPTION */
font-normal text-[16px] text-[#8ea0bd]

/* HERO ACTIONS */
flex flex-wrap gap-[12px] py-[16px]

/* HERO BADGES */
flex flex-wrap gap-[8px] pb-[16px]

/* BADGE CHIP */
bg-[#11141c] border border-[#8ea0bd] px-[8px] py-[6px] rounded-[8px]
font-normal text-[12px] text-[#8ea0bd]

/* FEATURED CARD - see above */
w-[420px] min-w-[420px]

/* GRID PROFILES ROW */
bg-[#0c0e12] border border-[#1f2633] rounded-[14px]

/* GRID PROFILES BLOCK */
gap-[8px] p-[24px]

/* TEXT FILTER SECTION */
h-[226px] flex flex-col justify-between

/* GRID EYEBROW */
font-bold text-[14px] text-[#5ce1e6] uppercase

/* GRID TITLE */
font-extrabold text-[32px] text-white tracking-[-0.16px]

/* GRID DESCRIPTION */
font-normal text-[16px] text-[#8ea0bd]

/* FILTER ROW */
flex flex-wrap gap-[12px] items-end pt-[16px]

/* FILTER FIELD */
flex flex-col gap-[12px]

/* FILTER LABEL */
font-bold text-[15px] text-white

/* FILTER BUTTON */
h-[38px] w-[124px]
border border-[#1f2633] px-[16px] py-[10px] rounded-[10px]
font-bold text-[15px] text-[#e9eef7]

/* DABS CARD (matches online) */
bg-[#151927] border border-[#1f2633] rounded-[14px]
max-w-[396px] min-w-[300px]
shadow-[0px_20px_60px_0px_rgba(0,0,0,0.4)]

/* DABS STAT ROW */
flex gap-[8px] items-center

/* DABS NUMBER */
font-extrabold text-[20px] text-[#5ce1e6] tracking-[-0.16px]

/* DABS LABEL */
font-['Metal_Mania'] text-[20px] text-white

/* DABS TEXT */
font-medium text-[18px] text-white

/* DABS LOCATION */
font-normal text-[16px] text-[#8ea0bd]

/* GRID PROFILE CARD */
bg-[#151927] border border-[#1f2633] rounded-[14px]
min-w-[366px] w-[366px]

/* PROFILE CARD CONTENT */
flex gap-[12px] h-[260px]

/* PROFILE IMAGE LEFT */
h-full w-[160px] min-w-[160px] rounded-[14px] overflow-clip

/* PROFILE IMAGE */
absolute inset-0 object-cover object-[50%_50%] rounded-[14px] size-full

/* PROFILE IMAGE OVERLAY */
bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.75)]
gap-[6px] pb-[12px] pt-[32px] px-[12px] rounded-[14px]

/* PROFILE NAME */
font-extrabold text-[20px] text-white

/* PROFILE AGE */
font-normal text-[18px] text-white

/* PROFILE LOCATION */
font-medium text-[16px] text-[#8ea0bd]

/* PROFILE TAGS (RIGHT) */
flex flex-col gap-[8px] h-full items-end overflow-clip

/* PROFILE PILL STATUS */
bg-[rgba(92,225,230,0.12)] border border-[#5ce1e6]
px-[10px] py-[6px] rounded-[999px]
font-bold text-[12px] text-[#5ce1e6]

/* TAG ROW */
flex flex-wrap gap-[6px] items-start justify-end overflow-clip w-full

/* BIO */
py-[10px] w-full
font-medium text-[16px] text-white

/* CTA ROW */
flex gap-[8px] w-full

/* SIGNUP SECTION */
bg-[#0c0e12] border border-[#1f2633] rounded-[14px]

/* SIGNUP CONTENT */
flex overflow-clip rounded-[inherit]

/* SIGNUP LEFT */
flex flex-col gap-[8px] p-[20px]

/* SIGNUP EYEBROW */
font-semibold text-[18px] text-[#5ce1e6]

/* SIGNUP TITLE */
font-extrabold text-[32px] text-white tracking-[-0.16px]

/* SIGNUP DESCRIPTION */
font-medium text-[16px] text-[#8ea0bd]

/* SIGNUP FORM CARD */
bg-[#151927] border border-[#1f2633] rounded-[14px]
min-w-[366px] w-[366px] p-[20px]

/* FORM HEADER */
py-[10px]
font-semibold text-[18px] text-white
font-medium text-[16px] text-[#8ea0bd]

/* GOOGLE BUTTON */
bg-white border border-[#747775] rounded-[8px]
px-[12px] py-[10px] gap-[10px]
font-medium text-[14px] text-[#1f1f1f]

/* DIVIDER */
flex items-center justify-between
font-normal text-[16px] text-[#8ea0bd]

/* FORM FIELD LABEL */
font-bold text-[15px] text-white

/* FORM INPUT */
bg-[#0c0e12] border border-[#1f2633] rounded-[10px]
px-[16px] py-[10px]
font-normal text-[15px] text-[#8ea0bd]

/* SUBMIT BUTTON */
px-[18px] py-[12px] rounded-[10px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.4)]
font-bold text-[15px] text-[#0c0e12]

/* ACTIVITY FEED CARD */
bg-[#151927] border border-[#1f2633] rounded-[14px]
min-w-[366px] p-[20px]

/* ACTIVITY STAT NUMBER */
font-extrabold text-[52px] text-[#5ce1e6]

/* ACTIVITY LABEL */
font-bold text-[20px] text-white

/* ACTIVITY HEADER */
font-bold text-[20px] text-white
font-medium text-[16px] text-[#8ea0bd]

/* ACTIVITY ITEM */
bg-[#11141c] border border-[#1f2633] rounded-[10px]
px-[16px] py-[10px]
font-normal text-[15px] text-[#8ea0bd]

/* FOOTER */
bg-[#0c0e12] px-[24px] py-[16px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.4)] w-full

/* FOOTER CONTENT */
flex gap-[32px] items-center px-[24px] py-0

/* FOOTER LOGO */
font-['Metal_Mania'] text-[52px] text-white

/* FOOTER TEXT */
font-normal text-[16px] text-[#8ea0bd]

/* FOOTER LINKS */
flex gap-[12px]

/* FOOTER LINK */
px-[16px] py-[10px] rounded-[10px]
font-normal text-[15px] text-[#8ea0bd]
```

---

## Mobile Onboarding Components (node 482-530)

### Screen 1: Signup (step0/signup)

**Structure:**
```
mob-onboard-screen (390px width, min-height: 100vh, bg: #0c0e12)
├── mob-watermark (absolute, "dab" text, 180px, #1f2633, opacity 0.4)
└── mob-onboard-content (padding: 100px 20px 40px 20px, gap: 24px)
    ├── mob-title-section
    │   └── mob-hero-title ("JOIN YOUR CREW", Metal Mania, 52px, #5ce1e6)
    └── mob-form-section (gap: 16px)
        ├── mob-form-header
        │   ├── mob-form-title (18px, 600 weight, white)
        │   └── mob-form-subtitle (14px, 400 weight, #8ea0bd)
        ├── mob-google-btn (white bg, border: #747775, rounded: 8px)
        ├── mob-divider
        │   ├── mob-divider-line (bg: #1f2633)
        │   └── mob-divider-text ("or", 14px, #8ea0bd)
        └── mob-form (gap: 12px)
            ├── mob-field > mob-label + mob-input
            ├── mob-field-row > mob-field-half (for side-by-side)
            └── mob-cta-btn (gradient, rounded: 10px)
```

### Tailwind Classes (node 482-530)

```tailwind
/* MOBILE SCREEN */
bg-[#0c0e12] w-[390px] min-h-screen flex flex-col items-center relative overflow-hidden

/* WATERMARK */
font-['Metal_Mania'] text-[180px] text-[#1f2633] opacity-40 absolute top-[20px] left-1/2 -translate-x-1/2

/* CONTENT */
flex flex-col items-center gap-[24px] pt-[100px] px-[20px] pb-[40px] w-full relative z-1

/* HERO TITLE */
font-['Metal_Mania'] text-[52px] text-[#5ce1e6] leading-[1] text-center

/* FORM SECTION */
flex flex-col gap-[16px] w-full mt-[16px]

/* FORM HEADER */
flex flex-col gap-[4px] items-center text-center

/* FORM TITLE */
font-semibold text-[18px] text-white

/* FORM SUBTITLE */
font-normal text-[14px] text-[#8ea0bd]

/* GOOGLE BUTTON */
bg-white border border-[#747775] rounded-[8px] px-[12px] py-[10px] gap-[10px] w-full
font-medium text-[14px] text-[#1f1f1f]

/* DIVIDER */
flex items-center justify-center w-full gap-[12px]
/* Divider line: flex-1 h-[1px] bg-[#1f2633] */
/* Divider text: font-normal text-[14px] text-[#8ea0bd] */

/* FORM */
flex flex-col gap-[12px] w-full

/* FIELD */
flex flex-col gap-[8px] w-full

/* FIELD ROW (side-by-side) */
flex gap-[12px] w-full
/* FIELD HALF: flex-1 min-w-0 */

/* LABEL */
font-bold text-[15px] text-white

/* INPUT */
bg-[#0c0e12] border border-[#1f2633] rounded-[10px] px-[16px] py-[10px] w-full
font-normal text-[15px] text-[#e9eef7]
placeholder:text-[#8ea0bd]
focus:border-[#5ce1e6] focus:shadow-[0_0_0_2px_rgba(92,225,230,0.12)]

/* CTA BUTTON */
bg-gradient-to-r from-[#5ce1e6] to-[#e68fff]
rounded-[10px] px-[16px] py-[12px] w-full mt-[4px]
shadow-[0px_20px_60px_0px_rgba(0,0,0,0.4)]
font-bold text-[15px] text-[#0c0e12]

/* PROGRESS DOTS (for multi-step) */
flex gap-[8px] items-center justify-center py-[16px]
/* Dot: w-[8px] h-[8px] rounded-full bg-[#1f2633] */
/* Active: bg-[#5ce1e6] scale-[1.2] */
/* Completed: bg-[#5ce1e6] */
```

### CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.mob-onboard-screen` | Full screen container (390px, dark bg) |
| `.mob-watermark` | Background "dab" text watermark |
| `.mob-onboard-content` | Main content wrapper |
| `.mob-title-section` | Title container |
| `.mob-hero-title` | Metal Mania cyan title |
| `.mob-form-section` | Form container |
| `.mob-form-header` | Form header (title + subtitle) |
| `.mob-form-title` | Form heading text |
| `.mob-form-subtitle` | Form description text |
| `.mob-google-btn` | Google sign-in button |
| `.mob-divider` | "or" divider with lines |
| `.mob-divider-line` | Horizontal line |
| `.mob-divider-text` | "or" text |
| `.mob-form` | Form element container |
| `.mob-field` | Single field wrapper |
| `.mob-field-row` | Side-by-side fields row |
| `.mob-field-half` | Half-width field |
| `.mob-label` | Input label |
| `.mob-input` | Text input |
| `.mob-error` | Error message |
| `.mob-cta-btn` | Gradient CTA button |
| `.mob-continue-btn` | Continue button variant |
| `.mob-progress` | Progress dots container |
| `.mob-progress-dot` | Individual progress dot |

---

### Screen 2: Basic Profile (node 482-1122)

**Extracted via Figma MCP Tools (get_variable_defs, get_design_context)**

**Token Values:**
```json
{
  "color/text/highlight": "#FFFFFF",
  "color/muted": "#8ea0bd",
  "space/sm": "8",
  "radius/md": "10",
  "field/base": "Font(family: Inter, style: Regular, size: 15, weight: 400)",
  "button/padding/xxl": "16",
  "button/padding/md": "10",
  "space/md": "12",
  "button/padding/xxxxl": "20",
  "radius/lg": "14",
  "color/card": "#151927",
  "color/stroke": "#1f2633",
  "color/bg": "#0c0e12",
  "button/padding/xs": "6",
  "space/xs": "6",
  "button/base": "Font(family: Inter, style: Bold, size: 15, weight: 700)",
  "color/accent": "#5ce1e6",
  "color/accent2": "#e68fff",
  "space/lg": "16"
}
```

**Structure:**
```
onb-screen (size-full, relative, flex col, justify-between)
├── onb-bg-layers (absolute inset-0)
│   └── video (fullbleed: h-[107.88%] w-[145.87%] top-[-7.87%] left-[-9.22%])
├── onb-logo-watermark (top-[44px], blur-[2px], opacity-20)
└── onb-content (basis-0 grow, flex col, gap-[8px], justify-end, p-[16px])
    └── onb-signup-card (bg-[#151927], border-[#1f2633], rounded-[14px])
        └── signup-inner (p-[20px], gap-[12px], overflow-clip)
            ├── header-block (py-[10px], gap-[8px])
            │   ├── title ("The Basics", extrabold 20px, tracking-[-0.16px], white)
            │   └── subtitle (normal 16px, #8ea0bd)
            ├── avatar-upload (h-[200px], bg-[#151927], border-[#1f2633], rounded-[14px])
            │   ├── inner (p-[20px], gap-[12px], center)
            │   │   └── "Upload an Image" (normal 15px, #8ea0bd)
            │   └── inset-shadow (shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25)])
            ├── field-row (gap-[8px])
            │   ├── age-field (gap-[6px])
            │   │   ├── label ("Age", bold 15px, white)
            │   │   └── input (bg-[#0c0e12], border-[#1f2633], rounded-[10px], px-[16px] py-[10px])
            │   └── gender-field (gap-[6px])
            │       ├── label ("Gender", bold 15px, white)
            │       └── select-row (gap-[6px])
            │           ├── btn ("Male", flex-1, bg-[#0c0e12], rounded-[10px], px-[16px] py-[10px])
            │           ├── btn ("Female", flex-1)
            │           └── btn ("Other", flex-1)
            └── cta-row (gap-[8px])
                └── cta-btn ("Continue 1/5", gradient, rounded-[10px], px-[16px] py-[10px])
```

**CSS Values (node 482-1122):**
```css
/* SCREEN CONTAINER */
display: flex; flex-direction: column; align-items: center; justify-content: space-between;
position: relative; width: 100%; height: 100%;

/* VIDEO BACKGROUND - FULL BLEED */
position: absolute; height: 107.88%; left: -9.22%; top: -7.87%; width: 145.87%;

/* LOGO WATERMARK */
position: absolute; filter: blur(2px); height: 163px; left: 51px; opacity: 0.2; top: 44px; width: 287px;

/* CONTENT WRAPPER */
flex: 1 0 0; display: flex; flex-direction: column; gap: 8px; /* space-sm */
align-items: center; justify-content: flex-end; padding: 16px; /* space-lg */
position: relative; width: 100%;

/* SIGNUP CARD */
background: #151927; /* color-card */
border: 1px solid #1f2633; /* color-stroke */
border-radius: 14px; /* radius-lg */
width: 100%;

/* SIGNUP INNER */
display: flex; flex-direction: column; gap: 12px; /* space-md */
overflow: clip; padding: 20px; /* button-padding-xxxxl */
border-radius: inherit; width: 100%;

/* HEADER TEXT BLOCK */
display: flex; flex-direction: column; gap: 8px; /* space-sm */
padding: 10px 0; /* py: radius-md */
width: 100%;

/* HEADER TITLE */
font-family: Inter; font-weight: 800; font-size: 20px;
color: white; letter-spacing: -0.16px;

/* HEADER SUBTITLE */
font-family: Inter; font-weight: 400; font-size: 16px;
color: #8ea0bd; /* color-muted */

/* AVATAR UPLOAD AREA */
background: #151927; /* color-card */
border: 1px solid #1f2633; /* color-stroke */
height: 200px; border-radius: 14px; /* radius-lg */
width: 100%;

/* AVATAR INSET SHADOW */
position: absolute; inset: 0; pointer-events: none;
box-shadow: inset 0px 4px 4px 0px rgba(0,0,0,0.25);

/* AVATAR PLACEHOLDER TEXT */
font-family: Inter; font-weight: 400; font-size: 15px;
color: #8ea0bd; /* color-muted */
text-align: center;

/* FIELD LABEL */
font-family: Inter; font-weight: 700; font-size: 15px; color: white;

/* FIELD INPUT */
background: #0c0e12; /* color-bg */
border: 1px solid #1f2633; /* color-stroke */
border-radius: 10px; /* radius-md */
padding: 10px 16px; /* py: button-padding-md, px: button-padding-xxl */
width: 100%;

/* INPUT PLACEHOLDER */
font-family: Inter; font-weight: 400; font-size: 15px;
color: #8ea0bd; /* color-muted */

/* GENDER SELECT ROW */
display: flex; gap: 6px; /* space-xs */
align-items: flex-start; width: 100%;

/* GENDER BUTTON (default) */
flex: 1 0 0; background: #0c0e12; /* color-bg */
border: 1px solid #1f2633; /* color-stroke */
border-radius: 10px; /* radius-md */
padding: 10px 16px; /* py: button-padding-md, px: button-padding-xxl */
font-family: Inter; font-weight: 400; font-size: 15px;
color: #8ea0bd; /* color-muted */
text-align: center;

/* CTA BUTTON */
border-radius: 10px; /* radius-md */
padding: 10px 16px; /* py: button-padding-md, px: button-padding-xxl */
width: 100%;
font-family: Inter; font-weight: 700; font-size: 15px;
color: #0c0e12; /* color-bg */
text-align: center;
/* background: gradient from cyan to pink */
```

### CSS Classes Reference for Screen 2

| Class | Purpose |
|-------|---------|
| `.onb-screen` | Full viewport container |
| `.onb-bg-layers` | Background layer wrapper |
| `.onb-bg-video-fullbleed` | Video extending beyond viewport |
| `.onb-logo-watermark-top` | Logo positioned at top-[44px] |
| `.onb-content-bottom` | Content aligned to bottom |
| `.onb-avatar-upload` | 200px tall upload area |
| `.onb-avatar-upload-inner` | Centered content wrapper |
| `.onb-avatar-shadow` | Inset shadow overlay |
| `.onb-avatar-text` | "Upload an Image" text |
| `.onb-gender-select` | 3-button row for gender |
| `.onb-gender-btn` | Individual gender button |
| `.onb-gender-btn-active` | Selected state with accent color |

---

---

## Mobile Home Swipe Card - Silver Tier (node 571:506)

**Extracted via Figma MCP Tools (get_variable_defs, get_design_context)**

### Token Values (Silver Variant)
```json
{
  "greys/100": "#FAFAFA",
  "color/red": "#ff7b7b",
  "color/panel": "#11141c",
  "color/accent": "#5ce1e6",
  "color/accent2": "#e68fff",
  "color/bg/card": "#151927",
  "color/text/muted": "#8EA0BD",
  "color/text/dark": "#5B687C",
  "color/button/stroke": "#1F2633",
  "color/text/base": "#E9EEF7",
  "space/xs": "6",
  "space/sm": "8",
  "space/md": "12",
  "space/lg": "16",
  "space/xl": "24",
  "space/xxl": "32",
  "radius/md": "10",
  "radius/lg": "14",
  "radius/circle": "999",
  "button/padding/xs": "6",
  "button/padding/sm": "8",
  "button/padding/md": "10",
  "button/padding/xxl": "16",
  "shadow/base": "Effect(type: DROP_SHADOW, color: #00000066, offset: (0, 20), radius: 60, spread: 0)",
  "shadow/inner": "Effect(type: INNER_SHADOW, color: #00000080, offset: (4, 4), radius: 4, spread: 0)",
  "shadow/navbarmobile": "Effect(type: DROP_SHADOW, color: #00000040, offset: (0, -4), radius: 4, spread: 0)"
}
```

### Structure
```
mh-silver-container (bg: #FAFAFA, full viewport)
├── mh-silver-content (gap: 16px, p: 16px, justify-end)
│   ├── mh-silver-card (border: 4px #e6e6e6, radius: 24px, shadow, p: 24px, gap: 12px)
│   │   ├── mh-silver-header (justify-between)
│   │   │   ├── mh-silver-logo (DAB logo, flipped, gradient fill)
│   │   │   └── mh-silver-status-row (gap: 12px)
│   │   │       ├── mh-chip-pro (🔥 PRO, border: #ff7b7b)
│   │   │       └── mh-status-online (Online, border: #5ce1e6)
│   │   ├── mh-silver-main (flex-col, gap: 12px)
│   │   │   ├── mh-silver-image-section
│   │   │   │   └── mh-silver-image-wrapper (border: 4px #e6e6e6, radius: 14px)
│   │   │   │       ├── mh-silver-image (object-cover)
│   │   │   │       └── mh-silver-image-overlay (gradient, p: 32px 12px 12px 12px)
│   │   │   │           ├── mh-silver-name-row (32px text, gap: 8px)
│   │   │   │           ├── mh-silver-location-row (16px, #8ea0bd)
│   │   │   │           └── mh-silver-chips-row (flex-wrap, gap: 6px)
│   │   │   │               ├── mh-silver-tag (style: Boulder, Sport)
│   │   │   │               ├── mh-silver-tag-grade (Advanced - pink)
│   │   │   │               ├── mh-silver-chip-belay (Belay Certified)
│   │   │   │               └── mh-silver-chip-standard (Edelrid Ohm, Host)
│   │   │   └── mh-silver-bio (border: 4px #e6e6e6, radius: 14px, inset shadow)
│   │   │       └── mh-silver-bio-text (14px, #11141c)
│   │   └── mh-silver-cta-row (gap: 12px, shadow)
│   │       ├── mh-silver-btn-next (bg: #1f2633, flex: 1)
│   │       └── mh-silver-btn-dab (gradient fill, flex: 1, h: 38px)
│   └── mh-silver-navbar (shadow: 0 -4px 4px)
│       └── mh-silver-navbar-frame (bg: #11141c, h: 100px, radius-top: 14px)
│           └── mh-silver-navbar-links (4 nav items)
```

### CSS Values (Exact from Figma node 571:506)

```css
/* SILVER CONTAINER */
background: #FAFAFA;  /* greys/100 */
display: flex; flex-direction: column; align-items: center; justify-content: center;
width: 100%; min-height: 100vh;

/* SILVER CONTENT */
flex: 1 1 0; display: flex; flex-direction: column; gap: 16px; /* space-lg */
align-items: center; justify-content: flex-end;
padding: 16px 16px 0 16px; /* pt: space-lg, px: space-lg */

/* SILVER CARD - 4px silver border, 24px radius */
background: transparent;
border: 4px solid #e6e6e6;
border-radius: 24px;
box-shadow: 0px 20px 60px 0px rgba(0, 0, 0, 0.4); /* shadow/base */
padding: 24px; /* space-xl */
gap: 12px; /* space-md */

/* HEADER ROW */
display: flex; align-items: center; justify-content: space-between; width: 100%;

/* DAB LOGO (header) */
width: 49.456px; height: 28.805px;
transform: scaleY(-1) rotate(180deg);
fill: linear-gradient(90deg, #5ce1e6, #e68fff);

/* STATUS ROW */
display: flex; gap: 12px; /* space-md */

/* PRO CHIP */
background: #11141c; /* color/panel */
border: 1px solid #ff7b7b; /* color/red */
padding: 6px 8px; /* py: btn-pad-xs, px: btn-pad-sm */
border-radius: 8px; /* space-sm */
font-size: 12px; font-weight: 400; color: #ff7b7b;

/* ONLINE STATUS */
background: #151927; /* color/bg/card */
border: 1px solid #5ce1e6; /* color/accent */
padding: 6px 10px; /* py: btn-pad-xs, px: btn-pad-md */
border-radius: 999px; /* radius/circle */
font-size: 12px; font-weight: 700; color: #5ce1e6;

/* IMAGE WRAPPER - 4px silver border */
border: 4px solid #e6e6e6;
border-radius: 14px; /* radius-lg */

/* IMAGE OVERLAY - gradient */
background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.75));
padding: 32px 12px 12px 12px; /* pt: space-xxl, px/pb: space-md */
gap: 6px; /* space-xs */
border-radius: 14px; /* radius-lg (inner) */

/* NAME ROW */
font-size: 32px; gap: 8px; color: white;
/* Name: font-weight: 800; Age: font-weight: 400; */

/* LOCATION */
font-size: 16px; font-weight: 500; color: #8ea0bd; /* color-muted */

/* STYLE TAG (Boulder, Sport) */
background: rgba(92, 225, 230, 0.08);
padding: 6px 10px; /* py: btn-pad-xs, px: btn-pad-md */
border-radius: 999px; /* radius-circle */
font-size: 12px; font-weight: 700; color: #5ce1e6; /* color-accent */

/* GRADE TAG (Advanced) */
background: rgba(92, 225, 230, 0.08);
padding: 6px 10px;
border-radius: 999px;
font-size: 12px; font-weight: 700; color: #e68fff; /* color-accent2 */

/* BELAY CERTIFIED CHIP */
background: #11141c; /* color-panel */
border: 1px solid #5ce1e6; /* color-accent */
padding: 6px 8px; /* py: btn-pad-xs, px: btn-pad-sm */
border-radius: 8px; /* space-sm */
font-size: 12px; font-weight: 400; color: #5ce1e6;

/* STANDARD CHIP (Edelrid Ohm, Host) */
background: #11141c; /* color-panel */
border: 1px solid #1f2633; /* color-stroke */
padding: 6px 8px;
border-radius: 8px;
font-size: 12px; font-weight: 400; color: #5b687c; /* color-text-dark */

/* BIO SECTION - 4px silver border, inset shadow */
border: 4px solid #e6e6e6;
border-radius: 14px; /* radius-lg */
padding: 12px 16px; /* py: space-md, px: space-lg */
gap: 8px; /* space-sm */

/* BIO TEXT - dark on light */
font-size: 14px; /* body-sm */
font-weight: 500;
color: #11141c; /* dark text */

/* BIO INSET SHADOW */
box-shadow: inset 4px 4px 4px 0px rgba(0, 0, 0, 0.5);

/* CTA ROW */
display: flex; gap: 12px; /* space-md */
box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.4); /* shadow/small */

/* NEXT BUTTON */
background: #1f2633; /* color-stroke */
padding: 10px 16px; /* py: btn-pad-md, px: btn-pad-xxl */
border-radius: 10px; /* radius-md */
font-size: 15px; font-weight: 700; color: #e9eef7; /* color-text-base */

/* DAB BUTTON - gradient fill */
background: linear-gradient(90deg, #5ce1e6, #e68fff);
border: 1px solid #5ce1e6;
border-radius: 10px; /* radius-md */
height: 38px;
/* Contains DAB logo (36.498px × 22px) with dark fill #0C0E12 */

/* MOBILE NAVBAR */
box-shadow: 0px -4px 4px 0px rgba(0, 0, 0, 0.25); /* shadow/navbarmobile */

/* NAVBAR FRAME */
background: #11141c; /* color-panel */
padding: 12px 24px; /* py: space-md, px: space-xl */
border-top-left-radius: 14px; /* radius-lg */
border-top-right-radius: 14px;
height: 100px;

/* NAV ITEM ICON */
width: 26px; height: 26px;
color (inactive): #5b687c; /* color-text-dark */
color (active): #5ce1e6; /* color-accent */

/* NAV LABEL */
font-size: 10px; /* body-xxs */
font-weight: 400;
color (inactive): #5b687c;
color (active): #8ea0bd; /* color-muted */
```

### Tailwind Classes (Exact from Figma)

```tailwind
/* SILVER CONTAINER */
bg-neutral-50 content-stretch flex flex-col items-center justify-center relative size-full

/* SILVER CONTENT */
basis-0 box-border content-stretch flex flex-col gap-[var(--space\/lg,16px)] grow items-center justify-end min-h-px min-w-px pb-0 pt-[var(--space\/lg,16px)] px-[var(--space\/lg,16px)] relative shrink-0 w-full

/* SILVER CARD */
basis-0 border-4 border-[#e6e6e6] border-solid box-border content-stretch flex flex-col gap-[var(--space\/md,12px)] grow items-center min-h-px min-w-px p-[var(--space\/xl,24px)] relative rounded-[24px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.4)] shrink-0 w-full

/* HEADER */
content-stretch flex items-center justify-between relative shrink-0 w-full

/* STATUS ROW */
content-stretch flex gap-[var(--space\/md,12px)] items-start justify-end relative shrink-0

/* ONLINE PILL */
bg-[#151927] border border-[#5ce1e6] border-solid box-border content-stretch flex items-center justify-center px-[var(--button\/padding\/md,10px)] py-[var(--button\/padding\/xs,6px)] relative rounded-[var(--radius\/circle,999px)] shrink-0

/* IMAGE WRAPPER */
basis-0 border-4 border-[#e6e6e6] border-solid box-border content-stretch flex flex-col gap-[8px] grow h-full items-center justify-end min-h-px min-w-px relative rounded-[var(--radius\/lg,14px)] shrink-0

/* IMAGE OVERLAY */
bg-gradient-to-b box-border content-stretch flex flex-col from-[rgba(0,0,0,0)] gap-[var(--space\/xs,6px)] items-start justify-end pb-[var(--space\/md,12px)] pt-[var(--space\/xxl,32px)] px-[var(--space\/md,12px)] relative rounded-[var(--radius\/lg,14px)] shrink-0 to-[rgba(0,0,0,0.75)] w-full

/* NAME ROW */
content-stretch flex gap-[8px] items-center leading-[0] not-italic relative shrink-0 text-[32px] text-nowrap text-white w-full

/* STYLE TAG */
bg-[rgba(92,225,230,0.08)] box-border content-stretch flex gap-[6px] items-center justify-center px-[var(--button\/padding\/md,10px)] py-[var(--button\/padding\/xs,6px)] relative rounded-[var(--radius\/circle,999px)] shrink-0 w-full
font-['Inter:Bold',sans-serif] font-bold text-[#5ce1e6] text-[12px]

/* GRADE TAG (Advanced) */
font-['Inter:Bold',sans-serif] font-bold text-[12px] text-[color:var(--color\/accent2,#e68fff)]

/* BELAY CHIP */
bg-[#11141c] border border-[#5ce1e6] border-solid box-border content-stretch flex items-center justify-center px-[var(--button\/padding\/sm,8px)] py-[var(--button\/padding\/xs,6px)] relative rounded-[var(--space\/sm,8px)] shrink-0
font-['Inter:Regular',sans-serif] font-normal text-[#5ce1e6] text-[12px]

/* STANDARD CHIP */
bg-[#11141c] border border-[#1f2633] border-solid box-border content-stretch flex items-center justify-center px-[var(--button\/padding\/sm,8px)] py-[var(--button\/padding\/xs,6px)] relative rounded-[var(--space\/sm,8px)] shrink-0
font-['Inter:Regular',sans-serif] font-normal text-[#5b687c] text-[12px]

/* BIO SECTION */
border-4 border-[#e6e6e6] border-solid box-border content-stretch flex flex-col gap-[var(--space\/sm,8px)] items-center px-[var(--space\/lg,16px)] py-[var(--space\/md,12px)] relative rounded-[var(--radius\/lg,14px)] shrink-0 w-full

/* BIO INSET SHADOW */
absolute inset-0 pointer-events-none shadow-[4px_4px_4px_0px_inset_rgba(0,0,0,0.5)]

/* CTA ROW */
box-border content-stretch flex gap-[var(--space\/md,12px)] items-center overflow-clip relative shadow-[0px_2px_2px_0px_rgba(0,0,0,0.4)] shrink-0 w-full

/* NEXT BUTTON */
bg-[#1f2633] box-border content-stretch flex items-center justify-center px-[var(--button\/padding\/xxl,16px)] py-[var(--button\/padding\/md,10px)] relative rounded-[var(--radius\/md,10px)] shrink-0 w-full
font-['Inter:Bold',sans-serif] font-bold text-[#e9eef7] text-[15px]

/* DAB BUTTON - gradient */
border border-[#5ce1e6] border-solid box-border content-stretch flex h-[38px] items-center justify-center relative rounded-[var(--radius\/md,10px)] shrink-0 w-full
background: linear-gradient(90deg, #5ce1e6, #e68fff)

/* NAVBAR */
box-border content-stretch flex gap-[8px] items-start relative shadow-[0px_-4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[390px]

/* NAVBAR FRAME */
basis-0 bg-[#11141c] box-border content-stretch flex flex-col grow h-[100px] items-start min-h-px min-w-px px-[var(--space\/xl,24px)] py-[var(--space\/md,12px)] relative rounded-tl-[var(--radius\/lg,14px)] rounded-tr-[var(--radius\/lg,14px)] shrink-0

/* NAV ITEM */
basis-0 content-stretch flex flex-col gap-[8px] grow h-full items-center justify-center min-h-px min-w-px relative shrink-0

/* NAV LABEL */
font-['Inter:Regular',sans-serif] font-normal h-[14px] text-[#5b687c] text-[10px] text-center w-[73px]
```

### CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.mh-silver-container` | Full viewport container with neutral-50 bg |
| `.mh-silver-content` | Content wrapper with bottom justify |
| `.mh-silver-card` | Main card with 4px silver border, 24px radius |
| `.mh-silver-header` | Header row (logo + status) |
| `.mh-silver-logo` | DAB logo container (flipped) |
| `.mh-silver-status-row` | PRO + Online chips row |
| `.mh-silver-main` | Main content area |
| `.mh-silver-image-section` | Image section wrapper |
| `.mh-silver-image-wrapper` | Image container with silver border |
| `.mh-silver-image` | Profile image |
| `.mh-silver-image-overlay` | Gradient overlay |
| `.mh-silver-name-row` | Name + age row |
| `.mh-silver-location-row` | Location text |
| `.mh-silver-chips-section` | Chips container |
| `.mh-silver-chips-row` | Wrapping chips row |
| `.mh-silver-tag` | Style tag (Boulder, Sport) |
| `.mh-silver-tag-grade` | Grade tag modifier (pink) |
| `.mh-silver-chip-belay` | Belay Certified chip |
| `.mh-silver-chip-standard` | Standard chip |
| `.mh-silver-bio` | Bio section with silver border |
| `.mh-silver-bio-text` | Bio text (dark on light) |
| `.mh-silver-bio-shadow` | Inset shadow overlay |
| `.mh-silver-cta-row` | CTA buttons row |
| `.mh-silver-btn-next` | Next button (gray bg) |
| `.mh-silver-btn-dab` | DAB button (gradient fill) |
| `.mh-silver-navbar` | Mobile navbar container |
| `.mh-silver-navbar-frame` | Navbar frame |
| `.mh-silver-navbar-links` | Nav links row |
| `.mh-silver-nav-item` | Individual nav item |
| `.mh-silver-nav-icon` | Nav icon |
| `.mh-silver-nav-label` | Nav label text |

---

*Last Updated: 2025-01-XX (Major Update)*
*Source: Figma file `DAB-Build` via MCP tools*
*Nodes referenced: 626:1154 (02_COMPONENTS page), 636:2049 (usercard-mobile), 634:16523, 475:11205, 475:11238, 475:11311, 476:13447, 475:11248, 475:11301, 456:4115, 592:2085, 634:15800, 470:1116, and more*
*All tokens extracted using `get_variable_defs` and `get_design_context` with forceCode:true*

---

## 🎴 User Card Mobile Component (Cyan Border Variant)

**Component Location:**
- **Figma Node**: `636:2049` (usercard-mobile frame), `634:16523` (Property 1=Default)
- **Component File**: `src/components/MobileSwipeCardSilver.tsx`
- **CSS Classes**: All prefixed with `.uc-mobile-*`

### Key Design Tokens (Exact from Figma)

| Element | Value | Usage |
|---------|-------|-------|
| **Card Container** | `bg: #0c0e12`, `border: 4px solid #5ce1e6`, `radius: 14px` | Main card with cyan border |
| **Card Size** | `width: 358px`, `height: 724px` | Fixed dimensions |
| **Card Padding** | `24px` (space/xl) | Inner padding |
| **Card Gap** | `12px` (space/md) | Gap between sections |
| **Card Shadow** | `0px 20px 60px 0px rgba(0, 0, 0, 0.4)` | shadow/base |
| **Image Wrapper Border** | `4px solid #5ce1e6` | Cyan border on image |
| **Image Wrapper Padding** | `4px` (space/xxs) | Padding inside border |
| **Image Height** | `500px` | Fixed height |
| **Name Font** | `32px`, `800 weight` (heading/md) | Name text size |
| **Age Font** | `32px`, `400 weight` | Age text size |
| **Location Font** | `16px`, `500 weight` (body/base) | Location text |
| **Location Color** | `#e9eef7` (color/text) | Location text color |
| **Chips Gap** | `6px` | Gap between chips in overlay |
| **Chip Background** | `#151927` (color/card) | Chips in overlay use card bg |
| **Bio Background** | `#1f2633` (color/stroke) | Bio section background |
| **Bio Padding** | `12px 16px` (space/md, space/lg) | Bio padding |
| **Bio Font** | `14px`, `500 weight` (body/sm) | Bio text size |
| **Bio Text Color** | `#8ea0bd` (color/muted) | Bio text color |
| **Bio Text Width** | `278px` | Exact width from Figma |
| **Bio Inset Shadow** | `inset 4px 4px 4px 0px rgba(0, 0, 0, 0.5)` | shadow/inner |
| **CTA Row Gap** | `12px` (space/md) | Gap between buttons |
| **Next Button** | `bg: #11141c` (color/panel) | Panel background |
| **DAB Button** | `border: 1px solid #5ce1e6` | Border only (no fill) |

### Structure

```
uc-mobile-card (358px × 724px, bg: #0c0e12, border: 4px #5ce1e6, radius: 14px, p: 24px, gap: 12px)
├── uc-mobile-header (justify-between)
│   ├── PRO chip (left) - megabtn-chip megabtn-chip-pro
│   └── Online pill (right) - megabtn-pill megabtn-pill-online
├── uc-mobile-main (flex-col, gap: 12px)
│   ├── uc-mobile-image-section (h: 500px)
│   │   └── uc-mobile-image-wrapper (border: 4px #5ce1e6, p: 4px, radius: 14px)
│   │       ├── uc-mobile-image (absolute, cover)
│   │       └── uc-mobile-image-overlay (gradient, p: 32px 12px 12px 12px, gap: 6px)
│   │           ├── uc-mobile-name-row (32px font, gap: 8px)
│   │           │   ├── uc-mobile-name (32px, 800 weight, white)
│   │           │   └── uc-mobile-age (32px, 400 weight, white)
│   │           ├── uc-mobile-location-row (16px, #e9eef7)
│   │           └── uc-mobile-chips-section
│   │               └── uc-mobile-chips-row (flex-wrap, gap: 6px)
│   │                   ├── Style tags (Boulder, Sport) - button-tag
│   │                   ├── Grade tag (Advanced) - button-tag button-tag-grade
│   │                   ├── Belay Certified - button-chip button-chip-accent button-chip-card-bg
│   │                   └── Standard chips - button-chip button-chip-muted button-chip-card-bg
│   └── uc-mobile-bio (bg: #1f2633, p: 12px 16px, radius: 14px)
│       ├── uc-mobile-bio-text (14px, #8ea0bd, width: 278px)
│       └── uc-mobile-bio-shadow (inset shadow)
└── uc-mobile-cta-row (gap: 12px)
    ├── Next button (flex: 1) - button-navlink (bg: #11141c)
    └── DAB button (flex: 1) - button-dab (border only)
```

### CSS Values (Exact from Figma node 634:16523)

```css
/* USER CARD CONTAINER */
.uc-mobile-card {
  width: 358px;
  height: 724px;
  background: #0c0e12; /* color/bg */
  border: 4px solid #5ce1e6; /* 4px cyan border */
  border-radius: 14px; /* radius/lg */
  padding: 24px; /* space/xl */
  gap: 12px; /* space/md */
  box-shadow: 0px 20px 60px 0px rgba(0, 0, 0, 0.4); /* shadow/base */
}

/* HEADER ROW */
.uc-mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* IMAGE SECTION - 500px height */
.uc-mobile-image-section {
  height: 500px;
  width: 100%;
}

/* IMAGE WRAPPER - 4px cyan border, 4px padding */
.uc-mobile-image-wrapper {
  border: 4px solid #5ce1e6;
  border-radius: 14px; /* radius/lg */
  padding: 4px; /* space/xxs - padding inside border */
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* IMAGE OVERLAY */
.uc-mobile-image-overlay {
  background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.75));
  padding: 32px 12px 12px 12px; /* pt: space/xxl, px/pb: space/md */
  gap: 6px; /* space/xs */
  border-radius: 14px; /* radius/lg */
}

/* NAME ROW - 32px font, gap 8px */
.uc-mobile-name-row {
  font-size: 32px; /* heading/md */
  gap: 8px; /* space/sm */
  color: #ffffff; /* color/white */
}

.uc-mobile-name {
  font-weight: 800; /* Extra Bold */
}

.uc-mobile-age {
  font-weight: 400; /* Regular */
}

/* LOCATION - 16px, text color */
.uc-mobile-location {
  font-size: 16px; /* body/base */
  font-weight: 500; /* Medium */
  color: #e9eef7; /* color/text */
}

/* CHIPS ROW - gap 6px */
.uc-mobile-chips-row {
  gap: 6px; /* 6px gap between chips */
  flex-wrap: wrap;
}

/* Chips in overlay use card background */
.megabtn-chip-card-bg {
  background: #151927; /* color/card */
}

/* BIO SECTION - stroke color background */
.uc-mobile-bio {
  background: #1f2633; /* color/stroke */
  padding: 12px 16px; /* py: space/md, px: space/lg */
  border-radius: 14px; /* radius/lg */
  position: relative;
}

.uc-mobile-bio-text {
  font-size: 14px; /* body/sm */
  font-weight: 500; /* Medium */
  color: #8ea0bd; /* color/muted */
  width: 278px; /* exact width from Figma */
}

.uc-mobile-bio-shadow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 4px 4px 4px 0px rgba(0, 0, 0, 0.5); /* shadow/inner */
  border-radius: 14px; /* radius/lg */
}

/* CTA ROW - gap 12px */
.uc-mobile-cta-row {
  gap: 12px; /* space/md */
  width: 100%;
}

.uc-mobile-cta-button-wrapper {
  flex: 1 0 0;
  min-width: 0;
}

/* NEXT BUTTON - panel background */
.megabtn-navlink {
  background: #11141c; /* color/panel */
  color: #e9eef7; /* color/text */
}

/* DAB BUTTON - border only */
.megabtn-dab {
  border: 1px solid #5ce1e6;
  background: transparent;
}
```

### Tailwind Classes (Exact from Figma)

```tailwind
/* CARD CONTAINER */
bg-[var(--color\/bg,#0c0e12)] border-4 border-[#5ce1e6] border-solid
flex flex-col gap-[var(--space\/md,12px)] items-center
p-[var(--space\/xl,24px)] rounded-[var(--radius\/lg,14px)]
shadow-[0px_20px_60px_0px_rgba(0,0,0,0.4)]
h-[724px] w-[358px]

/* HEADER */
flex items-center justify-between w-full

/* IMAGE SECTION */
flex h-[500px] items-center w-full

/* IMAGE WRAPPER */
border-4 border-[#5ce1e6] border-solid
p-[var(--space\/xxs,4px)] rounded-[var(--radius\/lg,14px)]
basis-0 grow h-full

/* IMAGE OVERLAY */
bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.75)]
flex flex-col gap-[var(--space\/xs,6px)] items-start justify-end
pb-[var(--space\/md,12px)] pt-[var(--space\/xxl,32px)] px-[var(--space\/md,12px)]
rounded-[var(--radius\/lg,14px)]

/* NAME ROW */
flex gap-[8px] items-center text-[32px] text-white

/* LOCATION */
text-[16px] text-[color:var(--color\/text,#e9eef7)]

/* CHIPS ROW */
flex flex-wrap gap-[6px] items-start overflow-clip w-full

/* CHIP (in overlay) */
bg-[var(--color\/card,#151927)] border border-[var(--color\/primary,#5ce1e6)]
px-[var(--button\/padding\/sm,8px)] py-[var(--button\/padding\/xs,6px)]
rounded-[var(--space\/sm,8px)] text-[12px]

/* BIO SECTION */
bg-[var(--color\/stroke,#1f2633)] flex flex-col gap-[var(--space\/sm,0px)]
px-[var(--space\/lg,16px)] py-[var(--space\/md,12px)]
rounded-[var(--radius\/lg,14px)] w-full

/* BIO TEXT */
text-[14px] text-[color:var(--color\/muted,#8ea0bd)] w-[278px]

/* BIO SHADOW */
absolute inset-0 pointer-events-none
shadow-[4px_4px_4px_0px_inset_rgba(0,0,0,0.5)]

/* CTA ROW */
flex gap-[var(--space\/md,12px)] items-center overflow-clip w-full

/* NEXT BUTTON */
bg-[var(--color\/panel,#11141c)] px-[var(--button\/padding\/xxl,16px)]
py-[var(--button\/padding\/md,10px)] rounded-[var(--radius\/md,10px)]
text-[15px] text-[color:var(--color\/text,#e9eef7)] w-full

/* DAB BUTTON */
border border-[var(--color\/primary,#5ce1e6)] h-[38px]
px-[var(--button\/padding\/xxl,16px)] py-[var(--button\/padding\/md,10px)]
rounded-[var(--radius\/md,10px)] w-full
```

### CSS Classes Reference

| Class | Purpose | Key Styles |
|-------|---------|------------|
| `.uc-mobile-card` | Main card container | `358px × 724px`, `4px cyan border`, `bg: #0c0e12` |
| `.uc-mobile-header` | Header row | `justify-between` |
| `.uc-mobile-main` | Main content area | `flex-col`, `gap: 12px` |
| `.uc-mobile-image-section` | Image section wrapper | `height: 500px` |
| `.uc-mobile-image-wrapper` | Image container | `4px cyan border`, `padding: 4px` |
| `.uc-mobile-image` | Profile image | `absolute`, `cover` |
| `.uc-mobile-image-overlay` | Gradient overlay | `gradient`, `p: 32px 12px 12px 12px` |
| `.uc-mobile-name-row` | Name + age row | `32px font`, `gap: 8px` |
| `.uc-mobile-name` | Name text | `32px`, `800 weight` |
| `.uc-mobile-age` | Age text | `32px`, `400 weight` |
| `.uc-mobile-location-row` | Location container | `16px font` |
| `.uc-mobile-location` | Location text | `#e9eef7` color |
| `.uc-mobile-chips-section` | Chips container | `flex-col` |
| `.uc-mobile-chips-row` | Wrapping chips row | `gap: 6px`, `flex-wrap` |
| `.uc-mobile-bio` | Bio section | `bg: #1f2633`, `p: 12px 16px` |
| `.uc-mobile-bio-text` | Bio text | `14px`, `#8ea0bd`, `width: 278px` |
| `.uc-mobile-bio-shadow` | Inset shadow overlay | `inset 4px 4px 4px rgba(0,0,0,0.5)` |
| `.uc-mobile-cta-row` | CTA buttons row | `gap: 12px` |
| `.uc-mobile-cta-button-wrapper` | Button wrapper | `flex: 1 0 0` |

### Implementation Notes

1. **Cyan Border**: Card and image wrapper both use `4px solid #5ce1e6` (not silver)
2. **Image Padding**: Image wrapper has `4px` padding inside the border
3. **Name Size**: Name and age both use `32px` font (heading/md size)
4. **Location Color**: Location uses `#e9eef7` (text color), not muted
5. **Chip Background**: Chips in overlay use `#151927` (card bg) with `.megabtn-chip-card-bg` modifier
6. **Bio Background**: Bio uses `#1f2633` (stroke color) as background, not silver
7. **Bio Text Width**: Bio text has exact width of `278px` from Figma
8. **CTA Buttons**: Next button uses panel bg, DAB button is border-only (not gradient)

---

## 🆕 Major Updates (2025-01-XX)

### New Tokens Added
- `color/primary` (#5ce1e6) - alias for accent
- `color/secondary` (#e68fff) - alias for accent2
- `color/white` (#ffffff) - white text/backgrounds
- `color/darker` (#5b687c) - darker inactive text
- `shadow/glow` - accent glow effect
- `inner/lightfill` - light fill inner shadow

### Corrected Values
- **Pill opacity**: Default is 0.2 (not 0.08), Joined is 0.4 (not 0.08)
- **Chip backgrounds**: Use `color/bg` (#0c0e12) not `color/panel` for default state
- **Chip text**: Default chips use white text (#e9eef7) not muted
- **Ghost button**: Border uses `color/muted` (#8ea0bd) not `color/stroke`
- **Button hover states**: CTA and DAB buttons use border + small shadow on hover
- **Chip hover**: Uses panel background (#11141c) with muted border
- **Chip focus**: Uses panel background with accent border and accent text
- **Radius/sm**: Token value is 6px, but chips use space/sm (8px) as radius

### Component Updates
- All button variants now include hover state specifications
- Chip variants updated with correct background colors and text colors
- Pill variants updated with correct opacity values
- Filter mobile button documented (white bg with muted border)

