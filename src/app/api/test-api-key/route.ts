import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiting (resets on server restart)
// In production, use Redis or a proper rate limiting solution
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 tests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const REQUEST_TIMEOUT = 10000; // 10 seconds

type SupportedService = "openai" | "anthropic" | "gemini" | "stripe" | "github";

interface TestResult {
  valid: boolean;
  status: number;
  responseTime: number;
  error?: string;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

function checkRateLimit(clientIP: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function testOpenAI(apiKey: string): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await fetchWithTimeout(
      "https://api.openai.com/v1/models",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
      REQUEST_TIMEOUT
    );

    const responseTime = Date.now() - startTime;
    const valid = response.status === 200;

    if (!valid) {
      const data = await response.json().catch(() => ({}));
      return {
        valid: false,
        status: response.status,
        responseTime,
        error: data.error?.message || `HTTP ${response.status}`,
      };
    }

    return { valid: true, status: response.status, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    if (error instanceof Error && error.name === "AbortError") {
      return { valid: false, status: 0, responseTime, error: "Request timed out" };
    }
    return {
      valid: false,
      status: 0,
      responseTime,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function testAnthropic(apiKey: string): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await fetchWithTimeout(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "Hi" }],
        }),
      },
      REQUEST_TIMEOUT
    );

    const responseTime = Date.now() - startTime;
    
    // 200 = success, 401 = invalid key, other errors might still indicate valid key
    if (response.status === 200) {
      return { valid: true, status: response.status, responseTime };
    }
    
    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));
      return {
        valid: false,
        status: response.status,
        responseTime,
        error: data.error?.message || "Invalid API key",
      };
    }

    // Other status codes (rate limit, etc.) might still mean the key is valid
    const data = await response.json().catch(() => ({}));
    if (response.status === 429 || response.status === 400) {
      // Rate limited or bad request but key might be valid
      return {
        valid: true,
        status: response.status,
        responseTime,
        error: data.error?.message || `API responded with ${response.status}`,
      };
    }

    return {
      valid: false,
      status: response.status,
      responseTime,
      error: data.error?.message || `HTTP ${response.status}`,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    if (error instanceof Error && error.name === "AbortError") {
      return { valid: false, status: 0, responseTime, error: "Request timed out" };
    }
    return {
      valid: false,
      status: 0,
      responseTime,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function testGemini(apiKey: string): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      { method: "GET" },
      REQUEST_TIMEOUT
    );

    const responseTime = Date.now() - startTime;
    const valid = response.status === 200;

    if (!valid) {
      const data = await response.json().catch(() => ({}));
      return {
        valid: false,
        status: response.status,
        responseTime,
        error: data.error?.message || `HTTP ${response.status}`,
      };
    }

    return { valid: true, status: response.status, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    if (error instanceof Error && error.name === "AbortError") {
      return { valid: false, status: 0, responseTime, error: "Request timed out" };
    }
    return {
      valid: false,
      status: 0,
      responseTime,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function testStripe(apiKey: string): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await fetchWithTimeout(
      "https://api.stripe.com/v1/balance",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
      REQUEST_TIMEOUT
    );

    const responseTime = Date.now() - startTime;
    const valid = response.status === 200;

    if (!valid) {
      const data = await response.json().catch(() => ({}));
      return {
        valid: false,
        status: response.status,
        responseTime,
        error: data.error?.message || `HTTP ${response.status}`,
      };
    }

    return { valid: true, status: response.status, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    if (error instanceof Error && error.name === "AbortError") {
      return { valid: false, status: 0, responseTime, error: "Request timed out" };
    }
    return {
      valid: false,
      status: 0,
      responseTime,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function testGitHub(apiKey: string): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await fetchWithTimeout(
      "https://api.github.com/user",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "MockMaster-API-Tester",
        },
      },
      REQUEST_TIMEOUT
    );

    const responseTime = Date.now() - startTime;
    const valid = response.status === 200;

    if (!valid) {
      const data = await response.json().catch(() => ({}));
      return {
        valid: false,
        status: response.status,
        responseTime,
        error: data.message || `HTTP ${response.status}`,
      };
    }

    return { valid: true, status: response.status, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    if (error instanceof Error && error.name === "AbortError") {
      return { valid: false, status: 0, responseTime, error: "Request timed out" };
    }
    return {
      valid: false,
      status: 0,
      responseTime,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const { allowed, remaining } = checkRateLimit(clientIP);

    if (!allowed) {
      return NextResponse.json(
        {
          valid: false,
          status: 429,
          responseTime: 0,
          error: "Rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(
              Math.ceil((rateLimitMap.get(clientIP)?.resetTime || 0) / 1000)
            ),
          },
        }
      );
    }

    const body = await request.json();
    const { service, apiKey } = body;

    // Validate input
    if (!service || !apiKey) {
      return NextResponse.json(
        { valid: false, status: 400, responseTime: 0, error: "Service and API key are required" },
        { status: 400 }
      );
    }

    if (typeof apiKey !== "string" || apiKey.length < 10) {
      return NextResponse.json(
        { valid: false, status: 400, responseTime: 0, error: "Invalid API key format" },
        { status: 400 }
      );
    }

    const validServices: SupportedService[] = ["openai", "anthropic", "gemini", "stripe", "github"];
    if (!validServices.includes(service)) {
      return NextResponse.json(
        { valid: false, status: 400, responseTime: 0, error: "Unsupported service" },
        { status: 400 }
      );
    }

    // Test the API key based on service
    let result: TestResult;

    switch (service as SupportedService) {
      case "openai":
        result = await testOpenAI(apiKey);
        break;
      case "anthropic":
        result = await testAnthropic(apiKey);
        break;
      case "gemini":
        result = await testGemini(apiKey);
        break;
      case "stripe":
        result = await testStripe(apiKey);
        break;
      case "github":
        result = await testGitHub(apiKey);
        break;
      default:
        result = { valid: false, status: 400, responseTime: 0, error: "Unsupported service" };
    }

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (error) {
    // Never log the API key - only log safe error info
    console.error("API key test error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { valid: false, status: 500, responseTime: 0, error: "Internal server error" },
      { status: 500 }
    );
  }
}
