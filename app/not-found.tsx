import type { Metadata } from "next";

import { Fade } from "@/components/motion/Fade";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Page not found",
};

// §8.8: an h1, one line of explanation, and three routes out. A 404 that only apologises
// leaves the visitor where they were; the job is to recover them.
export default function NotFound() {
  return (
    <Container width="prose">
      <div className="flex flex-col items-start gap-6 py-24">
        {/* The same intro treatment every other route gets — title, then lead, then
            controls. This was the one page in the site with no motion at all, and a 404
            is exactly where a little care is worth spending: it is rare, it is the worst
            moment of someone's visit, and the page's whole job is to make them feel
            recovered rather than dumped. */}
        <SplitText
          as="h1"
          delay={0.1}
          className="font-serif text-display-2 font-semibold text-text"
        >
          Page not found
        </SplitText>
        <Fade delay={0.4}>
          <p className="max-w-measure font-sans text-body-lg text-text-muted">
            That URL does not exist, or it moved. Here is the way back.
          </p>
        </Fade>
        <Fade delay={0.6}>
          <div className="flex flex-wrap gap-3">
            <Button href="/">Home</Button>
            <Button href="/projects" variant="secondary">
              Projects
            </Button>
            <Button href="/contact" variant="secondary">
              Contact
            </Button>
          </div>
        </Fade>
      </div>
    </Container>
  );
}
