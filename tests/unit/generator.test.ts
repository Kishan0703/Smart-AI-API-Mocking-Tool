import { describe, it, expect } from "vitest";
import {
  generateContextAwareData,
  generateSchema,
} from "@/lib/generator";

describe("generateContextAwareData (local faker fallback)", () => {
  it("generates the requested number of items for a collection prompt", () => {
    const data = generateContextAwareData(
      "I need a list of 3 users with name and email"
    );

    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(3);

    for (const item of data as Record<string, unknown>[]) {
      expect(item).toHaveProperty("id");
      expect(typeof item.email).toBe("string");
      expect(item.email).toContain("@");
    }
  });

  it("enriches user entities with sensible context fields", () => {
    const data = generateContextAwareData("list of 2 users") as Record<
      string,
      unknown
    >[];

    expect(data[0]).toHaveProperty("firstName");
    expect(data[0]).toHaveProperty("lastName");
    expect(data[0]).toHaveProperty("createdAt");
  });

  it("defaults to 10 items when no count is specified", () => {
    const data = generateContextAwareData("products with price and rating");

    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(10);
    for (const item of data as Record<string, unknown>[]) {
      expect(item).toHaveProperty("id");
    }
  });

  it("never generates real-looking passwords for password fields", () => {
    const data = generateContextAwareData(
      "users with password and email"
    ) as Record<string, unknown>[];

    for (const item of data) {
      expect(item.password).toBe("********");
    }
  });
});

describe("generateSchema (JSON schema inference)", () => {
  it("describes arrays with an item schema", () => {
    const schema = generateSchema([{ id: 1, active: true }]);

    expect(schema).toEqual({
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          active: { type: "boolean" },
        },
      },
    });
  });

  it("distinguishes integers from floating point numbers", () => {
    const schema = generateSchema({ count: 5, price: 19.99 }) as {
      properties: Record<string, { type: string }>;
    };

    expect(schema.properties.count.type).toBe("integer");
    expect(schema.properties.price.type).toBe("number");
  });

  it("handles all JSON primitive types", () => {
    const schema = generateSchema({
      s: "text",
      b: false,
      n: null,
    }) as { properties: Record<string, { type: string }> };

    expect(schema.properties.s.type).toBe("string");
    expect(schema.properties.b.type).toBe("boolean");
    expect(schema.properties.n.type).toBe("null");
  });

  it("recurses into nested objects", () => {
    const schema = generateSchema({ user: { name: "dev" } }) as {
      properties: { user: { type: string; properties: unknown } };
    };

    expect(schema.properties.user.type).toBe("object");
    expect(schema.properties.user.properties).toEqual({
      name: { type: "string" },
    });
  });

  it("returns an empty item schema for empty arrays", () => {
    expect(generateSchema([])).toEqual({ type: "array", items: {} });
  });
});
