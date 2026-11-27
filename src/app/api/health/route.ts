import { NextResponse } from "next/server";

// Liveness/readiness probe used by the Docker HEALTHCHECK,
// the CI smoke tests and load balancers / orchestrators.
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "mockmaster",
      version: process.env.npm_package_version ?? "0.1.0",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
