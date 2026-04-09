import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    message: "HvacPass API is running",
    version: "1.0.0",
  });
}
