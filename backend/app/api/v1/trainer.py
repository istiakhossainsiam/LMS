import json
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_trainer
from app.core.security import sanitize_plain_text
from app.models.courses import Course, CourseVariant
from app.models.lessons import Choice, Lesson, LiveClass, Module, ProjectSubmission, Question
from app.models.users import Enrollment, Notification, User
from app.services.gamification_service import evaluate_course_completion_and_certificate

router = APIRouter(prefix="/trainer", tags=["Trainer & Mentor Studio"])


class CourseCreateRequest(BaseModel):
    title: str = Field(..., min_length=4, max_length=255)
    title_bn: str = Field(default="", max_length=255)
    description: str = Field(..., min_length=10)
    description_bn: str = Field(default="")
    category: str = Field(default="Web Development", max_length=100)
    price: float = Field(..., ge=0)
    original_price: float = Field(default=5000.0, ge=0)
    is_live_course: bool = False
    batch_title: str = Field(default="Batch 01", max_length=120)
    final_project_title: str = Field(default="", max_length=255)
    final_project_description: str = Field(default="")
    thumbnail_url: str = Field(
        default="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80"
    )


class ModuleCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    title_bn: str = Field(default="", max_length=255)
    order: int = 1


class LessonCreateRequest(BaseModel):
    module_id: Optional[int] = None
    title: str = Field(..., min_length=2, max_length=255)
    title_bn: str = Field(default="", max_length=255)
    description: str = Field(default="")
    video_id: str = Field(..., min_length=3, max_length=120)
    duration_minutes: int = Field(default=20, ge=1)
    pass_mark: int = Field(default=50, ge=10, le=100)
    is_free_preview: bool = False
    order: int = 1


class ChoiceItemInput(BaseModel):
    text: str
    is_correct: bool = False


class QuestionCreateRequest(BaseModel):
    text: str = Field(..., min_length=3)
    text_bn: str = Field(default="")
    question_type: str = Field(default="MCQ")  # MCQ or Short
    correct_answer: str = Field(default="")
    marks: int = Field(default=1, ge=1)
    choices: List[ChoiceItemInput] = []


class LiveClassCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    meeting_link: str = Field(..., min_length=5, max_length=500)
    platform: str = Field(default="Zoom Live", max_length=50)
    days_from_now: int = Field(default=2, ge=0, le=90)
    description: str = Field(default="")


class GradeSubmissionRequest(BaseModel):
    grade: float = Field(..., ge=0.0, le=100.0)
    feedback: str = Field(default="", max_length=2000)


@router.get("/studio")
async def get_trainer_studio(
    user: User = Depends(require_trainer),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Course).order_by(desc(Course.id))
    if not (user.is_staff or user.is_superuser):
        stmt = stmt.where(Course.instructor_id == user.id)
    courses = (await db.execute(stmt)).scalars().all()
    course_ids = [c.id for c in courses]

    modules = (
        await db.execute(select(Module).where(Module.course_id.in_(course_ids)).order_by(Module.order, Module.id))
    ).scalars().all() if course_ids else []
    lessons = (
        await db.execute(select(Lesson).where(Lesson.course_id.in_(course_ids)).order_by(Lesson.order, Lesson.id))
    ).scalars().all() if course_ids else []
    live_classes = (
        await db.execute(select(LiveClass).where(LiveClass.course_id.in_(course_ids)).order_by(LiveClass.date_time))
    ).scalars().all() if course_ids else []
    submissions = (
        await db.execute(
            select(ProjectSubmission).where(ProjectSubmission.course_id.in_(course_ids)).order_by(desc(ProjectSubmission.submitted_at))
        )
    ).scalars().all() if course_ids else []

    course_map = {c.id: c.title for c in courses}

    return {
        "stats": {
            "managed_courses": len(courses),
            "total_students": sum(c.students_count for c in courses),
            "total_lessons": len(lessons),
            "pending_submissions": sum(1 for s in submissions if s.grade is None),
        },
        "courses": [
            {
                "id": c.id,
                "title": c.title,
                "title_bn": c.title_bn or c.title,
                "category": c.category,
                "price": c.price,
                "students_count": c.students_count,
                "rating": c.rating,
                "is_live_course": c.is_live_course,
                "final_project_title": c.final_project_title,
            }
            for c in courses
        ],
        "modules": [
            {"id": m.id, "course_id": m.course_id, "title": m.title, "order": m.order}
            for m in modules
        ],
        "lessons": [
            {
                "id": l.id,
                "course_id": l.course_id,
                "module_id": l.module_id,
                "title": l.title,
                "video_id": l.video_id,
                "duration_minutes": l.duration_minutes,
                "pass_mark": l.pass_mark,
                "order": l.order,
            }
            for l in lessons
        ],
        "live_classes": [
            {
                "id": lc.id,
                "course_id": lc.course_id,
                "course_title": course_map.get(lc.course_id, ""),
                "title": lc.title,
                "date_time": lc.date_time.isoformat(),
                "meeting_link": lc.meeting_link,
                "platform": lc.platform,
            }
            for lc in live_classes
        ],
        "submissions": [
            {
                "id": s.id,
                "course_id": s.course_id,
                "course_title": course_map.get(s.course_id, ""),
                "user_id": s.user_id,
                "user_name": s.user_name,
                "github_or_live_url": s.github_or_live_url,
                "notes": s.notes,
                "grade": s.grade,
                "feedback": s.feedback,
                "submitted_at": s.submitted_at.isoformat(),
            }
            for s in submissions
        ],
    }


@router.post("/courses", status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreateRequest,
    user: User = Depends(require_trainer),
    db: AsyncSession = Depends(get_db),
):
    course = Course(
        instructor_id=user.id,
        instructor_name=user.full_name or user.username,
        title=sanitize_plain_text(payload.title.strip()),
        title_bn=sanitize_plain_text(payload.title_bn.strip() or payload.title.strip()),
        description=sanitize_plain_text(payload.description.strip()),
        description_bn=sanitize_plain_text(payload.description_bn.strip() or payload.description.strip()),
        category=sanitize_plain_text(payload.category.strip()),
        price=payload.price,
        original_price=max(payload.price, payload.original_price),
        is_live_course=payload.is_live_course,
        batch_title=sanitize_plain_text(payload.batch_title.strip()),
        final_project_title=sanitize_plain_text(payload.final_project_title.strip()),
        final_project_description=sanitize_plain_text(payload.final_project_description.strip()),
        thumbnail_url=payload.thumbnail_url.strip(),
        features_json=json.dumps(["HD Video Lectures", "Server-Verified Assessments", "Official QR Certificate"]),
        outcomes_json=json.dumps(["Build production-ready projects", "Pass mentor code review"]),
    )
    db.add(course)
    await db.flush()
    db.add(
        CourseVariant(
            course_id=course.id,
            variant_type="Recorded",
            variant_type_bn="রেকর্ডেড ভার্সন",
            price=course.price,
            description="Full curriculum access",
        )
    )
    await db.commit()
    await db.refresh(course)
    return {"id": course.id, "title": course.title}


@router.post("/courses/{course_id}/modules", status_code=status.HTTP_201_CREATED)
async def create_module(
    course_id: int,
    payload: ModuleCreateRequest,
    user: User = Depends(require_trainer),
    db: AsyncSession = Depends(get_db),
):
    mod = Module(
        course_id=course_id,
        title=sanitize_plain_text(payload.title.strip()),
        title_bn=sanitize_plain_text(payload.title_bn.strip() or payload.title.strip()),
        order=payload.order,
    )
    db.add(mod)
    await db.commit()
    await db.refresh(mod)
    return {"id": mod.id, "title": mod.title}


@router.post("/courses/{course_id}/lessons", status_code=status.HTTP_201_CREATED)
async def create_lesson(
    course_id: int,
    payload: LessonCreateRequest,
    user: User = Depends(require_trainer),
    db: AsyncSession = Depends(get_db),
):
    lesson = Lesson(
        course_id=course_id,
        module_id=payload.module_id,
        title=sanitize_plain_text(payload.title.strip()),
        title_bn=sanitize_plain_text(payload.title_bn.strip() or payload.title.strip()),
        description=sanitize_plain_text(payload.description.strip()),
        video_id=sanitize_plain_text(payload.video_id.strip()),
        duration_minutes=payload.duration_minutes,
        pass_mark=payload.pass_mark,
        is_free_preview=payload.is_free_preview,
        order=payload.order,
    )
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return {"id": lesson.id, "title": lesson.title}


@router.post("/lessons/{lesson_id}/questions", status_code=status.HTTP_201_CREATED)
async def create_lesson_question(
    lesson_id: int,
    payload: QuestionCreateRequest,
    user: User = Depends(require_trainer),
    db: AsyncSession = Depends(get_db),
):
    # Normalize question_type ("TEXT" -> "Short") to prevent LMS 1.0's grading mismatch bug!
    q_type = "Short" if payload.question_type.strip().upper() in ("SHORT", "TEXT") else "MCQ"
    q = Question(
        lesson_id=lesson_id,
        text=sanitize_plain_text(payload.text.strip()),
        text_bn=sanitize_plain_text(payload.text_bn.strip() or payload.text.strip()),
        question_type=q_type,
        correct_answer=sanitize_plain_text(payload.correct_answer.strip()),
        marks=payload.marks,
    )
    db.add(q)
    await db.flush()

    if q_type == "MCQ":
        for ch in payload.choices:
            db.add(
                Choice(
                    question_id=q.id,
                    text=sanitize_plain_text(ch.text.strip()),
                    text_bn=sanitize_plain_text(ch.text.strip()),
                    is_correct=ch.is_correct,
                )
            )
    await db.commit()
    return {"id": q.id, "question_type": q.question_type}


@router.post("/courses/{course_id}/live-classes", status_code=status.HTTP_201_CREATED)
async def create_live_class(
    course_id: int,
    payload: LiveClassCreateRequest,
    user: User = Depends(require_trainer),
    db: AsyncSession = Depends(get_db),
):
    lc = LiveClass(
        course_id=course_id,
        title=sanitize_plain_text(payload.title.strip()),
        title_bn=sanitize_plain_text(payload.title.strip()),
        date_time=datetime.now(timezone.utc) + timedelta(days=payload.days_from_now),
        meeting_link=payload.meeting_link.strip(),
        platform=sanitize_plain_text(payload.platform.strip()),
        description=sanitize_plain_text(payload.description.strip()),
    )
    db.add(lc)
    await db.commit()
    await db.refresh(lc)
    return {"id": lc.id, "title": lc.title}


@router.post("/submissions/{submission_id}/grade")
async def grade_project_submission(
    submission_id: int,
    payload: GradeSubmissionRequest,
    user: User = Depends(require_trainer),
    db: AsyncSession = Depends(get_db),
):
    sub = (
        await db.execute(select(ProjectSubmission).where(ProjectSubmission.id == submission_id))
    ).scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project submission not found.")

    sub.grade = round(payload.grade, 1)
    sub.feedback = sanitize_plain_text(payload.feedback.strip())

    student = (await db.execute(select(User).where(User.id == sub.user_id))).scalar_one_or_none()
    course = (await db.execute(select(Course).where(Course.id == sub.course_id))).scalar_one_or_none()
    enrollment = (
        await db.execute(
            select(Enrollment).where(Enrollment.user_id == sub.user_id, Enrollment.course_id == sub.course_id)
        )
    ).scalar_one_or_none()

    cert_id = None
    if student and course and enrollment and sub.grade >= 50.0:
        cert = await evaluate_course_completion_and_certificate(db, student, course, enrollment)
        if cert:
            cert_id = cert.certificate_id

    if student:
        db.add(
            Notification(
                user_id=student.id,
                title=f"Final Project Graded: {sub.grade}/100",
                message=f"Mentor feedback: {sub.feedback or 'Great work!'}",
            )
        )

    await db.commit()
    return {
        "status": "graded",
        "grade": sub.grade,
        "feedback": sub.feedback,
        "certificate_minted": cert_id,
    }
