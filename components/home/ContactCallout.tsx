import { ContactChannels } from "@/components/contact/ContactChannels";
import { Button } from "@/components/ui/Button";
import type { Site } from "@/lib/schemas";

type ContactCalloutProps = { site: Site };

/**
 * §8.1's seventh section, and §7.4's "no page is a dead end".
 *
 * It lives in `components/home/` because §4's tree puts it there, but three routes render
 * it: the home page, `/projects/[slug]/`, and `/experience/`. That is deliberate rather
 * than accidental — one component means the closing call to action cannot say one thing at
 * the bottom of the home page and something else at the bottom of a project.
 *
 * The channels come from `ContactChannels`, so the callout and `/contact/` itself can
 * never end up listing different ways to make contact.
 */
export function ContactCallout({ site }: ContactCalloutProps) {
  return (
    <section
      aria-labelledby="contact-callout"
      className="flex flex-col gap-heading rounded-none border border-border-subtle bg-surface p-6 md:p-10"
    >
      <div className="flex flex-col gap-4">
        <h2
          id="contact-callout"
          className="max-w-measure font-serif text-heading-1 font-semibold text-text"
        >
          {site.contact.headline}
        </h2>
        <p className="max-w-measure font-sans text-body-lg text-text-muted">
          {site.contact.body}
        </p>
      </div>

      <div className="flex flex-col gap-6 md:gap-10">
        <ContactChannels site={site} />
        {/* The button sits in a flex row so it keeps its intrinsic width. Dropped
            straight into the column above it would stretch to the full card. */}
        <div className="flex flex-wrap gap-3">
          <Button href="/contact">Go to the contact page</Button>
        </div>
      </div>
    </section>
  );
}
