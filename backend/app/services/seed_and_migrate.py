import json
import os
import sqlite3
from datetime import datetime, timedelta, timezone
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models import (
    Badge,
    BlogPost,
    Certificate,
    Choice,
    CodeChallenge,
    Course,
    CourseBundle,
    CourseVariant,
    Enrollment,
    FAQ,
    FlashSale,
    JobPosting,
    Lesson,
    LessonDiscussion,
    LessonScore,
    LessonWatchLog,
    LiveClass,
    Module,
    Note,
    Notification,
    Payment,
    PaymentGatewaySetting,
    Profile,
    PromoCode,
    Question,
    Review,
    SiteSettings,
    StoreOrder,
    StoreProduct,
    User,
    UserActivity,
    UserBadge,
    VideoTestimonial,
    Workshop,
)


def ensure_vault_files() -> None:
    vault_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "media_vault")
    os.makedirs(vault_dir, exist_ok=True)
    sample_files = {
        "fullstack-architecture-handbook.pdf": (
            "LEARN WITH MARUF AHMED — FULL-STACK ARCHITECTURE HANDBOOK (2026 EDITION)\n\n"
            "Chapter 1: Production FastAPI & Async SQLAlchemy 2.0\n"
            "Chapter 2: React 19 Mobile-First Ergonomics & Spring Physics\n"
            "Chapter 3: Zero-Trust Security, JWT Rotation & OWASP Top 10 Defense\n"
        ),
        "django-react-saas-starter-kit.zip": (
            "PK\x03\x04 — Protected Digital Asset Archive: SaaS Starter Kit Boilerplate by Maruf Ahmed."
        ),
        "ui-ux-design-token-system.pdf": (
            "LEARN WITH MARUF AHMED — APPLE & SHADCN DESIGN TOKEN REFERENCE\n\n"
            "1. Optical Typography Scale\n2. Translucent Materials & Vibrancy\n3. 48dp Touch Ergonomics\n"
        ),
        "lesson-1-cheatsheet.pdf": (
            "Lesson 1 Architecture & Setup Cheatsheet — Learn With Maruf Ahmed Cloud LMS 2.0"
        ),
    }
    for fname, text in sample_files.items():
        fpath = os.path.join(vault_dir, fname)
        if not os.path.exists(fpath):
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(text)


async def seed_initial_data(db: AsyncSession) -> None:
    ensure_vault_files()

    user_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    if user_count > 0:
        return

    now = datetime.now(timezone.utc)

    # 1. Site Settings & Payment Gateway Settings
    db.add(SiteSettings())
    db.add(PaymentGatewaySetting())
    db.add(
        FlashSale(
            title="Cloud LMS 2.0 Launch — Flat 25% Off All Career Tracks",
            title_bn="ক্লাউড এলএমএস ২.০ লঞ্চ অফার — সকল ক্যারিয়ার ট্র্যাকে ২৫% বিশেষ ছাড়",
            discount_percentage=25,
            promo_code="MARUF25",
            end_time=now + timedelta(days=14),
            is_active=True,
        )
    )
    db.add_all(
        [
            PromoCode(code="MARUF25", discount_percentage=25, active=True),
            PromoCode(code="WELCOME20", discount_percentage=20, active=True),
            PromoCode(code="SKILL15", discount_percentage=15, active=True),
        ]
    )

    # 2. Core Users (Admin, Trainer, Student)
    admin_user = User(
        username="maruf_admin",
        email="admin@learnwithmarufahmed.com",
        full_name="Maruf Ahmed",
        password_hash=hash_password("Admin@1234"),
        is_active=True,
        is_staff=True,
        is_superuser=True,
    )
    trainer_user = User(
        username="tanvir_mentor",
        email="trainer@learnwithmarufahmed.com",
        full_name="Tanvir Hasan",
        password_hash=hash_password("Trainer@1234"),
        is_active=True,
        is_staff=False,
        is_superuser=False,
    )
    student_user = User(
        username="arif_learner",
        email="student@learnwithmarufahmed.com",
        full_name="Arifur Rahman",
        password_hash=hash_password("Student@1234"),
        is_active=True,
        is_staff=False,
        is_superuser=False,
    )
    db.add_all([admin_user, trainer_user, student_user])
    await db.flush()

    db.add_all(
        [
            Profile(
                user_id=admin_user.id,
                phone_number="+880 1711-223344",
                occupation="Lead Instructor & Founder",
                bio="Full-Stack Software Architect & Educator helping 15,000+ Bangladeshi learners build global tech careers.",
                is_trainer=True,
                current_streak=42,
                longest_streak=90,
                referral_code="MARUF01",
            ),
            Profile(
                user_id=trainer_user.id,
                phone_number="+880 1811-556677",
                occupation="Senior Systems Mentor",
                bio="Senior Backend & Cloud Engineer specializing in Python, FastAPI, and Distributed Systems.",
                is_trainer=True,
                current_streak=19,
                longest_streak=34,
                referral_code="TANVIR02",
            ),
            Profile(
                user_id=student_user.id,
                phone_number="+880 1911-889900",
                occupation="Student",
                bio="Passionate full-stack engineering student building real-world cloud apps.",
                is_trainer=False,
                current_streak=7,
                longest_streak=14,
                referral_code="ARIF2026",
            ),
        ]
    )

    # 3. Gamification Badges
    badges = [
        Badge(
            name="Quiz Master",
            name_bn="কুইজ মাস্টার",
            description="Scored 80%+ on a technical assessment",
            description_bn="টেকনিক্যাল কুইজে ৮০%+ স্কোর অর্জন করেছেন",
            icon_name="Award",
            badge_type="QUIZ_SCORE",
            threshold=80,
        ),
        Badge(
            name="7-Day Streak",
            name_bn="৭ দিনের ধারাবাহিকতা",
            description="Maintained a 7-day continuous learning streak",
            description_bn="টানা ৭ দিন নিয়মিত লার্নিং স্ট্রিক বজায় রেখেছেন",
            icon_name="Flame",
            badge_type="STREAK",
            threshold=7,
        ),
        Badge(
            name="Fast Finisher",
            name_bn="দ্রুত সম্পন্নকারী",
            description="Completed 3+ technical lessons",
            description_bn="৩টি বা তার বেশি লেসন সম্পন্ন করেছেন",
            icon_name="Zap",
            badge_type="LESSONS_COMPLETED",
            threshold=3,
        ),
        Badge(
            name="Certified Graduate",
            name_bn="সার্টিফাইড গ্র্যাজুয়েট",
            description="Completed a full course and earned an official certificate",
            description_bn="পূর্ণাঙ্গ কোর্স সম্পন্ন করে অফিশিয়াল সার্টিফিকেট অর্জন করেছেন",
            icon_name="GraduationCap",
            badge_type="COURSES_COMPLETED",
            threshold=1,
        ),
    ]
    db.add_all(badges)
    await db.flush()
    db.add_all(
        [
            UserBadge(user_id=student_user.id, badge_id=badges[0].id),
            UserBadge(user_id=student_user.id, badge_id=badges[1].id),
        ]
    )

    # 4. Courses (Bilingual + Variants + Outcomes)
    c1 = Course(
        instructor_id=admin_user.id,
        instructor_name="Maruf Ahmed",
        title="Full-Stack Cloud Engineering with React 19, FastAPI & PostgreSQL",
        title_bn="রিয়্যাক্ট ১৯, ফাস্টএপিআই ও পোস্টগ্রেএসকিউএল দিয়ে ফুল-স্ট্যাক ক্লাউড ইঞ্জিনিয়ারিং",
        description="Build production-grade, secure, mobile-first cloud applications from scratch. Covers async Python, SQLAlchemy 2.0, JWT rotation, Tailwind v4, shadcn/ui, and Docker deployment.",
        description_bn="শুরু থেকে প্রোডাকশন-রেডি, সিকিউর এবং মোবাইল-ফার্স্ট ক্লাউড অ্যাপ্লিকেশন তৈরি শিখুন। অ্যাসিঙ্ক পাইথন, ফাস্টএপিআই, রিয়্যাক্ট ১৯, সিকিউরিটি ও ডকার ডিপ্লয়মেন্টসহ সম্পূর্ণ গাইডলাইন।",
        thumbnail_url="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80",
        category="Web Development",
        category_bn="ওয়েব ডেভেলপমেন্ট",
        level="Intermediate to Pro",
        duration_hours=56,
        price=2800.0,
        original_price=5500.0,
        students_count=840,
        rating=4.95,
        final_project_title="Deploy a Multi-Tenant SaaS API & Mobile-First PWA",
        final_project_description="Submit your GitHub repository or ZIP bundle containing your FastAPI + React 19 application with JWT auth and parameterized ORM queries.",
        is_live_course=True,
        batch_title="Batch 08 • Autumn 2026",
        batch_title_bn="ব্যাচ ০৮ • শরৎ ২০২৬",
        total_seats=60,
        seats_booked=48,
        enrollment_deadline=now + timedelta(days=10),
        live_class_schedule="Sun & Wed • 9:00 PM BST",
        live_class_schedule_bn="রবি ও বুধ • রাত ৯:০০টা",
        features_json=json.dumps([
            "56+ Hours HD Recorded & Live Hybrid Sessions",
            "Server-Verified Quizzes & Code Reviews by Maruf Ahmed",
            "Lifetime Access + Official QR-Verified Certificate",
            "Protected Source Code Vault & Architecture Blueprints",
        ]),
        outcomes_json=json.dumps([
            "Architect high-concurrency async APIs with FastAPI & SQLAlchemy 2.0",
            "Eliminate SQL Injection, XSS, CSRF & Broken Access Control",
            "Design Apple-grade fluid mobile interfaces with React 19 & Tailwind CSS",
            "Deploy production containers with automated CI/CD pipelines",
        ]),
    )

    c2 = Course(
        instructor_id=admin_user.id,
        instructor_name="Maruf Ahmed",
        title="Python, Django & AI Automation Bootcamp for Freelancers",
        title_bn="পাইথন, জ্যাঙ্গো এবং এআই অটোমেশন বুটক্যাম্প (ফ্রিল্যান্সিং ও জব ট্র্যাক)",
        description="Master Python backend engineering, REST APIs, Gemini/LLM workflow automation, and international marketplace client delivery.",
        description_bn="পাইথন ব্যাকএন্ড ডেভেলপমেন্ট, এপিআই ইন্টিগ্রেশন, এআই অটোমেশন এবং আন্তর্জাতিক মার্কেটপ্লেসে ক্লায়েন্ট প্রজেক্ট হ্যান্ডলিংয়ের কমপ্লিট কোর্স।",
        thumbnail_url="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1000&q=80",
        category="Python & AI",
        category_bn="পাইথন ও এআই",
        level="Beginner to Advanced",
        duration_hours=48,
        price=2200.0,
        original_price=4500.0,
        students_count=1120,
        rating=4.9,
        final_project_title="AI-Powered Content & E-Commerce Automation Pipeline",
        final_project_description="Build an automated Python + LLM pipeline with webhook verification and role-based dashboard.",
        is_live_course=False,
        batch_title="Self-Paced + Weekly Support",
        batch_title_bn="সেলফ-পেসড + সাপ্তাহিক সাপোর্ট",
        total_seats=200,
        seats_booked=145,
        features_json=json.dumps([
            "48 Hours Structured Video Curriculum",
            "Real-World Freelance Project Templates",
            "Timestamped Smart Notes & PDF Exports",
            "Instant QR-Verified Graduation Certificate",
        ]),
        outcomes_json=json.dumps([
            "Write clean, idiomatic Python 3.12+ and asynchronous tasks",
            "Integrate Google Gemini & OpenAI APIs safely into web products",
            "Integrate bKash, Nagad, and SSLCommerz payment flows",
            "Win and deliver high-ticket Upwork/Fiverr engineering contracts",
        ]),
    )

    c3 = Course(
        instructor_id=trainer_user.id,
        instructor_name="Tanvir Hasan",
        title="Product UI/UX Engineering, Design Systems & Fluid Motion",
        title_bn="প্রোডাক্ট ইউআই/ইউএক্স ইঞ্জিনিয়ারিং, ডিজাইন সিস্টেম ও ফ্লুইড অ্যানিমেশন",
        description="Learn how top Silicon Valley teams craft tactile interfaces using optical typography, 3-layer design tokens, Figma systems, and spring physics.",
        description_bn="আধুনিক ডিজাইন টোকেন, অপটিক্যাল টাইপোগ্রাফি, ফিগমা অটো-লেআউট এবং স্প্রিং অ্যানিমেশনের মাধ্যমে বিশ্বমানের মোবাইল ও ওয়েব ইউআই ডিজাইন শিখুন।",
        thumbnail_url="https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=80",
        category="UI/UX Design",
        category_bn="ইউআই/ইউএক্স ডিজাইন",
        level="All Levels",
        duration_hours=36,
        price=1950.0,
        original_price=4000.0,
        students_count=630,
        rating=4.88,
        final_project_title="Complete Mobile-First Fintech Design System & Prototype",
        final_project_description="Deliver a token-driven component library with light/dark parity and WCAG AA contrast.",
        is_live_course=True,
        batch_title="Batch 04 • Live Studio",
        batch_title_bn="ব্যাচ ০৪ • লাইভ স্টুডিও",
        total_seats=40,
        seats_booked=31,
        live_class_schedule="Fri & Sat • 8:30 PM BST",
        live_class_schedule_bn="শুক্র ও শনি • রাত ৮:৩০টা",
        features_json=json.dumps([
            "36 Hours Design + Engineering Hybrid Modules",
            "Live Portfolio & Case Study Critique",
            "Complete Figma & shadcn/ui Token Kit Included",
        ]),
        outcomes_json=json.dumps([
            "Build 3-tier primitive, semantic, and component design tokens",
            "Design mobile-native bottom sheets, safe areas, and 48dp touch targets",
            "Implement critically damped spring animations on web & mobile",
        ]),
    )

    c4 = Course(
        instructor_id=admin_user.id,
        instructor_name="Maruf Ahmed",
        title="Cybersecurity, Ethical API Hardening & Bug Bounty Fundamentals",
        title_bn="সাইবার সিকিউরিটি, এপিআই হার্ডেনিং ও বাগ বাউন্টি ফান্ডামেন্টালস",
        description="Hands-on offensive and defensive web security: prevent SQLi, Stored XSS, IDOR, Payment Bypass, and JWT vulnerabilities in modern cloud apps.",
        description_bn="ওয়েব অ্যাপ্লিকেশন সিকিউরিটি, এসকিউএল ইনজেকশন, এক্সএসএস, পেমেন্ট বাইপাস প্রতিরোধ এবং এথিক্যাল পেন-টেস্টিংয়ের প্র্যাকটিক্যাল গাইড।",
        thumbnail_url="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80",
        category="Cybersecurity",
        category_bn="সাইবার সিকিউরিটি",
        level="Intermediate",
        duration_hours=32,
        price=2400.0,
        original_price=4800.0,
        students_count=490,
        rating=4.96,
        final_project_title="",
        final_project_description="",
        is_live_course=False,
        batch_title="Recorded Pro Track",
        batch_title_bn="রেকর্ডেড প্রো ট্র্যাক",
        features_json=json.dumps([
            "OWASP Top 10 Hands-On Labs",
            "Real Codebase Audit Case Studies",
            "Official Security Completion Certificate",
        ]),
        outcomes_json=json.dumps([
            "Audit Django, FastAPI, and Node.js backends for critical flaws",
            "Replace naive regex WAFs with true parameterized queries & AST sanitizers",
            "Implement signed media vaults and webhook replay protection",
        ]),
    )

    db.add_all([c1, c2, c3, c4])
    await db.flush()

    # Variants for Course 1 & Course 2
    v1_rec = CourseVariant(
        course_id=c1.id,
        variant_type="Recorded",
        variant_type_bn="রেকর্ডেড ভার্সন",
        price=2800.0,
        description="Full HD pre-recorded curriculum + quizzes + certificate",
    )
    v1_live = CourseVariant(
        course_id=c1.id,
        variant_type="Online Live",
        variant_type_bn="অনলাইন লাইভ ব্যাচ",
        price=3800.0,
        description="Everything in Recorded + 2x Weekly Live Zoom Classes & Code Review",
        meeting_link="https://zoom.us/j/9988776655",
    )
    v1_one = CourseVariant(
        course_id=c1.id,
        variant_type="One to One",
        variant_type_bn="১-টু-১ প্রাইভেট মেন্টরশিপ",
        price=8500.0,
        description="Dedicated 1-on-1 weekly architecture mentorship with Maruf Ahmed",
        meeting_link="https://meet.google.com/lwma-1to1",
    )
    v2_rec = CourseVariant(
        course_id=c2.id,
        variant_type="Recorded",
        variant_type_bn="রেকর্ডেড ভার্সন",
        price=2200.0,
        description="Self-paced full access with community support",
    )
    db.add_all([v1_rec, v1_live, v1_one, v2_rec])
    await db.flush()

    # Modules & Sequential Lessons for Course 1
    m1 = Module(
        course_id=c1.id,
        title="Module 01: Cloud Architecture & Zero-Trust FastAPI Foundation",
        title_bn="মডিউল ০১: ক্লাউড আর্কিটেকচার এবং জিরো-ট্রাস্ট ফাস্টএপিআই ফাউন্ডেশন",
        order=1,
    )
    m2 = Module(
        course_id=c1.id,
        title="Module 02: Mobile-First React 19, Tailwind v4 & Apple Fluid Physics",
        title_bn="মডিউল ০২: মোবাইল-ফার্স্ট রিয়্যাক্ট ১৯, টেইলউইন্ড এবং অ্যাপল ফ্লুইড মোশন",
        order=2,
    )
    db.add_all([m1, m2])
    await db.flush()

    l1 = Lesson(
        course_id=c1.id,
        module_id=m1.id,
        title="01. Designing Decoupled React + FastAPI Systems & Eliminating SQL Injection",
        title_bn="০১. ডিকাপলড রিয়্যাক্ট + ফাস্টএপিআই আর্কিটেকচার এবং এসকিউএল ইনজেকশন প্রতিরোধ",
        description="Learn how SQLAlchemy 2.0 Async parameterized statements eliminate SQL injection at the driver level without breaking code notes.",
        description_bn="SQLAlchemy 2.0 এর প্যারামিটারাইজড কুয়েরির মাধ্যমে কীভাবে শতভাগ নিরাপদ ডেটাবেস লেয়ার তৈরি করতে হয় তা জানুন।",
        video_id="M7lc1UVf-VE",
        duration_minutes=22,
        resource_file_path="lesson-1-cheatsheet.pdf",
        pass_mark=50,
        is_free_preview=True,
        order=1,
    )
    l2 = Lesson(
        course_id=c1.id,
        module_id=m1.id,
        title="02. Dual-Token JWT Auth, Argon2id Hashing & Single-Device Session Guard",
        title_bn="০২. ডুয়াল-টোকেন জেডব্লিউটি অথেনটিকেশন, আর্জন২ হ্যাশিং ও সিঙ্গেল-ডিভাইস সেশন",
        description="Implement memory-backed access tokens, rotating refresh tokens, and automatic session invalidation when a second device logs in.",
        description_bn="অ্যাকাউন্ট শেয়ারিং রোধে সিঙ্গেল-ডিভাইস সেশন গার্ড এবং নিরাপদ টোকেন রোটেশন ইমপ্লিমেন্টেশন।",
        video_id="ysz5S6PUM-U",
        duration_minutes=28,
        resource_file_path="fullstack-architecture-handbook.pdf",
        pass_mark=60,
        is_free_preview=False,
        order=2,
    )
    l3 = Lesson(
        course_id=c1.id,
        module_id=m2.id,
        title="03. Apple WWDC Spring Physics, Safe-Area Insets & 48dp Mobile Touch Ergonomics",
        title_bn="০৩. অ্যাপল স্প্রিং ফিজিক্স, সেফ-এরিয়া ইনসেট এবং ৪৮ডিপি মোবাইল টাচ ইউএক্স",
        description="Translate Apple's Designing Fluid Interfaces principles to the web using critically damped springs, Vaul bottom sheets, and optical typography.",
        description_bn="মোবাইল ব্রাউজারে নেটিভ অ্যাপের মতো স্মুথ বটম শিট, স্প্রিং অ্যানিমেশন এবং সেফ-এরিয়া ডিজাইন কৌশল।",
        video_id="aqz-KE-bpKQ",
        duration_minutes=25,
        resource_file_path="ui-ux-design-token-system.pdf",
        pass_mark=50,
        is_free_preview=False,
        order=3,
    )
    db.add_all([l1, l2, l3])

    # Add lessons for Course 2 & Course 4 so student can also have a 100% completed course with Certificate
    m_c4 = Module(
        course_id=c4.id,
        title="Module 01: OWASP API Security & Payment Verification",
        title_bn="মডিউল ০১: ওওয়াস্প এপিআই সিকিউরিটি ও পেমেন্ট ভেরিফিকেশন",
        order=1,
    )
    db.add(m_c4)
    await db.flush()

    l_c4_1 = Lesson(
        course_id=c4.id,
        module_id=m_c4.id,
        title="01. Preventing Fake Payment Bypass & Securing Media Vaults",
        title_bn="০১. ফেইক পেমেন্ট বাইপাস প্রতিরোধ ও সিকিউর মিডিয়া ভল্ট",
        description="Audit real-world checkout flaws and implement signed download tokens.",
        description_bn="চেকআউট ফ্লো অডিট এবং সাইনড ডাউনলোড টোকেন ইমপ্লিমেন্টেশন।",
        video_id="M7lc1UVf-VE",
        duration_minutes=19,
        resource_file_path="lesson-1-cheatsheet.pdf",
        pass_mark=50,
        is_free_preview=True,
        order=1,
    )
    db.add(l_c4_1)
    await db.flush()

    # Quizzes for Lesson 1 & Lesson 2
    q1 = Question(
        lesson_id=l1.id,
        text="Which technique reliably prevents SQL Injection while allowing students to save SQL code comments (-- or /* */) in their study notes?",
        text_bn="শিক্ষার্থীদের নোটে SQL কোড বা কমেন্ট (-- বা /* */) লেখার স্বাধীনতা বজায় রেখে SQL Injection প্রতিরোধের সবচেয়ে নির্ভরযোগ্য উপায় কোনটি?",
        question_type="MCQ",
        marks=1,
    )
    q2 = Question(
        lesson_id=l1.id,
        text="What is the minimum video watch percentage required by the server heartbeat before a lesson can be marked complete?",
        text_bn="একটি লেসন কমপ্লিট করার জন্য সার্ভার হার্টবিট অনুযায়ী ন্যূনতম কত শতাংশ ভিডিও দেখা আবশ্যক? (সংখ্যায় লিখুন, যেমন 80)",
        question_type="Short",
        correct_answer="80",
        marks=1,
    )
    q3 = Question(
        lesson_id=l2.id,
        text="Which password hashing algorithm won the Password Hashing Competition and resists GPU cracking?",
        text_bn="কোন পাসওয়ার্ড হ্যাশিং অ্যালগরিদমটি জিপিইউ ক্র্যাকিং প্রতিরোধে সবচেয়ে আধুনিক ও নিরাপদ?",
        question_type="MCQ",
        marks=1,
    )
    db.add_all([q1, q2, q3])
    await db.flush()

    db.add_all(
        [
            Choice(question_id=q1.id, text="Parameterized ORM / Prepared Statements (SQLAlchemy 2.0)", text_bn="প্যারামিটারাইজড ওআরএম / প্রিপেয়ার্ড স্টেটমেন্ট (SQLAlchemy 2.0)", is_correct=True),
            Choice(question_id=q1.id, text="Blocking words like SELECT and -- using Regex Middleware", text_bn="রেজেক্স দিয়ে SELECT বা -- ব্লক করা", is_correct=False),
            Choice(question_id=q1.id, text="Hiding input fields with CSS display:none", text_bn="সিএসএস দিয়ে ইনপুট লুকিয়ে রাখা", is_correct=False),
            Choice(question_id=q3.id, text="Argon2id", text_bn="Argon2id", is_correct=True),
            Choice(question_id=q3.id, text="Plain MD5", text_bn="Plain MD5", is_correct=False),
            Choice(question_id=q3.id, text="Base64 Encoding", text_bn="Base64 Encoding", is_correct=False),
        ]
    )

    # Enrollments, Watch Logs, Scores, Notes, Discussions & Certificate for student_user
    db.add_all(
        [
            Enrollment(
                user_id=student_user.id,
                course_id=c1.id,
                variant_id=v1_live.id,
                progress=33.3,
                completed_lesson_ids_json=json.dumps([l1.id]),
            ),
            Enrollment(
                user_id=student_user.id,
                course_id=c4.id,
                variant_id=None,
                progress=100.0,
                completed_lesson_ids_json=json.dumps([l_c4_1.id]),
            ),
        ]
    )
    db.add_all(
        [
            LessonWatchLog(user_id=student_user.id, lesson_id=l1.id, watched_seconds=1200, total_seconds=1320, watch_percentage=90.9),
            LessonWatchLog(user_id=student_user.id, lesson_id=l2.id, watched_seconds=420, total_seconds=1680, watch_percentage=25.0),
            LessonWatchLog(user_id=student_user.id, lesson_id=l_c4_1.id, watched_seconds=1140, total_seconds=1140, watch_percentage=100.0),
            LessonScore(user_id=student_user.id, lesson_id=l1.id, score=100.0, passed=True, attempts=1, last_attempt_time=now - timedelta(days=1)),
            LessonScore(user_id=student_user.id, lesson_id=l_c4_1.id, score=95.0, passed=True, attempts=1, last_attempt_time=now - timedelta(days=3)),
        ]
    )
    db.add(
        Note(
            user_id=student_user.id,
            lesson_id=l1.id,
            content=(
                "[02:15] Architecture takeaway: Never use regex middleware to block SQL keywords like `--` or `SELECT * FROM courses` because programming students write code in notes!\n"
                "[08:40] Always use SQLAlchemy 2.0 bound parameters (`select(Course).where(Course.id == cid)`).\n"
                "[14:20] Server-side watch heartbeat ensures 80% completion before unlocking the next module."
            ),
        )
    )

    d1 = LessonDiscussion(
        lesson_id=l1.id,
        user_id=student_user.id,
        user_name="Arifur Rahman",
        comment="ভাইয়া, আমরা যদি নোটে বা ডিসকাশনে `-- SQL comment` বা `SELECT * FROM users` লিখি, এখন তো আর 400 Bad Request দিচ্ছে না! এটা কীভাবে কাজ করছে?",
        is_mentor_reply=False,
        is_pinned=True,
    )
    db.add(d1)
    await db.flush()
    db.add(
        LessonDiscussion(
            lesson_id=l1.id,
            user_id=admin_user.id,
            user_name="Maruf Ahmed (Instructor)",
            parent_id=d1.id,
            comment="দারুণ প্রশ্ন আরিফ! LMS 2.0-তে আমরা ভুল Regex WAF বাদ দিয়ে শতভাগ SQLAlchemy 2.0 Parameterized Query এবং NH3 HTML Sanitizer ব্যবহার করেছি। তাই কোড স্নিপেট লেখায় কোনো বাধা নেই এবং SQL Injection ও Stored XSS শতভাগ অসম্ভব।",
            is_mentor_reply=True,
            is_pinned=False,
        )
    )

    # Live Classes
    db.add_all(
        [
            LiveClass(
                course_id=c1.id,
                title="Live Architecture Review: Scaling FastAPI + React on Cloud",
                title_bn="লাইভ আর্কিটেকচার রিভিউ: ক্লাউডে ফাস্টএপিআই ও রিয়্যাক্ট স্কেলিং",
                date_time=now + timedelta(days=2, hours=4),
                meeting_link="https://zoom.us/j/9988776655",
                platform="Zoom Live",
                description="Interactive Q&A and live debugging session for Batch 08 learners.",
            ),
            LiveClass(
                course_id=c3.id,
                title="Design Critique: Mobile Safe-Areas & Vaul Spring Sheets",
                title_bn="ডিজাইন ক্রিটিক: মোবাইল সেফ-এরিয়া এবং স্প্রিং শিট",
                date_time=now + timedelta(days=4, hours=2),
                meeting_link="https://meet.google.com/lwma-design-live",
                platform="Google Meet",
                description="Bring your Figma and Tailwind components for live feedback.",
            ),
        ]
    )

    # Official Verified Certificate for student_user
    db.add(
        Certificate(
            certificate_id="LWMA-2026A1",
            user_id=student_user.id,
            course_id=c4.id,
            student_name="Arifur Rahman",
            course_name=c4.title,
            course_name_bn=c4.title_bn,
            instructor_name="Maruf Ahmed",
            grade_score=95.0,
            issued_at=now - timedelta(days=2),
        )
    )

    # Course Bundles
    db.add_all(
        [
            CourseBundle(
                title="Full-Stack & Cybersecurity Career Mastery Bundle",
                title_bn="ফুল-স্ট্যাক ও সাইবার সিকিউরিটি ক্যারিয়ার মাস্টারি বান্ডেল",
                description="Get both our flagship React 19 + FastAPI Cloud Engineering track and the Ethical API Hardening course together at 45% savings.",
                description_bn="রিয়্যাক্ট ১৯ + ফাস্টএপিআই ক্লাউড ইঞ্জিনিয়ারিং এবং সাইবার সিকিউরিটি কোর্স দুটি একসাথে ৪৫% সাশ্রয়ে!",
                course_ids_json=json.dumps([c1.id, c4.id]),
                price=3900.0,
                original_price=7900.0,
                thumbnail_url="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80",
            ),
            CourseBundle(
                title="Complete Product Engineer Track (Full-Stack + UI/UX + Python AI)",
                title_bn="কমপ্লিট প্রোডাক্ট ইঞ্জিনিয়ার ট্র্যাক (ফুল-স্ট্যাক + ইউআই/ইউএক্স + পাইথন এআই)",
                description="The ultimate 3-course bundle for founders, freelancers, and product engineers.",
                description_bn="ফ্রিল্যান্সার এবং ফুল-স্ট্যাক প্রোডাক্ট ইঞ্জিনিয়ারদের জন্য ৩টি প্রিমিয়াম কোর্সের সমন্বিত বান্ডেল।",
                course_ids_json=json.dumps([c1.id, c2.id, c3.id]),
                price=4950.0,
                original_price=10300.0,
                thumbnail_url="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80",
            ),
        ]
    )

    # Payments (Approved + Pending for Admin Verification Queue)
    db.add_all(
        [
            Payment(
                invoice_number="INV-202601",
                user_id=student_user.id,
                user_name="Arifur Rahman",
                course_id=c1.id,
                variant_id=v1_live.id,
                item_title=f"{c1.title} (Online Live)",
                method="bKash",
                sender_number="01911889900",
                transaction_id="BKX984210LM",
                promo_code_applied="MARUF25",
                amount=2850.0,
                status="Approved",
                created_at=now - timedelta(days=12),
            ),
            Payment(
                invoice_number="INV-202602",
                user_id=student_user.id,
                user_name="Arifur Rahman",
                course_id=c4.id,
                item_title=c4.title,
                method="Nagad",
                sender_number="01911889900",
                transaction_id="NGD773190AB",
                amount=2400.0,
                status="Approved",
                created_at=now - timedelta(days=20),
            ),
            Payment(
                invoice_number="INV-202603",
                user_id=student_user.id,
                user_name="Arifur Rahman",
                course_id=c2.id,
                variant_id=v2_rec.id,
                item_title=c2.title,
                method="bKash",
                sender_number="01755443322",
                transaction_id="BKPEND88219",
                amount=2200.0,
                status="Pending",
                created_at=now - timedelta(hours=3),
            ),
        ]
    )

    # Digital Store Products
    sp1 = StoreProduct(
        title="Full-Stack Cloud Architecture & Security Handbook (PDF + Diagrams)",
        title_bn="ফুল-স্ট্যাক ক্লাউড আর্কিটেকচার ও সিকিউরিটি হ্যান্ডবুক (পিডিএফ)",
        slug="fullstack-cloud-architecture-handbook",
        category="ebook",
        short_description="240-page field manual covering FastAPI, React 19, PostgreSQL indexing, JWT security, and system design.",
        short_description_bn="ফাস্টএপিআই, রিয়্যাক্ট ১৯, পোস্টগ্রেএসকিউএল এবং সিস্টেম ডিজাইনের ২৪০ পৃষ্ঠার প্র্যাকটিক্যাল ই-বুক।",
        price=450.0,
        original_price=900.0,
        thumbnail_url="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        vault_file_path="fullstack-architecture-handbook.pdf",
        sales_count=310,
    )
    sp2 = StoreProduct(
        title="Production SaaS Starter Kit (React 19 + FastAPI + bKash/SSLCommerz Ready)",
        title_bn="প্রোডাকশন সাস স্টার্টার কিট (রিয়্যাক্ট ১৯ + ফাস্টএপিআই + পেমেন্ট গেটওয়ে রেডি)",
        slug="production-saas-starter-kit",
        category="code",
        short_description="Save 80+ engineering hours with our pre-configured monorepo template including RBAC, invoices, and dark/light design tokens.",
        short_description_bn="অথেনটিকেশন, ইনভয়েস, ডার্ক/লাইট থিম এবং পেমেন্ট মডিউলসহ রেডিমেড প্রোডাকশন সোর্স কোড টেমপ্লেট।",
        price=1490.0,
        original_price=3500.0,
        thumbnail_url="https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=800&q=80",
        vault_file_path="django-react-saas-starter-kit.zip",
        sales_count=175,
    )
    sp3 = StoreProduct(
        title="Apple & shadcn/ui Mobile Design Token System",
        title_bn="অ্যাপল ও শ্যাডসিএন মোবাইল ডিজাইন টোকেন সিস্টেম",
        slug="apple-shadcn-design-token-system",
        category="template",
        short_description="Complete 3-layer CSS variable token architecture, optical typography scales, and spring physics presets.",
        short_description_bn="৩-লেয়ার সিএসএস ভ্যারিয়েবল টোকেন, অপটিক্যাল টাইপোগ্রাফি এবং স্প্রিং অ্যানিমেশন গাইড।",
        price=390.0,
        original_price=800.0,
        thumbnail_url="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        vault_file_path="ui-ux-design-token-system.pdf",
        sales_count=220,
    )
    db.add_all([sp1, sp2, sp3])
    await db.flush()

    # Give student_user one approved StoreOrder so they can test signed vault download immediately
    db.add(
        StoreOrder(
            user_id=student_user.id,
            product_id=sp1.id,
            product_title=sp1.title,
            amount=450.0,
            payment_method="bKash",
            sender_number="01911889900",
            transaction_id="BKSTORE9910",
            status="Approved",
            is_paid=True,
        )
    )

    # Workshops, Video Testimonials, Reviews, FAQs, Blog Posts
    db.add_all(
        [
            Workshop(
                title="Architecting Anti-Vibecoded Cloud Apps with React 19 & FastAPI",
                title_bn="রিয়্যাক্ট ১৯ ও ফাস্টএপিআই দিয়ে প্রফেশনাল ক্লাউড অ্যাপ আর্কিটেকচার (ফ্রি লাইভ ওয়ার্কশপ)",
                description="Join Maruf Ahmed live to learn how to transition from monolithic templates to high-speed async microservices and fluid mobile UIs.",
                description_bn="কীভাবে সাধারণ টেমপ্লেট ছেড়ে হাই-পারফরম্যান্স ক্লাউড অ্যাপ এবং অ্যাপল-গ্রেড মোবাইল ইউআই তৈরি করবেন তা সরাসরি শিখুন।",
                speaker_name="Maruf Ahmed",
                date_time=now + timedelta(days=5),
                duration_minutes=90,
                platform="Zoom Live",
                registrations_count=196,
                is_active=True,
            ),
            VideoTestimonial(
                student_name="Nusrat Jahan",
                student_role="Frontend Engineer at Remote SaaS",
                student_role_bn="ফ্রন্টএন্ড ইঞ্জিনিয়ার (রিমোট সাস কোম্পানি)",
                course_name=c1.title,
                video_id="M7lc1UVf-VE",
                quote="The mobile-first engineering discipline and code reviews from Maruf bhaiya helped me land my first $1,800/mo remote role.",
                quote_bn="মারুফ ভাইয়ার কোড রিভিউ এবং প্র্যাকটিক্যাল গাইডলাইন আমাকে প্রথম রিমোট সফটওয়্যার ইঞ্জিনিয়ারিং জব পেতে সরাসরি সাহায্য করেছে।",
            ),
            VideoTestimonial(
                student_name="Sabbir Hossain",
                student_role="Top Rated Seller on Upwork",
                student_role_bn="টপ রেটেড ফ্রিল্যান্সার (আপওয়ার্ক)",
                course_name=c2.title,
                video_id="ysz5S6PUM-U",
                quote="From zero backend confidence to building secure FastAPI & Django systems for international clients.",
                quote_bn="ব্যাকএন্ড ডেভেলপমেন্ট ও সিকিউরিটি এত সহজভাবে বাংলায় আগে কোথাও শিখিনি।",
            ),
        ]
    )

    db.add_all(
        [
            Review(
                user_id=student_user.id,
                course_id=c1.id,
                name="Arifur Rahman",
                role="Full-Stack Learner",
                rating=5,
                text="The new LMS 2.0 mobile player is super fast! Taking timestamped notes while watching on my phone feels like a native iOS app.",
                text_bn="নতুন এলএমএস ২.০ এর মোবাইল প্লেয়ার অসাধারণ! ফোনে ভিডিও দেখার পাশাপাশি টাইমস্ট্যাম্প নোট নেওয়া এবং কুইজ দেওয়া একদম নেটিভ অ্যাপের মতো স্মুথ।",
                is_approved=True,
            ),
            Review(
                user_id=None,
                course_id=c2.id,
                name="Mahmudul Hasan",
                role="Backend Developer",
                rating=5,
                text="Best practical curriculum in Bangladesh. Every module forces you to pass real assessments before moving forward.",
                text_bn="বাংলাদেশের অন্যতম সেরা প্র্যাকটিক্যাল কোর্স। প্রতিটি লেসনের পর কুইজ ও প্রজেক্ট থাকায় ফাঁকি দেওয়ার কোনো সুযোগ নেই।",
                is_approved=True,
            ),
        ]
    )

    db.add_all(
        [
            FAQ(
                question="How does payment verification work for bKash, Nagad, and Rocket?",
                question_bn="বিকাশ, নগদ বা রকেটের মাধ্যমে পেমেন্ট ভেরিফিকেশন কীভাবে কাজ করে?",
                answer="Select your preferred Course Variant, send the fee to our official wallet number or use instant gateway checkout, and submit your TrxID. Once verified, your course unlocks immediately along with a downloadable QR-verified PDF invoice.",
                answer_bn="আপনার পছন্দের কোর্স ভ্যারিয়েন্ট সিলেক্ট করে অফিশিয়াল বিকাশ/নগদ/রকেট নাম্বারে পেমেন্ট সম্পন্ন করুন এবং TrxID জমা দিন। ভেরিফাই হওয়া মাত্রই কোর্স আনলক হবে এবং অফিশিয়াল QR-কোডযুক্ত PDF ইনভয়েস ডাউনলোড করতে পারবেন।",
                order=1,
            ),
            FAQ(
                question="Can I watch lessons and take notes smoothly on a mobile phone?",
                question_bn="আমি কি মোবাইল ফোন থেকে ক্লাস করা, নোট নেওয়া এবং কুইজ দেওয়ার সব সুবিধা পাব?",
                answer="Yes! LMS 2.0 is engineered mobile-first with Apple-style fluid bottom sheets, sticky 16:9 video playback, 48dp touch targets, and 1-click PDF note exports.",
                answer_bn="হ্যাঁ! LMS 2.0 সম্পূর্ণ মোবাইল-ফার্স্ট আর্কিটেকচারে তৈরি। ভিডিও চলাকালীন স্ক্রল করলেও ভিডিও উপরে স্টিকি থাকে এবং নিচে ট্যাবের মাধ্যমে নোট, কুইজ ও ডিসকাশন ব্যবহার করা যায়।",
                order=2,
            ),
            FAQ(
                question="How are certificates issued and verified by employers?",
                question_bn="সার্টিফিকেট কীভাবে প্রদান করা হয় এবং নিয়োগকর্তারা কীভাবে তা যাচাই করবেন?",
                answer="Every lesson requires watching at least 80% of the video (verified by server heartbeats) and passing the quiz. Upon 100% completion, a unique LWMA Certificate ID & QR code is minted, verifiable publicly at /verify-certificate.",
                answer_bn="প্রতিটি লেসনের ন্যূনতম ৮০% ভিডিও দেখা এবং কুইজে পাস করা বাধ্যতামূলক। ১০০% কোর্স শেষ হলে স্বয়ংক্রিয়ভাবে ইউনিক QR কোডসহ সার্টিফিকেট তৈরি হয় যা যেকোনো প্রতিষ্ঠান অনলাইনে যাচাই করতে পারে।",
                order=3,
            ),
        ]
    )

    db.add_all(
        [
            BlogPost(
                title="Why We Rebuilt Learn With Maruf Ahmed on React 19 & FastAPI",
                title_bn="কেন আমরা লার্ন উইথ মারুফ আহমেদ প্ল্যাটফর্মটি রিয়্যাক্ট ১৯ ও ফাস্টএপিআই-তে নতুন করে তৈরি করলাম",
                slug="why-we-rebuilt-lwma-on-react-19-and-fastapi",
                category="Architecture",
                category_bn="আর্কিটেকচার",
                author_name="Maruf Ahmed",
                excerpt="How moving from a monolithic template setup to an async FastAPI + React 19 architecture eliminated 10 security bottlenecks and transformed mobile learning.",
                excerpt_bn="মনোলিথিক টেমপ্লেট থেকে অ্যাসিঙ্ক ফাস্টএপিআই এবং রিয়্যাক্ট ১৯ আর্কিটেকচারে রূপান্তরের মাধ্যমে কীভাবে আমরা নিরাপত্তা ও মোবাইল পারফরম্যান্স নিশ্চিত করেছি।",
                content=(
                    "<p>Modern learners spend over 72% of their study time on mobile devices. Traditional server-rendered templates with heavy 3D background scripts drain battery and introduce layout lag.</p>"
                    "<h3>1. True Mobile-First Fluidity</h3>"
                    "<p>By adopting Apple WWDC fluid interface principles—critically damped springs, translucent chrome, and sticky video viewports—students can watch lectures, insert clickable video timestamps into their study notes, and participate in mentor Q&A without losing playback focus.</p>"
                    "<h3>2. Zero-Trust API Security</h3>"
                    "<p>Using SQLAlchemy 2.0 parameterized queries, Argon2id password hashing, and server-side video watch heartbeats guarantees every certificate earned on LWMA 2.0 represents genuine mastery.</p>"
                ),
                content_bn=(
                    "<p>বর্তমানে ৭২% এরও বেশি শিক্ষার্থী মোবাইল ফোনে ক্লাস করে থাকেন। তাই LMS 2.0-কে আমরা একদম নতুনভাবে মোবাইল-ফার্স্ট ও ক্লাউড-নেটিভ আর্কিটেকচারে তৈরি করেছি।</p>"
                    "<h3>১. অ্যাপল-গ্রেড ফ্লুইড ইন্টারফেস</h3>"
                    "<p>কোনো অপ্রয়োজনীয় ইমোজি আইকন বা ব্যাটারি-ড্রেইনিং থ্রিডি ক্যানভাস নয়; বরং পরিচ্ছন্ন টাইপোগ্রাফি এবং স্প্রিং-ফিজিক্স শিট ব্যবহার করা হয়েছে।</p>"
                    "<h3>২. শতভাগ সার্ভার-ভেরিফাইড প্রোগ্রেস ও সিকিউরিটি</h3>"
                    "<p>প্যারামিটারাইজড ওআরএম কুয়েরি, সাইনড মিডিয়া ভল্ট এবং ভিডিও ওয়াচ হার্টবিট প্রতিটি শিক্ষার্থীর অর্জনকে করে শতভাগ নির্ভরযোগ্য।</p>"
                ),
                cover_image_url="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80",
                read_time_minutes=6,
                views_count=342,
            ),
            BlogPost(
                title="5 SQL Injection & XSS Myths Every Backend Developer Must Stop Believing",
                title_bn="এসকিউএল ইনজেকশন ও এক্সএসএস নিয়ে ৫টি ভুল ধারণা যা প্রতিটি ডেভেলপারের জানা জরুরি",
                slug="5-sql-injection-and-xss-myths-backend-developers",
                category="Cybersecurity",
                category_bn="সাইবার সিকিউরিটি",
                author_name="Maruf Ahmed",
                excerpt="Why blocking SQL keywords with regular expressions breaks legitimate apps—and how parameterized AST bindings and HTML sanitizers solve it properly.",
                excerpt_bn="রেজেক্স দিয়ে SELECT বা -- ব্লক করা কেন ভুল পদ্ধতি এবং কীভাবে প্যারামিটারাইজড কুয়েরি ও এইচটিএমএল স্যানিটাইজার দিয়ে আসল নিরাপত্তা নিশ্চিত করতে হয়।",
                content=(
                    "<p>A common anti-pattern in web apps is writing a naive regex middleware that blocks words like <code>SELECT</code> or comment symbols like <code>--</code>. On a coding education platform, that blocks students from taking SQL notes!</p>"
                    "<p>The real solution is separating code from data at the protocol level using prepared statements in SQLAlchemy 2.0, paired with context-aware HTML sanitization (NH3) for user discussions.</p>"
                ),
                content_bn=(
                    "<p>অনেক ডেভেলপার ভুলবশত রেজেক্স মিডলওয়্যার দিয়ে <code>SELECT</code> বা <code>--</code> কিওয়ার্ড ব্লক করেন। কিন্তু একটি প্রোগ্রামিং লার্নিং প্ল্যাটফর্মে শিক্ষার্থীরা নোটে কোড লিখবেই!</p>"
                    "<p>আসল সমাধান হলো ডেটাবেস ড্রাইভার লেভেলে প্রিপেয়ার্ড স্টেটমেন্ট (SQLAlchemy 2.0) এবং ডিসকাশনের জন্য NH3 এইচটিএমএল স্যানিটাইজার ব্যবহার করা।</p>"
                ),
                cover_image_url="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80",
                read_time_minutes=5,
                views_count=219,
            ),
        ]
    )

    db.add_all(
        [
            Notification(
                user_id=student_user.id,
                title="Welcome to Learn With Maruf Ahmed 2.0!",
                message="Your mobile-first workspace, 7-day learning streak, and enrolled courses are ready.",
            ),
            UserActivity(user_id=student_user.id, action="Completed Lesson 01 & Passed Assessment (100%)"),
            UserActivity(user_id=student_user.id, action="Earned Official Certificate LWMA-2026A1"),
        ]
    )

    await db.commit()
    await seed_jobs_and_challenges_if_empty(db)


async def seed_jobs_and_challenges_if_empty(db: AsyncSession) -> None:
    job_count = (await db.execute(select(func.count(JobPosting.id)))).scalar() or 0
    if job_count == 0:
        db.add_all([
            JobPosting(
                title="Junior Full-Stack Python & React Engineer",
                title_bn="জুনিয়র ফুল-স্ট্যাক পাইথন ও রিয়্যাক্ট ইঞ্জিনিয়ার",
                company_name="Brain Station 23",
                company_logo="https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=200&q=80",
                location="Gulshan-1, Dhaka (Hybrid)",
                job_type="Full-time Hybrid",
                salary_range="৳55,000 - ৳85,000 / month",
                experience_level="Fresh Graduate to 1 Year",
                description="Join our enterprise cloud engineering squad. You will develop asynchronous REST/GraphQL microservices with FastAPI, implement responsive React 19 interfaces, and adhere to zero-trust security standards.",
                description_bn="ব্রেন স্টেশন ২৩-এর এন্টারপ্রাইজ ক্লাউড টিমে যোগ দিন। ফাস্টএপিআই দিয়ে মাইক্রোসার্ভিস ডেভেলপমেন্ট এবং রিয়্যাক্ট ১৯ দিয়ে ফ্রন্টএন্ড তৈরিতে কাজ করবেন।",
                skills_required_json=json.dumps(["FastAPI", "React 19", "PostgreSQL", "Docker", "Tailwind CSS"]),
                is_active=True,
            ),
            JobPosting(
                title="Cloud Backend Engineer (FastAPI & Distributed Systems)",
                title_bn="ক্লাউড ব্যাকএন্ড ইঞ্জিনিয়ার (ফাস্টএপিআই ও ডিস্ট্রিবিউটেড সিস্টেমস)",
                company_name="Astha IT",
                company_logo="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=200&q=80",
                location="Remote (Bangladesh)",
                job_type="Full-time Remote",
                salary_range="৳60,000 - ৳95,000 / month",
                experience_level="1 - 2 Years",
                description="Work with global clients building high-throughput payment pipelines and real-time APIs. Focus on async SQLAlchemy 2.0, Redis caching, and CI/CD automation.",
                description_bn="গ্লোবাল ক্লায়েন্টদের জন্য হাই-থ্রুপুট পেমেন্ট ও এপিআই পাইপলাইন তৈরি। পাইথন অ্যাসিঙ্ক প্রোগ্রামিং ও ক্লাউড ডেপ্লয়মেন্টে পারদর্শী হতে হবে।",
                skills_required_json=json.dumps(["Python", "FastAPI", "SQLAlchemy 2.0", "Redis", "Celery"]),
                is_active=True,
            ),
            JobPosting(
                title="AI Platform & LLM Application Associate",
                title_bn="এআই প্ল্যাটফর্ম ও এলএলএম অ্যাপ্লিকেশন অ্যাসোসিয়েট",
                company_name="REVE Systems",
                company_logo="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80",
                location="Banani, Dhaka",
                job_type="Full-time On-site",
                salary_range="৳65,000 - ৳105,000 / month",
                experience_level="Entry to Mid-Level",
                description="Build enterprise AI agent workflows, RAG pipelines, and conversational interfaces using Python, LangChain, and modern vector databases.",
                description_bn="রিভ সিস্টেমসের এআই প্ল্যাটফর্ম টিমে আরএজি ও এজেন্টিক অটোমেশন সিস্টেম তৈরিতে কাজ করার সুযোগ।",
                skills_required_json=json.dumps(["Python", "LangChain", "Vector DB", "FastAPI", "Prompt Engineering"]),
                is_active=True,
            ),
            JobPosting(
                title="Mobile-First Frontend Engineer (React 19 & Tailwind)",
                title_bn="মোবাইল-ফার্স্ট ফ্রন্টএন্ড ইঞ্জিনিয়ার (রিয়্যাক্ট ১৯ ও টেলউইন্ড)",
                company_name="Technosoft BD",
                company_logo="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&q=80",
                location="Remote (Bangladesh)",
                job_type="Full-time Remote",
                salary_range="৳50,000 - ৳80,000 / month",
                experience_level="Fresh Graduate / 1 Year",
                description="Craft frictionless, accessible, mobile-first web applications using React 19, TypeScript, Tailwind CSS, and Apple-grade fluid animations.",
                description_bn="রিয়্যাক্ট ১৯ এবং অ্যাপল ডিজাইন গাইডলাইন অনুযায়ী মোবাইল-ফার্স্ট ফ্লুইড ইউজার ইন্টারফেস তৈরির জন্য টিম মেম্বার নিয়োগ দেওয়া হচ্ছে।",
                skills_required_json=json.dumps(["React 19", "TypeScript", "Tailwind CSS", "Framer Motion", "PWA"]),
                is_active=True,
            ),
            JobPosting(
                title="Cloud Infrastructure & DevOps Apprentice",
                title_bn="ক্লাউড ইনফ্রাস্ট্রাকচার ও ডেভঅপস শিক্ষানবিস",
                company_name="TigerIT Bangladesh",
                company_logo="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=200&q=80",
                location="Mohakhali DOHS, Dhaka",
                job_type="Full-time On-site",
                salary_range="৳50,000 - ৳75,000 / month",
                experience_level="Fresh Graduate",
                description="Support production Kubernetes clusters, Linux servers, automated backups, and zero-trust firewall configurations.",
                description_bn="টাইগারআইটির ক্লাউড অপারেশনস টিমে লিনাক্স, কুবারনেটিস এবং সিকিউর ডেপ্লয়মেন্ট মনিটরিংয়ে ক্যারিয়ার শুরু করুন।",
                skills_required_json=json.dumps(["Linux", "Docker", "Kubernetes", "Bash Scripting", "Nginx"]),
                is_active=True,
            ),
        ])

    challenge_count = (await db.execute(select(func.count(CodeChallenge.id)))).scalar() or 0
    if challenge_count == 0:
        db.add_all([
            CodeChallenge(
                title="Two Sum Problem",
                title_bn="টু সাম অ্যালগরিদম",
                category="Algorithms & Data Structures",
                difficulty="Easy",
                language="python",
                description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
                description_bn="একটি ইন্টিজার অ্যারে `nums` এবং একটি `target` দেওয়া আছে। এমন দুটি সংখ্যার ইনডেক্স রিটার্ন করুন যাদের যোগফল `target` এর সমান হয়।",
                starter_code="def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your solution below\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n",
                test_cases_json=json.dumps([
                    {"input": "[2, 7, 11, 15], 9", "expected": "[0, 1]"},
                    {"input": "[3, 2, 4], 6", "expected": "[1, 2]"},
                    {"input": "[3, 3], 6", "expected": "[0, 1]"}
                ]),
                points=30,
            ),
            CodeChallenge(
                title="SQL Injection Prevention in AST Queries",
                title_bn="এএসটি কুয়েরিতে এসকিউএল ইনজেকশন প্রতিরোধ",
                category="Database & Security",
                difficulty="Medium",
                language="python",
                description="Implement a function `build_safe_query(table: str, filters: dict) -> tuple[str, dict]` that constructs a safe parameterized SQLAlchemy/asyncpg query string and parameter dict, preventing malicious SQL injection fragments.",
                description_bn="এমন একটি ফাংশন লিখুন যা প্যারামিটারাইজড কুয়েরি ও প্যারামিটার ডিকশনারি রিটার্ন করবে যাতে কোনো এসকিউএল ইনজেকশন সম্ভব না হয়।",
                starter_code="def build_safe_query(table: str, filters: dict) -> tuple[str, dict]:\n    # Validate table identifier (alphanumeric only)\n    if not table.isidentifier():\n        raise ValueError('Invalid table name')\n    clauses = [f\"{k} = :{k}\" for k in filters.keys()]\n    sql = f\"SELECT * FROM {table} WHERE \" + \" AND \".join(clauses)\n    return sql, filters\n",
                test_cases_json=json.dumps([
                    {"input": "'users', {'email': 'test@example.com'}", "expected": "('SELECT * FROM users WHERE email = :email', {'email': 'test@example.com'})"},
                    {"input": "'courses', {'category': 'Web', 'price': 2000}", "expected": "('SELECT * FROM courses WHERE category = :category AND price = :price', {'category': 'Web', 'price': 2000})"}
                ]),
                points=50,
            ),
            CodeChallenge(
                title="Palindrome String Validator",
                title_bn="প্যালিনড্রোম স্ট্রিং ভ্যালিডেটর",
                category="Strings & Logic",
                difficulty="Easy",
                language="python",
                description="A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Implement `is_palindrome(s: str) -> bool`.",
                description_bn="একটি স্ট্রিং থেকে সকল স্পেস ও স্পেশাল ক্যারেক্টার বাদ দিয়ে ছোট হাতের অক্ষরে রূপান্তর করার পর যদি সামনে ও পেছন থেকে সমান পড়া যায়, তবে ট্রু রিটার্ন করুন।",
                starter_code="def is_palindrome(s: str) -> bool:\n    # Write your solution below\n    cleaned = ''.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]\n",
                test_cases_json=json.dumps([
                    {"input": "'A man, a plan, a canal: Panama'", "expected": "True"},
                    {"input": "'race a car'", "expected": "False"},
                    {"input": "' '", "expected": "True"}
                ]),
                points=25,
            ),
            CodeChallenge(
                title="JWT Expiration & Scope Validator",
                title_bn="জেডব্লিউটি এক্সপাইরেশন ও স্কোপ ভ্যালিডেটর",
                category="Authentication & Cloud",
                difficulty="Medium",
                language="python",
                description="Write `validate_claims(claims: dict, required_scope: str, current_time: int) -> bool` that verifies a token has not expired (`exp > current_time`) and includes the required scope in its scopes list.",
                description_bn="টোকেনের `exp` ফিল্ড বর্তমান সময়ের চেয়ে বড় কিনা এবং প্রয়োজনীয় স্কোপ তালিকায় বিদ্যমান কিনা তা যাচাই করে ট্রু বা ফলস দিন।",
                starter_code="def validate_claims(claims: dict, required_scope: str, current_time: int) -> bool:\n    # Verify exp claim\n    if claims.get('exp', 0) <= current_time:\n        return False\n    scopes = claims.get('scopes', [])\n    return required_scope in scopes\n",
                test_cases_json=json.dumps([
                    {"input": "{'exp': 2000, 'scopes': ['read', 'write']}, 'write', 1500", "expected": "True"},
                    {"input": "{'exp': 1000, 'scopes': ['read', 'write']}, 'write', 1500", "expected": "False"},
                    {"input": "{'exp': 2000, 'scopes': ['read']}, 'admin', 1500", "expected": "False"}
                ]),
                points=55,
            ),
        ])

    await db.commit()


async def import_from_legacy_sqlite(db: AsyncSession) -> dict:
    r"""
    Non-destructively imports any additional courses, FAQs, or blog posts from
    E:\website\learn-with-maruf-ahmed\db.sqlite3 if available.
    """
    legacy_path = settings.LEGACY_SQLITE_PATH
    if not os.path.exists(legacy_path):
        return {"found_legacy_db": False, "imported_courses": 0, "imported_faqs": 0}

    imported_courses = 0
    imported_faqs = 0
    try:
        conn = sqlite3.connect(legacy_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        existing_titles = set((await db.execute(select(Course.title))).scalars().all())
        cur.execute("SELECT * FROM core_course")
        for row in cur.fetchall():
            r = dict(row)
            title = (r.get("title") or "").strip()
            if title and title not in existing_titles:
                db.add(
                    Course(
                        instructor_name="Maruf Ahmed",
                        title=title,
                        title_bn=r.get("title_bn") or title,
                        description=r.get("description") or "",
                        description_bn=r.get("description_bn") or "",
                        category=r.get("category") or "Web Development",
                        price=float(r.get("price") or 2000.0),
                        original_price=float(r.get("original_price") or 4000.0),
                        students_count=int(r.get("students_count") or 50),
                        rating=float(r.get("rating") or 4.9),
                        thumbnail_url="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80",
                    )
                )
                existing_titles.add(title)
                imported_courses += 1

        existing_questions = set((await db.execute(select(FAQ.question))).scalars().all())
        cur.execute("SELECT * FROM core_faq")
        for row in cur.fetchall():
            r = dict(row)
            q_text = (r.get("question") or "").strip()
            if q_text and q_text not in existing_questions:
                db.add(
                    FAQ(
                        question=q_text,
                        question_bn=r.get("question_bn") or q_text,
                        answer=r.get("answer") or "",
                        answer_bn=r.get("answer_bn") or "",
                        order=int(r.get("order") or 10),
                    )
                )
                existing_questions.add(q_text)
                imported_faqs += 1

        conn.close()
        await db.commit()
    except Exception as exc:
        return {"found_legacy_db": True, "imported_courses": imported_courses, "imported_faqs": imported_faqs, "note": str(exc)}

    return {"found_legacy_db": True, "imported_courses": imported_courses, "imported_faqs": imported_faqs}
