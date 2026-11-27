import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { MockEndpoint } from "@/lib/types";

// MOCK_DATA_DIR must be set before the storage module is imported —
// the data file location is resolved once, at module load.
const dataDir = mkdtempSync(join(tmpdir(), "mockmaster-storage-"));
process.env.MOCK_DATA_DIR = dataDir;

const { mockStorage } = await import("@/lib/storage");

function makeEndpoint(overrides: Partial<MockEndpoint> = {}): MockEndpoint {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? crypto.randomUUID(),
    slug: overrides.slug ?? `test-${Math.random().toString(36).slice(2, 8)}`,
    name: overrides.name ?? "Test endpoint",
    prompt: overrides.prompt ?? "test prompt",
    schema: overrides.schema ?? {},
    data: overrides.data ?? [{ id: 1 }],
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    settings: overrides.settings ?? {
      latency: 0,
      errorRate: 0,
      errorType: "500",
      supportedMethods: ["GET"],
      customHeaders: {},
    },
  };
}

beforeAll(() => {
  expect(existsSync(dataDir)).toBe(true);
});

afterAll(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

beforeEach(() => {
  mockStorage.clear();
});

describe("MockStorage (file-backed endpoint store)", () => {
  it("creates and retrieves endpoints by id", () => {
    const endpoint = makeEndpoint();
    mockStorage.create(endpoint);

    expect(mockStorage.getById(endpoint.id)).toEqual(endpoint);
    expect(mockStorage.getById("does-not-exist")).toBeUndefined();
  });

  it("retrieves endpoints by slug", () => {
    const endpoint = makeEndpoint({ slug: "my-sneakers" });
    mockStorage.create(endpoint);

    expect(mockStorage.getBySlug("my-sneakers")?.id).toBe(endpoint.id);
    expect(mockStorage.getBySlug("unknown-slug")).toBeUndefined();
  });

  it("lists endpoints newest-first", () => {
    const older = makeEndpoint({
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    const newer = makeEndpoint({
      createdAt: "2025-06-01T00:00:00.000Z",
      updatedAt: "2025-06-01T00:00:00.000Z",
    });
    mockStorage.create(older);
    mockStorage.create(newer);

    const all = mockStorage.getAll();

    expect(all).toHaveLength(2);
    expect(all[0].id).toBe(newer.id);
    expect(all[1].id).toBe(older.id);
  });

  it("updates endpoints and bumps updatedAt", async () => {
    const endpoint = makeEndpoint();
    mockStorage.create(endpoint);
    await new Promise((r) => setTimeout(r, 5)); // ensure timestamp differs

    const updated = mockStorage.update(endpoint.id, { name: "Renamed" });

    expect(updated?.name).toBe("Renamed");
    expect(updated?.updatedAt).not.toBe(endpoint.updatedAt);
    expect(mockStorage.getById(endpoint.id)?.name).toBe("Renamed");
    expect(mockStorage.update("missing", { name: "x" })).toBeUndefined();
  });

  it("deletes endpoints", () => {
    const endpoint = makeEndpoint();
    mockStorage.create(endpoint);

    expect(mockStorage.delete(endpoint.id)).toBe(true);
    expect(mockStorage.delete(endpoint.id)).toBe(false);
    expect(mockStorage.getById(endpoint.id)).toBeUndefined();
  });

  it("persists data to disk so it survives restarts", async () => {
    const endpoint = makeEndpoint({ slug: "persist-me" });
    mockStorage.create(endpoint);

    // Simulate a server restart: fresh module instance, same data dir.
    vi.resetModules();
    const { mockStorage: freshStorage } = await import("@/lib/storage");

    expect(freshStorage.getBySlug("persist-me")?.id).toBe(endpoint.id);
  });
});
