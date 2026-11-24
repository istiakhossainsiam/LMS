# Design System Master: Learn With Maruf Ahmed (LWMA) 2.0

**Skills Applied:** `/ui-ux-pro-max`, `/ui-styling` (shadcn/ui + Tailwind CSS), `/apple-design` (WWDC Fluid Interfaces)  
**Target Experience:** Tactile, high-craft, mobile-first academic cloud platform (Linear / Apple Developer / MasterClass caliber — **zero "vibecoded" AI slop**).

---

## 1. Anti-Slop & Non-Vibecoded Rules (CRITICAL)

1. **Zero Emoji Icons**: Never use emojis (`🚀`, `🔥`, `📚`, `✨`) as UI icons, badges, or navigation indicators. Use **Lucide (`lucide-react`)** or **Phosphor (`@phosphor-icons/react`)** vector icons with consistent `1.75px` stroke width and token sizes (`16px`, `20px`, `24px`).
2. **Zero Noisy Background Canvases**: Do not render distracting 3D particle networks (`background-3d.js`) behind reading/learning content. Use clean architectural surfaces, subtle 1px structural hairlines, and optical depth (`backdrop-filter: blur(20px) saturate(180%)`).
3. **Zero Nested Card Clutter**: Never nest cards inside cards inside cards. Use clean horizontal hairlines, bento grid dividers, and whitespace (`4dp`/`8dp` rhythm) to group related elements.
4. **Instant Pointer-Down Feedback**: Every interactive control must respond on `pointerdown` (`active:scale-[0.98] transition-transform duration-100 ease-out`).
5. **Interruptible Spring Physics**: All sheets, drawers, tabs, and modals must use critically damped springs (`damping: 1.0`, `response: 0.35s`) or flick-projected springs (`damping: 0.82`, `response: 0.32s`).

---

## 2. Semantic Color Tokens (WCAG AA/AAA Verified ≥ 4.5:1)

| Token | Light Mode (Daylight) | Dark Mode (Cinema/Player) | Contrast & Purpose |
| :--- | :--- | :--- | :--- |
| `--background` | `#F8FAFC` | `#090D16` | Root canvas |
| `--card` / `--surface` | `#FFFFFF` | `#111827` | Primary elevated containers |
| `--surface-subtle` | `#F1F5F9` | `#1E293B` | Secondary wells, code blocks, filter pills |
| `--surface-glass` | `rgba(255, 255, 255, 0.78)` | `rgba(17, 24, 39, 0.78)` | Translucent header, bottom nav, floating sheets |
| `--foreground` | `#0F172A` | `#F8FAFC` | Primary text (>15:1 contrast) |
| `--muted-foreground` | `#475569` | `#94A3B8` | Secondary text (>6.3:1 contrast) |
| `--primary` | `#0284C7` | `#38BDF8` | Primary brand actions & active tabs |
| `--accent` | `#D97706` | `#F59E0B` | Streaks, certificates, flash sales, highlights |
| `--success` | `#059669` | `#10B981` | Completed lessons, quiz pass, verified status |
| `--destructive` | `#DC2626` | `#EF4444` | Errors, quiz lockouts, destructive actions |
| `--border` | `#E2E8F0` | `rgba(255, 255, 255, 0.08)` | 1px structural borders |

---

## 3. Optical Typography & Bilingual (`bn` / `en`) Scale

- **Display / Headings**: `'Space Grotesk', 'Inter', 'Hind Siliguri', sans-serif`
  - Hero Display: `clamp(2rem, 4.5vw, 3.5rem)`, `line-height: 1.08`, `letter-spacing: -0.025em`, `font-weight: 700`
  - Section H2: `clamp(1.5rem, 3vw, 2.25rem)`, `line-height: 1.15`, `letter-spacing: -0.02em`, `font-weight: 700`
  - Card H3: `1.125rem` (`18px`), `line-height: 1.35`, `letter-spacing: -0.01em`, `font-weight: 600`
- **Body Copy**: `'Inter', 'Hind Siliguri', system-ui, sans-serif`
  - Base (`16px` minimum on mobile inputs to prevent iOS auto-zoom), `line-height: 1.6` (`1.7` for Bangla script `:lang(bn)`)
- **Monospace / Telemetry**: `'JetBrains Mono', monospace`
  - Used for `TrxID`, `Certificate ID`, video timestamps (`[04:18]`), prices (`৳2,500`), and code snippets.

---

## 4. Mobile-First Ergonomics Checklist

- [x] **Bottom Tab Navigation (`< 768px`)**: Strictly 5 primary items (*Home, Courses, My Learning, Store, Profile*) with `min-h-[48px]` touch targets and `padding-bottom: env(safe-area-inset-bottom)`.
- [x] **Sticky Course Player**: On mobile `< 768px`, the `16:9` video player remains docked at the top (`sticky top-0 z-40`) while curriculum, quiz, notes, and Q&A scroll smoothly underneath inside a spring-animated tab container.
- [x] **Touch Target Discipline**: All interactive buttons, chips, and icon controls have a minimum hit area of `44x44px` (`48x48dp` on Android) and `>= 8px` gap between adjacent touchables.
- [x] **Reduced Motion & Accessibility**: Full support for `prefers-reduced-motion: reduce`, semantic ARIA labels on icon buttons, and focus trapping on dialogs/sheets.
