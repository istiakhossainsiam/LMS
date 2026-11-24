import asyncio
from httpx import ASGITransport, AsyncClient
from app.main import app, lifespan


async def run_comprehensive_security_audit() -> None:
    async with lifespan(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 1. Health & Security Headers check
            health = await client.get("/api/health")
            assert health.status_code == 200
            assert health.headers.get("X-Content-Type-Options") == "nosniff"
            assert health.headers.get("X-Frame-Options") == "DENY"

            # 2. SQL Injection attempt on course search must be safely parameterized
            sqli = await client.get("/api/v1/public/courses", params={"q": "' OR 1=1 -- SELECT * FROM users"})
            assert sqli.status_code == 200
            assert isinstance(sqli.json(), list)

            # 3. Student Login & Single-Device Session Guard
            login1 = await client.post(
                "/api/v1/auth/login",
                json={"identifier": "student@learnwithmarufahmed.com", "password": "Student@1234"},
            )
            assert login1.status_code == 200
            token_device_1 = login1.json()["access_token"]

            # Login from Device 2 should invalidate Device 1's token!
            login2 = await client.post(
                "/api/v1/auth/login",
                json={"identifier": "student@learnwithmarufahmed.com", "password": "Student@1234"},
            )
            assert login2.status_code == 200
            token_device_2 = login2.json()["access_token"]

            old_device_req = await client.get(
                "/api/v1/student/dashboard",
                headers={"Authorization": f"Bearer {token_device_1}"},
            )
            assert old_device_req.status_code == 401, "Old device session must be invalidated!"

            headers = {"Authorization": f"Bearer {token_device_2}"}

            # 4. Code/SQL Study Notes Preservation (Fixes LMS 1.0's broken regex WAF!)
            code_note = await client.put(
                "/api/v1/student/lessons/1/note",
                json={"content": "SELECT id, email FROM users WHERE active = 1; -- SQL comment /* block */"},
                headers=headers,
            )
            assert code_note.status_code == 200

            # 5. Stored XSS Sanitization in Lesson Q&A Discussions
            xss_post = await client.post(
                "/api/v1/student/lessons/1/discussions",
                json={"comment": 'Hello <script>alert("xss")</script> world!'},
                headers=headers,
            )
            assert xss_post.status_code == 201
            assert "<script>" not in xss_post.json()["comment"]

            # 6. Anti-Cheat Lesson Completion (Requires >= 80% server watch log + quiz pass)
            premature_complete = await client.post("/api/v1/student/lessons/2/complete", headers=headers)
            assert premature_complete.status_code == 400, "Must block completion when watch < 80%"

            # 7. Zero Quiz Answer Leakage on Failed Quiz Attempt
            fail_quiz = await client.post(
                "/api/v1/student/lessons/2/quiz/submit",
                json={"answers": {"3": "999999"}},
                headers=headers,
            )
            assert fail_quiz.status_code in (200, 429)
            if fail_quiz.status_code == 200:
                assert fail_quiz.json()["passed"] is False
                assert "correct_answers" not in fail_quiz.json(), "Must NEVER leak correct answers on fail!"
            else:
                assert "locked for cooldown" in fail_quiz.json()["detail"]

            # 8. Digital Store Payment Bypass Prevention & Signed Vault Token Verification
            import uuid
            dynamic_trx = f"TRX{uuid.uuid4().hex[:10].upper()}"
            store_order = await client.post(
                "/api/v1/store/checkout",
                json={
                    "product_id": 2,
                    "payment_method": "bKash",
                    "sender_number": "01711000000",
                    "transaction_id": dynamic_trx,
                },
                headers=headers,
            )
            assert store_order.status_code == 201
            assert store_order.json()["is_paid"] is False
            assert store_order.json()["status"] == "Pending"

            # Forged vault token must be rejected with 403
            bad_vault = await client.get("/api/v1/vault/download/forged.jwt.token")
            assert bad_vault.status_code == 403

            # 9. Job Placement Camp & Talent Pipeline (Ostad-grade feature)
            jobs_res = await client.get("/api/v1/public/jobs")
            assert jobs_res.status_code == 200
            jobs_data = jobs_res.json()
            assert len(jobs_data) >= 1
            test_job_id = jobs_data[0]["id"]

            job_apply = await client.post(
                f"/api/v1/student/jobs/{test_job_id}/apply",
                json={
                    "portfolio_url": "https://github.com/student/cloud-lms-project",
                    "cover_note": "Certified Graduate in Full-Stack Cloud Engineering.",
                },
                headers=headers,
            )
            assert job_apply.status_code in (201, 400)
            if job_apply.status_code == 201:
                assert job_apply.json()["status"] == "Under Review"
            else:
                assert "already submitted" in job_apply.json()["detail"]

            # 10. Interactive CodeLab / CodeMama evaluation
            challenges_res = await client.get("/api/v1/public/codelab/challenges")
            assert challenges_res.status_code == 200
            challenges = challenges_res.json()
            assert len(challenges) >= 1
            challenge_id = challenges[0]["id"]

            # Run code evaluation
            eval_res = await client.post(
                f"/api/v1/student/codelab/challenges/{challenge_id}/run",
                json={
                    "code": "def two_sum(nums, target):\n    return [0, 1]",
                },
                headers=headers,
            )
            assert eval_res.status_code == 200
            eval_data = eval_res.json()
            assert "all_passed" in eval_data
            assert "results" in eval_data

            # 11. SEO & AI Search (GEO) Standards Verification per claude-seo
            robots = await client.get("/robots.txt")
            assert robots.status_code == 200
            assert "User-agent: *" in robots.text
            assert "Sitemap:" in robots.text

            sitemap = await client.get("/sitemap.xml")
            assert sitemap.status_code == 200
            assert "<urlset" in sitemap.text
            assert "hreflang=\"bn\"" in sitemap.text
            assert "/courses" in sitemap.text

            llms = await client.get("/llms.txt")
            assert llms.status_code == 200
            assert "Learn With Maruf Ahmed" in llms.text

            llms_full = await client.get("/llms-full.txt")
            assert llms_full.status_code == 200
            assert "Master Curriculum" in llms_full.text

            print("ALL 11 OWASP, LMS 2.0, JOB/CODELAB & SEO/GEO TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(run_comprehensive_security_audit())
