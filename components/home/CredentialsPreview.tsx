import { CertificationGrid } from "@/components/certifications/CertificationGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Certification } from "@/lib/schemas";

type CredentialsPreviewProps = { certifications: Certification[] };

/**
 * §8.1's sixth section: up to four featured certifications, linking to
 * `/skills/`.
 *
 * The section is not rendered at all when nothing is featured. An owner with no
 * credentials should get a home page with six sections, not a seventh one announcing that
 * they have none.
 */
export function CredentialsPreview({ certifications }: CredentialsPreviewProps) {
  if (certifications.length === 0) return null;

  return (
    <section className="flex flex-col gap-heading">
      <SectionHeading
        title="Credentials"
        action={{ href: "/skills", label: "All credentials →" }}
      />
      <CertificationGrid certifications={certifications} />
    </section>
  );
}
