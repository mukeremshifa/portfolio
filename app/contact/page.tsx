import type { Metadata } from "next";

import { ContactChannels } from "@/components/contact/ContactChannels";
import { Fade } from "@/components/motion/Fade";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { BulletList } from "@/components/ui/BulletList";
import { SectionRail, type RailSection } from "@/components/layout/SectionRail";
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

  // Built here rather than as a module constant, because the form section is conditional
  // (§8.7's switch, below) and a rail stop pointing at an element that was not rendered
  // is a dead link. With no endpoint the page has three stops, which is exactly the
  // minimum the rail draws itself for.
  const sections: RailSection[] = [
    { id: "intro", label: "Contact" },
    ...(site.contact.endpoint ? [{ id: "form", label: "Send a message" }] : []),
    { id: "channels", label: "Direct channels" },
    { id: "what-helps", label: "What helps" },
  ];

  return (
    <Container width="prose">
      <div className="flex flex-col gap-section py-section md:gap-section-lg md:py-section-lg">
        <div id="intro" data-rail-section className="flex flex-col gap-4">
          <SplitText
            as="h1"
            className="font-serif text-display-2 font-semibold text-text"
          >
            Contact
          </SplitText>
          <Fade delay={0.35}>
            <p className="max-w-measure font-sans text-body-lg text-text-muted">
              Tell me a little about the product, role, or technical challenge. A few
              sentences about the constraint is enough to start.
            </p>
          </Fade>
        </div>

        {/* §8.7's switch, now live. With no `endpoint` the page is exactly what it was
            in Phase 3 — the direct channels alone, which is a finished way to make
            contact rather than a stand-in for one. Nothing below this line moved when the
            form arrived, which is what the Phase 3 note predicted. */}
        {site.contact.endpoint ? (
          <div id="form" data-rail-section>
            {/* Wrapped here rather than inside `ContactForm`, which owns five pieces of
                state and should not also own an entrance. The form arrives as one block:
                staggering its fields would animate a sequence the reader is about to
                fill in top to bottom anyway, and a field that is still moving when the
                cursor lands in it is a field fighting its user. */}
            <Reveal>
              <ContactForm endpoint={site.contact.endpoint} email={site.email} />
            </Reveal>
          </div>
        ) : null}

        <section id="channels" data-rail-section className="flex flex-col gap-heading">
          <Reveal className="flex flex-col gap-heading">
            <SectionHeading
              title="Direct channels"
              lead="These reach me whichever way you prefer."
            />
            <ContactChannels site={site} layout="stack" />
          </Reveal>
        </section>

        <section id="what-helps" data-rail-section className="flex flex-col gap-heading">
          <Reveal className="flex flex-col gap-heading">
            <SectionHeading title="What helps" />
            {/* The square, like every other list of peers on the site. This briefly took the
                chevron on the argument that the items ask something of the reader rather than
                record something done — true, and not worth a second marker: three stacked
                chevrons under a heading are the shape of a collapsed accordion, and a reader
                who tries to click one has been told something false about the page. Three
                items that are peers of one another get the peer marker. */}
            <BulletList
              items={[
                "The constraint you are working against, more than the feature list.",
                "Whether this is a role, a contract, or a question.",
                "Anything I can read before replying: a repository, a spec, a ticket.",
              ]}
              tone="muted"
            />
          </Reveal>
        </section>
      </div>

      <SectionRail sections={sections} />
    </Container>
  );
}
