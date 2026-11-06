// Preserve the existing quiz data format while isolating accounts on this device.
const keys = ['studyDays','recentExams','examHistory','dailyGoal','lastPaper','quizProgress'];
export function clearDeletedStudyAccount(id: string) {
  const active = localStorage.getItem('studyAccountOwner') === id;
  for (const key of keys) {
    localStorage.removeItem(`${key}:${id}`);
    if (active) localStorage.removeItem(key);
  }
  if (active) {
    for (const key of ['studyAccountOwner', 'userName', 'userPhone', 'userPassword']) localStorage.removeItem(key);
  }
}
export function activateStudyAccount(id: string) {
  const previous = localStorage.getItem('studyAccountOwner');
  if (previous === id) return;
  if (previous) {
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value === null) localStorage.removeItem(`${key}:${previous}`);
      else localStorage.setItem(`${key}:${previous}`, value);
      const next = localStorage.getItem(`${key}:${id}`);
      if (next === null) localStorage.removeItem(key);
      else localStorage.setItem(key, next);
    }
  }
  localStorage.setItem('studyAccountOwner', id);
  localStorage.removeItem('userPassword');
}