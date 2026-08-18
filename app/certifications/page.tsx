import type { Metadata } from "next";

import { CertificationGrid } from "@/components/certifications/CertificationGrid";
import { Container } from "@/components/ui/Container";
import { getCertifications } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { certificationListJsonLd, jsonLdScript } from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "Certifications",
  description:
    "Credentials with the issuer, the date, and a verification link where one exists. Expired ones stay listed and say so.",
  path: "/certifications",
});

/**
 * §8.6's card grid, newest first.
 *
 * Two things this page does that a credentials page usually does not:
 *
 * - **Expired credentials stay.** They carry an explicit "Expired {date}" badge instead of
 *   being dropped. Dropping them makes the page a claim about today that nobody can check
 *   against yesterday, and §8.6 asks for the badge by name.
 * - **The JSON-LD is a subset of the page.** §13.2 restricts the graph to credentials with
 *   a verifiable URL, so a credential rendered here in prose may legitimately be absent
 *   from the machine-readable list. Prose can be read with judgement; structured data is
 *   an assertion, and asserting something unverifiable is the thing to avoid.
 */
export default function CertificationsPage() {
  const certifications = [...getCertifications()].sort((a, b) =>
    b.issued.localeCompare(a.issued),
  );

  return (
    <Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(certificationListJsonLd(certifications)),
        }}
      />

      <div className="flex flex-col gap-section py-section md:gap-section-lg md:py-section-lg">
        <div className="flex flex-col gap-4">
          <h1 className="font-serif text-display-2 font-semibold text-text">
            Certifications
          </h1>
          <p className="max-w-measure font-sans text-body-lg text-text-muted">
            Credentials with the issuer, the date, and a link to verify where one exists.
            Anything that has lapsed stays on this page and says so.
          </p>
        </div>

        <CertificationGrid certifications={certifications} headingLevel="h2" />
      </div>
    </Container>
  );
}
