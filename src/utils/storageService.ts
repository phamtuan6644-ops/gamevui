/**
 * LocalStorage Service for BÉ VUI HỌC
 * Persists learner progress, stars, mastered letters/numbers, badges, and parent settings.
 */

export interface LearningProgress {
  stars: number;
  level: number;
  masteredLetters: string[];
  masteredNumbers: number[];
  unlockedBadges: string[];
  totalSessions: number;
  learningTimeSeconds: number;
  dailyTimeLimitMinutes: number; // 0 for unlimited
  childName: string;
  avatarId: string;
  lastActiveDate: string;
  incorrectQuestions: Array<{
    type: 'letter' | 'number';
    question: string;
    wrongAnswer: string;
    correctAnswer: string;
    timestamp: number;
  }>;
}

const STORAGE_KEY = 'be_vui_hoc_progress_v1';

const defaultProgress: LearningProgress = {
  stars: 0,
  level: 1,
  masteredLetters: [],
  masteredNumbers: [],
  unlockedBadges: ['daily_learner'],
  totalSessions: 1,
  learningTimeSeconds: 60,
  dailyTimeLimitMinutes: 30,
  childName: 'Bé Yêu',
  avatarId: 'bunny',
  lastActiveDate: new Date().toISOString().split('T')[0],
  incorrectQuestions: [],
};

class StorageService {
  public getProgress(): LearningProgress {
    if (typeof window === 'undefined') return defaultProgress;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return defaultProgress;
      const parsed = JSON.parse(data);
      return { ...defaultProgress, ...parsed };
    } catch {
      return defaultProgress;
    }
  }

  public saveProgress(progress: LearningProgress) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }

  public addStars(amount: number): LearningProgress {
    const p = this.getProgress();
    p.stars += amount;
    // Calculate level: level 1 = 0-9 stars, level 2 = 10-24, level 3 = 25-49, level 4 = 50+
    if (p.stars >= 50) p.level = 4;
    else if (p.stars >= 25) p.level = 3;
    else if (p.stars >= 10) p.level = 2;
    else p.level = 1;

    // Check badges
    this.checkBadges(p);
    this.saveProgress(p);
    return p;
  }

  public markLetterMastered(letterId: string): LearningProgress {
    const p = this.getProgress();
    if (!p.masteredLetters.includes(letterId)) {
      p.masteredLetters.push(letterId);
      this.checkBadges(p);
      this.saveProgress(p);
    }
    return p;
  }

  public markNumberMastered(num: number): LearningProgress {
    const p = this.getProgress();
    if (!p.masteredNumbers.includes(num)) {
      p.masteredNumbers.push(num);
      this.checkBadges(p);
      this.saveProgress(p);
    }
    return p;
  }

  public logIncorrect(type: 'letter' | 'number', question: string, wrongAnswer: string, correctAnswer: string) {
    const p = this.getProgress();
    p.incorrectQuestions.unshift({
      type,
      question,
      wrongAnswer,
      correctAnswer,
      timestamp: Date.now(),
    });
    // keep last 20
    if (p.incorrectQuestions.length > 20) {
      p.incorrectQuestions = p.incorrectQuestions.slice(0, 20);
    }
    this.saveProgress(p);
  }

  public addLearningTime(seconds: number) {
    const p = this.getProgress();
    p.learningTimeSeconds += seconds;
    this.saveProgress(p);
  }

  public updateSettings(settings: Partial<LearningProgress>) {
    const p = this.getProgress();
    const updated = { ...p, ...settings };
    this.saveProgress(updated);
    return updated;
  }

  public resetAllProgress(): LearningProgress {
    this.saveProgress(defaultProgress);
    return defaultProgress;
  }

  private checkBadges(p: LearningProgress) {
    const unlocked = new Set(p.unlockedBadges);

    if (p.masteredLetters.length >= 1) unlocked.add('first_letter');
    if (p.masteredLetters.length >= 5) unlocked.add('letter_master_5');
    if (p.masteredNumbers.length >= 5 || p.stars >= 10) unlocked.add('number_counter');
    if (p.stars >= 25) unlocked.add('star_collector');
    if (p.stars >= 50) unlocked.add('grand_champion');
    unlocked.add('daily_learner');

    p.unlockedBadges = Array.from(unlocked);
  }
}

export const storage = new StorageService();
