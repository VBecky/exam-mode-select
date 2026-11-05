import { beforeEach, expect, test } from 'vitest';
import { getDailyGoal, GOAL_OPTIONS, recordAnsweredQuestion, setDailyGoal } from './daily-goal';

beforeEach(() => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    },
  });
});

test('daily goals can reach 250 and retain answered-question progress', () => {
  recordAnsweredQuestion();
  setDailyGoal(250);
  expect(getDailyGoal()).toEqual({ count: 1, goal: 250, remaining: 249, done: false });
  expect(Math.max(...GOAL_OPTIONS)).toBe(250);
});

test('daily goals cannot exceed 250 questions', () => {
  setDailyGoal(250);
  setDailyGoal(251);
  expect(getDailyGoal().goal).toBe(250);
});