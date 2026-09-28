import { NextResponse } from "next/server";
import { resetDb } from "@/server/db";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  resetDb();
  return NextResponse.json({ ok: true });
}
