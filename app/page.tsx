import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { getSite } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";

// §17.1 wants metadata and a canonical URL on every finished page, and §16.4 leaves
// NEXT_PUBLIC_SITE_URL unset on previews, so production is the only place the home
// route's canonical is ever exercised for real. Phase 3 replaces the copy below; the
// canonical is here now so the Phase 2 promotion can verify it.
export const metadata: Metadata = buildMetadata({
  title: getSite().seo.title,
  description: getSite().seo.description,
  path: "/",
});

// Phase 1 builds the design system and the shell, not the home page — §8.1 is Phase 3's
// job and the real copy is Phase 5's. This is a holding page that exercises the shell
// while the routes around it are still empty.
export default function Home() {
  return (
    <Container width="prose">
      <div className="flex flex-col items-start gap-6 py-24">
        <p className="font-mono text-eyebrow text-text-muted uppercase">Phase 1</p>
        <h1 className="font-serif text-display-1 font-semibold text-text">
          Design system and application shell
        </h1>
        <Prose>
          <p>
            The tokens, the type scale, the theme mechanics, and the shell are in place.
            The pages that sit inside them are not — §8.1 is Phase 3, and the copy that
            fills it is Phase 5.
          </p>
        </Prose>
        <Button href="/dev/primitives">See the primitives</Button>
      </div>
    </Container>
  );
}
