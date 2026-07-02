import { NextRequest, NextResponse } from "next/server";
import { backend, BackendError } from "@/lib/backend-client";
import type { CreateCertificateRequest, SortDir, SortField } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  try {
    const data = await backend.listCertificates({
      page: sp.has("page") ? Number(sp.get("page")) : undefined,
      page_size: sp.has("page_size") ? Number(sp.get("page_size")) : undefined,
      subject: sp.get("subject") ?? undefined,
      issuer: sp.get("issuer") ?? undefined,
      expiring_within_days: sp.has("expiring_within_days")
        ? Number(sp.get("expiring_within_days"))
        : undefined,
      sort_by: (sp.get("sort_by") as SortField | null) ?? undefined,
      sort_dir: (sp.get("sort_dir") as SortDir | null) ?? undefined,
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/certificates] unexpected error", err);
    return NextResponse.json({ error: "upstream request failed" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as CreateCertificateRequest;
    const data = await backend.createCertificate(payload);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/certificates] unexpected error", err);
    return NextResponse.json({ error: "upstream request failed" }, { status: 502 });
  }
}
