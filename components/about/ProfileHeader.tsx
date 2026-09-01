import Image from "next/image";

import type { Site } from "@/lib/schemas";

type ProfileHeaderProps = { site: Site };

/**
 * `/about/`'s opening block: the avatar, the greeting, the passage, and the facts that do
 * not fit in a sentence.
 *
 * **The avatar is `site.avatar`, not `site.portrait`.** They are two crops of one
 * photograph and the difference matters here: `portrait` is 3:4 for the hero, and putting
 * a 3:4 image behind `rounded-full` crops the top of a head off. Absent `avatar`, this
 * collapses to a single column rather than reserving a circle for nothing — the same
 * behaviour §8.1 asks of the hero, for the same reason.
 *
 * `priority` because this is the largest element above the fold on the page and the only
 * candidate for its LCP.
 *
 * The facts render as a `<dl>`, which is what they are: term and value. §5.4's refusal of
 * proficiency scales applies to the languages too — `level` is whatever the content says
 * and is omitted entirely when it says nothing, so a language with no stated level reads
 * as a language rather than as a blank.
 */
export function ProfileHeader({ site }: ProfileHeaderProps) {
  const languages = site.languages
    .map((language) =>
      language.level ? `${language.name} (${language.level})` : language.name,
    )
    .join(", ");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        {site.avatar ? (
          <Image
            src={site.avatar.src}
            alt={site.avatar.alt}
            width={site.avatar.width}
            height={site.avatar.height}
            priority
            className="size-32 shrink-0 rounded-full border border-border-subtle object-cover md:size-40"
          />
        ) : null}

        <h1 className="font-serif text-display-2 font-semibold text-text">
          Hi, I&rsquo;m {site.name.split(" ")[0]}
        </h1>
      </div>

      <p className="max-w-measure font-sans text-body-lg text-text-muted">{site.bio}</p>

      {/* `items-baseline`, not the grid default of `stretch`. The term is `text-eyebrow`
          (0.75rem/1.4) and the value is `text-body` (1rem/1.7), so their line boxes are
          different heights — stretched, each sits at the top of its own box and the labels
          float above the values they belong to. Baseline alignment is what makes two type
          sizes sit on one line, and it derives the offset from the fonts rather than from a
          number someone picked. */}
      <dl className="flex flex-col gap-4 border-t border-border-subtle pt-6 sm:grid sm:grid-cols-[max-content_1fr] sm:items-baseline sm:gap-x-8 sm:gap-y-3">
        {/* Location only, and now the only shape `location` has: `remote` was deleted on
            2026-08-31. It was a claim about working arrangements, and this row answers
            "where are they" — one line saying two things that change independently is
            what put the boolean here in the first place. `availability` is where a
            working-arrangement claim belongs. */}
        <dt className="font-mono text-eyebrow text-text-muted uppercase">Based in</dt>
        <dd className="font-sans text-body text-text">{site.location.label}</dd>

        <dt className="font-mono text-eyebrow text-text-muted uppercase">Languages</dt>
        <dd className="font-sans text-body text-text">{languages}</dd>

        <dt className="font-mono text-eyebrow text-text-muted uppercase">Email</dt>
        <dd className="font-sans text-body text-text">
          <a
            href={`mailto:${site.email}`}
            className="text-brand underline decoration-1 underline-offset-[3px] transition-colors duration-(--duration-fast) ease-out hover:text-brand-hover"
          >
            {site.email}
          </a>
        </dd>

        {/* Gated on the same flag as the hero badge, deliberately. Two switches for one
            claim is how a site ends up open to work in one place and quiet in another. */}
        {site.availability.show ? (
          <>
            <dt className="font-mono text-eyebrow text-text-muted uppercase">
              Availability
            </dt>
            <dd className="font-sans text-body text-text">{site.availability.label}</dd>
          </>
        ) : null}
      </dl>
    </div>
  );
}
