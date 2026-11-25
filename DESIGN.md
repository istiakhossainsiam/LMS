---
version: 2.3.0
name: Training Pundit - Cloud LMS 2.0
description: Unified design system (palette 2.2, 2026-11-25: Cream 60% / Navy 30% / Orange 10%). Single source of truth: frontend/src/index.css @theme block.
colors:
  # Cream 60% / Navy 30% / Orange 10% (palette 2.2, 2026-11-25)
  page: "#F2E6C9"
  page-dark: "#0A1E33"
  surface: "#FBF3DC"
  surface-dark: "#102A44"
  surface-subtle: "#E9D9B4"
  surface-subtle-dark: "#16324F"
  surface-soft: "#EFE0BC"
  text: "#0F2A44"
  text-dark: "#FFF7E8"
  text-secondary: "#6B7280"
  text-secondary-dark: "#D9CDB8"
  text-muted: "#9CA3AF"
  line: "#E0D3AF"
  line-dark: "rgba(255,255,255,0.08)"
  accent: "#F97316"
  accent-hover: "#EA580C"
  accent-light-dark: "#FB923C"
  accent-soft: "#FFF1E6"
  accent-deep-text-on-cream: "#C2410C"
  success: "#059669"
  warning: "#D97706"
  danger: "#DC2626"
  code-bg: "#0A1E33"
typography:
  sans: Inter, Hind Siliguri, system-ui, sans-serif
  mono: JetBrains Mono, ui-monospace, monospace
  headings: text-balance, font-weight 700/800, letter-spacing -0.02em (Inter only — Space Grotesk retired as a display face)
  body: text-pretty leading-relaxed
  data: tabular-nums font-mono (all prices ৳, XP, timers, streaks, scores)
radii:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px (hero and Student ID card only)
shadows:
  2xs: 0 1px 2px rgba(0,0,0,0.04)
  sm: 0 1px 3px rgba(0,0,0,0.06)
  md: 0 4px 14px -2px rgba(0,0,0,0.12)
  lg: 0 10px 30px -10px rgba(0,0,0,0.15)
---

# Design Language & Guidelines (redesign 2026-11-25)

## Overview
Quiet, editorial, and code-first. Training Pundit 2.0 is an enterprise cloud learning
management system and code lab that feels like an ultra-refined modern
developer tool (Linear, Raycast, Vercel, Stripe), not a loud commercial
marketing template.

## Palette 2.3 — Cream 60% / Navy 30% / Orange 10% (2026-11-25; cream deepened 2026-11-25 — #FAF5EC was near-white on screen, replaced with visibly warm #F2E6C9)
- **Cream 60% (dominant backgrounds):** page `#F2E6C9`, surface `#FBF3DC`,
  subtle `#E9D9B4`, soft tint `#EFE0BC`. Light `theme-color` is `#F2E6C9`.
- **Navy 30% (text, headings, dark surfaces, footer/player chrome):**
  ink `#0F2A44`, surface-dark `#102A44`, raised-dark `#16324F`,
  page-dark `#0A1E33` (dark `theme-color`).
- **Navy bands (v2.3, 2026-11-25 — navy raised to a measured 25–35% of
  viewport area):** solid navy `#0F2A44` header (cream links, orange logo
  tile + Sign In, `#16324F` active pill), navy `#0A1E33` footer, navy
  promo ribbon, navy trust-metrics strip + navy 1-click role-sandbox
  panel in the hero, navy hiring-partners ribbon, navy "Why" section
  (cards `#16324F`, cream text), navy CTA band, navy Courses header
  panel, navy Learner Portal header card, navy mobile bottom dock.
  Cards stay cream — navy is header/footer/bands only, so the 60/30/10
  balance holds. Measured (pixel-count, nearest-anchor): Home light
  navy 25.3% (was 4.0%), Dashboard 27.4%, Mobile home 34.7%, Courses
  36.5% (includes navy course-cover blocks where external images are
  blocked in sandbox), Home dark 95.7% (dark mode is navy-dominant by
  design). Hero itself stays cream.
- **Orange 10% (accents ONLY — primary buttons, links, active states,
  highlights, focus rings):** accent `#F97316`, hover `#EA580C`,
  soft `#FFF1E6`, light-for-dark-mode `#FB923C`, deep text-on-cream `#C2410C`.
- **Semantic only:** success `#059669`, warning `#D97706`,
  danger `#DC2626`, muted grey `#6B7280`. Blue and teal are gone as
  accents — no `blue-*` / `sky-*` / `teal-*` Tailwind classes, no
  `#2563EB` / `#356DFF` / `#35C6BE` hexes, no blue/teal Three.js lights.
  Slate neutrals (`slate-*`) are kept as plain greys, never as accents.
  White text on orange/navy buttons is cream `#FBF3DC`.

## What changed in the 2.1 redesign
- **One token set.** Before, DESIGN.md tokens (`#151515`, `#2563EB`) occurred
  0 times in the frontend; the shipped code used Academic Aurora
  (`#356DFF`/`#35C6BE`/`#14213A`) plus parallel Tailwind slate plus a
  black/white "luxury" button system. All three are now merged into the
  table above, encoded as a Tailwind v4 `@theme` block in
  `frontend/src/index.css`.
- **One accent.** `#F97316` (dark `#FB923C`). Teal is removed entirely
  (was `#35C6BE`); success / verified / XP / progress use success
  `#059669` or the orange accent — never teal, never as a primary CTA
  and never as a blue→teal hover flip. Amber `#D97706` is for Live badges, streaks and
  "Mark complete" only; emerald is replaced by success `#059669`.
- **No decorative gradients.** All blue→teal / grey / amber text gradients,
  indigo/purple ambient blobs and the purple payment block are removed.
  The only gradients left are functional scrims (image overlay `bg-black/40`).
  Code surfaces (player video, CodeLab editor) stay fixed-dark `#0A1E33`.
- **One navbar.** The header was four different headers (forced-dark home,
  amber Admin, sky Trainer, emerald Student Hub). It is now one neutral
  glass header in all routes; role is shown by a mono label + the same
  accent brand tile. Subtitle is "Cloud LMS 2.0".
- **Theme-aware hero.** The hero was a dark-only slab (`#0A1E33`) on a light
  page, which forced the header dark. Light theme now gets a cream editorial
  hero (dark canvas hidden); dark theme keeps the cinematic slab.
- **Buttons.** One primary: accent `#F97316` (was also black `#0F172A` via
  `btn-luxury-primary` — re-pointed to accent). Secondary: cream `#FBF3DC` / `#E0D3AF`
  border. Ghost: transparent, `#6B7280` → `#0F2A44`. All interactive
  elements get `:focus-visible` accent ring.
- **Radii / elevation.** Ordinary cards are `rounded-2xl` (16px) max with
  `shadow-sm`; `rounded-3xl` + `shadow-xl/2xl` are reserved for the hero and
  the Student ID card. `Card3D` tilt/glare was removed (plain wrapper, same
  props/API).
- **Branding.** The LMS name is **Training Pundit** — all display branding
  is unified to `Training Pundit` / `trainingpundit.com` (navbar, hero,
  titles, meta/canonical, footer, ID card, admin settings). Demo logins are
  `student@` / `trainer@` / `admin@trainingpundit.com`; the backend auth
  alias maps these to the seeded accounts. Instructor name "Maruf Ahmed"
  as a person is kept where it refers to the instructor, not the LMS.
  Backend `/api/health` already says "TrainingPundit", and `seo.py` /
  `public.py` defaults were updated to `trainingpundit.com` in this pass.
- **No FOUC.** `index.html` has a pre-paint script reading `lwma_theme`
  (fallback: `prefers-color-scheme`); `useAppStore` uses the same fallback.
  `theme-color` is set per colour scheme.

## Principles
1. **Neutral Baseline**: Cream `#F2E6C9` page background by default with
   `#FBF3DC` surfaces and refined `#E0D3AF` borders. Dark: `#0A1E33` page, `#102A44` surfaces.
2. **No AI Slop / No Decorative Gradients**: neutral hierarchy with
   purposeful accents only (see above).
3. **Typography**: `text-balance` for headings, `text-pretty` for body.
   All currency (`৳`), XP, timers, streak counts, and scores MUST use
   `tabular-nums`.
4. **Button Hierarchy**:
   - `Primary`: `#F97316` fill, `#FBF3DC` text, hover `#EA580C`.
   - `Secondary`: cream `#FBF3DC` fill, `#E0D3AF` border, hover `#EFE0BC`.
   - `Ghost`: transparent fill, `#6B7280` text → `#0F2A44` on hover.
5. **Elevation**: `shadow-2xs` / `shadow-sm` default, `shadow-md` for
   dropdowns/sticky bars/modals, `shadow-lg` for sheets only.
6. **Layout**: container `max-w-7xl mx-auto px-4 sm:px-6`; page rhythm
   `py-8 sm:py-12 space-y-8`; H1 `text-2xl sm:text-4xl` (hero only
   `text-4xl sm:text-6xl`); H2 `text-xl sm:text-2xl`; body `text-sm`.
7. **Mobile-first**: 390px verified; touch targets 40/44/48px; glass blur
   is stripped on ≤768px (existing `index.css` override kept).

## Deliberately NOT changed
- No route, model, API, copy or data-flow change. No backend change except
  adding the two missing boot dependencies (`greenlet`, `email-validator`)
  to `backend/requirements.txt`.
- Trainer/Admin 14-tab IA was token-swept only, not redesigned.
- The Student ID card and hero keep `rounded-3xl` as the two exceptions.
