# UI Audit Report - Pre-Launch Polish

**Date:** 2025-12-22
**Purpose:** Identify and fix all UI/UX issues before first user launch

---

## 🔴 Critical Issues (Blockers)

### 1. **Missing fallback-female.jpg**
**Location:** `src/components/LandingPage.tsx:10`
**Issue:** Referenced file does not exist in `/public` folder
**Impact:** Female-identifying users will see broken images
**Fix:** Create or use fallback-male.jpg for all genders

### 2. **Broken Figma-hosted icons**
**Location:** `src/components/LandingPage.tsx:106-108`
```typescript
const ROCK_ICON = 'https://www.figma.com/api/mcp/asset/b40792a1-8803-46f4-8eda-7fffabd185d1'
const PRO_ICON = 'https://www.figma.com/api/mcp/asset/e59c8273-cc79-465c-baea-a52bc6410ee6'
const FOUNDER_ICON = 'https://www.figma.com/api/mcp/asset/678371f8-8c8a-45a5-bdfc-e9638de47c64'
```
**Issue:** External Figma assets may not load (CORS, expiration, network)
**Impact:** Pro, Founder, and Crew chips show broken icons
**Fix:** Download icons and host in `/public/icons/` folder

### 3. **No mobile-responsive landing page**
**Location:** `src/components/LandingPage.tsx` (entire file)
**Issue:** Desktop-only CSS, no mobile breakpoints
**Impact:** Mobile users see broken/unusable layout
**Fix:** Add mobile-first CSS with breakpoints

---

## 🟡 High Priority (UX Issues)

### 4. **Hard-coded values in LandingPage component**
**Locations:**
- Line 249: `style={{ gap: 'var(--space-md)' }}` ✅ (uses tokens)
- Line 251: `style={{ flex: 1 }}` ❌ (inline style)
- Line 252: `style={{ width: '100%', height: 'var(--btn-height-lg)' }}` ❌ (inline)
- Line 402: `style={{ gap: 'var(--space-md)' }}` ✅
- Line 404: `style={{ width: '100%', height: 'var(--btn-height-lg)' }}` ❌

**Issue:** Inconsistent use of design tokens
**Impact:** Harder to maintain, potential visual inconsistencies
**Fix:** Move all inline styles to CSS classes using tokens

### 5. **Missing "Sign In" option for existing users**
**Location:** `src/components/LandingPage.tsx` (entire landing page)
**Issue:** Only shows signup form, no way for existing users to log in
**Impact:** Returning users can't access their account from landing page
**Fix:** Add "Already have an account? Sign In" link

### 6. **No error handling for missing profiles**
**Location:** `src/components/LandingPage.tsx:1083-1085`
```typescript
if (loading) {
  return <div>Loading...</div>
}
```
**Issue:** Unstyled loading state, no error state
**Impact:** Poor UX during loading/errors
**Fix:** Use LoadingState component, add error handling

---

## 🟢 Medium Priority (Polish)

### 7. **Inconsistent button components**
**Locations:**
- Line 277: `<button className="button-navlink button-navlink-hover">Get Started</button>`
- Line 278: `<button className="button-navlink">Browse Climbers</button>`
- Line 251: `<button className="button-navlink" style={...}>Pass</button>`
- Line 1001: `<button className="onb-cta-btn" onClick={handleSubmit}>Let's Go</button>`

**Issue:** Mix of `button-navlink` and `onb-cta-btn` classes
**Impact:** Inconsistent button styling across page
**Fix:** Use unified ButtonCta component from design system

### 8. **Hardcoded placeholder text**
**Location:** Multiple locations in LandingPage.tsx
- Line 245: `bio || 'Looking for people to hit me up...'` (long fallback)
- Line 398: `bio || 'Ready for a safe catch and good beta.'` (different fallback)

**Issue:** Inconsistent placeholder text
**Impact:** Confusing for users who see different defaults
**Fix:** Use consistent, short placeholder or remove fallbacks

### 9. **Footer links don't go anywhere**
**Location:** `src/components/LandingPage.tsx:1054-1056`
```tsx
<a href="#">Community Guidelines</a>
<a href="#">Safety tips</a>
<a href="#">Contact</a>
```
**Issue:** All links use `href="#"` (no destination)
**Impact:** Clicking footer links does nothing
**Fix:** Create placeholder pages or use mailto: for contact

---

## 📱 Mobile-Specific Issues

### 10. **No mobile navigation**
**Issue:** Landing page has no MobileTopbar or MobileNavbar
**Impact:** Inconsistent with logged-in mobile experience
**Fix:** Add optional mobile header with login/signup CTAs

### 11. **Desktop-only grid layout**
**Location:** GridProfilesRow component (line 472-689)
**Issue:** Complex grid layout not responsive
**Impact:** Breaks on mobile screens
**Fix:** Stack vertically on mobile, horizontal on desktop

### 12. **Activity feed animation performance**
**Location:** AnimatedActivityFeed component (line 718-805)
**Issue:** setInterval every 3 seconds may drain battery on mobile
**Impact:** Poor mobile performance
**Fix:** Reduce frequency or pause when tab not visible

---

## 🎨 Design System Issues

### 13. **Old CSS classes not using tokens**
**Examples found:**
- `.fc-card`, `.fc-inner`, `.fc-pills-row` (featured climber card)
- `.gpc` (grid profile card)
- `.landing-hero`, `.landing-signup`, `.landing-footer`
- `.grid-filter-*` classes

**Audit needed:** Check if these classes use design tokens or hard-coded values

### 14. **Missing responsive breakpoints**
**Location:** `src/app/globals.css` (need to verify)
**Issue:** No @media queries for mobile/tablet/desktop
**Fix:** Add breakpoints:
  - Mobile: 0-767px
  - Tablet: 768px-1023px
  - Desktop: 1024px+

---

## 🔧 Quick Wins (Easy Fixes)

### 15. **Use existing icon components**
**Issue:** Icons loaded via `<img src={...}>` instead of SVG components
**Fix:** Create reusable icon components (e.g., `<ProIcon />`, `<FounderIcon />`)

### 16. **Replace fallback logic with Avatar component**
**Location:** Lines 13-19, 167, 315
**Issue:** Custom fallback logic instead of using global Avatar component
**Fix:** Use `<Avatar src={...} fallback={DEFAULT_PLACEHOLDER} />`

### 17. **Extract ChevronDown to global components**
**Location:** Lines 416-422
**Issue:** SVG defined inline in LandingPage component
**Fix:** Move to `src/components/icons/` or use Heroicons

---

## 📋 Action Plan (Priority Order)

### Phase 1: Fix Blockers (COMPLETED ✅)
1. ✅ Download and host Figma icons locally (rocknrollhand.svg, pro.svg)
2. ✅ Fix fallback-female.jpg (use fallback-male for all)
3. ✅ Add mobile CSS breakpoints (mobile-responsive.css)
4. ✅ Add "Sign In" link for existing users
5. ✅ Fix DAB button icon (button-within-button issue - created text-only SVGs)

### Phase 2: Polish UX (COMPLETED ✅)
5. ✅ Replace inline styles with CSS classes (added .fc-cta-wrapper button rule)
6. ✅ Add error handling and proper loading states (LoadingState component + error UI)
7. ✅ Unify button components (hero "Get Started" now uses button-cta)
8. ✅ Fix footer links (Community Guidelines, Safety Tips, Contact email)

### Phase 3: Design System (Day 3)
9. ✅ Audit all CSS classes for design token usage
10. ✅ Create mobile-first responsive layout
11. ✅ Extract reusable icon components
12. ✅ Test full flow: landing → signup → logged-in

---

## 🎯 Success Criteria

**Before launch, the landing page must:**
- ✅ Load without any broken images/icons
- ✅ Work perfectly on mobile (iOS Safari, Android Chrome)
- ✅ Use design tokens for all colors, spacing, typography
- ✅ Have consistent buttons/CTAs across entire page
- ✅ Include both signup AND login flows
- ✅ Show proper loading/error states
- ✅ Pass manual QA on 3 devices (mobile, tablet, desktop)

---

## 🚀 Next Steps

1. Start with **Phase 1 - Fix Blockers**
2. Test on localhost after each fix
3. Move to Phase 2 once no broken elements
4. Final Phase 3 polish for design system consistency

**Estimated Time:** 2-3 days for complete landing page polish
