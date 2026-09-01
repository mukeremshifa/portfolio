import { NextResponse } from "next/server";

import {
  ContactPayloadSchema,
  MAX_DWELL_MS,
  messageFor,
  MIN_DWELL_MS,
  type ContactFieldName,
  type ContactResponse,
} from "@/lib/contact";

/**
 * §14's contact endpoint, as a Next route handler rather than a Cloudflare Worker.
 *
 * **This is a deviation from §2 and §14, chosen deliberately** — see the 2026-09-01 entry
 * in `docs/DECISIONS.md`. The short version: same-origin removes §14.1's CORS allowlist
 * and the second toolchain, at the cost of §14.2's rate limit, which a stateless function
 * cannot hold without an external store.
 *
 * `lib/contact.ts` is still the shared contract. This file validates against exactly the
 * schema the client validates against, which is what keeps the two ends honest.
 *
 * **Never logs a message body or an email address** (§14.3). Outcome codes only.
 */

// The submission is read, validated, and sent. Nothing is stored, so there is nothing to
// cache; `force-dynamic` also stops a build-time evaluation of this route.
export const dynamic = "force-dynamic";

/** §14.2 item 1: a body big enough to be abuse is rejected before it is parsed. */
const MAX_BODY_BYTES = 16_000;

function json(body: ContactResponse, status: number) {
  // Every path returns JSON, including failures. The client reads `response.json()` and
  // treats a throw as a hard failure, so an empty or HTML error body would cost it the
  // specific message it would otherwise show.
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  // §14.2 item 1. `content-type` must be JSON; anything else is not this form.
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return json({ ok: false, error: "server" }, 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "server" }, 413);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return json({ ok: false, error: "server" }, 400);
  }

  // `content-length` is a claim, not a fact. Check the body actually read as well.
  if (raw.length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "server" }, 413);
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "server" }, 400);
  }

  // §14.2 item 3, against the same schema the browser used.
  const result = ContactPayloadSchema.safeParse(parsedBody);
  if (!result.success) {
    const fields: Partial<Record<ContactFieldName, string>> = {};

    for (const issue of result.error.issues) {
      const key = issue.path[0];

      // A failed honeypot arrives here as a `company` issue. It must not become a visible
      // field error, and it must not be distinguishable from success — see below.
      if (key === "company") return json({ ok: true }, 200);

      if (key === "name" || key === "email" || key === "message") {
        // `messageFor`, not `issue.message`. The client renders these verbatim under the
        // inputs, and Zod's own text ("Too small: expected string to have >=2
        // characters") is not the register anything else on this site is written in.
        const submitted = (parsedBody as Record<string, unknown>)?.[key];
        fields[key] ??= messageFor(key, typeof submitted === "string" ? submitted : "");
      }
    }

    // Nothing renderable failed, so this is a malformed payload rather than a bad form.
    if (Object.keys(fields).length === 0) {
      return json({ ok: false, error: "server" }, 400);
    }

    console.info("[contact] rejected: validation");
    return json({ ok: false, error: "validation", fields }, 400);
  }

  const payload = result.data;

  /**
   * §14.2 item 4, the time trap.
   *
   * **Both traps answer 200.** Telling a bot which check caught it is how the next
   * version gets past that check, and a person who somehow trips this (a tab left open
   * for an hour) sees the success message rather than an error they cannot act on. The
   * cost is real and worth naming: a genuine message lost to a stale tab is silently
   * dropped. The 30-minute ceiling is generous enough that this should be rare.
   */
  const dwell = Date.now() - payload.renderedAt;
  if (dwell < MIN_DWELL_MS || dwell > MAX_DWELL_MS) {
    console.info("[contact] rejected: dwell");
    return json({ ok: true }, 200);
  }

  /**
   * §14.2 item 5 is **not implemented**, and that is a recorded gap rather than an
   * oversight — a Vercel function holds no state between invocations, so a per-IP counter
   * needs an external store (Upstash, Vercel KV) that the owner chose not to add on
   * 2026-09-01. The honeypot and the time trap above are the spam defence.
   *
   * The seam is here. A limiter returns a retry window and this returns:
   *   return json({ ok: false, error: "rate_limit", retryAfter: seconds }, 429);
   * The client already renders that path in full, so adding a store is this file only.
   */

  const sent = await sendEmail(payload);
  if (!sent) {
    // §14.3: the provider's failure is logged, its response body is not, and neither is
    // anything the sender wrote.
    console.error("[contact] provider failure");
    return json({ ok: false, error: "server" }, 502);
  }

  console.info("[contact] delivered");
  return json({ ok: true }, 200);
}

/**
 * §14.3's single provider seam. Swapping Resend for anything else is this function.
 *
 * Returns a boolean rather than throwing: the caller's only decision is 502 or not, and
 * the provider's error text must not travel any further than this scope.
 */
async function sendEmail(payload: {
  name: string;
  email: string;
  message: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    // Missing configuration is a deployment fault, not a visitor's. It reads as a 502 so
    // the form shows the direct address, which still reaches a person.
    console.error("[contact] missing provider configuration");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // The whole point of the noreply/Reply-To split: hitting reply in the inbox
        // answers the person who filled in the form.
        reply_to: payload.email,
        subject: `Portfolio contact: ${payload.name}`,
        // Plain text. Nothing here needs HTML, and it is one less injection surface.
        text: `${payload.message}\n\n---\nFrom: ${payload.name} <${payload.email}>`,
      }),
    });

    if (!response.ok) {
      // Status only. The body can echo the address and the message.
      console.error(`[contact] provider status ${response.status}`);
      return false;
    }

    return true;
  } catch {
    console.error("[contact] provider unreachable");
    return false;
  }
}
