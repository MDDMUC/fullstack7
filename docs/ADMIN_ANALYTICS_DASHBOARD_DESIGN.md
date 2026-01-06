# Admin Analytics Dashboard Design Spec

**Version:** 1.2
**Date:** 2026-01-06
**Status:** Approved for Implementation
**Designer:** Experience Designer (AI)

---

## 1. Overview

The **Admin Analytics Dashboard** is a mobile-first, internal tool for monitoring the health and growth of the DAB platform. It focuses on high-level KPIs, onboarding funnel performance, and user engagement metrics.

**Route:** `/admin/analytics` (Protected Route)
**Layout:** Uses standard `MobileTopbar` and `MobileNavbar` (or a simplified Admin-specific variant of the bottom bar if navigation allows).
**Theme:** Dark Theme (consistent with app).

### Design Principles
*   **Mobile-First:** Fully functional on mobile devices for on-the-go monitoring.
*   **Token-Based:** Strictly uses `src/app/tokens.css` for all colors, spacing, and typography.
*   **Privacy-Conscious:** Aggregated views only; no drill-down to PII from the dashboard charts.
*   **Gamified & Live:** Uses "live" indicators (pulsing dots) and color-coded trends to make monitoring engaging.

---

## 2. Information Architecture (IA)

The dashboard is divided into three primary views, switchable via a Segmented Control (Tabs) at the top of the page, below the Topbar.

**Navigation Structure:**
1.  **Overview:** High-level health metrics (Acquisition & Retention).
2.  **Funnel:** Deep dive into Onboarding performance ("Level Up" view).
3.  **Engagement:** Activity metrics (Matches, Messages, Events).

**Global Filters (Top Right Action Menu):**
*   **Time Range:** Last 7 Days (Default), Last 30 Days, All Time.
*   **City:** All Cities (Default), Munich.

---

## 3. Screen Specifications

### 3.1 Shared Layout Elements

**Header (`MobileTopbar`)**
*   **Left:** Hamburger/Back icon (Color: `var(--color-text-default)`).
*   **Center:** "Analytics" (Typography: `var(--font-size-lg)`, `var(--font-weight-bold)`, Color: `var(--color-text-default)`).
*   **Right:** `CalendarIcon` (Triggers Date Range Filter, Color: `var(--color-primary)`).

**Sub-Header (Tabs)**
*   **Component:** Segmented Control.
*   **Style:**
    *   Container: `background-color: var(--color-surface-panel)`, `border-radius: var(--radius-md)`, `padding: var(--space-xxs)`.
    *   Active Tab: `background: var(--gradient-brand-hero)`, `color: var(--color-primary)`, `border-radius: var(--radius-sm)`, `font-weight: var(--font-weight-medium)`.
    *   Inactive Tab: `color: var(--color-muted)`.
*   **Items:** "Overview", "Funnel", "Engagement".

---

### 3.2 View 1: Overview

**Goal:** Quick pulse check on platform growth and activity.

**Layout (Vertical Stack with `gap: var(--space-md)`)**

1.  **KPI Grid (2x2 on Mobile, 4x1 on Desktop)**
    *   **Card Style:** `background-color: var(--color-surface-card)`, `border-radius: var(--radius-lg)`, `padding: var(--space-md)`, `border: 1px solid var(--color-border-default)`.
    *   **Cards:**
        1.  **Active Users (DAU)**: Value (e.g., "142"), Label "DAU (24h)".
            *   *Trend:* "↑ 12%" (Color: `var(--color-primary)`).
        2.  **New Signups**: Value (e.g., "45"), Label "Last 7d".
            *   *Trend:* "↓ 5%" (Color: `var(--color-state-red)`).
        3.  **Retention**: Value (e.g., "42%"), Label "Day 7".
            *   *Trend:* "-" (Color: `var(--color-text-muted)`).
        4.  **Matches**: Value (e.g., "89"), Label "Last 7d".
            *   *Trend:* "↑ 8%" (Color: `var(--color-secondary)`).

2.  **Growth Chart (Line Chart)**
    *   **Title:** "User Growth".
    *   **Y-Axis:** Count (`var(--font-size-xs)`, `var(--color-text-muted)`).
    *   **X-Axis:** Date (Day).
    *   **Lines:**
        *   `Signups`: Stroke `var(--color-primary)`, Stroke Width 2px.
        *   `DAU`: Stroke `var(--color-secondary)`, Stroke Width 2px.

3.  **Recent Activity Feed (List)**
    *   **Header:**
        *   **Title:** "Live Feed" (`var(--font-size-md)`, `var(--font-weight-bold)`).
        *   **Indicator:** `<div class="stat-live-dot"></div>` (Existing class using `presencePulse` animation and `var(--color-primary)`/`var(--color-secondary)` gradient).
    *   **Items (Last 5 events):**
        *   **Source:** Query `analytics_events` table (Server-side polling).
        *   **Filters:**
            *   Exclude PII properties (e.g., `invite_token`, `referrer`).
            *   Show only: `event_name`, `city_id`, `event_ts`.
        *   **Container:** `display: flex`, `align-items: center`, `padding: var(--space-sm) 0`, `border-bottom: 1px solid var(--color-border-default)`.
        *   **Icon:** Based on event type (User, Match, Message), Color: `var(--color-text-muted)`.
        *   **Text:** "New signup from Munich" (`var(--font-size-sm)`, `var(--color-text-default)`).
        *   **Time:** "2m ago" (`var(--font-size-xs)`, `var(--color-text-muted)`).

---

### 3.3 View 2: Onboarding Funnel ("Level Up")

**Goal:** Gamified view of user progression through setup.

**Layout (Vertical Stack)**

1.  **Funnel Summary Card**
    *   **Metric:** "Completion Rate".
    *   **Value:** "65%" (Big Text `var(--color-primary)`, `text-shadow: var(--shadow-glow)`).
    *   **Subtext:** "Basic Profile → Success".

2.  **Funnel Visualization (Progress Bars)**
    *   **Concept:** "Levels" to clear.
    *   **Steps (Y-Axis) - Aligned to `step_id` Enum:**
        1.  Basic Profile
        2.  Interests
        3.  Location
        4.  Pledge
        5.  Success (Signup)
    *   **Bar Visuals:**
        *   **Label:** Step Name + Absolute Count (e.g., "Interests (120)").
        *   **Bar Container:** `height: 8px`, `background-color: var(--color-surface-panel)`, `border-radius: var(--radius-full)`.
        *   **Bar Fill:** `background: var(--gradient-brand-horizontal)`, `border-radius: var(--radius-full)`.
        *   **Right Side:** Drop-off % (e.g., "-12%"). If drop-off > 20%, Color: `var(--color-state-red)`; otherwise `var(--color-text-muted)`.

3.  **Step Friction (Table)**
    *   **Headers:** Step Name, Avg Time.
    *   **Rows:**
        *   `Basic Profile`: "45s"
        *   `Interests`: "20s"
    *   **Highlight:** Highlight slowest steps with `var(--color-yellow)` text.

---

### 3.4 View 3: Engagement

**Goal:** Understand value realization (matches and chats).

**Layout (Vertical Stack)**

1.  **Match Health (Donut Chart)**
    *   **Metric:** "Matches / DAU".
    *   **Calculation:** `match_created` (Unique count) / `app_open` (Unique User Count).
    *   **Chart Colors:**
        *   Matched: `var(--color-primary)`.
        *   Unmatched: `var(--color-surface-panel)`.
    *   **Center Text:** `0.8` (`var(--font-size-xl)`, `var(--color-text-default)`).

2.  **Chat Activity**
    *   **Metric:** "Messages / Match".
    *   **Value:** Avg messages sent per match.
    *   **Icon:** Chat Bubble (`var(--color-secondary)`).

3.  **Event Participation**
    *   **Card:** "Events".
    *   **Stats:**
        *   Views: 1,200
        *   RSVPs: 140
        *   Conversion: 11.6% (`var(--color-accent-warm-cream)`).

---

## 4. Component Inventory & Token Usage

### 4.1 Metric Card (`AdminMetricCard`)
*   **Background:** `var(--color-surface-card)`
*   **Border:** `1px solid var(--color-border-default)`
*   **Radius:** `var(--radius-lg)`
*   **Padding:** `var(--space-md)`
*   **Typography:**
    *   Value: `var(--font-size-xxl)`, `var(--font-weight-bold)`, `var(--color-text-default)`.
    *   Label: `var(--font-size-xs)`, `var(--color-text-muted)`, uppercase tracking.

### 4.2 Charts (Implementation Note)
*   **Library Suggestion:** Recharts (React).
*   **Colors:**
    *   Series A: `var(--color-primary)` (Cyan)
    *   Series B: `var(--color-secondary)` (Purple)
    *   Grid Lines: `var(--color-border-default)` (Low opacity)
    *   Tooltip Bg: `var(--color-surface-panel)`
*   **Typography:** Axis labels use `var(--font-size-xs)`, `var(--color-text-muted)`.

### 4.3 Live Dot (`.stat-live-dot`)
*   **Reuses existing class:**
    ```css
    .stat-live-dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-right: 10px;
      border-radius: 50%;
      background: linear-gradient(120deg, var(--color-primary), var(--color-secondary));
      box-shadow: 0 0 0 4px rgba(92,225,230,0.1);
      animation: presencePulse 2.4s ease-in-out infinite;
      vertical-align: middle;
    }
    ```

---

## 5. Event Mapping

| UI Component | Metric | Source Event(s) |
| :--- | :--- | :--- |
| **Overview: DAU** | Unique users in last 24h | `app_open` (count distinct `user_id`) |
| **Overview: Signups** | Total signups | `signup` |
| **Overview: Matches** | Total matches | `match_created` |
| **Funnel Chart** | Step Counts | `onboarding_step_started` vs `onboarding_step_completed` |
| **Funnel: Time** | Avg Time on Step | `onboarding_step_completed.properties.duration_ms` |
| **Engagement: Msgs** | Message Volume | `message_sent` |
| **Events: Conversion** | RSVP Rate | `event_rsvp` / `event_view` |

---

## 6. Access & Constraints

*   **Role Required:** Admin (checked via RLS or App Logic).
*   **Empty States:** If no data exists (e.g., fresh install), show "No analytics data yet" with an illustration/icon using `var(--color-text-muted)`.
*   **Loading States:** Use skeletons for all cards and charts while fetching.

