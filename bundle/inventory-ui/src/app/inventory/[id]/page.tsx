import { notFound } from "next/navigation";
import { CertificateDetail } from "@/components/CertificateDetail";
import { backend, BackendError } from "@/lib/backend-client";

export const dynamic = "force-dynamic";

export default async function CertificateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const cert = await backend.getCertificate(params.id);
    return <CertificateDetail cert={cert} />;
  } catch (err) {
    if (err instanceof BackendError && err.status === 404) {
      notFound();
    }
    throw err;
  }
}
