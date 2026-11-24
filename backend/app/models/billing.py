import secrets
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    discount_percentage: Mapped[int] = mapped_column(Integer, default=15)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class GiftCode(Base):
    __tablename__ = "gift_codes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        index=True,
        default=lambda: f"GIFT-{secrets.token_hex(4).upper()}",
    )
    course_id: Mapped[Optional[int]] = mapped_column(ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    bundle_id: Mapped[Optional[int]] = mapped_column(ForeignKey("course_bundles.id", ondelete="SET NULL"), nullable=True)
    purchaser_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    recipient_email: Mapped[str] = mapped_column(String(254))
    is_redeemed: Mapped[bool] = mapped_column(Boolean, default=False)
    redeemed_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    invoice_number: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        index=True,
        default=lambda: f"INV-{secrets.token_hex(3).upper()}",
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    user_name: Mapped[str] = mapped_column(String(150), default="")
    course_id: Mapped[Optional[int]] = mapped_column(ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True)
    bundle_id: Mapped[Optional[int]] = mapped_column(ForeignKey("course_bundles.id", ondelete="SET NULL"), nullable=True)
    variant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("course_variants.id", ondelete="SET NULL"), nullable=True)
    item_title: Mapped[str] = mapped_column(String(255), default="")
    method: Mapped[str] = mapped_column(String(50), default="bKash")  # bKash, Nagad, Rocket, SSLCommerz
    sender_number: Mapped[str] = mapped_column(String(30))
    transaction_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    promo_code_applied: Mapped[str] = mapped_column(String(50), default="")
    amount: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="Pending", index=True)  # Pending, Approved, Rejected
    is_gift: Mapped[bool] = mapped_column(Boolean, default=False)
    gift_email: Mapped[str] = mapped_column(String(254), default="")
    generated_gift_code: Mapped[str] = mapped_column(String(32), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class PaymentGatewaySetting(Base):
    __tablename__ = "payment_gateway_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(100), default="Primary MFS & Gateway Config")
    active_gateway: Mapped[str] = mapped_column(String(50), default="MANUAL")  # MANUAL, BKASH_PGW, SSLCOMMERZ, SHURJOPAY
    is_sandbox: Mapped[bool] = mapped_column(Boolean, default=True)
    manual_bkash_number: Mapped[str] = mapped_column(String(30), default="01711-223344")
    manual_bkash_type: Mapped[str] = mapped_column(String(30), default="Personal (Send Money)")
    manual_nagad_number: Mapped[str] = mapped_column(String(30), default="01811-223344")
    manual_nagad_type: Mapped[str] = mapped_column(String(30), default="Personal (Send Money)")
    manual_rocket_number: Mapped[str] = mapped_column(String(30), default="01911-223344-5")
    manual_instructions: Mapped[str] = mapped_column(
        Text,
        default="Use Send Money to the official bKash/Nagad/Rocket wallet above and submit your 10-digit TrxID for instant verification.",
    )
    manual_instructions_bn: Mapped[str] = mapped_column(
        Text,
        default="উপরের অফিশিয়াল বিকাশ/নগদ/রকেট নাম্বারে Send Money করে আপনার Transaction ID (TrxID) প্রদান করুন।",
    )
    # Encrypted secrets at rest (Fernet)
    encrypted_app_key: Mapped[str] = mapped_column(Text, default="")
    encrypted_app_secret: Mapped[str] = mapped_column(Text, default="")
    encrypted_webhook_secret: Mapped[str] = mapped_column(Text, default="")


class TrainerPayout(Base):
    __tablename__ = "trainer_payouts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    trainer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    trainer_name: Mapped[str] = mapped_column(String(150), default="")
    amount: Mapped[float] = mapped_column(Float)
    method: Mapped[str] = mapped_column(String(50), default="bKash")  # bKash, Nagad, Bank Transfer
    account_number: Mapped[str] = mapped_column(String(100), default="")
    transaction_ref: Mapped[str] = mapped_column(String(100), default="")
    status: Mapped[str] = mapped_column(String(30), default="Completed")  # Completed, Processing, Pending
    notes: Mapped[str] = mapped_column(Text, default="")
    disbursed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

