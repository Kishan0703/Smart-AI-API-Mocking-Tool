import { describe, it, expect } from "vitest";

/**
 * Live integration tests for the Gemini-powered generation path.
 *
 * These are deliberately opt-in: they need a real GEMINI_API_KEY and a
 * running server, so they only execute when RUN_GEMINI_INTEGRATION=1.
 * Day-to-day CI runs the offline faker path instead (see
 * scripts/smoke-test.mjs) to stay fast, deterministic and free.
 */
const RUN = process.env.RUN_GEMINI_INTEGRATION === "1";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const API_KEY = process.env.GEMINI_API_KEY;
const describeIntegration = RUN && API_KEY ? describe : describe.skip;

describeIntegration("AI generation via Gemini (live API)", () => {
  it(
    "generates a working mock endpoint from a natural-language prompt",
    async () => {
      const res = await fetch(`${BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Create a list of 3 users with name and email",
          // Explicit user key: the route then *fails hard* on Gemini
          // errors instead of silently falling back to faker, so a 200
          // here proves the real AI path worked.
          apiKey: API_KEY,
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(typeof body.endpoint?.slug).toBe("string");
      expect(body.endpoint?.data).toBeTruthy();

      // The freshly generated endpoint must serve mock data immediately.
      const mockRes = await fetch(`${BASE_URL}/api/mock/${body.endpoint.slug}`);
      expect(mockRes.status).toBe(200);
      const mockBody = await mockRes.json();
      expect(mockBody.success).toBe(true);
      expect(mockBody.data).toBeTruthy();
    },
    120_000
  );

  it(
    "validates a working Gemini key through the API key tester",
    async () => {
      const res = await fetch(`${BASE_URL}/api/test-api-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: "gemini", apiKey: API_KEY }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.valid).toBe(true);
    },
    120_000
  );
});
