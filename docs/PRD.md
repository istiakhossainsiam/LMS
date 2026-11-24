# Product Requirements Document (PRD): Learn With Maruf Ahmed — LMS 2.0

**Project Name:** Learn With Maruf Ahmed (LWMA) — Cloud LMS 2.0  
**Target Workspace:** `e:\website\LMS 2.0`  
**Legacy Reference:** `E:\website\learn-with-maruf-ahmed` (Django 5.2 + SQLite Monolith)  
**Target Architecture:** Decoupled Cloud-Native SPA/PWA (**React 19 + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion**) & High-Concurrency Async API (**FastAPI + SQLAlchemy 2.0 Async + PostgreSQL/SQLite-Async + Redis/Background Tasks**)  
**Primary Design Directives:** `/ui-ux-pro-max`, `/ui-styling`, `/apple-design` — **Mobile-First Fluid UI**, **Zero "Vibecoded" AI Slop**, **Defense-in-Depth Security**

---

## 1. Executive Summary & Vision

**Learn With Maruf Ahmed (LWMA) 2.0** is a ground-up re-architecture of the existing monolithic Django LMS into a high-performance, cloud-ready, mobile-first learning platform built with **React** and **FastAPI**.

While LMS 1.0 established a rich feature set tailored for Bangladeshi learners (bilingual Bangla/English content, hybrid course variants, sequential video & quiz locking, timestamped notes, project grading, certificates, gamification, digital store, and AI blog generation), our deep audit of LMS 1.0 uncovered **10 critical security vulnerabilities** and **6 major architectural bottlenecks** alongside a generic template-heavy Bootstrap/Three.js UI.

**LMS 2.0 solves these at the root:**
1. **Anti-"Vibecoded" Craftsmanship (`/apple-design` + `/ui-ux-pro-max` + `/ui-styling`)**: Replaces noisy 3D particle canvases, generic neon gradients, and emoji icons with tactile Apple-inspired materials, spring-physics sheets (`Vaul` / `Motion`), optical typography (`Space Grotesk` + `Inter` + `Hind Siliguri` + `JetBrains Mono`), and strict 4/8dp mobile ergonomics.
2. **True Mobile-First Native Feel**: Designed from a `375px` viewport upward with iOS/Android safe-area compliance, thumb-zone bottom navigation (max 5 items), gesture-interruptible bottom sheets for quizzes/notes/discussions, and sticky mini-video player behavior.
3. **Zero-Trust Security Architecture**: Eliminates SQL injection via 100% parameterized SQLAlchemy 2.0 ORM queries (replacing LMS 1.0's broken regex WAF that blocked students from writing SQL/code notes), enforces server-side video heartbeat verification before unlocking lessons/certificates, strips quiz answers from client payloads, sanitizes all Q&A markdown against Stored XSS, and secures digital downloads via signed time-limited tokens.

---

## 2. Audit of Legacy LMS 1.0: What We Carry Forward vs. What We Fix

### 10 Critical Vulnerabilities Discovered in LMS 1.0 (`E:\website\learn-with-maruf-ahmed`) That LMS 2.0 Remediates by Design:
1. **Store Payment Bypass (`store/views.py:148`)**: Any POST to `/store/payment/process/` immediately marked orders `is_paid=True` with a fake `TXN-XXXX` ID, allowing free download of all paid e-books/source code.
2. **Course Completion & Certificate Minting Bypass (`core/views.py:854`)**: `/mark-lesson-complete/<id>/` never verified watch time or quiz pass status on the server; students could POST sequentially to mint an official verifiable certificate in seconds.
3. **Quiz Answer Leakage (`core/views.py:943` & `course-player.html`)**: Failing a quiz returned the entire `correct_answers` object in the JSON response, and locked lessons rendered their full quiz questions in hidden DOM divs.
4. **Locked Video ID Exposure (`course-player.html`)**: Every locked lesson exposed `data-video-id="{{ item.lesson.video_id }}"` in plain HTML sidebar attributes.
5. **Stored XSS in Lesson Discussions (`course-player.html:594`)**: Q&A comments and usernames were injected directly into `innerHTML` via template literals without sanitization.
6. **Unauthenticated `/media/` Direct File Access**: Paid store files, course resources, and `.zip` student project submissions were publicly downloadable via direct URLs.
7. **Broken Regex SQLi Middleware (`core/middleware.py`)**: A naive regex blocked `--`, `/* */`, and words like `SELECT ... FROM`, causing `400 Bad Request` whenever programming students took SQL/JS notes or asked coding questions in Q&A!
8. **Plaintext Secrets in Database**: SMTP passwords and bKash/SSLCommerz API secrets were stored unencrypted in SQLite.
9. **Open Redirects (`core/views.py:320, 418`)**: Unvalidated `?next=` parameter on login/signup allowed phishing redirects.
10. **IP Spoofing & Missing Rate Limits**: `LoginRateLimitMiddleware` trusted forged `X-Forwarded-For` headers and left promo/gift-code/OTP endpoints unprotected against brute-force enumeration.

### 6 Functional Bugs in LMS 1.0 Fixed in LMS 2.0:
1. **`NameError: name 'new_badges' is not defined`** crashing `submit_lesson_quiz` (`core/views.py:960`).
2. **Trainer Quiz Type Mismatch**: Trainer UI sent `question_type="TEXT"` while backend expected `"Short"`, causing short-answer questions to never be graded.
3. **Trainer Submission URL Bug**: Template referenced non-existent `sub.submission_url` instead of `sub.submission_file`.
4. **Runtime `ALTER TABLE` on Homepage Load**: `core/views.py` ran raw `PRAGMA` and `ALTER TABLE` queries inside HTTP GET requests.
5. **Synchronous Blocking SMTP & PDF Generation**: Sending bulk newsletters and generating ReportLab PDFs blocked the main HTTP thread.
6. **Hardcoded Checkout Wallet Numbers**: `checkout.html` hardcoded `01700000000` in JS instead of reading `PaymentGatewaySetting`.

---

## 3. Anti-"Vibecoded" Design System (`/ui-ux-pro-max` + `/ui-styling` + `/apple-design`)

### 3.1 Strict Anti-Slop Rules
- **BANNED**: Emojis used as structural UI icons (`🚀`, `🔥`, `📚`, `✨`). All iconography uses **Phosphor Icons (`@phosphor-icons/react`)** or **Lucide (`lucide-react`)** with consistent `1.75px` stroke weight and token-sized bounds (`16px`, `20px`, `24px`).
- **BANNED**: Distracting background 3D particle webs (`background-3d.js`) that drain mobile battery and reduce contrast.
- **BANNED**: Rainbow multi-stop gradients, glowing neon drop-shadows, and nested cards-inside-cards-inside-cards.
- **BANNED**: Layout shifts on press/hover or fixed-duration linear animations on gesture-driven elements.

### 3.2 Color Tokens (Semantic Dual-Theme with High Contrast ≥ 4.5:1)
| Semantic Token | Light Mode (Daylight) | Dark Mode (Cinema/Player) | Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `#F8FAFC` (Cool Alabaster) | `#090D16` (Obsidian Slate) | App root canvas |
| `--surface` / `--card` | `#FFFFFF` | `#111827` | Elevated cards, modules |
| `--surface-glass` | `rgba(255, 255, 255, 0.78)` | `rgba(17, 24, 39, 0.78)` | Sticky navbars, bottom tab bar, sheets (`backdrop-filter: blur(20px) saturate(180%)`) |
| `--foreground` | `#0F172A` (Contrast 15.4:1) | `#F8FAFC` (Contrast 16.1:1) | Primary headings & body copy |
| `--muted-foreground` | `#475569` (Contrast 7.2:1) | `#94A3B8` (Contrast 6.3:1) | Metadata, timestamps, subtitles |
| `--primary` | `#0284C7` (LWMA Cobalt) | `#38BDF8` (Luminous Sky) | Primary brand actions, active indicators |
| `--accent` | `#D97706` (Academic Amber) | `#F59E0B` (Warm Gold) | Streaks, certificates, high-priority CTAs, badges |
| `--success` | `#059669` (Emerald) | `#10B981` | Passed quizzes, completed lessons, verified certificates |
| `--destructive` | `#DC2626` (Crimson) | `#EF4444` | Errors, failed attempts, security warnings |
| `--border` | `#E2E8F0` (1px hairline) | `rgba(255, 255, 255, 0.08)` | Crisp structural hairlines & specular top edges |

---

## 4. Phased Implementation Plan

1. **Phase 1 — Backend Foundation & Security Core (`backend/`)**
2. **Phase 2 — Core API Routers & Business Services**
3. **Phase 3 — Frontend Design System & Mobile App Shell (`frontend/`)**
4. **Phase 4 — Public Storefront, Course Player & Dashboards**
5. **Phase 5 — Security Hardening & Mobile UX Verification**
