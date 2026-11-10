
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from "lucide-react";

import { getPYQs, getSubjects } from "../services/api";

const PAGE_SIZE = 10;
const LEVELS = ["Easy", "Medium", "Hard"];

const YEARS = Array.from({ length: 15 }, (_, index) =>
  String(2025 - index)
);

// Normalize API response into an array.
const toArray = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) return data.data;

  if (Array.isArray(data?.questions)) return data.questions;

  return [];
};

// Normalize question data received from the backend.
const normalize = (q, index) => {
  const rawDifficulty = String(
    q.difficulty ?? "MEDIUM"
  ).toLowerCase();

  const difficultyMap = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };

  const difficulty =
    difficultyMap[rawDifficulty] ?? "Medium";

  const rawOptions = q.options ?? [];

  const options = Array.isArray(rawOptions)
    ? rawOptions.map((option) =>
        typeof option === "object" && option !== null
          ? option.text ?? option.optionText ?? option.value ?? ""
          : option
      )
    : [];

  const rawAnswer = q.answer ?? q.correctAnswer;

  const answer =
    typeof rawAnswer === "object" && rawAnswer !== null
      ? rawAnswer.correctAnswer ??
        rawAnswer.answer ??
        rawAnswer.value ??
        rawAnswer.value
      : rawAnswer ?? "";

  return {
    id: q.id ?? q._id ?? index,
    year: q.year ?? "N/A",
    subject: q.subject?.name ?? q.subject ?? "Unknown",
    topic: q.topic?.name ?? q.topic ?? q.chapter ?? "General",
    marks: q.marks ?? q.mark ?? 1,
    difficulty,
    question: q.question ?? q.questionText ?? q.text ?? "",
    options,
    answer: answer ?? "",
    explanation:
      q.explanation ?? q.answer?.explanation ?? q.solution ?? "",
  };
};

// Fetch questions from backend.
async function loadQuestions() {
  const response = await getPYQs();

  return toArray(response.data).map(normalize);
}

// Difficulty badge colors.
const levelStyle = {
  Easy: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-700",
  Hard: "bg-rose-50 text-rose-700",
};

// Reusable dropdown component.
function Select({
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "All",
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--muted)]">
        {label}
      </span>

      <span className="relative block">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-[var(--line)] bg-white py-2.5 pl-3 pr-9 text-sm outline-none transition focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        />
      </span>
    </label>
  );
}

// Individual question card.
function QuestionCard({ q }) {
  const [open, setOpen] = useState(false);

  const letters = ["A", "B", "C", "D", "E"];

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 transition hover:shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="font-bold">GATE {q.year}</span>

        <span className="text-[var(--muted)]">
          {q.subject}, {q.topic}
        </span>

        <span className="ml-auto flex items-center gap-2">
          <span className="text-[var(--muted)]">
            {q.marks} {Number(q.marks) === 1 ? "mark" : "marks"}
          </span>

          <span
            className={`rounded-md px-2 py-1 text-xs font-semibold ${
              levelStyle[q.difficulty] ?? levelStyle.Medium
            }`}
          >
            {q.difficulty}
          </span>
        </span>
      </div>

      <p className="mt-4 text-base leading-relaxed text-[var(--ink)]">
        {q.question}
      </p>

      {q.options.length > 0 && (
        <ol className="mt-4 grid gap-2">
          {q.options.map((option, index) => (
            <li
              key={index}
              className="flex gap-3 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            >
              <span className="font-semibold text-[var(--muted)]">
                {letters[index] ?? index + 1}
              </span>

              <span>{option}</span>
            </li>
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="mt-5 text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        {open ? "Hide answer" : "Show answer"}
      </button>

      {open && (
        <div className="mt-3 rounded-lg bg-[var(--paper)] p-4 text-sm">
          <p>
            <strong>Answer:</strong>{" "}
            {String(q.answer || "Not available")}
          </p>

          {q.explanation && (
            <p className="mt-2 text-[var(--muted)]">
              {q.explanation}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default function PYQAnalyzer({ initialYear = "" }) {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [status, setStatus] = useState("loading");
  const [subjectStatus, setSubjectStatus] = useState("loading");

  const [filters, setFilters] = useState({
    search: "",
    subject: "",
    topic: "",
    year: initialYear ? String(initialYear) : "",
    difficulty: "",
  });

  const [visible, setVisible] = useState(PAGE_SIZE);

  // Update year when dashboard sends a selected year.
  useEffect(() => {
    setFilters((previous) => ({
      ...previous,
      year: initialYear ? String(initialYear) : "",
    }));

    setVisible(PAGE_SIZE);
  }, [initialYear]);

  // Fetch subjects and topics from Neon through Express.
  useEffect(() => {
    let cancelled = false;

    async function fetchSubjects() {
      setSubjectStatus("loading");

      try {
        const response = await getSubjects();
        const subjectList = response.data?.data ?? [];

        if (!Array.isArray(subjectList)) {
          throw new Error("Invalid subjects API response");
        }

        if (!cancelled) {
          setSubjects(subjectList);
          setSubjectStatus("ready");
        }
      } catch (error) {
        console.error("Subject loading error:", error);

        if (!cancelled) {
          setSubjectStatus("error");
        }
      }
    }

    fetchSubjects();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch PYQ questions.
  const fetchData = async () => {
    setStatus("loading");

    try {
      const data = await loadQuestions();
      setQuestions(data);
      setStatus("ready");
    } catch (error) {
      console.error("PYQ loading error:", error);
      setStatus("error");
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialQuestions() {
      setStatus("loading");

      try {
        const data = await loadQuestions();

        if (!cancelled) {
          setQuestions(data);
          setStatus("ready");
        }
      } catch (error) {
        console.error("PYQ loading error:", error);

        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    fetchInitialQuestions();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update filters.
  const updateFilter = (key) => (value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      ...(key === "subject" ? { topic: "" } : {}),
    }));

    setVisible(PAGE_SIZE);
  };

  // Check active filters.
  const active = Object.values(filters).some(Boolean);

  // Find currently selected subject.
  const selectedSubject = subjects.find(
    (subject) => subject.name === filters.subject
  );

  // Get topics belonging to selected subject.
  const topicOptions = (selectedSubject?.topics ?? [])
    .map((topic) => topic.name)
    .sort();

  // Apply filters.
  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return questions.filter(
      (q) =>
        (!filters.subject || q.subject === filters.subject) &&
        (!filters.topic || q.topic === filters.topic) &&
        (!filters.year || String(q.year) === filters.year) &&
        (!filters.difficulty ||
          q.difficulty === filters.difficulty) &&
        (!search ||
          `${q.question} ${q.topic} ${q.subject}`
            .toLowerCase()
            .includes(search))
    );
  }, [questions, filters]);

  // Calculate most frequently appearing topics
  // from the questions currently loaded.
  const topics = useMemo(() => {
    const counts = {};

    filtered.forEach((q) => {
      counts[q.topic] = (counts[q.topic] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [filtered]);

  const maxCount = topics[0]?.[1] || 1;

  // Reset all filters.
  const clearFilters = () => {
    setFilters({
      search: "",
      subject: "",
      topic: "",
      year: "",
      difficulty: "",
    });

    setVisible(PAGE_SIZE);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--accent-soft)] p-3">
            <BookOpen size={24} className="text-[var(--accent)]" />
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--ink)]">
              PYQ Analyzer
            </h1>

            <p className="mt-2 max-w-xl text-[var(--muted)]">
              Filter previous year questions and identify frequently
              appearing topics.
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--muted)]">
              Search
            </span>

            <span className="relative block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />

              <input
                value={filters.search}
                onChange={(event) =>
                  updateFilter("search")(event.target.value)
                }
                placeholder="Question or topic"
                className="w-full rounded-lg border border-[var(--line)] bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--accent)]"
              />
            </span>
          </label>

          {/* Subject */}
          <Select
            label="Subject"
            value={filters.subject}
            onChange={updateFilter("subject")}
            options={subjects.map((subject) => subject.name)}
            placeholder={
              subjectStatus === "loading"
                ? "Loading subjects..."
                : subjectStatus === "error"
                  ? "Failed to load"
                  : "All subjects"
            }
            disabled={subjectStatus !== "ready"}
          />

          {/* Topic */}
          <Select
            label="Topic"
            value={filters.topic}
            onChange={updateFilter("topic")}
            options={topicOptions}
            placeholder={
              !filters.subject ? "Select subject first" : "All topics"
            }
            disabled={!filters.subject || topicOptions.length === 0}
          />

          {/* Year */}
          <Select
            label="Year"
            value={filters.year}
            onChange={updateFilter("year")}
            options={YEARS}
            placeholder="All years"
          />

          {/* Difficulty */}
          <Select
            label="Difficulty"
            value={filters.difficulty}
            onChange={updateFilter("difficulty")}
            options={LEVELS}
            placeholder="All levels"
          />
        </div>

        {subjectStatus === "error" && (
          <p className="mt-4 flex items-center gap-2 text-sm text-rose-600">
            <AlertCircle size={16} />
            Couldn't load subjects. Check your backend server and retry.
          </p>
        )}
      </section>

      {/* Result count and clear button */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <p className="text-[var(--muted)]" aria-live="polite">
          {status === "ready"
            ? `${filtered.length} questions found`
            : "Loading questions..."}
        </p>

        {active && (
          <button
            type="button"
            onClick={clearFilters}
            className="font-semibold text-[var(--accent)] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Questions */}
        <section className="grid content-start gap-4">
          {/* Loading state */}
          {status === "loading" &&
            [0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl border border-[var(--line)] bg-white"
              />
            ))}

          {/* Error state */}
          {status === "error" && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertCircle size={18} />

              <span className="flex-1">
                Couldn't load questions. Check your backend server.
              </span>

              <button
                type="button"
                onClick={fetchData}
                className="flex items-center gap-1 font-semibold underline"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {status === "ready" && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--line)] p-10 text-center">
              <BookOpen
                size={32}
                className="mx-auto text-[var(--muted)]"
              />

              <p className="mt-3 text-lg font-bold">
                No questions found
              </p>

              <p className="mt-2 text-sm text-[var(--muted)]">
                {questions.length === 0
                  ? "Your database currently has no PYQ records."
                  : "Try changing or clearing your filters."}
              </p>
            </div>
          )}

          {/* Question cards */}
          {status === "ready" &&
            filtered.slice(0, visible).map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}

          {/* Pagination */}
          {status === "ready" && filtered.length > visible && (
            <button
              type="button"
              onClick={() =>
                setVisible((previous) => previous + PAGE_SIZE)
              }
              className="rounded-xl border border-[var(--line)] bg-white py-3 text-sm font-semibold transition hover:border-[var(--ink)]"
            >
              Show more questions
            </button>
          )}
        </section>

        {/* Topic frequency */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-[var(--ink)] p-6 text-white">
            <h2 className="text-lg font-bold">
              Most Asked Topics
            </h2>

            <p className="mt-1 text-sm text-white/60">
              Based on the loaded questions.
            </p>

            {topics.length === 0 ? (
              <p className="mt-6 text-sm text-white/60">
                No verified question data available yet.
              </p>
            ) : (
              <ul className="mt-5 grid gap-4">
                {topics.map(([topic, count]) => (
                  <li key={topic}>
                    <div className="flex justify-between text-sm">
                      <span>{topic}</span>
                      <span className="text-white/60">{count}</span>
                    </div>

                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{
                          width: `${(count / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
