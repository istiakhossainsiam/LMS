import json
import os
from enum import Enum
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limit import rate_limiter
from app.core.security import sanitize_plain_text
from app.models.courses import Certificate, Course, CourseBundle, CourseVariant, FAQ, Review
from app.models.lessons import Lesson, LessonScore, Module
from app.models.content_and_store import FlashSale, SiteSettings, VideoTestimonial, Workshop, WorkshopRegistration
from app.models.users import Profile, User

router = APIRouter(prefix="/public", tags=["Public Catalog, CMS & Verification"])


class CourseSortEnum(str, Enum):
    popular = "popular"
    price_asc = "price_asc"
    price_desc = "price_desc"
    rating = "rating"


class WorkshopRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: str = Field(..., min_length=6, max_length=30)


def serialize_course(course: Course, variants: list[CourseVariant] | None = None, lesson_count: int = 0) -> dict:
    try:
        features = json.loads(course.features_json or "[]")
    except Exception:
        features = []
    try:
        outcomes = json.loads(course.outcomes_json or "[]")
    except Exception:
        outcomes = []

    discount_pct = 0
    if course.original_price > course.price and course.original_price > 0:
        discount_pct = round(((course.original_price - course.price) / course.original_price) * 100)

    return {
        "id": course.id,
        "instructor_id": course.instructor_id,
        "instructor_name": course.instructor_name,
        "title": course.title,
        "title_bn": course.title_bn or course.title,
        "description": course.description,
        "description_bn": course.description_bn or course.description,
        "thumbnail_url": course.thumbnail_url,
        "category": course.category,
        "category_bn": course.category_bn or course.category,
        "level": course.level,
        "duration_hours": course.duration_hours,
        "price": course.price,
        "original_price": course.original_price,
        "discount_percentage": discount_pct,
        "students_count": course.students_count,
        "rating": course.rating,
        "is_live_course": course.is_live_course,
        "batch_title": course.batch_title,
        "batch_title_bn": course.batch_title_bn or course.batch_title,
        "total_seats": course.total_seats,
        "seats_booked": course.seats_booked,
        "seats_remaining": max(0, course.total_seats - course.seats_booked),
        "live_class_schedule": course.live_class_schedule,
        "live_class_schedule_bn": course.live_class_schedule_bn or course.live_class_schedule,
        "final_project_title": course.final_project_title,
        "final_project_description": course.final_project_description,
        "features": features,
        "outcomes": outcomes,
        "lesson_count": lesson_count,
        "variants": [
            {
                "id": v.id,
                "variant_type": v.variant_type,
                "variant_type_bn": v.variant_type_bn or v.variant_type,
                "price": v.price,
                "description": v.description,
            }
            for v in (variants or [])
        ],
    }


@router.get("/home")
async def get_home_data(db: AsyncSession = Depends(get_db)):
    site_settings = (await db.execute(select(SiteSettings).limit(1))).scalar_one_or_none()
    flash_sale = (
        await db.execute(select(FlashSale).where(FlashSale.is_active == True).order_by(desc(FlashSale.id)).limit(1))
    ).scalar_one_or_none()

    courses = (await db.execute(select(Course).order_by(desc(Course.students_count)))).scalars().all()
    all_variants = (await db.execute(select(CourseVariant))).scalars().all()
    variants_by_course: dict[int, list[CourseVariant]] = {}
    for v in all_variants:
        variants_by_course.setdefault(v.course_id, []).append(v)

    lesson_counts_rows = (
        await db.execute(select(Lesson.course_id, func.count(Lesson.id)).group_by(Lesson.course_id))
    ).all()
    lesson_counts = {cid: cnt for cid, cnt in lesson_counts_rows}

    bundles = (await db.execute(select(CourseBundle).order_by(desc(CourseBundle.id)))).scalars().all()
    workshops = (await db.execute(select(Workshop).where(Workshop.is_active == True))).scalars().all()
    testimonials = (await db.execute(select(VideoTestimonial))).scalars().all()
    reviews = (await db.execute(select(Review).where(Review.is_approved == True).limit(6))).scalars().all()
    faqs = (await db.execute(select(FAQ).order_by(FAQ.order, FAQ.id))).scalars().all()

    course_map = {c.id: c for c in courses}

    return {
        "site_settings": {
            "site_title": site_settings.site_title if site_settings else "Training Pundit",
            "site_title_bn": site_settings.site_title_bn if site_settings else "ট্রেনিং পণ্ডিত",
            "site_description": site_settings.site_description if site_settings else "",
            "site_description_bn": site_settings.site_description_bn if site_settings else "",
            "hero_badge": site_settings.hero_badge if site_settings else "",
            "hero_badge_bn": site_settings.hero_badge_bn if site_settings else "",
            "hero_title": site_settings.hero_title if site_settings else "",
            "hero_title_bn": site_settings.hero_title_bn if site_settings else "",
            "hero_subtitle": site_settings.hero_subtitle if site_settings else "",
            "hero_subtitle_bn": site_settings.hero_subtitle_bn if site_settings else "",
            "support_email": site_settings.support_email if site_settings else "support@trainingpundit.com",
            "support_phone": site_settings.support_phone if site_settings else "+880 1711-223344",
        },
        "flash_sale": {
            "id": flash_sale.id,
            "title": flash_sale.title,
            "title_bn": flash_sale.title_bn,
            "discount_percentage": flash_sale.discount_percentage,
            "promo_code": flash_sale.promo_code,
            "end_time": flash_sale.end_time.isoformat(),
        }
        if flash_sale
        else None,
        "stats": [
            {"value": "15,400+", "value_bn": "১৫,৪০০+", "label": "Active Learners", "label_bn": "সক্রিয় শিক্ষার্থী"},
            {"value": "96.4%", "value_bn": "৯৬.৪%", "label": "Completion Satisfaction", "label_bn": "সফলতার হার"},
            {"value": "48+", "value_bn": "৪৮+", "label": "Industry Real Projects", "label_bn": "ইন্ডাস্ট্রি প্রজেক্ট"},
            {"value": "24/7", "value_bn": "২৪/৭", "label": "Mentor Code Review", "label_bn": "মেন্টর সাপোর্ট"},
        ],
        "courses": [
            serialize_course(c, variants_by_course.get(c.id, []), lesson_counts.get(c.id, 3))
            for c in courses
        ],
        "bundles": [
            {
                "id": b.id,
                "title": b.title,
                "title_bn": b.title_bn or b.title,
                "description": b.description,
                "description_bn": b.description_bn or b.description,
                "price": b.price,
                "original_price": b.original_price,
                "savings": max(0, b.original_price - b.price),
                "discount_percentage": round(((b.original_price - b.price) / b.original_price) * 100)
                if b.original_price > 0
                else 0,
                "thumbnail_url": b.thumbnail_url,
                "courses": [
                    {"id": cid, "title": course_map[cid].title, "title_bn": course_map[cid].title_bn}
                    for cid in json.loads(b.course_ids_json or "[]")
                    if cid in course_map
                ],
            }
            for b in bundles
        ],
        "workshops": [
            {
                "id": w.id,
                "title": w.title,
                "title_bn": w.title_bn or w.title,
                "description": w.description,
                "description_bn": w.description_bn or w.description,
                "speaker_name": w.speaker_name,
                "date_time": w.date_time.isoformat(),
                "duration_minutes": w.duration_minutes,
                "platform": w.platform,
                "registrations_count": w.registrations_count,
            }
            for w in workshops
        ],
        "video_testimonials": [
            {
                "id": vt.id,
                "student_name": vt.student_name,
                "student_role": vt.student_role,
                "student_role_bn": vt.student_role_bn or vt.student_role,
                "course_name": vt.course_name,
                "video_id": vt.video_id,
                "quote": vt.quote,
                "quote_bn": vt.quote_bn or vt.quote,
            }
            for vt in testimonials
        ],
        "reviews": [
            {
                "id": r.id,
                "name": r.name,
                "role": r.role,
                "rating": r.rating,
                "text": r.text,
                "text_bn": r.text_bn or r.text,
            }
            for r in reviews
        ],
        "faqs": [
            {
                "id": f.id,
                "question": f.question,
                "question_bn": f.question_bn or f.question,
                "answer": f.answer,
                "answer_bn": f.answer_bn or f.answer,
            }
            for f in faqs
        ],
    }


@router.get("/courses")
async def list_courses(
    q: Optional[str] = Query(default=None, max_length=120),
    category: Optional[str] = Query(default=None, max_length=80),
    live_only: bool = Query(default=False),
    sort: CourseSortEnum = Query(default=CourseSortEnum.popular),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Course)
    if q and q.strip():
        pattern = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Course.title.ilike(pattern),
                Course.title_bn.ilike(pattern),
                Course.description.ilike(pattern),
                Course.category.ilike(pattern),
            )
        )
    if category and category.strip() and category.lower() != "all":
        stmt = stmt.where(Course.category == category.strip())
    if live_only:
        stmt = stmt.where(Course.is_live_course == True)

    if sort == CourseSortEnum.price_asc:
        stmt = stmt.order_by(Course.price.asc())
    elif sort == CourseSortEnum.price_desc:
        stmt = stmt.order_by(Course.price.desc())
    elif sort == CourseSortEnum.rating:
        stmt = stmt.order_by(Course.rating.desc())
    else:
        stmt = stmt.order_by(Course.students_count.desc())

    courses = (await db.execute(stmt)).scalars().all()
    all_variants = (await db.execute(select(CourseVariant))).scalars().all()
    variants_by_course: dict[int, list[CourseVariant]] = {}
    for v in all_variants:
        variants_by_course.setdefault(v.course_id, []).append(v)

    lesson_counts_rows = (
        await db.execute(select(Lesson.course_id, func.count(Lesson.id)).group_by(Lesson.course_id))
    ).all()
    lesson_counts = {cid: cnt for cid, cnt in lesson_counts_rows}

    return [
        serialize_course(c, variants_by_course.get(c.id, []), lesson_counts.get(c.id, 3))
        for c in courses
    ]


@router.get("/courses/{course_id}")
async def get_course_detail(course_id: int, db: AsyncSession = Depends(get_db)):
    course = (await db.execute(select(Course).where(Course.id == course_id))).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    variants = (await db.execute(select(CourseVariant).where(CourseVariant.course_id == course_id))).scalars().all()
    modules = (
        await db.execute(select(Module).where(Module.course_id == course_id).order_by(Module.order, Module.id))
    ).scalars().all()
    lessons = (
        await db.execute(select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.order, Lesson.id))
    ).scalars().all()
    reviews = (
        await db.execute(select(Review).where(Review.course_id == course_id, Review.is_approved == True))
    ).scalars().all()

    # SECURITY: Never leak video_id for non-preview lessons on public course detail!
    syllabus_modules = []
    for m in modules:
        m_lessons = [l for l in lessons if l.module_id == m.id]
        syllabus_modules.append(
            {
                "id": m.id,
                "title": m.title,
                "title_bn": m.title_bn or m.title,
                "order": m.order,
                "lessons": [
                    {
                        "id": l.id,
                        "title": l.title,
                        "title_bn": l.title_bn or l.title,
                        "duration_minutes": l.duration_minutes,
                        "is_free_preview": l.is_free_preview,
                        "preview_video_id": l.video_id if l.is_free_preview else None,
                    }
                    for l in m_lessons
                ],
            }
        )

    data = serialize_course(course, list(variants), len(lessons))
    data["modules"] = syllabus_modules
    data["reviews"] = [
        {
            "id": r.id,
            "name": r.name,
            "role": r.role,
            "rating": r.rating,
            "text": r.text,
            "text_bn": r.text_bn or r.text,
        }
        for r in reviews
    ]
    return data


@router.post("/workshops/{workshop_id}/register")
async def register_workshop(
    workshop_id: int,
    payload: WorkshopRegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    client_ip = rate_limiter.get_client_ip(request)
    rate_limiter.check(f"workshop_reg::{client_ip}", max_requests=6, window_seconds=300)

    workshop = (await db.execute(select(Workshop).where(Workshop.id == workshop_id))).scalar_one_or_none()
    if not workshop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workshop not found.")

    reg = WorkshopRegistration(
        workshop_id=workshop.id,
        name=sanitize_plain_text(payload.name),
        email=payload.email.lower().strip(),
        phone=sanitize_plain_text(payload.phone),
    )
    workshop.registrations_count += 1
    db.add(reg)
    await db.commit()
    return {
        "status": "registered",
        "message": f"Seat confirmed for {workshop.title}! Joining link will be sent to {payload.email}.",
        "registrations_count": workshop.registrations_count,
    }


@router.get("/certificates/verify/{certificate_id}")
async def verify_certificate(certificate_id: str, db: AsyncSession = Depends(get_db)):
    clean_id = certificate_id.strip().upper()
    stmt = select(Certificate).where(func.upper(Certificate.certificate_id) == clean_id)
    cert = (await db.execute(stmt)).scalar_one_or_none()
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No verified certificate found matching this Certificate ID.",
        )
    site_settings = (await db.execute(select(SiteSettings).limit(1))).scalar_one_or_none()
    return {
        "verified": True,
        "certificate_id": cert.certificate_id,
        "student_name": cert.student_name,
        "course_name": cert.course_name,
        "course_name_bn": cert.course_name_bn or cert.course_name,
        "instructor_name": cert.instructor_name,
        "grade_score": cert.grade_score,
        "issued_at": cert.issued_at.isoformat(),
        "verification_authority": "Training Pundit — Official Credential Registry",
        "certificate_template_url": site_settings.certificate_template_url if site_settings else "",
    }


@router.get("/certificate-template/file/{filename}")
async def get_certificate_template_file(filename: str):
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename.",
        )
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    file_path = os.path.join(backend_dir, "media_vault", "certificates", filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate template not found.",
        )
    ext = os.path.splitext(filename)[1].lower()
    media_type = "image/png" if ext == ".png" else "image/jpeg"
    return FileResponse(path=file_path, filename=filename, media_type=media_type)


@router.get("/leaderboard")
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    users = (await db.execute(select(User).where(User.is_active == True))).scalars().all()
    profiles = (await db.execute(select(Profile))).scalars().all()
    profile_map = {p.user_id: p for p in profiles}

    score_rows = (
        await db.execute(select(LessonScore.user_id, func.sum(LessonScore.score)).group_by(LessonScore.user_id))
    ).all()
    score_map = {uid: float(total or 0.0) for uid, total in score_rows}

    cert_rows = (
        await db.execute(select(Certificate.user_id, func.count(Certificate.id)).group_by(Certificate.user_id))
    ).all()
    cert_map = {uid: int(cnt or 0) for uid, cnt in cert_rows}

    entries = []
    for u in users:
        p = profile_map.get(u.id)
        streak = p.current_streak if p else 1
        quiz_points = round(score_map.get(u.id, 0.0))
        certs = cert_map.get(u.id, 0)
        xp = quiz_points + (streak * 25) + (certs * 250)
        entries.append(
            {
                "user_id": u.id,
                "name": u.full_name or u.username,
                "occupation": p.occupation if p else "Learner",
                "streak": streak,
                "quiz_points": quiz_points,
                "certificates_count": certs,
                "total_xp": xp,
            }
        )

    entries.sort(key=lambda x: x["total_xp"], reverse=True)
    for idx, item in enumerate(entries[:15], start=1):
        item["rank"] = idx
    return entries[:15]
