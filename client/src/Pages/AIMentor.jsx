
import { useState } from "react";
import { Sparkles, Send, LoaderCircle, BookOpen } from "lucide-react";
import { explainWithAI } from "../services/api";

export default function AIMentor() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("Algorithms");
  const [topic, setTopic] = useState("");
  const [options, setOptions] = useState("");
  const [studentAttempt, setStudentAttempt] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError("Please enter a question first.");
      return;
    }

    setLoading(true);
    setError("");
    setExplanation("");

    try {
      const response = await explainWithAI({
        question,
        subject,
        topic,
        options: options
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        studentAttempt,
      });

      setExplanation(response.data.data.explanation);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not generate an explanation. Check your backend and API key."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 pb-24">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-[var(--accent)]">
          <Sparkles size={24} />
          <span className="font-semibold">Powered by Gemini</span>
        </div>

        <h1 className="text-3xl font-extrabold text-[var(--ink)] sm:text-4xl">
          Your AI GATE Mentor
        </h1>

        <p className="mt-3 text-[var(--muted)]">
          Ask a GATE question and receive a structured,
          step-by-step explanation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Subject
          </label>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-white p-3 outline-none focus:border-[var(--accent)]"
          >
            <option>Algorithms</option>
            <option>Operating Systems</option>
            <option>Computer Networks</option>
            <option>Database Management Systems</option>
            <option>Theory of Computation</option>
            <option>Computer Organization and Architecture</option>
            <option>Digital Logic</option>
            <option>Programming and Data Structures</option>
            <option>Compiler Design</option>
            <option>Engineering Mathematics</option>
            <option>General Aptitude</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Topic (optional)
          </label>

          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Dynamic Programming"
            className="w-full rounded-xl border border-[var(--line)] bg-white p-3 outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Your GATE question
          </label>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Paste your question here..."
            rows={5}
            maxLength={8000}
            className="w-full resize-y rounded-xl border border-[var(--line)] bg-white p-3 outline-none focus:border-[var(--accent)]"
          />
          <p className="mt-1 text-right text-xs text-[var(--muted)]">
            {question.length}/8000
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Options (optional, one per line)
          </label>

          <textarea
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder={"A. Option one\nB. Option two\nC. Option three\nD. Option four"}
            rows={4}
            className="w-full rounded-xl border border-[var(--line)] bg-white p-3 outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Your attempt (optional)
          </label>

          <textarea
            value={studentAttempt}
            onChange={(e) => setStudentAttempt(e.target.value)}
            placeholder="Explain what you tried or where you got stuck..."
            rows={3}
            className="w-full rounded-xl border border-[var(--line)] bg-white p-3 outline-none focus:border-[var(--accent)]"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle className="animate-spin" size={18} />
              Generating explanation...
            </>
          ) : (
            <>
              <Send size={18} />
              Explain with AI
            </>
          )}
        </button>
      </form>

      {explanation && (
        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <div className="mb-5 flex items-center gap-2">
            <BookOpen className="text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--ink)]">
              Your Explanation
            </h2>
          </div>

          <div className="whitespace-pre-wrap leading-8 text-[var(--ink)]">
            {explanation}
          </div>

          <p className="mt-6 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
            AI-generated explanation. Verify important answers against
            official GATE sources.
          </p>
        </section>
      )}
    </main>
  );
}
