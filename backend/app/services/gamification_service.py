import json
import secrets
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.courses import Certificate, Course
from app.models.lessons import Lesson, ProjectSubmission
from app.models.users import Badge, Enrollment, Notification, Referral, User, UserActivity, UserBadge


async def log_user_activity(db: AsyncSession, user_id: int, action: str) -> None:
    activity = UserActivity(user_id=user_id, action=action)
    db.add(activity)


async def check_and_award_badges(
    db: AsyncSession,
    user: User,
    badge_type: str,
    current_value: float,
) -> list[dict]:
    """
    Evaluates and awards gamification badges without the LMS 1.0 NameError bug.
    Always returns a list of newly awarded badge dicts.
    """
    newly_awarded: list[dict] = []
    stmt = select(Badge).where(Badge.badge_type == badge_type, Badge.threshold <= int(current_value))
    badges = (await db.execute(stmt)).scalars().all()
    if not badges:
        return newly_awarded

    existing_stmt = select(UserBadge.badge_id).where(UserBadge.user_id == user.id)
    existing_ids = set((await db.execute(existing_stmt)).scalars().all())

    for b in badges:
        if b.id not in existing_ids:
            ub = UserBadge(user_id=user.id, badge_id=b.id)
            db.add(ub)
            db.add(
                Notification(
                    user_id=user.id,
                    title=f"New Badge Unlocked: {b.name}",
                    message=b.description,
                )
            )
            newly_awarded.append(
                {
                    "id": b.id,
                    "name": b.name,
                    "name_bn": b.name_bn,
                    "description": b.description,
                    "icon_name": b.icon_name,
                }
            )
    return newly_awarded


async def evaluate_course_completion_and_certificate(
    db: AsyncSession,
    user: User,
    course: Course,
    enrollment: Enrollment,
) -> Certificate | None:
    """
    Checks if all lessons in the course are completed AND (if the course has a final project)
    whether the student's project submission grade is >= 50.
    If eligible, mints a verifiable Certificate automatically.
    """
    lessons_stmt = select(Lesson.id).where(Lesson.course_id == course.id)
    all_lesson_ids = set((await db.execute(lessons_stmt)).scalars().all())
    try:
        completed_ids = set(json.loads(enrollment.completed_lesson_ids_json or "[]"))
    except Exception:
        completed_ids = set()

    if not all_lesson_ids:
        return None

    pct = round((len(completed_ids & all_lesson_ids) / len(all_lesson_ids)) * 100.0, 1)
    enrollment.progress = min(100.0, pct)

    if not all_lesson_ids.issubset(completed_ids):
        return None

    # Check if final project is required and passed
    grade_score = 96.0
    if course.final_project_title.strip():
        sub_stmt = select(ProjectSubmission).where(
            ProjectSubmission.user_id == user.id,
            ProjectSubmission.course_id == course.id,
        )
        sub = (await db.execute(sub_stmt)).scalar_one_or_none()
        if not sub or sub.grade is None or sub.grade < 50.0:
            return None
        grade_score = float(sub.grade)

    # Check if certificate already exists
    cert_stmt = select(Certificate).where(
        Certificate.user_id == user.id,
        Certificate.course_id == course.id,
    )
    existing_cert = (await db.execute(cert_stmt)).scalar_one_or_none()
    if existing_cert:
        return existing_cert

    new_cert = Certificate(
        certificate_id=f"LWMA-{secrets.token_hex(4).upper()}",
        user_id=user.id,
        course_id=course.id,
        student_name=user.full_name or user.username,
        course_name=course.title,
        course_name_bn=course.title_bn or course.title,
        instructor_name=course.instructor_name or "Maruf Ahmed",
        grade_score=grade_score,
    )
    db.add(new_cert)
    db.add(
        Notification(
            user_id=user.id,
            title="Official Certificate Issued!",
            message=f"Congratulations! Your verified certificate ({new_cert.certificate_id}) for {course.title} is ready.",
        )
    )
    await log_user_activity(db, user.id, f"Earned official certificate for {course.title}")

    # Check courses completed badge
    cert_count_stmt = select(func.count(Certificate.id)).where(Certificate.user_id == user.id)
    total_certs = int((await db.execute(cert_count_stmt)).scalar() or 0) + 1
    await check_and_award_badges(db, user, "COURSES_COMPLETED", total_certs)

    return new_cert
