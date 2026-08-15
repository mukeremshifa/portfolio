import type { Metadata } from "next";

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
        <h1 className="font-serif text-display-2 font-semibold text-text">
          Page not found
        </h1>
        <p className="max-w-measure font-sans text-body-lg text-text-muted">
          That URL does not exist, or it moved. Here is the way back.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href="/">Home</Button>
          <Button href="/projects/" variant="secondary">
            Projects
          </Button>
          <Button href="/contact/" variant="secondary">
            Contact
          </Button>
        </div>
      </div>
    </Container>
  );
}
