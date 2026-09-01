import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting for the contact endpoint.
 *
 * **Server-only.** Imported by `app/api/contact/route.ts` and nothing else; it reads
 * secrets from `process.env` and must never reach a client bundle.
 *
 * Two limits, because they stop different attacks and one does not imply the other:
 *
 * 1. **Per IP.** Stops one source flooding the mailbox or burning function invocations.
 * 2. **Global.** A circuit breaker across every IP at once. This is the one that catches a
 *    distributed flood, where each address stays under the per-IP ceiling and the per-IP
 *    limiter therefore never fires. Without it the first limit is a speed bump for anyone
 *    with a proxy pool.
 *
 * A sliding window rather than a fixed one: a fixed window lets someone send the full
 * allowance at 09:59 and again at 10:00, which is twice the intended rate at the boundary.
 */

/**
 * Per IP. Five in ten minutes is far above what a person composing a message will ever
 * do, and far below what makes a flood worth attempting.
 */
const PER_IP_LIMIT = 5;
const PER_IP_WINDOW = "10 m";

/**
 * Across everyone. Set from what this site plausibly receives rather than from what the
 * infrastructure can bear: a portfolio contact form getting more than fifty messages in a
 * day is being abused, not discovered.
 */
const GLOBAL_LIMIT = 50;
const GLOBAL_WINDOW = "1 d";

export type RateLimitVerdict =
  | { allowed: true }
  /** `retryAfter` is seconds, which is what §14.1's 429 body carries. */
  | { allowed: false; retryAfter: number };

/**
 * Built once per process rather than per request, so a warm function reuses the client
 * and the connection instead of rebuilding both on every submit.
 *
 * `null` when the credentials are absent, which is the local-development case and, for a
 * short window, production before the Upstash variables are set. See `checkRateLimit`.
 */
const redis = (() => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  return new Redis({ url, token });
})();

const perIp = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(PER_IP_LIMIT, PER_IP_WINDOW),
      prefix: "contact:ip",
      // Off deliberately. Analytics writes extra keys per request, and the free tier's
      // command budget is better spent on the limit itself.
      analytics: false,
    })
  : null;

const global = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(GLOBAL_LIMIT, GLOBAL_WINDOW),
      prefix: "contact:global",
      analytics: false,
    })
  : null;

/** True when the limiter is actually wired up, for the route's startup log. */
export const rateLimitConfigured = redis !== null;

/**
 * The visitor's address, from the header the platform sets.
 *
 * `x-forwarded-for` is a list when proxies chain; the **first** entry is the client and
 * the rest are the hops. Taking the last would rate-limit Vercel's own edge, which is one
 * identifier for every visitor.
 *
 * This header is trivially spoofable in general. On Vercel it is set by the platform and
 * the app cannot be reached except through it, so it is trustworthy *here* — but that is a
 * property of the deployment, not of the header, and it stops being true the moment this
 * runs somewhere else.
 */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Both limits, in the order that costs least when one of them rejects.
 *
 * **Fails open.** If Upstash is unreachable or unconfigured, the submission is allowed
 * rather than refused. That is a deliberate trade: the failure mode of failing closed is
 * that a real message is lost while the contact form silently reports success or an
 * error, which is worse for a portfolio than the failure mode of failing open, which is
 * that a flood gets through during an outage. The honeypot and the time trap still apply
 * either way, and §14.3's rule holds throughout — no address, no message body, and no raw
 * IP is ever logged.
 */
export async function checkRateLimit(request: Request): Promise<RateLimitVerdict> {
  if (!perIp || !global) {
    // Unconfigured. Logged once per cold start rather than per request, which would turn
    // a missing variable into log spam.
    return { allowed: true };
  }

  try {
    const ip = clientIp(request);

    const ipVerdict = await perIp.limit(ip);
    if (!ipVerdict.success) {
      return { allowed: false, retryAfter: secondsUntil(ipVerdict.reset) };
    }

    const globalVerdict = await global.limit("all");
    if (!globalVerdict.success) {
      return { allowed: false, retryAfter: secondsUntil(globalVerdict.reset) };
    }

    return { allowed: true };
  } catch {
    // Upstash down, network fault, quota exhausted. Fail open, per the note above.
    console.error("[contact] rate limiter unavailable");
    return { allowed: true };
  }
}

/** `reset` is an epoch-ms timestamp; §14.1's `retryAfter` is a count of seconds. */
function secondsUntil(reset: number): number {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
}
