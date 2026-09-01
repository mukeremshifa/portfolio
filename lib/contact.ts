import { z } from "zod";

/**
 * §14.1's wire contract, in one place.
 *
 * **Both ends import this.** The client validates against it before sending;
 * `app/api/contact/route.ts` validates against it on arrival. That is the entire reason
 * this file is not inside the component: a contract that lives in two places is a
 * contract that drifts.
 *
 * **No `node:fs`, no server-only imports.** `lib/content.ts` is the validation gate for
 * `content/`, and it reads the filesystem, which makes it unusable from a client
 * component by construction. This file is the opposite by construction: plain Zod and
 * types, safe in a browser and on the server alike.
 */

// §14.2's field bounds. Named rather than inlined because the route handler asserts the
// same numbers and the client's messages quote them.
export const NAME_MIN = 2;
export const NAME_MAX = 100;
export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 5000;

/**
 * §14.2's time trap. `renderedAt` is stamped when the form mounts, so the gap to submit
 * is how long a human spent reading and typing. Under three seconds is automation;
 * over thirty minutes is a stale tab, which is rejected because the timestamp stops
 * being evidence of anything once it is that old.
 */
export const MIN_DWELL_MS = 3_000;
export const MAX_DWELL_MS = 30 * 60_000;

/** The fields a person actually fills in — the honeypot is deliberately not one. */
export type ContactFieldName = "name" | "email" | "message";

export const CONTACT_FIELDS: readonly ContactFieldName[] = ["name", "email", "message"];

/**
 * The POST body of §14.1.
 *
 * `company` is the honeypot and is typed as the empty string: a populated one is a
 * schema failure rather than a branch, so neither end can forget to check it. What the
 * two ends *do* about that failure differs — see the note on `ContactResponse`.
 */
export const ContactPayloadSchema = z.object({
  name: z.string().trim().min(NAME_MIN).max(NAME_MAX),
  email: z.email(),
  message: z.string().trim().min(MESSAGE_MIN).max(MESSAGE_MAX),
  company: z.literal(""),
  renderedAt: z.number().int().positive(),
});

export type ContactPayload = z.infer<typeof ContactPayloadSchema>;

/**
 * §14.1's four response rows, as a discriminated union.
 *
 * The client switches on `error` rather than on the HTTP status, so a proxy that
 * rewrites a status cannot silently change which message a person reads.
 *
 * Note there is no `"spam"` member, and that is deliberate: §14.2's honeypot and time
 * trap both answer `{ ok: true }`. Telling a bot which check caught it is how the next
 * version gets past that check.
 */
export type ContactResponse =
  | { ok: true }
  | { ok: false; error: "validation"; fields: Partial<Record<ContactFieldName, string>> }
  | { ok: false; error: "rate_limit"; retryAfter: number }
  | { ok: false; error: "server" };

/**
 * The client's error copy.
 *
 * Zod's own messages ("String must contain at least 20 character(s)") are accurate and
 * are not the register anything else on this site is written in. These are keyed by
 * field and by what went wrong, so the form never renders a raw Zod issue.
 *
 * The route handler answers 400s from this same map via `messageFor`, so a message is
 * worded identically whether the browser or the server caught the problem.
 */
const MESSAGES: Record<ContactFieldName, { empty: string; invalid: string }> = {
  name: {
    empty: "Please add your name.",
    invalid: `Your name needs to be between ${NAME_MIN} and ${NAME_MAX} characters.`,
  },
  email: {
    empty: "Please add your email address, so I can reply.",
    invalid: "That does not look like an email address I could reply to.",
  },
  message: {
    empty: "Please add a message.",
    invalid: `A message needs at least ${MESSAGE_MIN} characters. A sentence or two about the constraint is plenty.`,
  },
};

/**
 * The same copy, keyed by field, for a caller that has a value rather than an issue.
 *
 * The route handler answers 400s with these rather than Zod's own strings: the client
 * renders the `fields` map verbatim under the inputs, so whatever the server puts there
 * is site copy whether it was written as site copy or not.
 */
export function messageFor(field: ContactFieldName, value: string): string {
  return value.trim().length === 0 ? MESSAGES[field].empty : MESSAGES[field].invalid;
}

/**
 * Validate one field, for the blur path. Returns `undefined` when the field is fine.
 *
 * Field-at-a-time rather than parsing the whole payload and filtering, because on blur
 * the other fields may legitimately be empty and must not be marked as errors — §8.7 is
 * explicit that validation never runs on a field the person has not finished with.
 */
export function validateField(
  field: ContactFieldName,
  value: string,
): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return MESSAGES[field].empty;

  const result = ContactPayloadSchema.shape[field].safeParse(trimmed);
  return result.success ? undefined : MESSAGES[field].invalid;
}

/**
 * Validate every field, for the submit path.
 *
 * Returns a map that is empty when the form is good, which is also the shape the 400
 * response carries — so the submit handler sets errors from either source without
 * caring which one produced them.
 */
export function validateAll(
  values: Record<ContactFieldName, string>,
): Partial<Record<ContactFieldName, string>> {
  const errors: Partial<Record<ContactFieldName, string>> = {};

  for (const field of CONTACT_FIELDS) {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  }

  return errors;
}
