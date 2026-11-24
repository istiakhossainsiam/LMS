import time
from collections import defaultdict
from fastapi import HTTPException, Request, status


class TokenBucketRateLimiter:
    """
    Memory-safe sliding-window / token-bucket rate limiter that does NOT trust forged
    X-Forwarded-For headers unless explicitly behind a local reverse proxy.
    Fixes LMS 1.0's IP-spoofing and login rate-limit bugs.
    """

    def __init__(self) -> None:
        self._buckets: dict[str, list[float]] = defaultdict(list)

    @staticmethod
    def get_client_ip(request: Request) -> str:
        client_host = request.client.host if request.client else "127.0.0.1"
        if client_host in ("127.0.0.1", "::1", "localhost"):
            forwarded = request.headers.get("x-real-ip")
            if forwarded:
                return forwarded.strip()[:64]
        return client_host

    def check(self, key: str, max_requests: int, window_seconds: int) -> None:
        now = time.monotonic()
        cutoff = now - window_seconds
        history = [ts for ts in self._buckets[key] if ts > cutoff]
        if len(history) >= max_requests:
            retry_after = max(1, int(window_seconds - (now - history[0])))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please wait {retry_after} seconds before trying again.",
                headers={"Retry-After": str(retry_after)},
            )
        history.append(now)
        self._buckets[key] = history

    def record_failure(self, key: str, max_failures: int, window_seconds: int) -> None:
        self.check(f"fail::{key}", max_failures, window_seconds)

    def clear_failures(self, key: str) -> None:
        self._buckets.pop(f"fail::{key}", None)


rate_limiter = TokenBucketRateLimiter()
