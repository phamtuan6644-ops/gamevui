import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import HomeScreen from './components/HomeScreen';
import LetterKingdom from './components/LetterKingdom';
import NumberIsland from './components/NumberIsland';
import DiscoveryForest from './components/DiscoveryForest';
import ShapeCity from './components/ShapeCity';
import BrainChallenge from './components/BrainChallenge';
import BadgesModal from './components/BadgesModal';
import ParentZoneModal from './components/ParentZoneModal';
import { storage, LearningProgress } from './utils/storageService';
import audio from './utils/audioService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [progress, setProgress] = useState<LearningProgress>(storage.getProgress());
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isParentsOpen, setIsParentsOpen] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);

  // Periodic learning time tracker
  useEffect(() => {
    const timer = setInterval(() => {
      storage.addLearningTime(10);
      const updated = storage.getProgress();
      setProgress(updated);

      // Check daily limit if set
      if (
        updated.dailyTimeLimitMinutes > 0 &&
        updated.learningTimeSeconds >= updated.dailyTimeLimitMinutes * 60 &&
        !timeWarning
      ) {
        setTimeWarning(true);
      }
    }, 10000); // update every 10s

    return () => clearInterval(timer);
  }, [timeWarning]);

  // Sync progress when stars are earned
  const handleStarsEarned = (amount: number) => {
    const updated = storage.getProgress();
    setProgress({ ...updated });
  };

  const handleProgressReset = () => {
    setProgress(storage.getProgress());
  };

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col font-['Baloo_2',sans-serif]">
      {/* Top Navigation */}
      <TopNav
        stars={progress.stars}
        level={progress.level}
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenParents={() => setIsParentsOpen(true)}
      />

      {/* Screen Time Gentle Rest Reminder if exceeded */}
      {timeWarning && (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-center font-bold text-sm flex items-center justify-center gap-3 shadow-md animate-fade-in z-20">
          <span>⏰ Bé đã học chăm chỉ {progress.dailyTimeLimitMinutes} phút rồi! Hãy chớp mắt và thư giãn một chút nhé!</span>
          <button
            onClick={() => setTimeWarning(false)}
            className="px-3 py-1 bg-white text-amber-900 rounded-lg text-xs font-black shadow-sm"
          >
            Đã hiểu
          </button>
        </div>
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        {currentScreen === 'home' && (
          <HomeScreen
            stars={progress.stars}
            level={progress.level}
            childName={progress.childName}
            onSelectZone={(zoneId) => setCurrentScreen(zoneId)}
            onOpenBadges={() => setIsBadgesOpen(true)}
            onOpenParents={() => setIsParentsOpen(true)}
          />
        )}

        {currentScreen === 'letters' && (
          <LetterKingdom
            onBack={() => setCurrentScreen('home')}
            onStarsEarned={handleStarsEarned}
          />
        )}

        {currentScreen === 'numbers' && (
          <NumberIsland
            onBack={() => setCurrentScreen('home')}
            onStarsEarned={handleStarsEarned}
          />
        )}

        {currentScreen === 'forest' && (
          <DiscoveryForest
            onBack={() => setCurrentScreen('home')}
            onStarsEarned={handleStarsEarned}
          />
        )}

        {currentScreen === 'shapes' && (
          <ShapeCity
            onBack={() => setCurrentScreen('home')}
            onStarsEarned={handleStarsEarned}
          />
        )}

        {currentScreen === 'brain' && (
          <BrainChallenge
            onBack={() => setCurrentScreen('home')}
            onStarsEarned={handleStarsEarned}
          />
        )}
      </main>

      {/* Badges Showcase Modal */}
      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        currentStars={progress.stars}
      />

      {/* Parent Zone Modal */}
      <ParentZoneModal
        isOpen={isParentsOpen}
        onClose={() => setIsParentsOpen(false)}
        onProgressReset={handleProgressReset}
      />
    </div>
  );
}
