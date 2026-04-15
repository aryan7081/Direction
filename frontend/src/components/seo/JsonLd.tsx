/**
 * Server-only JSON-LD for search engines (Schema.org).
 * Keep payloads small; split large reference docs into separate files if needed.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
