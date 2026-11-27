import { describe, it, expect } from "vitest";
import {
  cn,
  generateEndpointSlug,
  shouldFail,
  sleep,
} from "@/lib/utils";

describe("generateEndpointSlug", () => {
  it("builds a readable, url-safe slug from a prompt", () => {
    const slug = generateEndpointSlug("List of 10 customized sneakers!!");

    // Words longer than 2 chars, first three, lowercase, joined with "-"
    expect(slug).toMatch(/^list-customized-sneakers-[a-z0-9]{1,8}$/);
  });

  it("strips characters that are invalid in URLs", () => {
    const slug = generateEndpointSlug("Fancy $100 products & special offers");

    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug).not.toContain("$");
    expect(slug).not.toContain("&");
  });

  it("produces unique slugs for identical prompts (random suffix)", () => {
    const slugs = new Set(
      Array.from({ length: 50 }, () =>
        generateEndpointSlug("same prompt every time")
      )
    );

    expect(slugs.size).toBeGreaterThan(40);
  });
});

describe("shouldFail (chaos-mode error injection)", () => {
  it("never fails when errorRate is 0", () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldFail(0)).toBe(false);
    }
  });

  it("always fails when errorRate is 100", () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldFail(100)).toBe(true);
    }
  });

  it("returns a boolean for mid-range rates", () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof shouldFail(50)).toBe("boolean");
    }
  });
});

describe("sleep (chaos-mode latency injection)", () => {
  it("resolves after roughly the requested delay", async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(45);
    expect(elapsed).toBeLessThan(2000);
  });
});

describe("cn (class name helper)", () => {
  it("merges conditional classes", () => {
    expect(cn("a", true && "b", false && "c")).toBe("a b");
  });

  it("lets later tailwind classes win conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
