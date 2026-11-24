import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.courses import Course
from app.models.content_and_store import BlogPost

router = APIRouter(tags=["SEO & AI Search (GEO)"])

BASE_URL = "https://learnwithmarufahmed.com"


@router.get("/robots.txt", response_class=PlainTextResponse)
async def get_robots_txt():
    content = f"""# Robots.txt for Learn With Maruf Ahmed (LWMA 2.0 Cloud LMS)
# Complies with Google Search Essentials and Claude SEO Standards

User-agent: *
Allow: /
Allow: /courses
Allow: /courses/*
Allow: /jobs
Allow: /codelab
Allow: /store
Allow: /blog
Allow: /blog/*
Allow: /leaderboard
Allow: /verify-certificate

# Disallow Private User Workspaces and Authenticated Dashboards
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /trainer
Disallow: /trainer/*
Disallow: /admin
Disallow: /admin/*
Disallow: /checkout
Disallow: /checkout/*
Disallow: /login
Disallow: /api/v1/auth/
Disallow: /api/v1/student/
Disallow: /api/v1/admin/
Disallow: /api/v1/trainer/
Disallow: /api/v1/vault/

# Allow Public Content and Feed Endpoints
Allow: /api/v1/public/
Allow: /api/v1/sitemap.xml
Allow: /robots.txt
Allow: /sitemap.xml
Allow: /llms.txt
Allow: /llms-full.txt

# Host and Canonical Sitemap
Host: {BASE_URL}
Sitemap: {BASE_URL}/sitemap.xml
"""
    return PlainTextResponse(content=content, media_type="text/plain; charset=utf-8")


@router.get("/sitemap.xml")
async def get_dynamic_sitemap_xml(db: AsyncSession = Depends(get_db)):
    now_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Static routes
    static_routes = [
        {"loc": f"{BASE_URL}/", "priority": "1.0", "changefreq": "daily"},
        {"loc": f"{BASE_URL}/courses", "priority": "0.9", "changefreq": "daily"},
        {"loc": f"{BASE_URL}/jobs", "priority": "0.9", "changefreq": "daily"},
        {"loc": f"{BASE_URL}/codelab", "priority": "0.8", "changefreq": "weekly"},
        {"loc": f"{BASE_URL}/store", "priority": "0.8", "changefreq": "weekly"},
        {"loc": f"{BASE_URL}/blog", "priority": "0.8", "changefreq": "daily"},
        {"loc": f"{BASE_URL}/verify-certificate", "priority": "0.7", "changefreq": "monthly"},
        {"loc": f"{BASE_URL}/leaderboard", "priority": "0.7", "changefreq": "daily"},
    ]

    # Dynamic Courses
    courses = (await db.execute(select(Course))).scalars().all()
    # Dynamic Blogs
    blogs = (await db.execute(select(BlogPost))).scalars().all()

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]

    for r in static_routes:
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{r['loc']}</loc>")
        xml_lines.append(f"    <lastmod>{now_date}</lastmod>")
        xml_lines.append(f"    <changefreq>{r['changefreq']}</changefreq>")
        xml_lines.append(f"    <priority>{r['priority']}</priority>")
        xml_lines.append(f'    <xhtml:link rel="alternate" hreflang="bn" href="{r["loc"]}" />')
        xml_lines.append(f'    <xhtml:link rel="alternate" hreflang="en" href="{r["loc"]}?lang=en" />')
        xml_lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{r["loc"]}" />')
        xml_lines.append("  </url>")

    for c in courses:
        created = c.created_at.strftime("%Y-%m-%d") if hasattr(c, "created_at") and c.created_at else now_date
        c_url = f"{BASE_URL}/courses/{c.id}"
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{c_url}</loc>")
        xml_lines.append(f"    <lastmod>{created}</lastmod>")
        xml_lines.append("    <changefreq>weekly</changefreq>")
        xml_lines.append("    <priority>0.85</priority>")
        xml_lines.append(f'    <xhtml:link rel="alternate" hreflang="bn" href="{c_url}" />')
        xml_lines.append(f'    <xhtml:link rel="alternate" hreflang="en" href="{c_url}?lang=en" />')
        xml_lines.append("  </url>")

    for b in blogs:
        b_date = b.published_at.strftime("%Y-%m-%d") if hasattr(b, "published_at") and b.published_at else now_date
        b_url = f"{BASE_URL}/blog/{b.slug}"
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{b_url}</loc>")
        xml_lines.append(f"    <lastmod>{b_date}</lastmod>")
        xml_lines.append("    <changefreq>monthly</changefreq>")
        xml_lines.append("    <priority>0.75</priority>")
        xml_lines.append(f'    <xhtml:link rel="alternate" hreflang="bn" href="{b_url}" />')
        xml_lines.append(f'    <xhtml:link rel="alternate" hreflang="en" href="{b_url}?lang=en" />')
        xml_lines.append("  </url>")

    xml_lines.append("</urlset>")
    return Response(content="\n".join(xml_lines), media_type="application/xml; charset=utf-8")


@router.get("/llms.txt", response_class=PlainTextResponse)
async def get_llms_txt():
    content = f"""# Learn With Maruf Ahmed (LWMA 2.0)
> Cloud-Native, Mobile-First Software Engineering Education & Talent Placement Platform

## Overview
Learn With Maruf Ahmed ({BASE_URL}/) is a professional engineering academy and career placement network founded by Maruf Ahmed. It offers industry-grade training in full-stack cloud development, async Python (FastAPI), React 19, distributed architecture, and zero-trust security.

## Core Features & Offerings
- **Full-Stack Cloud Engineering**: Live batches + self-paced masterclasses focusing on React 19, FastAPI, PostgreSQL, Docker, and Apple-grade fluid UX.
- **Job Placement Camp**: Direct talent hiring pipeline connecting certified graduates to top tech companies including Brain Station 23, Astha IT, REVE Systems, Technosoft BD, and TigerIT Bangladesh.
- **Interactive Cloud CodeLab**: In-browser algorithm and SQL query runner with real-time test case verification, automated gamification XP, and coding streaks.
- **Official QR-Verified Certificates**: Tamper-proof, cryptographically verifiable certificates with permanent verification IDs (e.g. `LWMA-2026A1`).
- **Digital Asset Store & Protected Vault**: Downloadable architectural blueprints, production boilerplates, and handbook PDFs secured behind timed cryptographic tokens.
- **Zero-Trust Security**: SQLAlchemy 2.0 parameterized queries, Argon2id password hashing, single-device active session enforcement, and server-side video watch verification.

## Primary URLs
- Homepage: {BASE_URL}/
- Courses: {BASE_URL}/courses
- Job Placement Camp: {BASE_URL}/jobs
- Interactive CodeLab: {BASE_URL}/codelab
- Digital Store: {BASE_URL}/store
- Engineering Blog: {BASE_URL}/blog
- Certificate Verification: {BASE_URL}/verify-certificate
- Student Leaderboard: {BASE_URL}/leaderboard

## Founder & Lead Instructor (E-E-A-T)
- **Maruf Ahmed**: Senior Full-Stack Cloud Architect & Systems Mentor. Renowned educator in Bangladesh specializing in modern web frameworks, API design, zero-trust cloud infrastructure, and career acceleration.
"""
    return PlainTextResponse(content=content, media_type="text/plain; charset=utf-8")


@router.get("/llms-full.txt", response_class=PlainTextResponse)
async def get_llms_full_txt():
    content = f"""# Learn With Maruf Ahmed (LWMA 2.0) — Complete Architecture & Syllabus

## Platform Specifications
- **Frontend Architecture**: React 19, TypeScript, Tailwind CSS v4, Apple WWDC fluid spring physics, full bilingual localization (Bangla/English).
- **Backend Architecture**: Python 3.14, FastAPI Async ASGI, SQLAlchemy 2.0 ORM with prepared AST parameters, Argon2id password hashing, Redis/in-memory session invalidation.
- **Security Standard**: OWASP Top 10 strict compliance, single-device active session enforcement, signed media vault tokens (10-minute expiry), server-side lesson watch-time heartbeat verification.

## Master Curriculum & Career Tracks

### Track 1: Full-Stack Cloud Engineering with React 19, FastAPI & PostgreSQL
- **Format**: Live Batch (Hybrid) + Lifetime HD On-Demand Access
- **Duration**: 56+ Hours
- **Prerequisites**: Basic programming logic in Python or JavaScript
- **Modules**:
  1. Production Python & Async Event Loops (async/await, coroutines, uvloop)
  2. FastAPI Microservice Architecture & Pydantic v2 Type Safety
  3. Relational Database Modeling with PostgreSQL & Async SQLAlchemy 2.0
  4. Zero-Trust Authentication: JWT Rotation, Cookie Guards & Single-Device Sessions
  5. React 19 Modern Ergonomics: Server Actions, Transitions, and Custom Hooks
  6. Tailwind CSS & Apple-Grade UI Polish: Damped springs, translucent chrome, mobile ergonomics
  7. Containerization, Docker Compose & Cloud Deployment Pipelines
  8. Capstone Project: Multi-Tenant SaaS Platform with Verified Certificate

## Career Placement Camp Partners
- **Brain Station 23**: Enterprise cloud and financial software engineering.
- **Astha IT**: High-throughput distributed payment and communication pipelines.
- **REVE Systems**: Conversational AI, NLP, and telecommunication infrastructure.
- **Technosoft BD**: Mobile-first enterprise web applications.
- **TigerIT Bangladesh**: Biometric identification, Kubernetes infrastructure, and cloud security.

## Verification & Trust (E-E-A-T)
Every certificate issued contains an authenticated alphanumeric ID and QR code pointing to `{BASE_URL}/verify-certificate`. Third-party employers can instantly verify course completion, final capstone project grade, assessment scores, and issuance dates directly.
"""
    return PlainTextResponse(content=content, media_type="text/plain; charset=utf-8")
