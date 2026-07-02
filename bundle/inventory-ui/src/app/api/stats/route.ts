import { NextResponse } from "next/server";
import { backend, BackendError } from "@/lib/backend-client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await backend.getStats();
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/stats] unexpected error", err);
    return NextResponse.json({ error: "upstream request failed" }, { status: 502 });
  }
}
