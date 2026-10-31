import React, { useState } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import contentData from '../data/contentData.json';
import audio from '../utils/audioService';
import BunnyMascot from './BunnyMascot';

interface DiscoveryForestProps {
  onBack: () => void;
  onStarsEarned: (count: number) => void;
}

export const DiscoveryForest: React.FC<DiscoveryForestProps> = ({ onBack, onStarsEarned }) => {
  const animals = contentData.natureAnimals;
  const [activeAnimal, setActiveAnimal] = useState(animals[0]);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<any>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePlayAnimal = async (animal: typeof animals[0]) => {
    audio.playClick();
    setActiveAnimal(animal);
    await audio.speak(`${animal.name}. Kêu ${animal.soundName}. ${animal.desc}`);
  };

  const startAnimalQuiz = () => {
    setIsQuizMode(true);
    const target = animals[Math.floor(Math.random() * animals.length)];
    const distractors = animals.filter((a) => a.name !== target.name).slice(0, 2);
    const options = [target, ...distractors].sort(() => 0.5 - Math.random());

    setQuizQuestion({
      target,
      options,
      prompt: `Bạn nào kêu "${target.soundName}" vậy bé?`,
    });
    setFeedback(null);

    setTimeout(() => {
      audio.speak(`Bạn nào kêu ${target.soundName} vậy bé?`);
    }, 400);
  };

  const handleSelectQuiz = (selected: typeof animals[0]) => {
    if (selected.name === quizQuestion.target.name) {
      audio.playCorrect();
      setFeedback('Chính xác rồi! Bé nhận được 1 ⭐');
      audio.playStarChime();
      onStarsEarned(1);
      confetti({ particleCount: 40, spread: 60 });
      setTimeout(() => {
        startAnimalQuiz();
      }, 1600);
    } else {
      audio.playEncourage();
      setFeedback('Chưa đúng rồi. Bé nghe lại xem nhé! 🐰');
      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-green-50/50 to-emerald-100/40 p-3 sm:p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Nav header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur rounded-3xl p-3 sm:p-4 shadow-sm border-2 border-emerald-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                audio.playClick();
                onBack();
              }}
              className="p-2 sm:px-4 sm:py-2 bg-emerald-100 hover:bg-emerald-200 active:scale-95 text-emerald-900 rounded-2xl font-bold flex items-center gap-2 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Về Trang chủ</span>
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-800 flex items-center gap-2">
                <span>🌲 Khu Rừng Khám Phá</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Tìm hiểu các bạn động vật đáng yêu và tiếng kêu tự nhiên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audio.playClick();
                setIsQuizMode(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                !isQuizMode ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              🐾 Khám Phá Muông Thú
            </button>
            <button
              onClick={startAnimalQuiz}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                isQuizMode ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              🎯 Đố Vui Tiếng Kêu
            </button>
          </div>
        </div>

        {!isQuizMode ? (
          <div className="space-y-6">
            {/* Spotlight Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-3 border-emerald-300">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 rounded-3xl border-2 border-emerald-300 text-center shadow-inner">
                  <span className="text-8xl sm:text-9xl animate-pulse filter drop-shadow-md">
                    {activeAnimal.emoji}
                  </span>
                  <span className="text-3xl font-black text-emerald-800 mt-2">
                    {activeAnimal.name}
                  </span>
                  <span className="text-sm font-bold text-teal-700 bg-white px-3 py-1 rounded-full mt-1 border border-emerald-200">
                    Kêu: "{activeAnimal.soundName}"
                  </span>

                  <button
                    onClick={() => handlePlayAnimal(activeAnimal)}
                    className="mt-5 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 active:scale-95 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg border-b-4 border-emerald-700 transition-transform cursor-pointer"
                  >
                    <Volume2 className="w-6 h-6 animate-pulse" />
                    <span>Nghe tiếng {activeAnimal.name}</span>
                  </button>
                </div>

                <div className="md:col-span-7 space-y-4">
                  <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200">
                    <h3 className="text-xl font-bold text-emerald-900 mb-1">
                      Đặc điểm đáng yêu của {activeAnimal.name}:
                    </h3>
                    <p className="text-lg text-slate-700 font-medium leading-relaxed">
                      {activeAnimal.desc}
                    </p>
                  </div>

                  <div className="pt-2">
                    <BunnyMascot
                      message={`Bunny rất thích bạn ${activeAnimal.name}! Bé hãy bắt chước tiếng kêu "${activeAnimal.soundName}" nhé!`}
                      mood="happy"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Animals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {animals.map((item) => {
                const isSelected = activeAnimal.name === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => handlePlayAnimal(item)}
                    className={`p-4 rounded-3xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-lg scale-105 ring-4 ring-emerald-300'
                        : 'bg-white hover:bg-emerald-50 text-slate-800 shadow-sm border-2 border-emerald-200 active:scale-95'
                    }`}
                  >
                    <span className="text-5xl">{item.emoji}</span>
                    <span className="font-extrabold text-base mt-2">{item.name}</span>
                    <span
                      className={`text-xs ${
                        isSelected ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {item.soundName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Quiz Mode */
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border-3 border-emerald-300 space-y-6">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                Thử thách đôi tai vàng
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
                {quizQuestion.prompt}
              </h3>
            </div>

            <div className="flex justify-center">
              <BunnyMascot
                message={`Lắng nghe nè: "${quizQuestion.target.soundName}"! Bé chọn đúng bạn ấy nhé!`}
                mood="thinking"
                size="md"
              />
            </div>

            {feedback && (
              <div className="p-3 bg-emerald-100 border-2 border-emerald-400 text-emerald-800 rounded-2xl text-center font-bold text-lg animate-bounce">
                {feedback}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
              {quizQuestion.options.map((opt: typeof animals[0]) => (
                <button
                  key={opt.name}
                  onClick={() => handleSelectQuiz(opt)}
                  className="p-6 bg-white hover:bg-emerald-50 border-3 border-emerald-300 hover:border-emerald-500 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-6xl">{opt.emoji}</span>
                  <span className="font-black text-xl text-slate-800">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryForest;
