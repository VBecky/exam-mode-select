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
