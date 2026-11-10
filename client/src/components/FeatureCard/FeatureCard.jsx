import { ArrowUpRight } from "lucide-react";
import StatusBadge from "../StatusBadge/StatusBadge";

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  status = "soon",
  actionLabel,
  onAction,
}) {
  const available = status === "available";

  return (
    <article
      className={`rounded-2xl border p-6 transition-all duration-300 ${
        available
          ? "border-[var(--line)] bg-[var(--surface)] hover:-translate-y-1 hover:shadow-lg"
          : "border-dashed border-[var(--line)] bg-[var(--surface)]/60"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--ink)]">
          {Icon && <Icon size={23} />}
        </div>

        <StatusBadge status={status} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-[var(--ink)]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>

      {available && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 flex items-center gap-2 rounded-lg bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent)]"
        >
          {actionLabel}
          <ArrowUpRight size={16} />
        </button>
      )}
    </article>
  );
}