import { BookOpen, LayoutDashboard, BarChart3 } from "lucide-react";

const links = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "pyq",
    label: "PYQ Analyzer",
    icon: BarChart3,
  },
];

export default function Navbar({
  current = "dashboard",
  onNavigate,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

        <button
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--ink)] text-white">
            <BookOpen size={18} />
          </span>

          <span className="text-lg font-extrabold tracking-tight text-[var(--ink)]">
            GATE Mentor
          </span>
        </button>

        <nav className="flex items-center gap-1">
          {links.map(({ id, label, icon: Icon }) => {
            const active = current === id;

            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--ink)]"
                    : "text-[var(--muted)] hover:bg-[var(--paper)]"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}