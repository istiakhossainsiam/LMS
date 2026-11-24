import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import create_vault_download_token, sanitize_plain_text
from app.models.courses import Certificate, Course, CourseVariant
from app.models.lessons import (
    Choice,
    Lesson,
    LessonDiscussion,
    LessonReport,
    LessonScore,
    LessonWatchLog,
    LiveClass,
    Module,
    Note,
    ProjectSubmission,
    Question,
)
from app.models.users import Badge, Enrollment, Notification, Referral, User, UserActivity, UserBadge
from app.services.gamification_service import (
    check_and_award_badges,
    evaluate_course_completion_and_certificate,
    log_user_activity,
)
from app.services.pdf_service import generate_lesson_notes_pdf_bytes

router = APIRouter(prefix="/student", tags=["Student Dashboard & Secure Course Player"])


class HeartbeatRequest(BaseModel):
    watched_seconds: int = Field(..., ge=0, le=36000)
    total_seconds: int = Field(..., ge=10, le=36000)


class QuizSubmitRequest(BaseModel):
    answers: Dict[str, str]  # question_id (str) -> choice_id (str) for MCQ or text answer for Short


class NoteSaveRequest(BaseModel):
    content: str = Field(default="", max_length=20000)


class DiscussionPostRequest(BaseModel):
    comment: str = Field(..., min_length=2, max_length=3000)
    parent_id: Optional[int] = None


class ProjectSubmitRequest(BaseModel):
    github_or_live_url: str = Field(..., min_length=5, max_length=500)
    notes: str = Field(default="", max_length=2000)


class IssueReportRequest(BaseModel):
    issue_type: str = Field(default="Video", max_length=40)
    description: str = Field(..., min_length=5, max_length=1500)


@router.get("/dashboard")
async def get_student_dashboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    enrollments = (
        await db.execute(select(Enrollment).where(Enrollment.user_id == user.id).order_by(desc(Enrollment.enrolled_at)))
    ).scalars().all()
    courses = (await db.execute(select(Course))).scalars().all()
    course_map = {c.id: c for c in courses}

    variants = (await db.execute(select(CourseVariant))).scalars().all()
    variant_map = {v.id: v for v in variants}

    certificates = (
        await db.execute(select(Certificate).where(Certificate.user_id == user.id).order_by(desc(Certificate.issued_at)))
    ).scalars().all()

    user_badges = (await db.execute(select(UserBadge).where(UserBadge.user_id == user.id))).scalars().all()
    all_badges = (await db.execute(select(Badge))).scalars().all()
    badge_map = {b.id: b for b in all_badges}
    earned_badge_ids = {ub.badge_id for ub in user_badges}

    notifications = (
        await db.execute(
            select(Notification).where(Notification.user_id == user.id).order_by(desc(Notification.created_at)).limit(10)
        )
    ).scalars().all()
    activities = (
        await db.execute(
            select(UserActivity).where(UserActivity.user_id == user.id).order_by(desc(UserActivity.timestamp)).limit(10)
        )
    ).scalars().all()
    referrals = (await db.execute(select(Referral).where(Referral.referrer_id == user.id))).scalars().all()

    enrolled_list = []
    total_completed_lessons = 0
    for enr in enrollments:
        c = course_map.get(enr.course_id)
        if not c:
            continue
        try:
            comp_ids = json.loads(enr.completed_lesson_ids_json or "[]")
        except Exception:
            comp_ids = []
        total_completed_lessons += len(comp_ids)
        v = variant_map.get(enr.variant_id) if enr.variant_id else None
        enrolled_list.append(
            {
                "enrollment_id": enr.id,
                "course_id": c.id,
                "title": c.title,
                "title_bn": c.title_bn or c.title,
                "thumbnail_url": c.thumbnail_url,
                "instructor_name": c.instructor_name,
                "progress": round(enr.progress, 1),
                "completed_lessons_count": len(comp_ids),
                "variant_type": v.variant_type if v else "Recorded",
                "enrolled_at": enr.enrolled_at.isoformat(),
            }
        )

    return {
        "enrolled_courses": enrolled_list,
        "stats": {
            "enrolled_count": len(enrolled_list),
            "completed_lessons": total_completed_lessons,
            "certificates_earned": len(certificates),
            "current_streak": user.profile.current_streak if user.profile else 1,
            "longest_streak": user.profile.longest_streak if user.profile else 1,
            "referral_code": user.profile.referral_code if user.profile else "",
            "referrals_count": len(referrals),
        },
        "certificates": [
            {
                "id": cert.id,
                "certificate_id": cert.certificate_id,
                "student_name": cert.student_name,
                "course_name": cert.course_name,
                "course_name_bn": cert.course_name_bn or cert.course_name,
                "instructor_name": cert.instructor_name,
                "grade_score": cert.grade_score,
                "issued_at": cert.issued_at.isoformat(),
            }
            for cert in certificates
        ],
        "badges": [
            {
                "id": b.id,
                "name": b.name,
                "name_bn": b.name_bn or b.name,
                "description": b.description,
                "description_bn": b.description_bn or b.description,
                "icon_name": b.icon_name,
                "earned": b.id in earned_badge_ids,
            }
            for b in all_badges
        ],
        "referrals": [
            {
                "id": r.id,
                "reward_promo_code": r.reward_promo_code,
                "created_at": r.created_at.isoformat(),
            }
            for r in referrals
        ],
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
            }
            for n in notifications
        ],
        "activities": [
            {
                "id": a.id,
                "action": a.action,
                "timestamp": a.timestamp.isoformat(),
            }
            for a in activities
        ],
    }


@router.get("/player/{course_id}")
async def get_course_player_data(
    course_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    course = (await db.execute(select(Course).where(Course.id == course_id))).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    enrollment = (
        await db.execute(
            select(Enrollment).where(Enrollment.user_id == user.id, Enrollment.course_id == course_id)
        )
    ).scalar_one_or_none()

    # Allow Admin or the Course Instructor to preview the player even if not enrolled
    is_privileged = user.is_staff or user.is_superuser or (course.instructor_id == user.id)
    if not enrollment and not is_privileged:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must enroll in this course to access the learning player.",
        )

    completed_ids: list[int] = []
    if enrollment:
        try:
            completed_ids = json.loads(enrollment.completed_lesson_ids_json or "[]")
        except Exception:
            completed_ids = []

    modules = (
        await db.execute(select(Module).where(Module.course_id == course_id).order_by(Module.order, Module.id))
    ).scalars().all()
    lessons = (
        await db.execute(select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.order, Lesson.id))
    ).scalars().all()

    watch_logs = (
        await db.execute(select(LessonWatchLog).where(LessonWatchLog.user_id == user.id))
    ).scalars().all()
    watch_map = {w.lesson_id: w for w in watch_logs}

    scores = (
        await db.execute(select(LessonScore).where(LessonScore.user_id == user.id))
    ).scalars().all()
    score_map = {s.lesson_id: s for s in scores}

    notes = (await db.execute(select(Note).where(Note.user_id == user.id))).scalars().all()
    note_map = {n.lesson_id: n.content for n in notes}

    questions = (await db.execute(select(Question))).scalars().all()
    choices = (await db.execute(select(Choice))).scalars().all()
    choices_by_q: dict[int, list[Choice]] = {}
    for ch in choices:
        choices_by_q.setdefault(ch.question_id, []).append(ch)
    questions_by_lesson: dict[int, list[Question]] = {}
    for q in questions:
        questions_by_lesson.setdefault(q.lesson_id, []).append(q)

    # Determine sequential locking: Lesson i is unlocked if i == 0, or Lesson i-1 is in completed_ids, or user is privileged
    completed_set = set(completed_ids)
    lessons_payload = []
    for idx, lesson in enumerate(lessons):
        is_unlocked = is_privileged or (idx == 0) or (lessons[idx - 1].id in completed_set) or (lesson.id in completed_set)
        w = watch_map.get(lesson.id)
        s = score_map.get(lesson.id)
        l_questions = questions_by_lesson.get(lesson.id, [])

        # SECURITY: Locked lessons NEVER expose video_id, resource download token, or quiz questions!
        if not is_unlocked:
            lessons_payload.append(
                {
                    "id": lesson.id,
                    "module_id": lesson.module_id,
                    "title": lesson.title,
                    "title_bn": lesson.title_bn or lesson.title,
                    "duration_minutes": lesson.duration_minutes,
                    "order": lesson.order,
                    "is_locked": True,
                    "is_completed": False,
                    "video_id": None,
                    "description": "",
                    "description_bn": "",
                    "watch_percentage": 0.0,
                    "pass_mark": lesson.pass_mark,
                    "has_quiz": len(l_questions) > 0,
                    "quiz_passed": False,
                    "quiz_score": None,
                    "quiz_attempts": 0,
                    "questions": [],
                    "note_content": "",
                    "resource_download_token": None,
                }
            )
        else:
            dl_token = None
            if lesson.resource_file_path:
                dl_token = create_vault_download_token(
                    user_id=user.id,
                    resource_type="lesson_resource",
                    resource_id=lesson.id,
                    file_path=lesson.resource_file_path,
                )
            lessons_payload.append(
                {
                    "id": lesson.id,
                    "module_id": lesson.module_id,
                    "title": lesson.title,
                    "title_bn": lesson.title_bn or lesson.title,
                    "description": lesson.description,
                    "description_bn": lesson.description_bn or lesson.description,
                    "duration_minutes": lesson.duration_minutes,
                    "order": lesson.order,
                    "is_locked": False,
                    "is_completed": lesson.id in completed_set,
                    "video_id": lesson.video_id,
                    "watch_percentage": round(w.watch_percentage, 1) if w else (100.0 if lesson.id in completed_set else 0.0),
                    "watched_seconds": w.watched_seconds if w else 0,
                    "pass_mark": lesson.pass_mark,
                    "has_quiz": len(l_questions) > 0,
                    "quiz_passed": bool(s and s.passed),
                    "quiz_score": round(s.score, 1) if s else None,
                    "quiz_attempts": s.attempts if s else 0,
                    # SECURITY: Choices NEVER include `is_correct`!
                    "questions": [
                        {
                            "id": q.id,
                            "text": q.text,
                            "text_bn": q.text_bn or q.text,
                            "question_type": q.question_type,
                            "marks": q.marks,
                            "choices": [
                                {
                                    "id": c.id,
                                    "text": c.text,
                                    "text_bn": c.text_bn or c.text,
                                }
                                for c in choices_by_q.get(q.id, [])
                            ],
                        }
                        for q in l_questions
                    ],
                    "note_content": note_map.get(lesson.id, ""),
                    "resource_download_token": dl_token,
                }
            )

    live_classes = (
        await db.execute(select(LiveClass).where(LiveClass.course_id == course_id).order_by(LiveClass.date_time))
    ).scalars().all()
    project_sub = (
        await db.execute(
            select(ProjectSubmission).where(
                ProjectSubmission.user_id == user.id,
                ProjectSubmission.course_id == course_id,
            )
        )
    ).scalar_one_or_none()
    cert = (
        await db.execute(
            select(Certificate).where(Certificate.user_id == user.id, Certificate.course_id == course_id)
        )
    ).scalar_one_or_none()

    return {
        "course": {
            "id": course.id,
            "title": course.title,
            "title_bn": course.title_bn or course.title,
            "instructor_name": course.instructor_name,
            "final_project_title": course.final_project_title,
            "final_project_description": course.final_project_description,
            "progress": round(enrollment.progress, 1) if enrollment else 0.0,
        },
        "watermark": f"{user.email} • {user.profile.phone_number if user.profile and user.profile.phone_number else f'UID-{user.id}'}",
        "modules": [
            {
                "id": m.id,
                "title": m.title,
                "title_bn": m.title_bn or m.title,
                "order": m.order,
            }
            for m in modules
        ],
        "lessons": lessons_payload,
        "live_classes": [
            {
                "id": lc.id,
                "title": lc.title,
                "title_bn": lc.title_bn or lc.title,
                "date_time": lc.date_time.isoformat(),
                "meeting_link": lc.meeting_link,
                "platform": lc.platform,
                "description": lc.description,
            }
            for lc in live_classes
        ],
        "project_submission": {
            "id": project_sub.id,
            "github_or_live_url": project_sub.github_or_live_url,
            "notes": project_sub.notes,
            "grade": project_sub.grade,
            "feedback": project_sub.feedback,
            "submitted_at": project_sub.submitted_at.isoformat(),
        }
        if project_sub
        else None,
        "certificate": {
            "certificate_id": cert.certificate_id,
            "issued_at": cert.issued_at.isoformat(),
            "grade_score": cert.grade_score,
        }
        if cert
        else None,
    }


@router.post("/lessons/{lesson_id}/heartbeat")
async def record_watch_heartbeat(
    lesson_id: int,
    payload: HeartbeatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lesson = (await db.execute(select(Lesson).where(Lesson.id == lesson_id))).scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    pct = min(100.0, round((payload.watched_seconds / max(1, payload.total_seconds)) * 100.0, 1))
    watch_log = (
        await db.execute(
            select(LessonWatchLog).where(
                LessonWatchLog.user_id == user.id,
                LessonWatchLog.lesson_id == lesson_id,
            )
        )
    ).scalar_one_or_none()

    if not watch_log:
        watch_log = LessonWatchLog(
            user_id=user.id,
            lesson_id=lesson_id,
            watched_seconds=payload.watched_seconds,
            total_seconds=payload.total_seconds,
            watch_percentage=pct,
        )
        db.add(watch_log)
    else:
        if payload.watched_seconds > watch_log.watched_seconds:
            watch_log.watched_seconds = payload.watched_seconds
        watch_log.total_seconds = payload.total_seconds
        watch_log.watch_percentage = max(watch_log.watch_percentage, pct)
        watch_log.updated_at = datetime.now(timezone.utc)

    await db.commit()
    return {
        "lesson_id": lesson_id,
        "watched_seconds": watch_log.watched_seconds,
        "watch_percentage": round(watch_log.watch_percentage, 1),
        "eligible_to_complete": watch_log.watch_percentage >= 80.0,
    }


@router.post("/lessons/{lesson_id}/quiz/submit")
async def submit_lesson_quiz(
    lesson_id: int,
    payload: QuizSubmitRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lesson = (await db.execute(select(Lesson).where(Lesson.id == lesson_id))).scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    questions = (await db.execute(select(Question).where(Question.lesson_id == lesson_id))).scalars().all()
    if not questions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This lesson has no quiz questions.")

    now = datetime.now(timezone.utc)
    score_rec = (
        await db.execute(
            select(LessonScore).where(LessonScore.user_id == user.id, LessonScore.lesson_id == lesson_id)
        )
    ).scalar_one_or_none()

    # Enforce 3-attempt / 5-minute cooldown rule on the server
    if score_rec and not score_rec.passed and score_rec.attempts >= 3 and score_rec.last_attempt_time:
        last_time = score_rec.last_attempt_time
        if last_time.tzinfo is None:
            last_time = last_time.replace(tzinfo=timezone.utc)
        elapsed = (now - last_time).total_seconds()
        if elapsed < 300:
            remaining = int(300 - elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Maximum 3 attempts reached. Quiz is locked for cooldown ({remaining}s remaining).",
            )
        else:
            score_rec.attempts = 0

    choices = (
        await db.execute(select(Choice).where(Choice.question_id.in_([q.id for q in questions])))
    ).scalars().all()
    correct_choice_by_q: dict[int, int] = {}
    for ch in choices:
        if ch.is_correct:
            correct_choice_by_q[ch.question_id] = ch.id

    total_marks = sum(max(1, q.marks) for q in questions)
    earned_marks = 0
    question_feedback: dict[str, bool] = {}

    for q in questions:
        submitted = (payload.answers.get(str(q.id)) or "").strip()
        is_right = False
        # Normalize both "Short" and "TEXT" so trainer-created questions always grade properly!
        if q.question_type.upper() in ("SHORT", "TEXT"):
            if submitted and submitted.lower() == (q.correct_answer or "").strip().lower():
                is_right = True
        else:
            correct_cid = correct_choice_by_q.get(q.id)
            if correct_cid and submitted == str(correct_cid):
                is_right = True

        question_feedback[str(q.id)] = is_right
        if is_right:
            earned_marks += max(1, q.marks)

    pct_score = round((earned_marks / max(1, total_marks)) * 100.0, 1)
    passed = pct_score >= float(lesson.pass_mark)

    if not score_rec:
        score_rec = LessonScore(
            user_id=user.id,
            lesson_id=lesson_id,
            score=pct_score,
            passed=passed,
            attempts=1,
            last_attempt_time=now,
        )
        db.add(score_rec)
    else:
        score_rec.attempts = 0 if passed else (score_rec.attempts + 1)
        score_rec.score = max(score_rec.score, pct_score) if score_rec.passed else pct_score
        score_rec.passed = score_rec.passed or passed
        score_rec.last_attempt_time = now
        score_rec.updated_at = now

    new_badges = []
    if passed:
        new_badges = await check_and_award_badges(db, user, "QUIZ_SCORE", pct_score)
        await log_user_activity(db, user.id, f"Passed quiz for '{lesson.title}' with {pct_score}%")

    await db.commit()

    # SECURITY: Notice we NEVER return `correct_answers` to the client on failure!
    return {
        "score": pct_score,
        "pass_mark": lesson.pass_mark,
        "passed": passed,
        "attempts_used": score_rec.attempts,
        "max_attempts": 3,
        "question_results": question_feedback,
        "new_badges": new_badges,
    }


@router.post("/lessons/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lesson = (await db.execute(select(Lesson).where(Lesson.id == lesson_id))).scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    enrollment = (
        await db.execute(
            select(Enrollment).where(Enrollment.user_id == user.id, Enrollment.course_id == lesson.course_id)
        )
    ).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enrolled in this course.")

    # SECURITY CHECK 1: Verify server-side video watch log >= 80%
    watch_log = (
        await db.execute(
            select(LessonWatchLog).where(
                LessonWatchLog.user_id == user.id,
                LessonWatchLog.lesson_id == lesson_id,
            )
        )
    ).scalar_one_or_none()

    if not watch_log or watch_log.watch_percentage < 80.0:
        current_pct = round(watch_log.watch_percentage, 1) if watch_log else 0.0
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Server verification failed: You have watched {current_pct}% of this lesson. At least 80% video completion is required.",
        )

    # SECURITY CHECK 2: If lesson has quiz questions, verify quiz was passed on the server!
    questions = (await db.execute(select(Question.id).where(Question.lesson_id == lesson_id))).scalars().all()
    if questions:
        score_rec = (
            await db.execute(
                select(LessonScore).where(LessonScore.user_id == user.id, LessonScore.lesson_id == lesson_id)
            )
        ).scalar_one_or_none()
        if not score_rec or not score_rec.passed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You must pass the lesson assessment (minimum {lesson.pass_mark}%) before completing this lesson.",
            )

    try:
        completed_ids = json.loads(enrollment.completed_lesson_ids_json or "[]")
    except Exception:
        completed_ids = []

    if lesson_id not in completed_ids:
        completed_ids.append(lesson_id)
        enrollment.completed_lesson_ids_json = json.dumps(completed_ids)

    course = (await db.execute(select(Course).where(Course.id == lesson.course_id))).scalar_one()
    cert = await evaluate_course_completion_and_certificate(db, user, course, enrollment)
    new_badges = await check_and_award_badges(db, user, "LESSONS_COMPLETED", len(completed_ids))
    await log_user_activity(db, user.id, f"Completed lesson: {lesson.title}")
    await db.commit()

    return {
        "status": "completed",
        "lesson_id": lesson_id,
        "course_progress": round(enrollment.progress, 1),
        "certificate_minted": cert.certificate_id if cert else None,
        "new_badges": new_badges,
    }


@router.put("/lessons/{lesson_id}/note")
async def save_lesson_note(
    lesson_id: int,
    payload: NoteSaveRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Saves student study notes safely using SQLAlchemy 2.0 bound parameters.
    Students can freely write SQL (`SELECT * FROM users -- comment`) or JS code without triggering false 400 errors!
    """
    note = (
        await db.execute(select(Note).where(Note.user_id == user.id, Note.lesson_id == lesson_id))
    ).scalar_one_or_none()

    if not note:
        note = Note(user_id=user.id, lesson_id=lesson_id, content=payload.content)
        db.add(note)
    else:
        note.content = payload.content
        note.updated_at = datetime.now(timezone.utc)

    await db.commit()
    return {"status": "saved", "updated_at": note.updated_at.isoformat()}


@router.get("/lessons/{lesson_id}/note/pdf")
async def export_lesson_note_pdf(
    lesson_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lesson = (await db.execute(select(Lesson).where(Lesson.id == lesson_id))).scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")
    course = (await db.execute(select(Course).where(Course.id == lesson.course_id))).scalar_one_or_none()
    note = (
        await db.execute(select(Note).where(Note.user_id == user.id, Note.lesson_id == lesson_id))
    ).scalar_one_or_none()

    pdf_bytes = generate_lesson_notes_pdf_bytes(
        course_title=course.title if course else "Learn With Maruf Ahmed",
        lesson_title=lesson.title,
        student_name=user.full_name or user.username,
        note_content=note.content if note else "",
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="LWMA-Notes-Lesson-{lesson_id}.pdf"'},
    )


@router.get("/lessons/{lesson_id}/discussions")
async def get_lesson_discussions(
    lesson_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    items = (
        await db.execute(
            select(LessonDiscussion)
            .where(LessonDiscussion.lesson_id == lesson_id)
            .order_by(desc(LessonDiscussion.is_pinned), LessonDiscussion.created_at.asc())
        )
    ).scalars().all()

    roots = [d for d in items if d.parent_id is None]
    replies_by_parent: dict[int, list[LessonDiscussion]] = {}
    for d in items:
        if d.parent_id is not None:
            replies_by_parent.setdefault(d.parent_id, []).append(d)

    return [
        {
            "id": r.id,
            "user_name": r.user_name,
            "comment": r.comment,
            "is_mentor_reply": r.is_mentor_reply,
            "is_pinned": r.is_pinned,
            "created_at": r.created_at.isoformat(),
            "replies": [
                {
                    "id": rep.id,
                    "user_name": rep.user_name,
                    "comment": rep.comment,
                    "is_mentor_reply": rep.is_mentor_reply,
                    "created_at": rep.created_at.isoformat(),
                }
                for rep in replies_by_parent.get(r.id, [])
            ],
        }
        for r in roots
    ]


@router.post("/lessons/{lesson_id}/discussions", status_code=status.HTTP_201_CREATED)
async def post_lesson_discussion(
    lesson_id: int,
    payload: DiscussionPostRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Sanitize comment against Stored XSS while preserving code discussions
    safe_comment = sanitize_plain_text(payload.comment.strip())
    is_mentor = bool(user.is_staff or user.is_superuser or (user.profile and user.profile.is_trainer))
    display_name = f"{user.full_name or user.username} (Mentor)" if is_mentor else (user.full_name or user.username)

    disc = LessonDiscussion(
        lesson_id=lesson_id,
        user_id=user.id,
        user_name=sanitize_plain_text(display_name),
        parent_id=payload.parent_id,
        comment=safe_comment,
        is_mentor_reply=is_mentor,
        is_pinned=False,
    )
    db.add(disc)
    await db.commit()
    await db.refresh(disc)
    return {
        "id": disc.id,
        "user_name": disc.user_name,
        "comment": disc.comment,
        "is_mentor_reply": disc.is_mentor_reply,
        "is_pinned": disc.is_pinned,
        "created_at": disc.created_at.isoformat(),
        "replies": [],
    }


@router.post("/courses/{course_id}/project")
async def submit_final_project(
    course_id: int,
    payload: ProjectSubmitRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sub = (
        await db.execute(
            select(ProjectSubmission).where(
                ProjectSubmission.user_id == user.id,
                ProjectSubmission.course_id == course_id,
            )
        )
    ).scalar_one_or_none()

    if not sub:
        sub = ProjectSubmission(
            user_id=user.id,
            user_name=user.full_name or user.username,
            course_id=course_id,
            github_or_live_url=sanitize_plain_text(payload.github_or_live_url.strip()),
            notes=sanitize_plain_text(payload.notes.strip()),
        )
        db.add(sub)
    else:
        sub.github_or_live_url = sanitize_plain_text(payload.github_or_live_url.strip())
        sub.notes = sanitize_plain_text(payload.notes.strip())
        sub.submitted_at = datetime.now(timezone.utc)

    await log_user_activity(db, user.id, f"Submitted final project for course #{course_id}")
    await db.commit()
    await db.refresh(sub)
    return {
        "id": sub.id,
        "github_or_live_url": sub.github_or_live_url,
        "notes": sub.notes,
        "grade": sub.grade,
        "feedback": sub.feedback,
        "submitted_at": sub.submitted_at.isoformat(),
    }


@router.post("/lessons/{lesson_id}/report")
async def report_lesson_issue(
    lesson_id: int,
    payload: IssueReportRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rep = LessonReport(
        user_id=user.id,
        lesson_id=lesson_id,
        issue_type=sanitize_plain_text(payload.issue_type),
        description=sanitize_plain_text(payload.description),
    )
    db.add(rep)
    await db.commit()
    return {"status": "reported", "message": "Thank you! Our engineering & mentor team has received your report."}


@router.get("/exams")
async def get_student_exams(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Online exams and MCQ assessments, mirroring the reference IVIS Exam System.
    """
    courses = (await db.execute(select(Course))).scalars().all()
    questions = (await db.execute(select(Question))).scalars().all()
    
    exam_list = []
    for c in courses:
        exam_list.append({
            "id": c.id,
            "title": f"{c.title} — Comprehensive Certification Exam",
            "title_bn": f"{c.title_bn or c.title} — চূড়ান্ত সার্টিফিকেশন পরীক্ষা",
            "course_id": c.id,
            "duration_minutes": 30,
            "total_questions": len(questions) if len(questions) > 0 else 10,
            "pass_mark_percentage": 60,
            "difficulty": "Intermediate",
            "status": "Available",
        })
    return exam_list


@router.get("/id-card")
async def get_student_id_card(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Official TrainingPundit Digital Student ID Card data.
    """
    roll_no = f"TP-2026-{user.id:04d}"
    batch = "Batch 2026-A"
    return {
        "institution": "TrainingPundit Autonomous Academy",
        "institution_bn": "ট্রেনিং পণ্ডিত অটোনোমাস একাডেমি",
        "student_name": user.full_name or user.username,
        "roll_number": roll_no,
        "email": user.email,
        "phone": user.profile.phone_number if user.profile else "017XXXXXXXX",
        "batch": batch,
        "joined_date": user.date_joined.strftime("%B %Y"),
        "barcode": f"TP{user.id:06d}",
        "status": "VERIFIED LEARNER",
        "qr_verify_url": f"https://trainingpundit.com/verify-id/{roll_no}",
    }


@router.get("/saved-videos")
async def get_saved_videos(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Saved and bookmarked video lectures for revision.
    """
    enrollments = (await db.execute(select(Enrollment).where(Enrollment.user_id == user.id))).scalars().all()
    course_ids = [e.course_id for e in enrollments]
    
    lessons = []
    if course_ids:
        lessons = (
            await db.execute(select(Lesson).where(Lesson.course_id.in_(course_ids)).order_by(Lesson.order).limit(6))
        ).scalars().all()

    return [
        {
            "id": l.id,
            "course_id": l.course_id,
            "title": l.title,
            "title_bn": l.title_bn or l.title,
            "duration_minutes": l.duration_minutes,
            "video_id": l.video_id,
            "saved_at": datetime.now(timezone.utc).isoformat(),
        }
        for l in lessons
    ]

