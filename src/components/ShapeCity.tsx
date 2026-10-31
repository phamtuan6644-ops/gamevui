import React, { useState } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import contentData from '../data/contentData.json';
import audio from '../utils/audioService';
import BunnyMascot from './BunnyMascot';

interface ShapeCityProps {
  onBack: () => void;
  onStarsEarned: (count: number) => void;
}

export const ShapeCity: React.FC<ShapeCityProps> = ({ onBack, onStarsEarned }) => {
  const shapes = contentData.shapesList;
  const [activeShape, setActiveShape] = useState(shapes[0]);
  const [isGameMode, setIsGameMode] = useState(false);
  const [targetShape, setTargetShape] = useState<typeof shapes[0]>(shapes[0]);
  const [gameOptions, setGameOptions] = useState<typeof shapes>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSpeakShape = async (shape: typeof shapes[0]) => {
    audio.playClick();
    setActiveShape(shape);
    await audio.speak(`${shape.vietnamese}. Đồ vật giống hình này như: ${shape.example}`);
  };

  const startShapeGame = () => {
    setIsGameMode(true);
    const target = shapes[Math.floor(Math.random() * shapes.length)];
    const distractors = shapes.filter((s) => s.name !== target.name).slice(0, 2);
    const opts = [target, ...distractors].sort(() => 0.5 - Math.random());

    setTargetShape(target);
    setGameOptions(opts);
    setFeedback(null);

    setTimeout(() => {
      audio.speak(`Bé hãy tìm ${target.vietnamese} giúp Bunny nhé!`);
    }, 400);
  };

  const handleSelectShape = (shape: typeof shapes[0]) => {
    if (shape.name === targetShape.name) {
      audio.playCorrect();
      setFeedback('Tuyệt vời! Bé chọn đúng rồi! +1 ⭐');
      audio.playStarChime();
      onStarsEarned(1);
      confetti({ particleCount: 40, spread: 60 });
      setTimeout(() => {
        startShapeGame();
      }, 1600);
    } else {
      audio.playEncourage();
      setFeedback('Chưa đúng rồi, bé thử lại nhé! 🐰');
      setTimeout(() => {
        setFeedback(null);
      }, 1400);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/70 via-indigo-50/50 to-purple-100/40 p-3 sm:p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Nav header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur rounded-3xl p-3 sm:p-4 shadow-sm border-2 border-purple-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                audio.playClick();
                onBack();
              }}
              className="p-2 sm:px-4 sm:py-2 bg-purple-100 hover:bg-purple-200 active:scale-95 text-purple-900 rounded-2xl font-bold flex items-center gap-2 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Về Trang chủ</span>
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-purple-800 flex items-center gap-2">
                <span>🏙️ Thành Phố Hình Khối</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Khám phá các hình khối quen thuộc trong cuộc sống
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audio.playClick();
                setIsGameMode(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                !isGameMode ? 'bg-purple-600 text-white shadow-sm' : 'bg-purple-100 text-purple-900'
              }`}
            >
              📐 Học Hình Khối
            </button>
            <button
              onClick={startShapeGame}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                isGameMode ? 'bg-purple-600 text-white shadow-sm' : 'bg-purple-100 text-purple-900'
              }`}
            >
              🎮 Thử Thách Tìm Hình
            </button>
          </div>
        </div>

        {!isGameMode ? (
          <div className="space-y-6">
            {/* Spotlight Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-3 border-purple-300">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-100 via-indigo-50 to-pink-100 rounded-3xl border-2 border-purple-300 text-center shadow-inner">
                  <span className="text-8xl sm:text-9xl filter drop-shadow-md">
                    {activeShape.emoji}
                  </span>
                  <span className="text-3xl font-black text-purple-900 mt-2">
                    {activeShape.name}
                  </span>

                  <button
                    onClick={() => handleSpeakShape(activeShape)}
                    className="mt-5 w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 active:scale-95 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg border-b-4 border-purple-800 transition-transform cursor-pointer"
                  >
                    <Volume2 className="w-6 h-6 animate-pulse" />
                    <span>Nghe đọc {activeShape.name}</span>
                  </button>
                </div>

                <div className="md:col-span-7 space-y-4">
                  <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200">
                    <h3 className="text-xl font-bold text-purple-900 mb-1">
                      Các đồ vật xung quanh có dạng {activeShape.name}:
                    </h3>
                    <p className="text-lg text-slate-700 font-medium leading-relaxed">
                      {activeShape.example}
                    </p>
                  </div>

                  <div className="pt-2">
                    <BunnyMascot
                      message={`Bé thấy ${activeShape.name} có ở khắp mọi nơi nè! Cùng Bunny tìm xem trong nhà có gì giống hình này nhé!`}
                      mood="happy"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shape Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {shapes.map((item) => {
                const isSelected = activeShape.name === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleSpeakShape(item)}
                    className={`p-4 rounded-3xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-lg scale-105 ring-4 ring-purple-300'
                        : 'bg-white hover:bg-purple-50 text-slate-800 shadow-sm border-2 border-purple-200 active:scale-95'
                    }`}
                  >
                    <span className="text-5xl">{item.emoji}</span>
                    <span className="font-black text-base mt-2">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Game Mode */
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border-3 border-purple-300 space-y-6">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                Trò chơi tinh mắt
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
                Bé hãy tìm: <span className="text-purple-600 underline">{targetShape.name}</span>
              </h3>
            </div>

            <div className="flex justify-center">
              <BunnyMascot
                message={`Đâu là ${targetShape.vietnamese} nhỉ? Bé chọn giúp Bunny với nhé!`}
                mood="thinking"
                size="md"
              />
            </div>

            {feedback && (
              <div className="p-3 bg-purple-100 border-2 border-purple-400 text-purple-900 rounded-2xl text-center font-bold text-lg animate-bounce">
                {feedback}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
              {gameOptions.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => handleSelectShape(opt)}
                  className="p-6 bg-white hover:bg-purple-50 border-3 border-purple-300 hover:border-purple-500 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-xl active:scale-95 transition-all cursor-pointer"
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

export default ShapeCity;
