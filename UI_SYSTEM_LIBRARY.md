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

**All values extracted directly from Figma file `DAB-Build` using `get_variable_defs`**

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
| `color/brand/primary` | `#5CE1E6` | Brand primary (alias) |
| `color/accent2` | `#e68fff` | Secondary accent (pink/purple) |
| `color/special` | `#ff9500` | Special/founder (orange) |
| `color/red` | `#ff7b7b` | Error/PRO badge/peaking state (red) |
| `color/yellow` | `#ffd166` | Warning/busy state (gold/yellow) |

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
  --color-accent2: #e68fff;
  --color-special: #ff9500;
  --color-red: #ff7b7b;
  --color-yellow: #ffd166;
  
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
| `space/sm` (as radius) | `8px` | `--radius-sm` | Chips |
| `radius/md` | `10px` | `--radius-md` | Buttons, inputs |
| `radius/lg` | `14px` | `--radius-lg` | Cards, images |
| `radius/circle` | `999px` | `--radius-circle` | Pills, tags, avatars |

```css
:root {
  --radius-sm: 8px;
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
| `shadow/small` | DROP_SHADOW | `0px 2px 2px rgba(0,0,0,0.4)` | Small elements |
| `shadow/inner` | INNER_SHADOW | `inset 4px 4px 4px rgba(0,0,0,0.5)` | Inset effects |
| `shadow/superglow` | DROP_SHADOW | `0px 0px 10px 10px rgba(92,225,230,0.4)` | Accent glow |
| `shadow/navbarmobile` | DROP_SHADOW | `0px -4px 4px rgba(0,0,0,0.25)` | Mobile navbar |

```css
:root {
  /* Drop Shadows */
  --shadow-base: 0px 20px 60px 0px rgba(0, 0, 0, 0.4);
  --shadow-hover: 0px 24px 70px 0px rgba(0, 0, 0, 0.45);
  --shadow-small: 0px 2px 2px 0px rgba(0, 0, 0, 0.4);
  --shadow-navbar-mobile: 0px -4px 4px 0px rgba(0, 0, 0, 0.25);
  
  /* Glow Effects */
  --shadow-superglow: 0px 0px 10px 10px rgba(92, 225, 230, 0.4);
  --shadow-dab-glow: 0px 0px 20px 0px rgba(92, 225, 230, 0.4);
  --shadow-dab-glow-hover: 0px 0px 30px 0px rgba(92, 225, 230, 0.6);
  
  /* Inner Shadows */
  --shadow-inner: inset 4px 4px 4px 0px rgba(0, 0, 0, 0.5);
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

| Class | Figma Node | Description | Padding | Radius |
|-------|------------|-------------|---------|--------|
| `.megabtn-cta` | button.cta | Gradient fill, dark text | 10px 16px | 10px |
| `.megabtn-ghost` | button.ghost | Transparent, border | 10px 16px | 10px |
| `.megabtn-navlink` | button.navlink | Dark fill `#1f2633` | 10px 16px | 10px |
| `.megabtn-dab` | button.dab | Cyan border, logo | 10px 16px | 10px |
| `.megabtn-dab-filled` | button.dab (filled) | Gradient fill, logo | 10px 16px | 10px |

```css
/* CTA Button - Gradient */
.megabtn-cta {
  padding: 10px 16px;
  background: linear-gradient(120deg, #5ce1e6, #e68fff);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #0c0e12;
  box-shadow: 0px 20px 60px 0px rgba(0, 0, 0, 0.4);
}

/* Ghost Button */
.megabtn-ghost {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid #1f2633;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #e9eef7;
}

/* Navlink Button */
.megabtn-navlink {
  padding: 10px 16px;
  background: #1f2633;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #e9eef7;
}

/* DAB Button (outline) */
.megabtn-dab {
  height: 38px;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid #5ce1e6;
  border-radius: 10px;
}

/* DAB Button (filled) */
.megabtn-dab-filled {
  height: 38px;
  padding: 10px 16px;
  background: linear-gradient(90deg, #5ce1e6, #e68fff);
  border: 1px solid #5ce1e6;
  border-radius: 10px;
}
```

### Pill Variants (Small - 12px font, 999px radius)

| Class | Figma State | Description | Background | Border |
|-------|-------------|-------------|------------|--------|
| `.megabtn-pill` | default | Default pill | `rgba(92,225,230,0.08)` | 1px `#1f2633` |
| `.megabtn-pill-joined` | joined | Joined indicator | `rgba(92,225,230,0.08)` | none |
| `.megabtn-pill-online` | focus | Online status | `rgba(92,225,230,0.12)` | 1px `#5ce1e6` |

```css
/* Default Pill */
.megabtn-pill {
  padding: 6px 10px;
  background: rgba(92, 225, 230, 0.08);
  border: 1px solid #1f2633;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #5ce1e6;
}

/* Joined Pill (no border) */
.megabtn-pill-joined {
  padding: 6px 10px;
  background: rgba(92, 225, 230, 0.08);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 400;
  color: #5ce1e6;
}

/* Online Pill (focus state - with border) */
.megabtn-pill-online {
  padding: 6px 10px;
  background: rgba(92, 225, 230, 0.12);
  border: 1px solid #5ce1e6;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #5ce1e6;
}
```

### Tag Variants (Small - 12px font, 999px radius)

| Class | Figma Node | Description | Text Color |
|-------|------------|-------------|------------|
| `.megabtn-tag` | button.tag | Style tags (Boulder, Sport) | `#5ce1e6` |
| `.megabtn-tag-grade` | button.tag (grade) | Grade tags (Advanced) | `#e68fff` |

```css
/* Style Tag */
.megabtn-tag {
  padding: 6px 10px;
  background: rgba(92, 225, 230, 0.08);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #5ce1e6;
}

/* Grade Tag (modifier) */
.megabtn-tag-grade {
  color: #e68fff;
}
```

### Chip Variants (Small - 12px font, 8px radius)

| Class | Figma State | Description | Border Color | Text Color |
|-------|-------------|-------------|--------------|------------|
| `.megabtn-chip-muted` | default | Standard chips | `#1f2633` | `#8ea0bd` |
| `.megabtn-chip-hover` | hover | Hover state | `#8ea0bd` | `#8ea0bd` |
| `.megabtn-chip-accent` | focus | Belay Certified | `#5ce1e6` | `#5ce1e6` |
| `.megabtn-chip-busy` | busy | Busy/away status | `#ffd166` | `#ffd166` |
| `.megabtn-chip-pink` | pink | Pink accent | `#e68fff` | `#e68fff` |
| `.megabtn-chip-peaking` | peaking | Peak activity | `#ff7b7b` | `#ff7b7b` |
| `.megabtn-chip-pro` | pro | PRO badge | `#ff7b7b` | `#ff7b7b` |
| `.megabtn-chip-founder` | founder | Founder badge | `#ff9500` | gradient text |
| `.megabtn-chip-crew` | crew | Crew badge | `#ff9500` | gradient text |

```css
/* Chip Base */
.megabtn-chip {
  padding: 6px 8px;
  background: #11141c;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 400;
}

/* Default/Muted Chip */
.megabtn-chip-muted {
  border: 1px solid #1f2633;
  color: #8ea0bd;
}

/* Hover State */
.megabtn-chip-hover {
  border: 1px solid #8ea0bd;
  color: #8ea0bd;
}

/* Accent/Focus Chip (Belay Certified) */
.megabtn-chip-accent {
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
/* Input Field */
.megabtn-field {
  width: 100%;
  padding: 10px 16px;
  background: #0c0e12;
  border: 1px solid #1f2633;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 400;
  color: #e9eef7;
}

.megabtn-field::placeholder {
  color: #8ea0bd;
}

.megabtn-field:focus {
  border-color: #5ce1e6;
  outline: none;
}

/* Activity Log Item */
.megabtn-activitylog {
  width: 100%;
  padding: 10px 16px;
  background: #11141c;
  border: 1px solid #1f2633;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 400;
  color: #8ea0bd;
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
// Primary CTA
<button className="megabtn megabtn-cta">Get Started</button>

// Ghost Button
<button className="megabtn megabtn-ghost">Browse</button>

// Full Width
<button className="megabtn megabtn-cta megabtn-full">Submit</button>

// DAB Button with Glow
<div className="megabtn-dab-wrapper">
  <button className="megabtn megabtn-dab">
    <img src="/dab-logo.svg" alt="DAB" />
  </button>
</div>

// Status Pill
<span className="megabtn megabtn-pill megabtn-pill-online">Online</span>

// Style Tag
<span className="megabtn megabtn-tag">Boulder</span>

// Grade Tag
<span className="megabtn megabtn-tag megabtn-tag-grade">Advanced</span>

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

*Last Updated: 2025-12-03*
*Source: Figma file `DAB-Build` via MCP tools*
*Nodes referenced: 465:38, 470:1116, 475:11205, 476:13448, 482:530, 482:1122, 571:506*
*All tokens extracted using `get_variable_defs` and `get_design_context`*

