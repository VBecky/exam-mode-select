// Completed exam attempts (localStorage based)

export type ExamAttempt = {
  subjectId: number;
  subjectName: string;
  year: string;
  score: number; // percentage
  correct: number;
  total: number;
  ts: number;
};

const KEY = "examHistory";
const MAX = 200;

export function getExamHistory(): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function recordExamAttempt(a: Omit<ExamAttempt, "ts">) {
  try {
    const list = getExamHistory();
    list.unshift({ ...a, ts: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

export type ExamStats = { examsDone: number; avgScore: number; bestScore: number };

export function getExamStats(list: ExamAttempt[] = getExamHistory()): ExamStats {
  if (list.length === 0) return { examsDone: 0, avgScore: 0, bestScore: 0 };
  const sum = list.reduce((s, a) => s + a.score, 0);
  return {
    examsDone: list.length,
    avgScore: Math.round(sum / list.length),
    bestScore: Math.max(...list.map((a) => a.score)),
  };
}

// ─── Derived analytics ────────────────────────────────────────────────────────

export type SubjectProgress = {
  subjectId: number;
  subjectName: string;
  attempts: number;
  avg: number;
  best: number;
  last: number;
  correct: number;
  total: number;
};

/** Per-subject performance, strongest first. */
export function getSubjectProgress(list: ExamAttempt[] = getExamHistory()): SubjectProgress[] {
  const map = new Map<number, ExamAttempt[]>();
  for (const a of list) {
    const arr = map.get(a.subjectId) ?? [];
    arr.push(a);
    map.set(a.subjectId, arr);
  }
  return [...map.entries()]
    .map(([subjectId, arr]) => {
      const sorted = [...arr].sort((x, y) => y.ts - x.ts);
      return {
        subjectId,
        subjectName: sorted[0].subjectName,
        attempts: sorted.length,
        avg: Math.round(sorted.reduce((s, a) => s + a.score, 0) / sorted.length),
        best: Math.max(...sorted.map((a) => a.score)),
        last: sorted[0].score,
        correct: sorted.reduce((s, a) => s + a.correct, 0),
        total: sorted.reduce((s, a) => s + a.total, 0),
      };
    })
    .sort((a, b) => b.avg - a.avg);
}

export type TrendPoint = { label: string; score: number };

/** Chronological score trend of the last `n` attempts. */
export function getScoreTrend(n = 8, list: ExamAttempt[] = getExamHistory()): TrendPoint[] {
  return [...list]
    .sort((a, b) => a.ts - b.ts)
    .slice(-n)
    .map((a, i) => ({ label: `#${i + 1}`, score: a.score }));
}

/** Difference between the average of the most recent half and the earlier half. */
export function getImprovement(list: ExamAttempt[] = getExamHistory()): number {
  if (list.length < 2) return 0;
  const asc = [...list].sort((a, b) => a.ts - b.ts);
  const mid = Math.floor(asc.length / 2);
  const avg = (arr: ExamAttempt[]) => arr.reduce((s, a) => s + a.score, 0) / arr.length;
  return Math.round(avg(asc.slice(mid)) - avg(asc.slice(0, mid)));
}

export type Achievement = { icon: string; label: string; hint: string; earned: boolean };

export function getAchievements(
  list: ExamAttempt[] = getExamHistory(),
  streak = 0,
): Achievement[] {
  const stats = getExamStats(list);
  const subjects = new Set(list.map((a) => a.subjectId)).size;
  return [
    { icon: "🎯", label: "First Exam", hint: "Finish 1 exam", earned: list.length >= 1 },
    { icon: "📚", label: "10 Papers", hint: "Finish 10 exams", earned: list.length >= 10 },
    { icon: "🔥", label: "7-Day Streak", hint: "Study 7 days in a row", earned: streak >= 7 },
    { icon: "⭐", label: "Scored 80%+", hint: "Get 80% on any paper", earned: stats.bestScore >= 80 },
    { icon: "🏆", label: "Scored 95%+", hint: "Get 95% on any paper", earned: stats.bestScore >= 95 },
    { icon: "🧭", label: "All-Rounder", hint: "Try 5 subjects", earned: subjects >= 5 },
  ];
}
