#!/usr/bin/env node
/**
 * Offline end-to-end smoke test for MockMaster.
 *
 * Boots expectations against a RUNNING production server (default
 * http://localhost:3000) and exercises every critical API path using the
 * deterministic faker fallback — no API key or internet access required.
 *
 * Used by CI after `next build` and against the published Docker image
 * ("test what you ship"). Run locally with:  npm run smoke
 *
 * Exit code 0 = all checks passed, 1 = at least one failure.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const BOOT_TIMEOUT_MS = 60_000;
const REQUEST_TIMEOUT_MS = 10_000;

let passed = 0;
const failures = [];

function check(name, ok, detail = "") {
  const line = `${ok ? "  ✓" : "  ✗"} ${name}${detail && !ok ? ` — ${detail}` : ""}`;
  console.log(line);
  if (ok) passed++;
  else failures.push({ name, detail });
}

async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    let json = null;
    try {
      json = await res.json();
    } catch {
      /* non-JSON response */
    }
    return { status: res.status, body: json };
  } finally {
    clearTimeout(timer);
  }
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < BOOT_TIMEOUT_MS) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return;
    } catch {
      /* server not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    `Server did not become healthy within ${BOOT_TIMEOUT_MS / 1000}s at ${BASE_URL}`
  );
}

async function main() {
  console.log(`\nSmoke test against ${BASE_URL}\n`);

  try {
    await waitForServer();
  } catch (err) {
    console.error(`  ✗ server unreachable — ${err.message}`);
    process.exit(1);
  }

  // 1. Health probe (used by Docker HEALTHCHECK too)
  const health = await request("GET", "/api/health");
  check(
    "GET /api/health → 200 with status ok",
    health.status === 200 && health.body?.status === "ok",
    `got ${health.status} ${JSON.stringify(health.body)}`
  );

  // 2. Generate a mock endpoint (faker fallback — no GEMINI key needed)
  const generated = await request("POST", "/api/generate", {
    prompt: "I need a list of 3 users with name and email",
  });
  check(
    "POST /api/generate → 200 with endpoint",
    generated.status === 200 &&
      generated.body?.success === true &&
      typeof generated.body?.endpoint?.slug === "string" &&
      !!generated.body?.endpoint?.id,
    `got ${generated.status} ${JSON.stringify(generated.body)?.slice(0, 200)}`
  );

  const endpoint = generated.body?.endpoint;
  if (!endpoint) {
    console.error("\nCannot continue without a generated endpoint.");
    process.exit(1);
  }

  // 3. The endpoint appears in the listing
  const list = await request("GET", "/api/endpoints");
  check(
    "GET /api/endpoints → contains the new endpoint",
    list.status === 200 &&
      Array.isArray(list.body?.endpoints) &&
      list.body.endpoints.some((ep) => ep.slug === endpoint.slug),
    `got ${list.status}`
  );

  // 4. The mock endpoint serves data (core feature)
  const mockGet = await request("GET", `/api/mock/${endpoint.slug}`);
  check(
    `GET /api/mock/${endpoint.slug} → 200 with data`,
    mockGet.status === 200 && mockGet.body?.success === true,
    `got ${mockGet.status}`
  );

  // 5. CRUD simulation on the mock endpoint
  const mockPost = await request("POST", `/api/mock/${endpoint.slug}`, {
    name: "created via smoke test",
  });
  check(
    "POST /api/mock/[slug] → 200 (simulated create)",
    mockPost.status === 200 && mockPost.body?.data?.createdAt,
    `got ${mockPost.status}`
  );

  const mockPut = await request("PUT", `/api/mock/${endpoint.slug}`, {
    name: "updated via smoke test",
  });
  check(
    "PUT /api/mock/[slug] → 200 (simulated update)",
    mockPut.status === 200 && mockPut.body?.success === true,
    `got ${mockPut.status}`
  );

  const mockDelete = await request("DELETE", `/api/mock/${endpoint.slug}`);
  check(
    "DELETE /api/mock/[slug] → 200 (simulated delete)",
    mockDelete.status === 200 && mockDelete.body?.success === true,
    `got ${mockDelete.status}`
  );

  // 6. Unknown slugs are a clean 404, not a 500
  const notFound = await request("GET", "/api/mock/this-slug-never-exists");
  check(
    "GET /api/mock/unknown-slug → 404",
    notFound.status === 404,
    `got ${notFound.status}`
  );

  // 7. Input validation on the key tester (offline — rejected before any
  //    external call)
  const badService = await request("POST", "/api/test-api-key", {
    service: "not-a-service",
    apiKey: "sk-invalid-key-format",
  });
  check(
    "POST /api/test-api-key with unknown service → 400",
    badService.status === 400,
    `got ${badService.status}`
  );

  // 8. Sync round-trip
  const sync = await request("POST", "/api/sync", { endpoints: [] });
  check(
    "POST /api/sync → 200",
    sync.status === 200 && sync.body?.success === true,
    `got ${sync.status}`
  );

  // 9. Cleanup: delete via the CRUD API so reruns start clean
  const cleanup = await request("DELETE", `/api/endpoints/${endpoint.id}`);
  check(
    "DELETE /api/endpoints/[id] → 200 (cleanup)",
    cleanup.status === 200 && cleanup.body?.success === true,
    `got ${cleanup.status}`
  );

  const afterList = await request("GET", "/api/endpoints");
  check(
    "GET /api/endpoints → endpoint removed",
    Array.isArray(afterList.body?.endpoints) &&
      !afterList.body.endpoints.some((ep) => ep.id === endpoint.id),
    `got ${afterList.status}`
  );

  console.log(
    `\nResult: ${passed} passed, ${failures.length} failed, ${passed + failures.length} total\n`
  );

  if (failures.length > 0) {
    console.error("Failures:");
    for (const f of failures) console.error(`  - ${f.name}${f.detail ? ` (${f.detail})` : ""}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(`\nSmoke test crashed: ${err.message}`);
  process.exit(1);
});
