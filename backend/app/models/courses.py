import secrets
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    instructor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    instructor_name: Mapped[str] = mapped_column(String(150), default="Maruf Ahmed")
    title: Mapped[str] = mapped_column(String(255), index=True)
    title_bn: Mapped[str] = mapped_column(String(255), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    description_bn: Mapped[str] = mapped_column(Text, default="")
    thumbnail_url: Mapped[str] = mapped_column(String(500), default="")
    category: Mapped[str] = mapped_column(String(100), default="Web Development", index=True)
    category_bn: Mapped[str] = mapped_column(String(100), default="ওয়েব ডেভেলপমেন্ট")
    level: Mapped[str] = mapped_column(String(50), default="Beginner to Advanced")
    duration_hours: Mapped[int] = mapped_column(Integer, default=42)
    price: Mapped[float] = mapped_column(Float, default=2500.0)
    original_price: Mapped[float] = mapped_column(Float, default=5000.0)
    students_count: Mapped[int] = mapped_column(Integer, default=120)
    rating: Mapped[float] = mapped_column(Float, default=4.9)
    # Final project settings
    final_project_title: Mapped[str] = mapped_column(String(255), default="")
    final_project_description: Mapped[str] = mapped_column(Text, default="")
    final_project_resource_url: Mapped[str] = mapped_column(String(500), default="")
    # Live batch settings
    is_live_course: Mapped[bool] = mapped_column(Boolean, default=False)
    batch_title: Mapped[str] = mapped_column(String(120), default="")
    batch_title_bn: Mapped[str] = mapped_column(String(120), default="")
    total_seats: Mapped[int] = mapped_column(Integer, default=50)
    seats_booked: Mapped[int] = mapped_column(Integer, default=12)
    enrollment_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    live_class_schedule: Mapped[str] = mapped_column(String(255), default="")
    live_class_schedule_bn: Mapped[str] = mapped_column(String(255), default="")
    features_json: Mapped[str] = mapped_column(Text, default="[]")
    outcomes_json: Mapped[str] = mapped_column(Text, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class CourseVariant(Base):
    __tablename__ = "course_variants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    variant_type: Mapped[str] = mapped_column(String(50), default="Recorded")  # Recorded, Online Live, Offline, One to One
    variant_type_bn: Mapped[str] = mapped_column(String(50), default="রেকর্ডেড")
    price: Mapped[float] = mapped_column(Float, default=2500.0)
    description: Mapped[str] = mapped_column(String(255), default="")
    meeting_link: Mapped[str] = mapped_column(String(500), default="")


class CourseBundle(Base):
    __tablename__ = "course_bundles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    title_bn: Mapped[str] = mapped_column(String(255), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    description_bn: Mapped[str] = mapped_column(Text, default="")
    course_ids_json: Mapped[str] = mapped_column(Text, default="[]")
    price: Mapped[float] = mapped_column(Float, default=4500.0)
    original_price: Mapped[float] = mapped_column(Float, default=9000.0)
    thumbnail_url: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    course_id: Mapped[Optional[int]] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(120), default="Student")
    avatar_url: Mapped[str] = mapped_column(String(500), default="")
    rating: Mapped[int] = mapped_column(Integer, default=5)
    text: Mapped[str] = mapped_column(Text)
    text_bn: Mapped[str] = mapped_column(Text, default="")
    is_approved: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class FAQ(Base):
    __tablename__ = "faqs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    question: Mapped[str] = mapped_column(String(500))
    question_bn: Mapped[str] = mapped_column(String(500), default="")
    answer: Mapped[str] = mapped_column(Text)
    answer_bn: Mapped[str] = mapped_column(Text, default="")
    order: Mapped[int] = mapped_column(Integer, default=0)


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    certificate_id: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        index=True,
        default=lambda: f"LWMA-{secrets.token_hex(4).upper()}",
    )
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    course_id: Mapped[Optional[int]] = mapped_column(ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True)
    student_name: Mapped[str] = mapped_column(String(200))
    course_name: Mapped[str] = mapped_column(String(255))
    course_name_bn: Mapped[str] = mapped_column(String(255), default="")
    instructor_name: Mapped[str] = mapped_column(String(150), default="Maruf Ahmed")
    grade_score: Mapped[float] = mapped_column(Float, default=95.0)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class JobPosting(Base):
    __tablename__ = "job_postings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    title_bn: Mapped[str] = mapped_column(String(255), default="")
    company_name: Mapped[str] = mapped_column(String(200), index=True)
    company_logo: Mapped[str] = mapped_column(String(500), default="")
    location: Mapped[str] = mapped_column(String(150), default="Dhaka, Bangladesh")
    job_type: Mapped[str] = mapped_column(String(50), default="Full-time Remote")
    salary_range: Mapped[str] = mapped_column(String(100), default="৳50,000 - ৳85,000 / month")
    experience_level: Mapped[str] = mapped_column(String(50), default="Entry to Mid-Level")
    description: Mapped[str] = mapped_column(Text)
    description_bn: Mapped[str] = mapped_column(Text, default="")
    skills_required_json: Mapped[str] = mapped_column(Text, default="[]")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class JobApplication(Base):
    __tablename__ = "job_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("job_postings.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    portfolio_url: Mapped[str] = mapped_column(String(500), default="")
    cover_note: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="Under Review")
    applied_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class CodeChallenge(Base):
    __tablename__ = "code_challenges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    title_bn: Mapped[str] = mapped_column(String(255), default="")
    category: Mapped[str] = mapped_column(String(100), default="Python & AI")
    difficulty: Mapped[str] = mapped_column(String(50), default="Medium")
    language: Mapped[str] = mapped_column(String(50), default="python")
    description: Mapped[Text] = mapped_column(Text)
    description_bn: Mapped[Text] = mapped_column(Text, default="")
    starter_code: Mapped[Text] = mapped_column(Text, default="")
    test_cases_json: Mapped[Text] = mapped_column(Text, default="[]")
    points: Mapped[int] = mapped_column(Integer, default=50)
