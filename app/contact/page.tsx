import type { Metadata } from "next";

import { ContactChannels } from "@/components/contact/ContactChannels";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSite } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch about a role, contract work, or a technical problem. Email, LinkedIn, and GitHub, all direct.",
  path: "/contact",
});

/**
 * §8.7, on its **form-free path**.
 *
 * §18 gives `/contact/` to Phase 4, and three things pulled it forward: §7.1 lists it as a
 * route, Phase 3's exit criterion is that every route in §7.1 is built, and the header
 * CTA, the footer, and every `ContactCallout` on the site link to it. Shipping the phase
 * with the most prominent call to action pointing at a 404 is worse than shipping the
 * page. See docs/DECISIONS.md.
 *
 * This is not a Phase 4 behaviour built early. §8.7 already specifies exactly this state:
 * *"The form renders only when `site.contact.endpoint` exists. Without it, the page shows
 * the direct channels alone."* `content/site.json` has no `endpoint` and will not get one
 * until Phase 4, so the page below is the path the spec already describes.
 *
 * **Phase 4 adds `<ContactForm>` in one place** — the marked slot below — and nothing else
 * on this page moves. The direct channels stay exactly where they are either way, because
 * §8.7 makes the `mailto:` present regardless of form state. If Phase 4 has to restructure
 * this page, this was built wrong.
 */
export default function ContactPage() {
  const site = getSite();

  return (
    <Container width="prose">
      <div className="flex flex-col gap-section py-section md:gap-section-lg md:py-section-lg">
        <div className="flex flex-col gap-4">
          <h1 className="font-serif text-display-2 font-semibold text-text">Contact</h1>
          <p className="max-w-measure font-sans text-body-lg text-text-muted">
            Tell me a little about the product, role, or technical challenge. A few
            sentences about the constraint is enough to start.
          </p>
        </div>

        {/* Phase 4's slot. `site.contact.endpoint` is the switch §8.7 already specifies:
            when it exists, <ContactForm endpoint={...} email={site.email} /> renders here
            and everything below stays put. No placeholder, no "coming soon" (§21) — a
            page either ships finished or it does not ship, and the direct channels are a
            finished way to make contact rather than a stand-in for one. */}

        <section className="flex flex-col gap-heading">
          <SectionHeading
            title="Direct channels"
            lead="These reach me whichever way you prefer."
          />
          <ContactChannels site={site} layout="stack" />
        </section>

        <section className="flex flex-col gap-heading">
          <SectionHeading title="What helps" />
          <ul className="flex max-w-measure list-disc flex-col gap-2 pl-6 font-sans text-body text-text-muted">
            <li>The constraint you are working against, more than the feature list.</li>
            <li>Whether this is a role, a contract, or a question.</li>
            <li>Anything I can read before replying: a repository, a spec, a ticket.</li>
          </ul>
        </section>
      </div>
    </Container>
  );
}
