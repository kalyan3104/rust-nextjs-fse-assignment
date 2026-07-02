import { NextResponse } from "next/server";
import { backend, BackendError } from "@/lib/backend-client";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await backend.getCertificate(params.id);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(`[/api/certificates/${params.id}] unexpected error`, err);
    return NextResponse.json({ error: "upstream request failed" }, { status: 502 });
  }
}
