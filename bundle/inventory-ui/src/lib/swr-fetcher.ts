export async function swrFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `request failed (${res.status})` }));
    throw new Error(body.error ?? `request failed (${res.status})`);
  }
  return (await res.json()) as T;
}
