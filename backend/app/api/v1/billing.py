import json
import secrets
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import Response
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.rate_limit import rate_limiter
from app.core.security import sanitize_plain_text
from app.models.billing import GiftCode, Payment, PaymentGatewaySetting, PromoCode
from app.models.courses import Course, CourseBundle, CourseVariant
from app.models.users import Enrollment, Notification, User
from app.services.gamification_service import log_user_activity
from app.services.pdf_service import generate_invoice_pdf_bytes

router = APIRouter(prefix="/billing", tags=["Billing, MFS Checkout, Gifts & Invoices"])


class PromoValidateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)


class CheckoutRequest(BaseModel):
    course_id: Optional[int] = None
    bundle_id: Optional[int] = None
    variant_id: Optional[int] = None
    method: str = Field(..., pattern="^(bKash|Nagad|Rocket|SSLCommerz)$")
    sender_number: str = Field(..., min_length=8, max_length=30)
    transaction_id: str = Field(..., min_length=5, max_length=60)
    promo_code: Optional[str] = Field(default="", max_length=50)
    is_gift: bool = False
    gift_email: Optional[EmailStr] = None


class GiftRedeemRequest(BaseModel):
    code: str = Field(..., min_length=5, max_length=32)


@router.get("/gateway-config")
async def get_gateway_config(db: AsyncSession = Depends(get_db)):
    gw = (await db.execute(select(PaymentGatewaySetting).limit(1))).scalar_one_or_none()
    if not gw:
        gw = PaymentGatewaySetting()
        db.add(gw)
        await db.commit()
        await db.refresh(gw)
    return {
        "active_gateway": gw.active_gateway,
        "is_sandbox": gw.is_sandbox,
        "manual_bkash_number": gw.manual_bkash_number,
        "manual_bkash_type": gw.manual_bkash_type,
        "manual_nagad_number": gw.manual_nagad_number,
        "manual_nagad_type": gw.manual_nagad_type,
        "manual_rocket_number": gw.manual_rocket_number,
        "manual_instructions": gw.manual_instructions,
        "manual_instructions_bn": gw.manual_instructions_bn,
    }


@router.post("/promo/validate")
async def validate_promo_code(
    payload: PromoValidateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    client_ip = rate_limiter.get_client_ip(request)
    rate_limiter.check(f"promo_check::{client_ip}", max_requests=12, window_seconds=300)

    clean_code = payload.code.strip().upper()
    promo = (
        await db.execute(select(PromoCode).where(func.upper(PromoCode.code) == clean_code, PromoCode.active == True))
    ).scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or expired promo code.")
    return {
        "valid": True,
        "code": promo.code,
        "discount_percentage": promo.discount_percentage,
    }


@router.post("/checkout", status_code=status.HTTP_201_CREATED)
async def submit_checkout(
    payload: CheckoutRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    client_ip = rate_limiter.get_client_ip(request)
    rate_limiter.check(f"checkout::{client_ip}", max_requests=10, window_seconds=300)

    if not payload.course_id and not payload.bundle_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please specify a course or bundle.")

    trx_clean = sanitize_plain_text(payload.transaction_id.strip().upper())
    existing_trx = (
        await db.execute(select(Payment).where(func.upper(Payment.transaction_id) == trx_clean))
    ).scalar_one_or_none()
    if existing_trx:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This Transaction ID (TrxID) has already been submitted.",
        )

    base_price = 0.0
    item_title = ""
    if payload.course_id:
        course = (await db.execute(select(Course).where(Course.id == payload.course_id))).scalar_one_or_none()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
        base_price = course.price
        item_title = course.title
        if payload.variant_id:
            variant = (
                await db.execute(
                    select(CourseVariant).where(
                        CourseVariant.id == payload.variant_id,
                        CourseVariant.course_id == course.id,
                    )
                )
            ).scalar_one_or_none()
            if variant:
                base_price = variant.price
                item_title = f"{course.title} ({variant.variant_type})"
    elif payload.bundle_id:
        bundle = (await db.execute(select(CourseBundle).where(CourseBundle.id == payload.bundle_id))).scalar_one_or_none()
        if not bundle:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course bundle not found.")
        base_price = bundle.price
        item_title = f"Bundle: {bundle.title}"

    discount_pct = 0
    promo_applied = ""
    if payload.promo_code and payload.promo_code.strip():
        clean_code = payload.promo_code.strip().upper()
        promo = (
            await db.execute(select(PromoCode).where(func.upper(PromoCode.code) == clean_code, PromoCode.active == True))
        ).scalar_one_or_none()
        if promo:
            discount_pct = promo.discount_percentage
            promo_applied = promo.code

    final_amount = round(base_price * (1.0 - (discount_pct / 100.0)), 2)

    payment = Payment(
        invoice_number=f"INV-{secrets.token_hex(3).upper()}",
        user_id=user.id,
        user_name=user.full_name or user.username,
        course_id=payload.course_id,
        bundle_id=payload.bundle_id,
        variant_id=payload.variant_id,
        item_title=item_title,
        method=payload.method,
        sender_number=sanitize_plain_text(payload.sender_number.strip()),
        transaction_id=trx_clean,
        promo_code_applied=promo_applied,
        amount=final_amount,
        status="Pending",
        is_gift=payload.is_gift,
        gift_email=payload.gift_email.lower().strip() if (payload.is_gift and payload.gift_email) else "",
    )
    db.add(payment)
    db.add(
        Notification(
            user_id=user.id,
            title=f"Payment Received ({payment.invoice_number})",
            message=f"We received your {payload.method} TrxID ({trx_clean}) for {item_title}. Verification is in progress.",
        )
    )
    await log_user_activity(db, user.id, f"Submitted {payload.method} payment {payment.invoice_number} for {item_title}")
    await db.commit()
    await db.refresh(payment)

    return {
        "id": payment.id,
        "invoice_number": payment.invoice_number,
        "item_title": payment.item_title,
        "method": payment.method,
        "sender_number": payment.sender_number,
        "transaction_id": payment.transaction_id,
        "amount": payment.amount,
        "status": payment.status,
        "is_gift": payment.is_gift,
        "gift_email": payment.gift_email,
        "created_at": payment.created_at.isoformat(),
    }


@router.post("/gifts/redeem")
async def redeem_gift_code(
    payload: GiftRedeemRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    client_ip = rate_limiter.get_client_ip(request)
    rate_limiter.check(f"gift_redeem::{client_ip}", max_requests=8, window_seconds=300)

    clean_code = payload.code.strip().upper()
    gift = (
        await db.execute(select(GiftCode).where(func.upper(GiftCode.code) == clean_code))
    ).scalar_one_or_none()
    if not gift:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Gift Code.")
    if gift.is_redeemed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This Gift Code has already been redeemed.")

    enrolled_titles = []
    if gift.course_id:
        existing = (
            await db.execute(
                select(Enrollment).where(Enrollment.user_id == user.id, Enrollment.course_id == gift.course_id)
            )
        ).scalar_one_or_none()
        if not existing:
            db.add(Enrollment(user_id=user.id, course_id=gift.course_id))
        c = (await db.execute(select(Course).where(Course.id == gift.course_id))).scalar_one_or_none()
        if c:
            enrolled_titles.append(c.title)

    if gift.bundle_id:
        bundle = (await db.execute(select(CourseBundle).where(CourseBundle.id == gift.bundle_id))).scalar_one_or_none()
        if bundle:
            for cid in json.loads(bundle.course_ids_json or "[]"):
                existing = (
                    await db.execute(select(Enrollment).where(Enrollment.user_id == user.id, Enrollment.course_id == cid))
                ).scalar_one_or_none()
                if not existing:
                    db.add(Enrollment(user_id=user.id, course_id=cid))
            enrolled_titles.append(bundle.title)

    gift.is_redeemed = True
    gift.redeemed_by_id = user.id
    db.add(
        Notification(
            user_id=user.id,
            title="Gift Course Redeemed!",
            message=f"You have been enrolled in {', '.join(enrolled_titles) or 'your gifted course'}.",
        )
    )
    await db.commit()
    return {
        "status": "redeemed",
        "enrolled_items": enrolled_titles,
    }


@router.get("/invoices")
async def list_my_invoices(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payments = (
        await db.execute(select(Payment).where(Payment.user_id == user.id).order_by(desc(Payment.created_at)))
    ).scalars().all()
    return [
        {
            "id": p.id,
            "invoice_number": p.invoice_number,
            "item_title": p.item_title,
            "method": p.method,
            "sender_number": p.sender_number,
            "transaction_id": p.transaction_id,
            "promo_code_applied": p.promo_code_applied,
            "amount": p.amount,
            "status": p.status,
            "is_gift": p.is_gift,
            "gift_email": p.gift_email,
            "generated_gift_code": p.generated_gift_code,
            "created_at": p.created_at.isoformat(),
        }
        for p in payments
    ]


@router.get("/invoices/{payment_id}/pdf")
async def download_invoice_pdf(
    payment_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payment = (await db.execute(select(Payment).where(Payment.id == payment_id))).scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")
    if payment.user_id != user.id and not (user.is_staff or user.is_superuser):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to download this invoice.")

    pdf_bytes = generate_invoice_pdf_bytes(
        invoice_number=payment.invoice_number,
        student_name=payment.user_name or user.full_name or user.username,
        student_email=user.email,
        item_title=payment.item_title,
        method=payment.method,
        sender_number=payment.sender_number,
        transaction_id=payment.transaction_id,
        amount=payment.amount,
        status=payment.status,
        created_at_str=payment.created_at.strftime("%Y-%m-%d %H:%M UTC"),
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{payment.invoice_number}.pdf"'},
    )
