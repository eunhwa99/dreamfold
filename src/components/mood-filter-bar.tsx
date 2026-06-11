import Link from "next/link";

type Props = {
  currentPath: string;
  moods: string[];
  selectedMood: string | null;
  query?: Record<string, string | null | undefined>;
};

export function MoodFilterBar({ currentPath, moods, selectedMood, query }: Props) {
  const entries = [
    { label: "전체", value: null },
    ...moods.map((mood) => ({ label: mood, value: mood }))
  ];

  return (
    <div className="s1-mood-row" aria-label="감정 필터">
      {entries.map((entry) => {
        const active = (entry.value ?? null) === selectedMood;
        const searchParams = new URLSearchParams();

        Object.entries(query ?? {}).forEach(([key, value]) => {
          if (value) {
            searchParams.set(key, value);
          }
        });

        if (entry.value) {
          searchParams.set("mood", entry.value);
        } else {
          searchParams.delete("mood");
        }

        const queryString = searchParams.toString();
        const href = queryString ? `${currentPath}?${queryString}` : currentPath;

        return (
          <Link
            key={entry.label}
            href={href}
            className={`mood-pill${active ? " active" : ""}`}
            aria-label={`${entry.label} 필터`}
          >
            {entry.label}
          </Link>
        );
      })}
    </div>
  );
}
