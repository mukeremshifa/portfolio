import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Site } from "@/lib/schemas";

type ContactChannelsProps = {
  site: Site;
  /**
   * `row` for the callout, where the channels sit beside each other under a paragraph.
   * `stack` for `/contact/`, where each channel is a line with room to breathe. Same
   * links, same order, different rhythm.
   */
  layout?: "row" | "stack";
};

/**
 * The direct channels: the email address, then whatever is in `site.socials`.
 *
 * §8.7 makes the `mailto:` link "always present regardless of form state", which is the
 * clause that lets `/contact/` ship in Phase 3 without the form. §8.1 asks the callout for
 * the same three channels. One component, so the two can never drift into showing
 * different things.
 *
 * The socials are rendered from the array rather than from three named branches, so
 * adding an `x` entry to `content/site.json` is a content change and nothing else — which
 * is the row of the swap matrix this component exists to satisfy.
 */
export function ContactChannels({ site, layout = "row" }: ContactChannelsProps) {
  return (
    <ul
      className={
        layout === "row"
          ? "flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-body"
          : "flex flex-col gap-3 font-sans text-body"
      }
    >
      <li>
        {/* Not `ExternalLink`: a `mailto:` does not open a tab, so the "(opens in a new
            tab)" suffix that component always adds would be a lie. */}
        <a
          href={`mailto:${site.email}`}
          className="text-brand underline decoration-1 underline-offset-[3px] transition-[text-decoration-thickness,color] duration-(--duration-fast) ease-out hover:text-brand-hover hover:decoration-2"
        >
          {site.email}
        </a>
      </li>
      {site.socials.map((social) => (
        <li key={social.url}>
          <ExternalLink href={social.url}>
            {social.label} <span aria-hidden="true">&#8599;</span>
          </ExternalLink>
        </li>
      ))}
    </ul>
  );
}
