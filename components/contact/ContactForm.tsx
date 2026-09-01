"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { ContactField } from "@/components/contact/ContactField";
import { Button } from "@/components/ui/Button";
import {
  CONTACT_FIELDS,
  MESSAGE_MIN,
  validateAll,
  validateField,
  type ContactFieldName,
  type ContactResponse,
} from "@/lib/contact";

type ContactFormProps = { endpoint: string; email: string };

type Status = "idle" | "submitting" | "success" | "rate_limit" | "error";

type Values = Record<ContactFieldName, string> & { company: string };

const EMPTY: Values = { name: "", email: "", message: "", company: "" };

/**
 * §8.7's form, rendered only when `site.contact.endpoint` exists.
 *
 * The direct channels below it do not depend on this component and are present whether
 * or not it renders — §8.7's last clause, and the reason `/contact/` could ship a phase
 * early without this. If this component fails, the page still works.
 *
 * **State is five `useState` calls and no form library.** §2 keeps the dependency list
 * short and pinned, and this is one form with three fields; a library would be more code
 * to read, not less, and none of them would give the §8.7 validation timing for free.
 */
export function ContactForm({ endpoint, email }: ContactFormProps) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<ContactFieldName, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  /**
   * Whether a submit has been attempted. This is the whole of §8.7's timing rule:
   * validation runs on submit, and on blur only *after* a failed submit — never on
   * first keystroke. Telling someone their email is invalid while they are still on the
   * fourth character of it is the behaviour this flag exists to prevent.
   */
  const [submitted, setSubmitted] = useState(false);

  // One ref per control, for moving focus to the first invalid field (§8.7). Each lands
  // on a native element inside `ContactField`, which is the shape the compiler's ref
  // lint expects — see `MobileNavigation` for the same pattern on a <dialog>.
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  /**
   * §14.1's `renderedAt`, feeding the server's time trap.
   *
   * **Stamped in an effect, not during render.** `Date.now()` in a render body is a
   * hydration mismatch, and on a statically rendered page it would be *build* time —
   * which the Worker's thirty-minute ceiling would then reject for every visitor,
   * turning an anti-spam check into a total outage. An effect runs in the browser, once,
   * per visitor.
   */
  const renderedAt = useRef(0);

  const stampRenderedAt = useCallback(() => {
    renderedAt.current = Date.now();
  }, []);

  useEffect(() => {
    stampRenderedAt();
  }, [stampRenderedAt]);

  function setField(field: ContactFieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));

    // Typing clears an existing error but never creates one. Clearing as soon as the
    // problem is fixed is the half of the interaction that feels responsive; creating
    // one here is the half that feels like being interrupted.
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleBlur(field: ContactFieldName) {
    if (!submitted) return;
    const error = validateField(field, values[field]);
    setErrors((current) => {
      // Delete rather than assign `undefined`. `Object.keys()` is how the submit path
      // asks whether the form is clean, and a key holding `undefined` counts.
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const found = validateAll(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      focusFirstInvalid(found);
      return;
    }

    setErrors({});
    setStatus("submitting");
    setRetryAfter(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          company: values.company,
          renderedAt: renderedAt.current,
        }),
      });

      const result = (await response.json()) as ContactResponse;

      if (result.ok) {
        // §14.1's 200 row: the form resets. `renderedAt` is re-stamped with it —
        // without that, a second message in the same session is measured from the first
        // mount and trips the thirty-minute ceiling.
        setValues(EMPTY);
        setSubmitted(false);
        stampRenderedAt();
        setStatus("success");
        return;
      }

      if (result.error === "validation") {
        // The server's strings, rendered as-is. It validated what this client could not.
        setErrors(result.fields);
        setStatus("idle");
        focusFirstInvalid(result.fields);
        return;
      }

      if (result.error === "rate_limit") {
        setRetryAfter(result.retryAfter);
        setStatus("rate_limit");
        return;
      }

      setStatus("error");
    } catch {
      // Network failure, a non-JSON body, or the endpoint being gone. All of them are
      // the same thing to the person in front of it: this did not send, and here is the
      // address that always works.
      setStatus("error");
    }
  }

  function focusFirstInvalid(found: Partial<Record<ContactFieldName, string>>) {
    // DOM order, not object order — §8.7 asks for the *first* invalid field, and object
    // key order is an implementation detail of whoever built the map.
    const first = CONTACT_FIELDS.find((field) => found[field]);
    if (first === "name") nameRef.current?.focus();
    else if (first === "email") emailRef.current?.focus();
    else if (first === "message") messageRef.current?.focus();
  }

  const busy = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* `noValidate` turns off the browser's own bubbles. They cannot be styled, they
          vanish on the next interaction, and they would compete with the messages below
          for the same job. The validation itself is not skipped — it moved into
          lib/contact.ts, where the server shares it. */}

      <ContactField
        name="name"
        label="Name"
        hint="Your name"
        value={values.name}
        error={errors.name}
        autoComplete="name"
        disabled={busy}
        onChange={(value) => setField("name", value)}
        onBlur={() => handleBlur("name")}
        controlRef={nameRef}
      />

      <ContactField
        name="email"
        label="Email"
        type="email"
        hint="you@example.com"
        value={values.email}
        error={errors.email}
        autoComplete="email"
        disabled={busy}
        onChange={(value) => setField("email", value)}
        onBlur={() => handleBlur("email")}
        controlRef={emailRef}
      />

      <ContactField
        name="message"
        label="Message"
        as="textarea"
        value={values.message}
        error={errors.message}
        hint={`A few sentences about the constraint, at least ${MESSAGE_MIN} characters`}
        disabled={busy}
        onChange={(value) => setField("message", value)}
        onBlur={() => handleBlur("message")}
        controlRef={messageRef}
      />

      <HoneypotField
        value={values.company}
        onChange={(value) => setValues((current) => ({ ...current, company: value }))}
      />

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={busy}>
          {/* The label does not change with state. §10.2 allows a crossfade here and
              nothing more, and SC 2.5.3 wants the accessible name stable — a button that
              relabels itself to "Sending…" changes its own name mid-interaction. The
              state is announced in the region below instead. This is the same reasoning
              `CopyButton` records. */}
          Send message
        </Button>
      </div>

      <StatusMessage status={status} email={email} retryAfter={retryAfter} />
    </form>
  );
}

/**
 * §8.7's honeypot: a real input, visually hidden, that a person never sees and a naive
 * bot fills in because it is in the DOM with a plausible name.
 *
 * **`position:absolute`, not `display:none` and not `sr-only`.** Hidden-by-display is
 * the first thing a bot skips, which defeats the point. `sr-only` is for content screen
 * readers *should* reach, and this is the opposite — hence `aria-hidden` and
 * `tabIndex={-1}`, which together keep it out of both the accessibility tree and the tab
 * order. A keyboard or screen reader user never lands on it.
 */
function HoneypotField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
      <label htmlFor="company">Company</label>
      <input
        id="company"
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/**
 * §8.7's single live region, and §14.1's failure copy.
 *
 * **One region, rendered unconditionally, whose text changes.** A region that mounts at
 * the same moment as its message is not reliably announced — the same reason
 * `CopyButton` keeps its status node always present. Adding a second region for failures
 * would mean two nodes competing to announce one event.
 *
 * §14.1 asks for a hard failure in `role="alert"` while §8.7 asks for one
 * `role="status"`. One node cannot hold both roles, so the role swaps on the same
 * always-mounted node: assertive when something failed, polite otherwise. Nothing is
 * mounted at announce time either way, which is the property that actually matters.
 *
 * Never animated (§10.2).
 */
function StatusMessage({
  status,
  email,
  retryAfter,
}: {
  status: Status;
  email: string;
  retryAfter: number | null;
}) {
  const failed = status === "error" || status === "rate_limit";

  return (
    <p
      role={failed ? "alert" : "status"}
      aria-live={failed ? "assertive" : "polite"}
      className={
        failed
          ? "font-sans text-body text-danger"
          : status === "success"
            ? "font-sans text-body text-success"
            : "font-sans text-body text-text-muted"
      }
    >
      {status === "submitting" ? "Sending your message…" : null}
      {status === "success"
        ? "Thank you. Your message is on its way, and I read everything that arrives."
        : null}
      {status === "rate_limit" ? (
        <>
          That is a few messages in a short window. Try again in {formatRetry(retryAfter)}
          , or email me directly at <MailLink email={email} />.
        </>
      ) : null}
      {status === "error" ? (
        <>
          Something went wrong sending that. Email me directly at{" "}
          <MailLink email={email} /> and it will reach me.
        </>
      ) : null}
    </p>
  );
}

/**
 * §14.1 requires both failure paths to surface the direct address. It is a real
 * `mailto:` rather than printed text, because a failure that hands someone an address to
 * retype by hand is the failure path failing a second time.
 */
function MailLink({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="underline decoration-1 underline-offset-[3px] transition-[text-decoration-thickness] duration-(--duration-fast) ease-out hover:decoration-2"
    >
      {email}
    </a>
  );
}

/**
 * Seconds are what the wire carries; a duration someone can act on is what they read.
 *
 * The units matter because the two limits are orders of magnitude apart: the per-IP
 * window is minutes, and the global daily cap is a day. Formatting everything as minutes
 * told a reader who tripped the daily limit to try again in "1440 minutes".
 */
function formatRetry(seconds: number | null): string {
  if (!seconds || seconds <= 60) return "a minute";

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return hours === 1 ? "an hour" : `${hours} hours`;

  const days = Math.ceil(hours / 24);
  return days === 1 ? "a day" : `${days} days`;
}
