export type RecentExam = {
  subjectId: number;
  year: string;
  duration: string;
  questionsCount: number;
  mode: "practice" | "exam";
  ts: number;
  score: number | null;
};

const KEY = "recentExams";
const MAX = 3;

export function getRecentExams(): RecentExam[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function save(list: RecentExam[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {}
}

/** Record that a paper was opened. Keeps the newest first, max 3, deduped by subject+year. */
export function recordRecentExam(entry: Omit<RecentExam, "ts" | "score">) {
  const list = getRecentExams();
  const existing = list.find((e) => e.subjectId === entry.subjectId && e.year === entry.year);
  const next: RecentExam = {
    ...entry,
    ts: Date.now(),
    score: existing?.score ?? null,
  };
  save([next, ...list.filter((e) => !(e.subjectId === entry.subjectId && e.year === entry.year))]);
}

/** Attach the latest exam score to a stored recent paper. */
export function updateRecentExamScore(subjectId: number, year: string, score: number) {
  const list = getRecentExams();
  const i = list.findIndex((e) => e.subjectId === subjectId && e.year === year);
  if (i === -1) return;
  list[i] = { ...list[i], score };
  save(list);
}
