type StatusBadgeProps = {
  state:
    "completed" | "in-progress" | "maintained" | "available" | "open" | "unavailable";
  label: string;
};

/**
 * §11.4: no information by colour alone. Three cues stack here — the `label` prop, which
 * is required and always rendered; the dot's colour; and the dot's *shape*, filled for
 * the affirmative states and hollow for `unavailable`. Print the badge in greyscale and
 * it still reads.
 *
 * Measured, since these are the smallest text in the system (§6.1's method, not its
 * numbers — these pairings are new), and re-measured against B4's dark stack: success
 * on surface-alt is 5.50:1 light and 5.70:1 dark; brand on brand-soft is 8.15:1 light;
 * brand-cream on brand-soft is 12.89:1 dark. text-muted on surface-alt, the smallest
 * pairing here, is 4.79:1 light and 5.28:1 dark.
 */
const states = {
  completed: "border-border-subtle bg-surface-alt text-text-muted",
  "in-progress": "border-transparent bg-brand-soft text-brand dark:text-brand-cream",
  maintained: "border-border-subtle bg-surface-alt text-text-muted",
  available: "border-border-subtle bg-surface-alt text-success",
  open: "border-transparent bg-brand-soft text-brand dark:text-brand-cream",
  unavailable: "border-border-subtle bg-surface-alt text-text-muted",
} as const;

const dots = {
  completed: "bg-text-muted",
  "in-progress": "bg-brand",
  maintained: "bg-text-muted",
  available: "bg-success",
  open: "bg-brand",
  unavailable: "border border-text-muted",
} as const;

export function StatusBadge({ state, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-none border px-2 py-1 font-mono text-body-sm ${states[state]}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-none ${dots[state]}`}
      />
      {label}
    </span>
  );
}
