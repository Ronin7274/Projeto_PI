---
name: Vanguard Tech Minimal
colors:
  surface: '#faf8ff'
  surface-dim: '#d7d9e8'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#ebedfc'
  surface-container-high: '#e5e7f6'
  surface-container-highest: '#dfe2f1'
  on-surface: '#171b26'
  on-surface-variant: '#444651'
  inverse-surface: '#2c303b'
  inverse-on-surface: '#eef0ff'
  outline: '#747683'
  outline-variant: '#c4c6d3'
  surface-tint: '#3d5aab'
  primary: '#001951'
  on-primary: '#ffffff'
  primary-container: '#022c7d'
  on-primary-container: '#7c98ed'
  inverse-primary: '#b4c5ff'
  secondary: '#224fd5'
  on-secondary: '#ffffff'
  secondary-container: '#4369ef'
  on-secondary-container: '#fffbff'
  tertiary: '#001f38'
  on-tertiary: '#ffffff'
  tertiary-container: '#00355a'
  on-tertiary-container: '#4aa0ec'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174c'
  on-primary-fixed-variant: '#224192'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001452'
  on-secondary-fixed-variant: '#0038b6'
  tertiary-fixed: '#d0e4ff'
  tertiary-fixed-dim: '#9bcbff'
  on-tertiary-fixed: '#001d34'
  on-tertiary-fixed-variant: '#004a7a'
  background: '#faf8ff'
  on-background: '#171b26'
  surface-variant: '#dfe2f1'
typography:
  display:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-precision, forward-looking visual identity tailored for modern technology platforms, next-generation digital services, and product ecosystems. 

### Brand Personality & Philosophy
- **Precision & Innovation:** Interfaces are engineered to feel sharp, deterministic, and frictionless.
- **Architectural Clarity:** Layouts favor structural grid rigor, intentional density, and purposeful whitespace over decorative noise.
- **Subtle Modernism:** A hybrid aesthetic fusing modern high-density SaaS elegance with subtle glassmorphic illumination and crisp micro-borders.

### Emotional Response
The interface inspires trust, technical mastery, and effortless control, allowing complex digital interactions to feel immediate and clean.

## Colors

The palette is engineered natively for light mode, establishing depth through crisp light foundations paired with deep royal blue and electric secondary accents.

### Color Hierarchy & Roles
- **Primary (`#022C7D` - Deep Royal Blue):** Reserved for primary actions, active state outlines, focus triggers, and key brand highlights.
- **Secondary (`#0841C9` - Electric Accent):** Utilized for secondary interactive signals, analytics indicators, feature badges, and complementary gradients.
- **Tertiary (`#187FC9` - Bright Azure):** Drives interactive callouts, active system statuses, and affirmative indicators.
- **Neutral (`#0B0F19` - Deep Obsidian):** Used for structural contrast and high-legibility text elements against light backgrounds.
- **Semantic Accents:** Defined via `named_colors` to ensure strict accessible contrast for warnings, errors, and subtle ambient glows.

## Typography

The type system is built on **Inter**, delivering utilitarian legibility, high optical precision, and neutral technical authority.

### Typographic Hierarchy
- **Display & Large Headlines:** Feature tighter letter tracking (`-0.02em` to `-0.03em`) and heavy weights (700–800) to create impact on hero modules and key marketing touchpoints.
- **Body Content:** Tuned with balanced line heights (1.5x - 1.6x) and neutral tracking for sustained readability on dashboards and data views.
- **Labels & Microcopy:** High-contrast, medium weights with expanded tracking (`0.01em` to `0.04em`) ensure instant recognition across badges, data tables, and input headers.

## Layout & Spacing

A responsive 12-column fluid grid defines layout structures across widescreen and desktop monitors, collapsing systematically down to tablet and mobile form factors.

### Breakpoint Matrix
- **Mobile (< 768px):** 4-column layout, `margin-mobile` (1rem), `gutter-mobile` (1rem).
- **Tablet (768px – 1024px):** 8-column layout, 2rem margins, 1.25rem gutters.
- **Desktop (> 1024px):** 12-column layout, `margin` (3rem), `gutter` (1.5rem), maximum container constraint of 1280px.

### Spacing Rules
Component padding and inter-element relationships adhere strictly to the 4px/8px modular base scale (`space-xs` through `space-xl`), ensuring optical harmony between micro-elements and macro-containers.

## Elevation & Depth

Visual hierarchy is constructed through tonal surface layering and low-contrast perimeter strokes, augmented by localized glow effects instead of heavy ambient drop shadows.

### Elevation Tiers
1. **Level 0 (Canvas Base):** Ground layer using light canvas foundations. Zero elevation or borders.
2. **Level 1 (Subsurface Cards & Insets):** Filled with structural containers, bordered by a subtle 1px stroke.
3. **Level 2 (Interactive Floating Modules & Modals):** Filled with elevated surface tiers with a 12px backdrop blur (`backdrop-filter: blur(12px)`) and a crisper 1px border.
4. **Active/Focus States:** Elevated surfaces emit an ambient perimeter illumination using `rgba(2, 44, 125, 0.25)` with a 16px blur radius, reinforcing physical responsiveness without visual clutter.

## Shapes

The interface embraces a balanced modern curvature (Level 2). This provides smooth, contemporary geometry while retaining geometric crispness suited for tech platforms.

- **Base Radius (0.5rem / 8px):** Applied to standard buttons, input controls, chips, and small panels.
- **Medium Radius (1rem / 16px):** Applied to cards, preview panels, modal sheets, and dropdown containers.
- **Large Radius (1.5rem / 24px):** Applied to hero wrapper containers, marketing banners, and floating navigational bars.

## Components

### Buttons
- **Primary:** Solid `#022C7D` background, white label (`label-lg`), 0.5rem radius, height 44px (desktop) / 48px (mobile). Hover initiates `#03399E` transition with a faint `accent-glow` shadow.
- **Secondary:** Transparent fill with a 1px border, text in secondary tones. Hover shifts background to subtle overlays and border to `#022C7D`.
- **Ghost / Text:** Borderless with minimal background wash on hover.

### Cards
- **Base Structure:** Clean surface background, 1px perimeter border, 1rem corner radius, and `space-lg` internal padding.
- **Interactive State:** Hover elevates border and adds a subtle vertical translate (-2px) with an ambient blue gradient rim light.

### Badges & Chips
- **Status Badges:** Compact pills (radius 9999px) with semi-transparent tinted backgrounds, contrasting micro-borders, and `label-sm` text.
- **Interactive Filter Chips:** Height 32px, `space-sm` horizontal padding, shifting from muted neutral outlines to active solid primary highlights.

### Input Fields
- **Container:** Height 44px, surface background, border 1px, radius 0.5rem, text `body-md`.
- **Focus State:** 1px stroke of `#022C7D` paired with a 2px outer glow (`rgba(2, 44, 125, 0.2)`).
- **Placeholder:** Styled with optical baseline centering.

### Navigation Bar
- **Floating Header:** Glassmorphic layout with a 16px blur, border-bottom, height 64px, holding logo, nav items with `label-lg` tracking, and primary CTA.