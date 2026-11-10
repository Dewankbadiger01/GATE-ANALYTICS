import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

const FIRST_YEAR = 2011;
const LAST_YEAR = 2025;

const years = Array.from(
  { length: LAST_YEAR - FIRST_YEAR + 1 },
  (_, i) => FIRST_YEAR + i
);

export default function Hero({ onExplore, onYear }) {
  return (
    <section className="grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">

      {/* Left content */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-4 py-2 text-xs font-bold text-[var(--ink)]">
          <Sparkles size={15} />
          YOUR PERSONAL GATE PREPARATION COMPANION
        </div>

        <h1 className="mt-6 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl">
          Practice every GATE question.
          <span className="block text-[var(--accent)]">
            Prepare smarter.
          </span>
        </h1>

        <p className="mt-5 max-w-lg text-base leading-7 text-[var(--muted)]">
          Analyze previous year questions, identify important topics,
          and improve your GATE preparation with data-driven insights.
        </p>

        <button
          type="button"
          onClick={onExplore}
          className="mt-8 flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 font-bold text-[var(--ink)] transition hover:bg-[#D78343]"
        >
          Explore Question Bank
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Right question palette */}
      <div className="rounded-3xl bg-[var(--ink)] p-6 text-white sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Choose a year</h2>
          <span className="text-sm text-white/60">
            {years.length} years
          </span>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-3">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => onYear(year)}
              className="aspect-[5/4] rounded-lg bg-white/10 text-sm font-semibold transition hover:bg-[var(--accent)] hover:text-[var(--ink)]"
            >
              {year}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-white/60">
          <BookOpen size={16} />
          Select a year to explore its questions.
        </div>
      </div>
    </section>
  );
}