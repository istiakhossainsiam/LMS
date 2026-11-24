import os
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.rate_limit import rate_limiter
from app.core.security import create_vault_download_token, decode_token, sanitize_plain_text
from app.models.content_and_store import BlogComment, BlogPost, StoreOrder, StoreProduct
from app.models.users import Notification, User

router = APIRouter(tags=["Digital Store, Protected Media Vault & Blog"])


class StoreCheckoutRequest(BaseModel):
    product_id: int
    payment_method: str = Field(..., pattern="^(bKash|Nagad|Rocket|SSLCommerz)$")
    sender_number: str = Field(..., min_length=8, max_length=30)
    transaction_id: str = Field(..., min_length=5, max_length=60)


class BlogCommentRequest(BaseModel):
    author_name: str = Field(..., min_length=2, max_length=120)
    body: str = Field(..., min_length=3, max_length=2000)


@router.get("/store/products")
async def list_store_products(db: AsyncSession = Depends(get_db)):
    products = (
        await db.execute(select(StoreProduct).where(StoreProduct.is_active == True).order_by(desc(StoreProduct.sales_count)))
    ).scalars().all()
    # SECURITY: Never expose `vault_file_path` in public product listings!
    return [
        {
            "id": p.id,
            "title": p.title,
            "title_bn": p.title_bn or p.title,
            "slug": p.slug,
            "category": p.category,
            "short_description": p.short_description,
            "short_description_bn": p.short_description_bn or p.short_description,
            "price": p.price,
            "original_price": p.original_price,
            "thumbnail_url": p.thumbnail_url,
            "sales_count": p.sales_count,
        }
        for p in products
    ]


@router.post("/store/checkout", status_code=status.HTTP_201_CREATED)
async def checkout_store_product(
    payload: StoreCheckoutRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Fixes LMS 1.0's critical Store Payment Bypass vulnerability (`store/views.py:148`).
    Orders are created with `status="Pending"` and `is_paid=False` until verified!
    """
    client_ip = rate_limiter.get_client_ip(request)
    rate_limiter.check(f"store_checkout::{client_ip}", max_requests=10, window_seconds=300)

    product = (
        await db.execute(select(StoreProduct).where(StoreProduct.id == payload.product_id, StoreProduct.is_active == True))
    ).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Digital product not found.")

    trx_clean = sanitize_plain_text(payload.transaction_id.strip().upper())
    dup = (
        await db.execute(select(StoreOrder).where(func.upper(StoreOrder.transaction_id) == trx_clean))
    ).scalar_one_or_none()
    if dup:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transaction ID already used.")

    order = StoreOrder(
        user_id=user.id,
        product_id=product.id,
        product_title=product.title,
        amount=product.price,
        payment_method=payload.payment_method,
        sender_number=sanitize_plain_text(payload.sender_number.strip()),
        transaction_id=trx_clean,
        status="Pending",
        is_paid=False,
    )
    db.add(order)
    db.add(
        Notification(
            user_id=user.id,
            title="Digital Store Order Submitted",
            message=f"Your order for '{product.title}' (TrxID: {trx_clean}) is pending admin verification.",
        )
    )
    await db.commit()
    await db.refresh(order)
    return {
        "id": order.id,
        "product_id": order.product_id,
        "product_title": order.product_title,
        "amount": order.amount,
        "payment_method": order.payment_method,
        "transaction_id": order.transaction_id,
        "status": order.status,
        "is_paid": order.is_paid,
        "created_at": order.created_at.isoformat(),
    }


@router.get("/store/my-orders")
async def list_my_store_orders(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    orders = (
        await db.execute(select(StoreOrder).where(StoreOrder.user_id == user.id).order_by(desc(StoreOrder.created_at)))
    ).scalars().all()
    products = (await db.execute(select(StoreProduct))).scalars().all()
    prod_map = {p.id: p for p in products}

    result = []
    for o in orders:
        p = prod_map.get(o.product_id)
        dl_token = None
        if o.is_paid and o.status == "Approved" and p and p.vault_file_path:
            dl_token = create_vault_download_token(
                user_id=user.id,
                resource_type="store_product",
                resource_id=p.id,
                file_path=p.vault_file_path,
            )
        result.append(
            {
                "id": o.id,
                "product_id": o.product_id,
                "product_title": o.product_title,
                "amount": o.amount,
                "payment_method": o.payment_method,
                "transaction_id": o.transaction_id,
                "status": o.status,
                "is_paid": o.is_paid,
                "download_token": dl_token,
                "created_at": o.created_at.isoformat(),
            }
        )
    return result


@router.get("/vault/download/{token}")
async def download_from_protected_vault(token: str):
    """
    Streams protected digital assets and course resources ONLY when a valid,
    unexpired signed JWT download token is presented.
    Fixes LMS 1.0's unprotected `/media/` direct file access vulnerability.
    """
    payload = decode_token(token)
    if not payload or payload.get("type") != "vault_download":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired signed media vault token.",
        )

    rel_path = os.path.basename(payload.get("fpath", ""))
    if not rel_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not specified.")

    vault_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "media_vault")
    full_path = os.path.join(vault_dir, rel_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Protected asset not found in vault.")

    return FileResponse(path=full_path, filename=rel_path)


@router.get("/blog/posts")
async def list_blog_posts(db: AsyncSession = Depends(get_db)):
    posts = (
        await db.execute(select(BlogPost).where(BlogPost.status == "Published").order_by(desc(BlogPost.created_at)))
    ).scalars().all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "title_bn": p.title_bn or p.title,
            "slug": p.slug,
            "category": p.category,
            "category_bn": p.category_bn or p.category,
            "author_name": p.author_name,
            "excerpt": p.excerpt,
            "excerpt_bn": p.excerpt_bn or p.excerpt,
            "content": p.content,
            "content_bn": p.content_bn or p.content,
            "cover_image_url": p.cover_image_url,
            "read_time_minutes": p.read_time_minutes,
            "views_count": p.views_count,
            "created_at": p.created_at.isoformat(),
        }
        for p in posts
    ]


@router.get("/blog/posts/{slug}")
async def get_blog_post(slug: str, db: AsyncSession = Depends(get_db)):
    post = (await db.execute(select(BlogPost).where(BlogPost.slug == slug))).scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")
    post.views_count += 1
    comments = (
        await db.execute(
            select(BlogComment)
            .where(BlogComment.post_id == post.id, BlogComment.is_approved == True)
            .order_by(desc(BlogComment.created_at))
        )
    ).scalars().all()
    await db.commit()
    return {
        "id": post.id,
        "title": post.title,
        "title_bn": post.title_bn or post.title,
        "slug": post.slug,
        "category": post.category,
        "category_bn": post.category_bn or post.category,
        "author_name": post.author_name,
        "content": post.content,
        "content_bn": post.content_bn or post.content,
        "cover_image_url": post.cover_image_url,
        "read_time_minutes": post.read_time_minutes,
        "views_count": post.views_count,
        "created_at": post.created_at.isoformat(),
        "comments": [
            {
                "id": c.id,
                "author_name": c.author_name,
                "body": c.body,
                "created_at": c.created_at.isoformat(),
            }
            for c in comments
        ],
    }


@router.post("/blog/posts/{post_id}/comments", status_code=status.HTTP_201_CREATED)
async def add_blog_comment(
    post_id: int,
    payload: BlogCommentRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    client_ip = rate_limiter.get_client_ip(request)
    rate_limiter.check(f"blog_comment::{client_ip}", max_requests=8, window_seconds=300)

    comment = BlogComment(
        post_id=post_id,
        author_name=sanitize_plain_text(payload.author_name.strip()),
        body=sanitize_plain_text(payload.body.strip()),
        is_approved=True,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return {
        "id": comment.id,
        "author_name": comment.author_name,
        "body": comment.body,
        "created_at": comment.created_at.isoformat(),
    }
