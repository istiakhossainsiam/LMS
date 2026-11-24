from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Module(Base):
    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    title_bn: Mapped[str] = mapped_column(String(255), default="")
    order: Mapped[int] = mapped_column(Integer, default=1)


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    module_id: Mapped[Optional[int]] = mapped_column(ForeignKey("modules.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    title_bn: Mapped[str] = mapped_column(String(255), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    description_bn: Mapped[str] = mapped_column(Text, default="")
    video_id: Mapped[str] = mapped_column(String(120), default="dQw4w9WgXcQ")
    duration_minutes: Mapped[int] = mapped_column(Integer, default=18)
    resource_file_path: Mapped[str] = mapped_column(String(500), default="")
    pass_mark: Mapped[int] = mapped_column(Integer, default=50)
    is_free_preview: Mapped[bool] = mapped_column(Boolean, default=False)
    order: Mapped[int] = mapped_column(Integer, default=1)


class LiveClass(Base):
    __tablename__ = "live_classes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    title_bn: Mapped[str] = mapped_column(String(255), default="")
    date_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    meeting_link: Mapped[str] = mapped_column(String(500))
    platform: Mapped[str] = mapped_column(String(50), default="Zoom")
    description: Mapped[str] = mapped_column(Text, default="")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(Text)
    text_bn: Mapped[str] = mapped_column(Text, default="")
    question_type: Mapped[str] = mapped_column(String(20), default="MCQ")  # MCQ or Short (normalized!)
    correct_answer: Mapped[str] = mapped_column(String(500), default="")
    marks: Mapped[int] = mapped_column(Integer, default=1)


class Choice(Base):
    __tablename__ = "choices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(String(500))
    text_bn: Mapped[str] = mapped_column(String(500), default="")
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)


class LessonWatchLog(Base):
    """
    Server-side video playback telemetry so students cannot call /complete
    without actually watching >= 80% of the lesson video!
    Fixes LMS 1.0's certificate minting bypass vulnerability.
    """
    __tablename__ = "lesson_watch_logs"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_watch_user_lesson"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    watched_seconds: Mapped[int] = mapped_column(Integer, default=0)
    total_seconds: Mapped[int] = mapped_column(Integer, default=600)
    watch_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class LessonScore(Base):
    __tablename__ = "lesson_scores"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_score_user_lesson"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    passed: Mapped[bool] = mapped_column(Boolean, default=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    last_attempt_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Note(Base):
    __tablename__ = "notes"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_note_user_lesson"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    content: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class LessonDiscussion(Base):
    __tablename__ = "lesson_discussions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    user_name: Mapped[str] = mapped_column(String(150), default="Student")
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("lesson_discussions.id", ondelete="CASCADE"), nullable=True, index=True)
    comment: Mapped[str] = mapped_column(Text)
    is_mentor_reply: Mapped[bool] = mapped_column(Boolean, default=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ProjectSubmission(Base):
    __tablename__ = "project_submissions"
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_project_user_course"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    user_name: Mapped[str] = mapped_column(String(150), default="")
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    file_path: Mapped[str] = mapped_column(String(500), default="")
    github_or_live_url: Mapped[str] = mapped_column(String(500), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    grade: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    feedback: Mapped[str] = mapped_column(Text, default="")
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class LessonReport(Base):
    __tablename__ = "lesson_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    issue_type: Mapped[str] = mapped_column(String(50), default="Video")
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="Pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
