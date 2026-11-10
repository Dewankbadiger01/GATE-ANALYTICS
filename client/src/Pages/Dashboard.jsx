
import { useState, useEffect, useCallback } from "react";

import {
  Library,
  Sparkles,
  LineChart,
  AlertCircle,
  Database,
  BookOpen,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

import Hero from "../components/Hero/Hero";
import FeatureCard from "../components/FeatureCard/FeatureCard";

import {
  getHealth,
  getSubjects,
  getPYQStats,
} from "../services/api";

export default function Dashboard({ onNavigate, onYear }) {
  const [stats, setStats] = useState({
    questions: 0,
    subjects: 0,
    verified: 0,
    unverified: 0,
    yearWise: [],
    subjectWise: [],
    online: false,
  });

  const [loading, setLoading] = useState(true);

  const retry = useCallback(async () => {
    setLoading(true);

    try {
      await getHealth();

      const [subjectsResponse, statsResponse] = await Promise.all([
        getSubjects(),
        getPYQStats(),
      ]);

      const subjects = subjectsResponse.data?.data ?? [];
      const data = statsResponse.data?.data ?? {};

      setStats({
        questions: data.totalQuestions ?? 0,
        subjects: subjects.length,
        verified: data.verifiedQuestions ?? 0,
        unverified: data.unverifiedQuestions ?? 0,
        yearWise: data.yearWise ?? [],
        subjectWise: data.subjectWise ?? [],
        online: true,
      });
    } catch (error) {
      console.error("Dashboard API error:", error);

      setStats((previous) => ({
        ...previous,
        online: false,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    retry();
  }, [retry]);

  const cards = [
    {
      label: "Total Questions",
      value: stats.questions,
      icon: Database,
    },
    {
      label: "Subjects",
      value: stats.subjects,
      icon: BookOpen,
    },
    {
      label: "Verified Questions",
      value: stats.verified,
      icon: CheckCircle,
    },
    {
      label: "Unverified Questions",
      value: stats.unverified,
      icon: Clock,
    },
  ];

  const maxYearCount = Math.max(
    ...stats.yearWise.map((item) => item.count),
    1
  );

  const maxSubjectCount = Math.max(
    ...stats.subjectWise.map((item) => item.count),
    1
  );

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24">
      <Hero
        onExplore={() => onNavigate("pyq")}
        onYear={onYear}
      />

      {/* Workspace */}
      <section aria-labelledby="workspace" className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="workspace"
              className="text-2xl font-bold text-[var(--ink)]"
            >
              Your Workspace
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Live statistics from your question database.
            </p>
          </div>

          <button
            onClick={retry}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold hover:bg-[var(--accent-soft)] disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {!stats.online && !loading && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertCircle size={18} />
            <span className="flex-1">
              Cannot connect to the question database.
              Check your backend server.
            </span>
            <button onClick={retry} className="font-semibold underline">
              Retry
            </button>
          </div>
        )}

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
              >
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[var(--muted)]">
                    {card.label}
                  </dt>
                  <Icon size={20} className="text-[var(--accent)]" />
                </div>

                <dd className="mt-3 text-3xl font-extrabold text-[var(--ink)]">
                  {loading ? "..." : card.value}
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-4 flex items-center gap-2 text-sm">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              stats.online ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-[var(--muted)]">
            Database: {loading ? "Checking..." : stats.online ? "Online" : "Offline"}
          </span>
        </div>
      </section>

      {/* Year-wise analytics */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-[var(--ink)]">
          Year-wise Questions
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Distribution of questions by exam year.
        </p>

        <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Loading statistics...</p>
          ) : stats.yearWise.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No question data available yet.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.yearWise.map((item) => (
                <div key={item.year}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{item.year}</span>
                    <span className="text-[var(--muted)]">{item.count}</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[var(--accent-soft)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{
                        width: `${(item.count / maxYearCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subject-wise analytics */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-[var(--ink)]">
          Subject-wise Questions
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Subjects ranked by the number of available questions.
        </p>

        <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Loading statistics...</p>
          ) : stats.subjectWise.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No subject-wise question data available yet.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.subjectWise.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex justify-between gap-3 text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-[var(--muted)]">{item.count}</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[var(--accent-soft)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{
                        width: `${(item.count / maxSubjectCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="tools" className="mt-14">
        <h2
          id="tools"
          className="text-2xl font-bold text-[var(--ink)]"
        >
          Explore Features
        </h2>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Everything you need to organize your GATE preparation.
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <FeatureCard
            icon={Library}
            status="available"
            title="PYQ Analyzer"
            description="Explore previous year questions with subject, year and difficulty filters."
            actionLabel="Open Question Bank"
            onAction={() => onNavigate("pyq")}
          />

         <FeatureCard
  icon={Sparkles}
  status="available"
  title="AI Mentor"
  description="Get step-by-step explanations and AI-assisted guidance for difficult concepts."
  actionLabel="Open AI Mentor"
  onAction={() => onNavigate("mentor")}
/>

          <FeatureCard
            icon={LineChart}
            status="soon"
            title="Performance Analytics"
            description="Track your accuracy, progress and topic-wise performance."
          />
        </div>
      </section>
    </main>
  );
}
