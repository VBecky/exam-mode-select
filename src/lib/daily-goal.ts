// Daily goal tracking (localStorage based)
// Counts questions answered today and stores the user's target goal.

const KEY = "dailyGoal";
export const GOAL_OPTIONS = [5, 10, 15, 20, 30];
const DEFAULT_GOAL = 5;

type DailyGoalState = {
  date: string; // YYYY-MM-DD
  count: number; // questions answered today
  goal: number; // target questions per day
};

function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function load(): DailyGoalState {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw ? (JSON.parse(raw) as Partial<DailyGoalState>) : {};
    const goal =
      typeof s.goal === "number" && GOAL_OPTIONS.includes(s.goal) ? s.goal : DEFAULT_GOAL;
    // Reset the counter when a new day starts
    if (s.date !== todayKey()) return { date: todayKey(), count: 0, goal };
    return { date: s.date, count: typeof s.count === "number" ? s.count : 0, goal };
  } catch {
    return { date: todayKey(), count: 0, goal: DEFAULT_GOAL };
  }
}

function save(s: DailyGoalState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export type DailyGoal = { count: number; goal: number; done: boolean; remaining: number };

export function getDailyGoal(): DailyGoal {
  const s = load();
  const remaining = Math.max(0, s.goal - s.count);
  return { count: s.count, goal: s.goal, done: s.count >= s.goal, remaining };
}

/** Count one answered question toward today's goal. */
export function recordAnsweredQuestion(): void {
  const s = load();
  save({ ...s, count: s.count + 1 });
}

/** Change the daily goal target. */
export function setDailyGoal(goal: number): void {
  const s = load();
  save({ ...s, goal });
}
