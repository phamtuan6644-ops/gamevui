import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Sparkles, Brain } from 'lucide-react';
import confetti from 'canvas-confetti';
import audio from '../utils/audioService';
import BunnyMascot from './BunnyMascot';

interface BrainChallengeProps {
  onBack: () => void;
  onStarsEarned: (count: number) => void;
}

interface CardItem {
  id: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_ICONS = [
  { emoji: '🐰', name: 'Thỏ con' },
  { emoji: '🍎', name: 'Quả táo' },
  { emoji: '⭐', name: 'Ngôi sao' },
  { emoji: '🚗', name: 'Ô tô' },
];

export const BrainChallenge: React.FC<BrainChallengeProps> = ({ onBack, onStarsEarned }) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Initialize Memory Game
  const initGame = () => {
    audio.playClick();
    const deck: CardItem[] = [];
    let idCounter = 1;

    MEMORY_ICONS.forEach((item) => {
      // create 2 of each
      deck.push({ id: idCounter++, emoji: item.emoji, name: item.name, isFlipped: false, isMatched: false });
      deck.push({ id: idCounter++, emoji: item.emoji, name: item.name, isFlipped: false, isMatched: false });
    });

    // Shuffle deck
    deck.sort(() => 0.5 - Math.random());
    setCards(deck);
    setFlippedIndices([]);
    setMatchedPairs(0);
    setIsWon(false);

    audio.speak('Bé hãy lật các thẻ bài để tìm các cặp hình giống nhau nhé!');
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length >= 2) {
      return;
    }

    audio.playClick();
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Matched!
        setTimeout(() => {
          audio.playCorrect();
          audio.speak(`Tìm thấy cặp ${cards[firstIdx].name}!`);
          const matchedCards = [...cards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatchedPairs((prev) => {
            const next = prev + 1;
            if (next === MEMORY_ICONS.length) {
              // Game Won!
              setIsWon(true);
              audio.playVictoryFanfare();
              onStarsEarned(3);
              confetti({ particleCount: 100, spread: 80 });
            }
            return next;
          });
        }, 500);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          audio.playEncourage();
          const resetCards = [...cards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/70 via-pink-50/50 to-rose-100/40 p-3 sm:p-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Nav header */}
        <div className="flex items-center justify-between gap-3 bg-white/90 backdrop-blur rounded-3xl p-3 sm:p-4 shadow-sm border-2 border-rose-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                audio.playClick();
                onBack();
              }}
              className="p-2 sm:px-4 sm:py-2 bg-rose-100 hover:bg-rose-200 active:scale-95 text-rose-900 rounded-2xl font-bold flex items-center gap-2 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Về Trang chủ</span>
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-rose-800 flex items-center gap-2">
                <span>🧠 Thử Thách Trí Tuệ</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Trò chơi lật thẻ bài rèn luyện trí nhớ siêu đỉnh cho bé
              </p>
            </div>
          </div>

          <button
            onClick={initGame}
            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Trộn Thẻ Mới</span>
          </button>
        </div>

        {/* Game Stage */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-3 border-rose-300 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <BunnyMascot
              message={
                isWon
                  ? 'Hoan hô! Trí nhớ của bạn nhỏ thật tuyệt vời!'
                  : 'Bé hãy lật 2 thẻ giống nhau để ghi điểm nhé!'
              }
              mood={isWon ? 'cheering' : 'happy'}
              size="sm"
            />

            <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-200">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="font-extrabold text-rose-800 text-sm">
                Đã ghép: {matchedPairs}/{MEMORY_ICONS.length} cặp
              </span>
            </div>
          </div>

          {!isWon ? (
            /* Cards 4x2 Grid */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto py-4">
              {cards.map((card, idx) => {
                const isRevealed = card.isFlipped || card.isMatched;

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className={`aspect-square rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-300 select-none shadow-md ${
                      card.isMatched
                        ? 'bg-emerald-100 border-3 border-emerald-400 scale-95 opacity-80'
                        : isRevealed
                        ? 'bg-white border-3 border-rose-400 scale-105'
                        : 'bg-gradient-to-tr from-rose-400 to-pink-500 border-3 border-rose-500 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isRevealed ? (
                      <span className="text-5xl sm:text-6xl animate-pop">{card.emoji}</span>
                    ) : (
                      <span className="text-4xl text-white font-black drop-shadow">❓</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Victory screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 bg-gradient-to-tr from-rose-400 to-amber-400 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-rose-800">
                Chúc Mừng Thần Đồng Trí Nhớ! 🎉
              </h3>
              <p className="text-slate-600 font-medium">
                Bé đã ghi nhớ và tìm được toàn bộ các cặp hình! Bé được thưởng{' '}
                <strong className="text-amber-500">+3 ⭐</strong>
              </p>
              <button
                onClick={initGame}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 text-white font-black text-lg rounded-2xl shadow-lg active:scale-95 transition-transform"
              >
                Chơi Vòng Mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainChallenge;
