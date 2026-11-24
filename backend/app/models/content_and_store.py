from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    site_title: Mapped[str] = mapped_column(String(200), default="TrainingPundit")
    site_title_bn: Mapped[str] = mapped_column(String(200), default="ট্রেনিং পণ্ডিত")
    site_description: Mapped[str] = mapped_column(
        Text,
        default="Bangladesh's premier hands-on engineering, career & digital skills learning platform.",
    )
    site_description_bn: Mapped[str] = mapped_column(
        Text,
        default="প্র্যাকটিক্যাল প্রজেক্ট, মেন্টরশিপ ও ক্যারিয়ার গাইডলাইনের মাধ্যমে আধুনিক স্কিল অর্জনের নির্ভরযোগ্য প্ল্যাটফর্ম।",
    )
    hero_badge: Mapped[str] = mapped_column(String(150), default="NEW BATCH ENROLLING • TRAININGPUNDIT 2.0")
    hero_badge_bn: Mapped[str] = mapped_column(String(150), default="নতুন ব্যাচে ভর্তি চলছে • ট্রেনিং পণ্ডিত ২.০")
    hero_title: Mapped[str] = mapped_column(String(300), default="Master Industry-Grade Skills With Structured Mentorship.")
    hero_title_bn: Mapped[str] = mapped_column(String(300), default="প্র্যাকটিক্যাল প্রজেক্ট ও সরাসরি মেন্টরশিপে গড়ে তুলুন স্বপ্নের ক্যারিয়ার")
    hero_subtitle: Mapped[str] = mapped_column(
        Text,
        default="Learn Full-Stack Engineering, UI/UX Systems, Data Analytics, and Career Skills with sequential assessments, verified certificates, and live code reviews.",
    )
    hero_subtitle_bn: Mapped[str] = mapped_column(
        Text,
        default="ফুল-স্ট্যাক ওয়েব ডেভেলপমেন্ট, পাইথন, ইউআই/ইউএক্স এবং ফ্রিল্যান্সিং শিখুন ধাপে ধাপে কুইজ, প্রজেক্ট মূল্যায়ন ও ভেরিফাইড সার্টিফিকেটের সাথে।",
    )
    support_email: Mapped[str] = mapped_column(String(150), default="support@trainingpundit.com")
    support_phone: Mapped[str] = mapped_column(String(50), default="+880 1711-223344")
    maintenance_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    invoice_company_name: Mapped[str] = mapped_column(String(150), default="TrainingPundit Technologies Ltd.")
    invoice_address: Mapped[str] = mapped_column(String(255), default="Dhaka, Bangladesh")


class FlashSale(Base):
    __tablename__ = "flash_sales"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), default="Season Skill Sprint — Extra 25% Off All Tracks")
    title_bn: Mapped[str] = mapped_column(String(200), default="স্কিল স্প্রিন্ট ফ্ল্যাশ সেল — সকল কোর্সে ২৫% বিশেষ ছাড়")
    discount_percentage: Mapped[int] = mapped_column(Integer, default=25)
    promo_code: Mapped[str] = mapped_column(String(50), default="MARUF25")
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Workshop(Base):
    __tablename__ = "workshops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    title_bn: Mapped[str] = mapped_column(String(255), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    description_bn: Mapped[str] = mapped_column(Text, default="")
    speaker_name: Mapped[str] = mapped_column(String(150), default="Maruf Ahmed")
    date_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=90)
    platform: Mapped[str] = mapped_column(String(50), default="Zoom Live")
    registrations_count: Mapped[int] = mapped_column(Integer, default=84)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class WorkshopRegistration(Base):
    __tablename__ = "workshop_registrations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    workshop_id: Mapped[int] = mapped_column(ForeignKey("workshops.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(150))
    email: Mapped[str] = mapped_column(String(254))
    phone: Mapped[str] = mapped_column(String(30))
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class VideoTestimonial(Base):
    __tablename__ = "video_testimonials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_name: Mapped[str] = mapped_column(String(150))
    student_role: Mapped[str] = mapped_column(String(150))
    student_role_bn: Mapped[str] = mapped_column(String(150), default="")
    course_name: Mapped[str] = mapped_column(String(200))
    video_id: Mapped[str] = mapped_column(String(100))
    quote: Mapped[str] = mapped_column(Text, default="")
    quote_bn: Mapped[str] = mapped_column(Text, default="")


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    title_bn: Mapped[str] = mapped_column(String(255), default="")
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(100), default="Engineering")
    category_bn: Mapped[str] = mapped_column(String(100), default="ইঞ্জিনিয়ারিং")
    author_name: Mapped[str] = mapped_column(String(150), default="Maruf Ahmed")
    excerpt: Mapped[str] = mapped_column(Text, default="")
    excerpt_bn: Mapped[str] = mapped_column(Text, default="")
    content: Mapped[str] = mapped_column(Text)
    content_bn: Mapped[str] = mapped_column(Text, default="")
    cover_image_url: Mapped[str] = mapped_column(String(500), default="")
    read_time_minutes: Mapped[int] = mapped_column(Integer, default=5)
    views_count: Mapped[int] = mapped_column(Integer, default=140)
    status: Mapped[str] = mapped_column(String(20), default="Published")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class BlogComment(Base):
    __tablename__ = "blog_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("blog_posts.id", ondelete="CASCADE"), index=True)
    author_name: Mapped[str] = mapped_column(String(150))
    body: Mapped[str] = mapped_column(Text)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class StoreProduct(Base):
    __tablename__ = "store_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    title_bn: Mapped[str] = mapped_column(String(255), default="")
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(50), default="ebook")  # ebook, template, code, other
    short_description: Mapped[str] = mapped_column(Text, default="")
    short_description_bn: Mapped[str] = mapped_column(Text, default="")
    price: Mapped[float] = mapped_column(Float, default=490.0)
    original_price: Mapped[float] = mapped_column(Float, default=990.0)
    thumbnail_url: Mapped[str] = mapped_column(String(500), default="")
    vault_file_path: Mapped[str] = mapped_column(String(500), default="")
    preview_url: Mapped[str] = mapped_column(String(500), default="")
    sales_count: Mapped[int] = mapped_column(Integer, default=45)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class StoreOrder(Base):
    """
    Fixes LMS 1.0's critical store payment bypass:
    Orders start as status='Pending' (is_paid=False) until verified by Admin or Gateway Webhook!
    """
    __tablename__ = "store_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("store_products.id", ondelete="CASCADE"), index=True)
    product_title: Mapped[str] = mapped_column(String(255), default="")
    amount: Mapped[float] = mapped_column(Float)
    payment_method: Mapped[str] = mapped_column(String(50), default="bKash")
    sender_number: Mapped[str] = mapped_column(String(30))
    transaction_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(20), default="Pending", index=True)  # Pending, Approved, Rejected
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
