import type { Metadata } from "next";

import { ExperienceTimeline } from "@/components/experience/ExperienceTimeline";
import { ContactCallout } from "@/components/home/ContactCallout";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getExperience, getSite } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { formatMonth } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Experience",
  description:
    "Employment, freelance, research, and independent work in order, with what each role actually involved and what came out of it.",
  path: "/experience",
});

/**
 * §8.4's timeline.
 *
 * Entries arrive from `getExperience()` in file order and are sorted newest first here,
 * because "newest first" is a decision about this page rather than a property of the
 * content — `/experience/` reads as a history, and a résumé that starts in 2017 asks the
 * reader to work backwards.
 *
 * The page ends with the résumé link and the contact callout, per §8.4 and §7.4: no page
 * is a dead end, and the résumé block disappears entirely when `site.resume` is removed.
 */
export default function ExperiencePage() {
  const site = getSite();
  const entries = [...getExperience()].sort((a, b) => b.start.localeCompare(a.start));

  return (
    <Container>
      <div className="flex flex-col gap-section py-section md:gap-section-lg md:py-section-lg">
        <div className="flex flex-col gap-4">
          <h1 className="font-serif text-display-2 font-semibold text-text">
            Experience
          </h1>
          <p className="max-w-measure font-sans text-body-lg text-text-muted">
            Employment, freelance engagements, research, and independent work, in order.
            Each entry says what the work was and what it left behind, and the badge says
            which kind it was.
          </p>
        </div>

        <ExperienceTimeline entries={entries} headingLevel="h2" />

        {site.resume ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <Button href={site.resume.url} external variant="secondary">
                Download résumé
              </Button>
            </div>
            <p className="font-sans text-body-sm text-text-muted">
              PDF, updated {formatMonth(site.resume.updated)}.
            </p>
          </div>
        ) : null}

        <ContactCallout site={site} />
      </div>
    </Container>
  );
}
