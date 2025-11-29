# DAB UI System Library

This document serves as a comprehensive reference for the DAB design system, with **EXACT values extracted directly from Figma**.

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
| radius/sm | 8px | 8px |
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

### Colors (Exact Hex Values)

| Token | Value | Usage |
|-------|-------|-------|
| `color/bg` | `#0c0e12` | Main background |
| `color/panel` | `#11141c` | Panel backgrounds, chip backgrounds |
| `color/card` | `#151927` | Card backgrounds |
| `color/stroke` | `#1f2633` | Borders and dividers |
| `color/text` | `#e9eef7` | Primary text |
| `color/text/muted` | `#8EA0BD` | Secondary/muted text |
| `color/muted` | `#8ea0bd` | Alias for muted |
| `color/accent` | `#5ce1e6` | Primary accent (cyan) |
| `color/accent2` | `#e68fff` | Secondary accent (purple) |

```css
/* CSS Variables - Exact from Figma */
--color-bg: #0c0e12;
--color-panel: #11141c;
--color-card: #151927;
--color-stroke: #1f2633;
--color-text: #e9eef7;
--color-muted: #8ea0bd;
--color-accent: #5ce1e6;
--color-accent2: #e68fff;
```

### Spacing (Exact Pixel Values)

| Token | Value | Usage |
|-------|-------|-------|
| `space/xxs` | `4px` | Smallest gaps (tag row gap) |
| `space/xs` | `6px` | Small gaps (bio gap, overlay gap) |
| `space/sm` | `8px` | CTA row gap, info row gap |
| `space/md` | `12px` | Inner container gap, overlay padding |
| `space/lg` | `16px` | Content row gap |
| `space/xxl` | `32px` | Overlay top padding |

```css
--space-xxs: 4px;
--space-xs: 6px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xxl: 32px;
```

### Button Padding (Exact Pixel Values)

| Token | Value | Usage |
|-------|-------|-------|
| `button/padding/xs` | `6px` | Vertical padding for pills, tags, chips |
| `button/padding/sm` | `8px` | Horizontal padding for chips |
| `button/padding/md` | `10px` | Horizontal padding for pills/tags, vertical for buttons |
| `button/padding/xxl` | `16px` | Horizontal padding for buttons |
| `button/padding/xxxxl` | `20px` | Inner container padding |

```css
--btn-pad-xs: 6px;
--btn-pad-sm: 8px;
--btn-pad-md: 10px;
--btn-pad-xxl: 16px;
--btn-pad-xxxxl: 20px;
```

### Border Radius (Exact Pixel Values)

| Token | Value | Usage |
|-------|-------|-------|
| space-sm (as radius) | 8px | Chips |
| radius-md | 10px | Buttons |
| radius-lg | 14px | Cards, images |
| radius-circle | 999px | Pills, tags |

```css
--radius-sm: 8px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-circle: 999px;
```

### Shadows (Exact Values)

| Token | Value |
|-------|-------|
| `shadow-card` | `0px 20px 60px 0px rgba(0, 0, 0, 0.4)` |

```css
--shadow-card: 0px 20px 60px 0px rgba(0, 0, 0, 0.4);
```

---

## Typography

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
```

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

*Last Updated: 2025-11-29*
*Source: Figma node 470:1116 via get_variable_defs and get_design_context*

