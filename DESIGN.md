---
version: 2.0.0
name: Learn With Maruf Ahmed - Cloud LMS 2.0
description: Design engineering system inspired by ibelick/ui-skills and Apple typography. Quiet, editorial, code-first developer aesthetic.
colors:
  page-default: "#FFFFFF"
  surface-default: "#FFFFFF"
  surface-subtle: "#F5F5F5"
  fill-default: "#FFFFFF"
  fill-subtle: "#FAFAFA"
  fill-strong: "#F5F5F5"
  fill-inverse: "#151515"
  fill-accent: "#F0F5FF"
  content-primary: "#151515"
  content-secondary: "#6B7280"
  content-muted: "#9CA3AF"
  content-extra-muted: "#E5E7EB"
  content-inverse: "#FFFFFF"
  content-accent: "#2563EB"
  color-line-default: "#E5E7EB"
typography:
  sans: Inter Variable, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
  mono: JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace
  headings: text-balance font-display tracking-tight
  body: text-pretty leading-relaxed
  data: tabular-nums font-mono
---

# Design Language & Guidelines (ui-skills)

## Overview
Quiet, editorial, and code-first. LWMA 2.0 is an enterprise cloud learning management system and code lab that feels like an ultra-refined modern developer tool (Linear, Raycast, Vercel, Stripe), not a loud commercial marketing template.

## Principles from ibelick/ui-skills
1. **Neutral Baseline**: White `#FFFFFF` page background by default with refined `#EDEDED` / `#E5E7EB` borders.
2. **No AI Slop / No Decorative Gradients**: Eliminate multicolor, purple, and saturated gradients. Use neutral hierarchy with purposeful accents.
3. **Typography**: Always use `text-balance` for headings and `text-pretty` for body text. All currency (`৳`), XP, timers, streak counts, and scores MUST use `tabular-nums`.
4. **Button Hierarchy**:
   - `Primary`: `#151515` fill, `#FFFFFF` text, subtle highlight, tactile press.
   - `Secondary`: `#FFFFFF` fill, `#E5E7EB` border, subtle hover `#FAFAFA`.
   - `Ghost`: transparent fill, `#6B7280` text transitioning to `#151515` on hover.
5. **Elevation**: Subtle `shadow-2xs` / `shadow-sm` and razor-thin optical borders.
