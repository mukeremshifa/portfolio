import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Spec §12.2: no build-time image pipeline for now. Everything routes through
  // <Figure>, so turning Vercel's optimizer back on later is a one-line change.
  images: { unoptimized: true },
  /**
   * `/certifications` became `/skills` on 2026-08-31, when the page grew the focus pillars
   * and the tool groups and finally matched the label the nav had always given it.
   *
   * Permanent (308) rather than temporary: the rename is settled, and a 301/308 is what
   * moves any accumulated ranking to the new URL instead of splitting it. The route was
   * live and linked from the home page, so dropping it without this is a 404 for every
   * link already pointing at it — including the résumé, which this repo cannot edit.
   */
  async redirects() {
    return [{ source: "/certifications", destination: "/skills", permanent: true }];
  },
  /**
   * §16.4's security headers, added in the Phase 6 hardening pass.
   *
   * **There is deliberately no `Content-Security-Policy` here, and that is the whole
   * decision.** A CSP worth having forbids `unsafe-inline` for scripts, and this site has
   * two inline scripts it cannot give up: `ThemeScript`, which must run before first
   * paint or the page flashes the wrong theme, and the JSON-LD blocks §13.2 requires.
   * Allowing them needs per-request nonces, and a nonce makes every response dynamic —
   * it would convert all 30 prerendered routes into server-rendered ones to harden a
   * static site that has no authentication, no cookies, no user input rendered back, and
   * one POST endpoint that echoes nothing. A `unsafe-inline` CSP, the other option, is a
   * header that looks like protection and provides close to none.
   *
   * So the headers below are the ones that are unambiguously worth their cost on a static
   * marketing site. Revisit the CSP if a route ever renders untrusted input.
   *
   * `Strict-Transport-Security` carries `preload` intentionally: the apex already serves
   * HTTPS only, and §16.4 fixed `mukeremshifa.com` as the canonical host. Note it is a
   * commitment — submitting to the preload list is easy to undo slowly and impossible to
   * undo quickly.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Two years, subdomains included. `conversekit.` and `synapsedeck.` are real
          // deployments under this apex and both already serve HTTPS.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // The site frames nothing and should be framed by nothing. `frame-ancestors`
          // would be the modern spelling, but it only exists inside a CSP.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Full URL to same-origin, bare origin to everyone else: outbound links to a
          // repository or a credential issuer should not carry the path they came from.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing here uses any of these; denying them keeps a future dependency from
          // quietly acquiring one.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Performance, not security — grouped here because it is a response header and
          // there is no second place for one. Lets the browser resolve DNS for the
          // outbound links this site is largely made of before they are clicked.
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // The contact endpoint answers JSON and must never be cached by an intermediary.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
