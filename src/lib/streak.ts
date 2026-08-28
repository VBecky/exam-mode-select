// Daily study streak tracking (localStorage based)

const KEY = "studyDays";

function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getStudyDays(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Mark today as an active study day. */
export function recordStudyDay(): void {
  try {
    const days = getStudyDays();
    const t = todayKey();
    if (!days.includes(t)) {
      days.push(t);
      // keep last 400 days
      localStorage.setItem(KEY, JSON.stringify(days.slice(-400)));
    }
  } catch {
    /* ignore */
  }
}

function shift(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** Consecutive-day streak ending today (or yesterday if today not yet studied). */
export function getStreakCount(days: string[] = getStudyDays()): number {
  const set = new Set(days);
  const now = new Date();
  let cursor = set.has(todayKey(now)) ? now : shift(now, -1);
  if (!set.has(todayKey(cursor))) return 0;
  let count = 0;
  while (set.has(todayKey(cursor))) {
    count++;
    cursor = shift(cursor, -1);
  }
  return count;
}

export type StreakDay = {
  label: string;
  key: string;
  active: boolean;
  isToday: boolean;
  isFuture: boolean;
};

/** Current week, Monday → Sunday. */
export function getWeek(days: string[] = getStudyDays()): StreakDay[] {
  const set = new Set(days);
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 0 = Monday
  const monday = shift(now, -dow);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const tKey = todayKey(now);
  return labels.map((label, i) => {
    const d = shift(monday, i);
    const key = todayKey(d);
    return {
      label,
      key,
      active: set.has(key),
      isToday: key === tKey,
      isFuture: i > dow,
    };
  });
}
