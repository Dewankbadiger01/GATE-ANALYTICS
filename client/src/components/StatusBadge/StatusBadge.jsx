export default function StatusBadge({ status }) {
  const available = status === "available";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        available
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {available ? "Available" : "Coming Soon"}
    </span>
  );
}