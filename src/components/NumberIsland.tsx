import React, { useState } from 'react';
import { Volume2, CheckCircle2, ArrowLeft, RefreshCw, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import contentData from '../data/contentData.json';
import audio from '../utils/audioService';
import { storage } from '../utils/storageService';
import BunnyMascot from './BunnyMascot';

interface NumberIslandProps {
  onBack: () => void;
  onStarsEarned: (count: number) => void;
}

type NumberTab = 'explorer' | 'countGame' | 'pickGame' | 'compareGame' | 'additionGame' | 'subtractionGame';

export const NumberIsland: React.FC<NumberIslandProps> = ({ onBack, onStarsEarned }) => {
  const numbers = contentData.numbers;
  const [activeTab, setActiveTab] = useState<NumberTab>('explorer');
  const [selectedNum, setSelectedNum] = useState(numbers[1]); // default to 1
  const [masteredNumbers, setMasteredNumbers] = useState<number[]>(
    storage.getProgress().masteredNumbers
  );

  // Game state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [currentQ, setCurrentQ] = useState<any>(null);
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'wrong' | null;
    selectedOption: any;
    message: string;
  }>({ status: null, selectedOption: null, message: '' });

  // Play number pronunciation
  const handlePronounceNumber = async (numObj: typeof numbers[0]) => {
    audio.playClick();
    await audio.speak(`Số ${numObj.value}. ${numObj.vietnamese}. ${numObj.item}`);
  };

  const handleMarkMastered = (val: number) => {
    audio.playClick();
    const updated = storage.markNumberMastered(val);
    setMasteredNumbers([...updated.masteredNumbers]);
    if (!masteredNumbers.includes(val)) {
      audio.playStarChime();
      onStarsEarned(1);
    }
  };

  // Generate question for different number game modes
  const generateQuestion = (mode: NumberTab, qIndex: number) => {
    const items = ['🍎', '🍓', '🥕', '⭐', '🎈', '🦆', '🐟', '🚗'];
    const chosenEmoji = items[Math.floor(Math.random() * items.length)];

    if (mode === 'countGame') {
      // Counting items (1 to 10)
      const count = Math.floor(Math.random() * 8) + 1; // 1 to 8 for clear counting on screen
      const options = [count];
      while (options.length < 3) {
        const fake = Math.floor(Math.random() * 9) + 1;
        if (!options.includes(fake)) options.push(fake);
      }
      options.sort(() => 0.5 - Math.random());

      return {
        mode,
        count,
        emoji: chosenEmoji,
        options,
        correctAnswer: count,
        prompt: `Bé đếm xem có tất cả bao nhiêu ${chosenEmoji} nào?`,
        qIndex,
      };
    }

    if (mode === 'pickGame') {
      // Pick number according to audio/name
      const target = numbers[Math.floor(Math.random() * numbers.length)];
      const distractors = numbers.filter((n) => n.value !== target.value);
      const fake1 = distractors[Math.floor(Math.random() * distractors.length)];
      const fake2 = distractors.filter((n) => n.value !== fake1.value)[0];
      const options = [target.value, fake1.value, fake2.value].sort(() => 0.5 - Math.random());

      return {
        mode,
        target,
        options,
        correctAnswer: target.value,
        prompt: `Bé hãy chọn số ${target.value} (${target.vietnamese}) nhé!`,
        qIndex,
      };
    }

    if (mode === 'compareGame') {
      // Compare two groups: Left vs Right
      const leftCount = Math.floor(Math.random() * 7) + 1;
      const diff = Math.random() > 0.3 ? (Math.random() > 0.5 ? 2 : -2) : 0;
      const rightCount = Math.max(1, Math.min(9, leftCount + diff));

      let sign = '=';
      if (leftCount > rightCount) sign = '>';
      else if (leftCount < rightCount) sign = '<';

      return {
        mode,
        leftCount,
        rightCount,
        emoji: chosenEmoji,
        options: ['>', '<', '='],
        correctAnswer: sign,
        prompt: `Bé hãy so sánh xem bên nào nhiều hơn nhé?`,
        qIndex,
      };
    }

    if (mode === 'additionGame') {
      // Visual addition: a + b
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 4) + 1;
      const sum = a + b;
      const options = [sum];
      while (options.length < 3) {
        const fake = Math.floor(Math.random() * 9) + 1;
        if (!options.includes(fake)) options.push(fake);
      }
      options.sort(() => 0.5 - Math.random());

      return {
        mode,
        a,
        b,
        emoji: chosenEmoji,
        options,
        correctAnswer: sum,
        prompt: `Có ${a} quả và thêm ${b} quả, tất cả là mấy quả nào?`,
        qIndex,
      };
    }

    if (mode === 'subtractionGame') {
      // Visual subtraction: total - minus
      const total = Math.floor(Math.random() * 5) + 3; // 3 to 7
      const minus = Math.floor(Math.random() * (total - 1)) + 1;
      const result = total - minus;
      const options = [result];
      while (options.length < 3) {
        const fake = Math.floor(Math.random() * 7) + 1;
        if (!options.includes(fake)) options.push(fake);
      }
      options.sort(() => 0.5 - Math.random());

      return {
        mode,
        total,
        minus,
        emoji: chosenEmoji,
        options,
        correctAnswer: result,
        prompt: `Có ${total} quả, bớt đi ${minus} quả, còn lại mấy quả?`,
        qIndex,
      };
    }

    return null;
  };

  const startNumberGame = (mode: NumberTab) => {
    setActiveTab(mode);
    setQuestionIndex(0);
    setScore(0);
    setGameFinished(false);
    setFeedback({ status: null, selectedOption: null, message: '' });

    const firstQ = generateQuestion(mode, 0);
    setCurrentQ(firstQ);

    if (firstQ?.prompt) {
      setTimeout(() => {
        audio.speak(firstQ.prompt);
      }, 400);
    }
  };

  const handleSelectAnswer = (ans: any) => {
    if (feedback.status !== null) return;

    const isCorrect = ans === currentQ.correctAnswer;

    if (isCorrect) {
      audio.playCorrect();
      const newScore = score + 1;
      setScore(newScore);
      storage.addStars(1);
      if (typeof currentQ.correctAnswer === 'number') {
        storage.markNumberMastered(currentQ.correctAnswer);
        setMasteredNumbers(storage.getProgress().masteredNumbers);
      }
      onStarsEarned(1);

      setFeedback({
        status: 'correct',
        selectedOption: ans,
        message: 'Hoan hô! Bé tính đúng rồi! +1 ⭐',
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
      });

      setTimeout(() => {
        nextQuestion(newScore);
      }, 1500);
    } else {
      audio.playEncourage();
      storage.logIncorrect('number', currentQ.prompt, String(ans), String(currentQ.correctAnswer));

      setFeedback({
        status: 'wrong',
        selectedOption: ans,
        message: 'Chưa chính xác rồi. Bé đếm kỹ lại một chút nhé! 🐰',
      });

      audio.speak('Bé đếm kỹ lại một chút nhé!');

      setTimeout(() => {
        setFeedback({ status: null, selectedOption: null, message: '' });
      }, 1800);
    }
  };

  const nextQuestion = (currentScore: number) => {
    if (questionIndex + 1 >= 5) {
      setGameFinished(true);
      audio.playVictoryFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
    } else {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      const nextQ = generateQuestion(activeTab, nextIdx);
      setCurrentQ(nextQ);
      setFeedback({ status: null, selectedOption: null, message: '' });

      if (nextQ?.prompt) {
        setTimeout(() => {
          audio.speak(nextQ.prompt);
        }, 400);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-blue-50/50 to-sky-100/40 p-3 sm:p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur rounded-3xl p-3 sm:p-4 shadow-sm border-2 border-sky-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                audio.playClick();
                if (activeTab !== 'explorer') {
                  setActiveTab('explorer');
                } else {
                  onBack();
                }
              }}
              className="p-2 sm:px-4 sm:py-2 bg-sky-100 hover:bg-sky-200 active:scale-95 text-sky-900 rounded-2xl font-bold flex items-center gap-2 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">
                {activeTab === 'explorer' ? 'Về Trang chủ' : 'Quay lại Đảo số'}
              </span>
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-sky-800 flex items-center gap-2">
                <span>🏝️ Đảo Số Học Kỳ Thú</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Nhận biết số, tập đếm và làm quen phép tính 0–10
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-sky-100/70 rounded-2xl border border-sky-200">
            <button
              onClick={() => {
                audio.playClick();
                setActiveTab('explorer');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'explorer'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-900 hover:bg-sky-200/50'
              }`}
            >
              🔢 Nhận Biết Số 0-10
            </button>
            <button
              onClick={() => startNumberGame('countGame')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'countGame'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-900 hover:bg-sky-200/50'
              }`}
            >
              🍎 Tập Đếm Đồ Vật
            </button>
            <button
              onClick={() => startNumberGame('pickGame')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'pickGame'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-900 hover:bg-sky-200/50'
              }`}
            >
              🎯 Chọn Số Đúng
            </button>
            <button
              onClick={() => startNumberGame('compareGame')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'compareGame'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-900 hover:bg-sky-200/50'
              }`}
            >
              ⚖️ So Sánh Lớn Bé
            </button>
            <button
              onClick={() => startNumberGame('additionGame')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'additionGame'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-900 hover:bg-sky-200/50'
              }`}
            >
              ➕ Phép Cộng Vui
            </button>
            <button
              onClick={() => startNumberGame('subtractionGame')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'subtractionGame'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-900 hover:bg-sky-200/50'
              }`}
            >
              ➖ Phép Trừ Trực Quan
            </button>
          </div>
        </div>

        {/* ================= EXPLORER MODE ================= */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            {/* Number Spotlight */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-3 border-sky-300">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Huge Number Display */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 rounded-3xl border-2 border-sky-300 text-center shadow-inner">
                  <span className="text-8xl sm:text-9xl font-black text-sky-600 drop-shadow-md">
                    {selectedNum.value}
                  </span>

                  <span className="text-3xl font-extrabold text-indigo-700 mt-2">
                    {selectedNum.vietnamese}
                  </span>

                  {/* Audio button */}
                  <button
                    onClick={() => handlePronounceNumber(selectedNum)}
                    className="mt-5 w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 active:scale-95 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg border-b-4 border-sky-700 transition-transform cursor-pointer"
                  >
                    <Volume2 className="w-6 h-6 animate-pulse" />
                    <span>Nghe đọc số {selectedNum.value}</span>
                  </button>
                </div>

                {/* Tactile counting representation */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                        Số lượng thực tế
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
                        {selectedNum.item}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleMarkMastered(selectedNum.value)}
                      className={`px-4 py-2 rounded-2xl font-bold text-sm flex items-center gap-1.5 transition-all ${
                        masteredNumbers.includes(selectedNum.value)
                          ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 border border-slate-300'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          masteredNumbers.includes(selectedNum.value)
                            ? 'text-emerald-600 fill-emerald-100'
                            : 'text-slate-400'
                        }`}
                      />
                      <span>
                        {masteredNumbers.includes(selectedNum.value) ? 'Đã thành thạo!' : 'Đánh dấu đã học'}
                      </span>
                    </button>
                  </div>

                  {/* Visual Items to Count */}
                  <div className="bg-sky-50/80 p-5 rounded-2xl border border-sky-200">
                    <p className="text-xs font-bold text-sky-800 mb-2">BÉ HÃY CHẠM ĐỂ ĐẾM:</p>
                    <div className="flex flex-wrap gap-2.5 min-h-[64px] items-center">
                      {selectedNum.value === 0 ? (
                        <span className="text-slate-400 font-medium italic">
                          (Số 0 là không có đồ vật nào cả bé nhé!)
                        </span>
                      ) : (
                        Array.from({ length: selectedNum.value }).map((_, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              audio.playStarChime();
                              audio.speak(String(i + 1));
                            }}
                            className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-sky-200 flex items-center justify-center text-3xl cursor-pointer hover:scale-115 active:scale-95 transition-transform"
                            title={`Chạm để đếm ${i + 1}`}
                          >
                            {selectedNum.emoji}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-sm text-slate-700">
                    💡 <strong className="text-amber-800">Mẹo nhớ cho bé:</strong> {selectedNum.hint}
                  </div>

                  <div className="pt-1">
                    <BunnyMascot
                      message={`Số ${selectedNum.value} đọc là "${selectedNum.vietnamese}". Bé hãy đếm các hình cùng Bunny nào!`}
                      mood="happy"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Numbers 0 to 10 Grid */}
            <div className="bg-white/90 rounded-3xl p-6 shadow-sm border border-sky-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                  <span>Trọn bộ các số từ 0 đến 10</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Đã thuộc {masteredNumbers.length}/11 số
                  </span>
                </h4>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Bấm vào từng số để khám phá
                </p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2.5">
                {numbers.map((num) => {
                  const isSelected = selectedNum.value === num.value;
                  const isMastered = masteredNumbers.includes(num.value);

                  return (
                    <button
                      key={num.value}
                      onClick={() => {
                        setSelectedNum(num);
                        handlePronounceNumber(num);
                      }}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500 text-white shadow-lg scale-105 ring-4 ring-sky-300'
                          : 'bg-white hover:bg-sky-50 text-slate-800 shadow-sm border-2 border-sky-200 hover:border-sky-400 active:scale-95'
                      }`}
                    >
                      {isMastered && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] shadow">
                          ✓
                        </div>
                      )}
                      <span className="text-3xl sm:text-4xl font-black">{num.value}</span>
                      <span
                        className={`text-xs font-bold mt-1 ${
                          isSelected ? 'text-sky-100' : 'text-slate-500'
                        }`}
                      >
                        {num.vietnamese}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= GAME MODES ================= */}
        {activeTab !== 'explorer' && currentQ && (
          <div className="space-y-6">
            {!gameFinished ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-3 border-sky-300 space-y-6">
                {/* Progress & Score */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sky-800 text-base sm:text-lg">
                      Câu hỏi {questionIndex + 1}/5
                    </span>
                    <div className="w-28 sm:w-48 bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-gradient-to-r from-sky-400 to-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${((questionIndex + 1) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-3 py-1 bg-sky-100 rounded-xl font-black text-sky-800 text-sm">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>{score} ⭐ Đạt được</span>
                  </div>
                </div>

                {/* Bunny Mascot Dialogue */}
                <div className="flex justify-center">
                  <BunnyMascot
                    message={currentQ.prompt}
                    mood={feedback.status === 'correct' ? 'cheering' : feedback.status === 'wrong' ? 'encouraging' : 'happy'}
                    size="md"
                  />
                </div>

                {/* Question Canvas */}
                {/* 1. COUNT GAME */}
                {activeTab === 'countGame' && (
                  <div className="bg-sky-50/70 p-6 rounded-3xl border-2 border-dashed border-sky-300 flex flex-wrap justify-center items-center gap-3 max-w-xl mx-auto min-h-[140px]">
                    {Array.from({ length: currentQ.count }).map((_, i) => (
                      <span
                        key={i}
                        className="text-5xl sm:text-6xl animate-bounce filter drop-shadow"
                        style={{ animationDelay: `${i * 120}ms` }}
                      >
                        {currentQ.emoji}
                      </span>
                    ))}
                  </div>
                )}

                {/* 2. PICK NUMBER GAME */}
                {activeTab === 'pickGame' && (
                  <div className="text-center py-4">
                    <span className="text-3xl sm:text-5xl font-black text-indigo-700 bg-indigo-50 px-6 py-3 rounded-2xl border-2 border-indigo-200 inline-block">
                      Số: "{currentQ.target.vietnamese}"
                    </span>
                  </div>
                )}

                {/* 3. COMPARE GAME */}
                {activeTab === 'compareGame' && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center max-w-2xl mx-auto">
                    {/* Left Box */}
                    <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 flex flex-col items-center justify-center min-h-[120px]">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {Array.from({ length: currentQ.leftCount }).map((_, i) => (
                          <span key={i} className="text-3xl sm:text-4xl">
                            {currentQ.emoji}
                          </span>
                        ))}
                      </div>
                      <span className="mt-2 font-black text-xl text-amber-800">
                        ({currentQ.leftCount})
                      </span>
                    </div>

                    {/* Question mark / Sign */}
                    <div className="text-center font-black text-3xl sm:text-4xl text-sky-700 bg-sky-100 py-3 rounded-2xl border-2 border-sky-300">
                      ?
                    </div>

                    {/* Right Box */}
                    <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 flex flex-col items-center justify-center min-h-[120px]">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {Array.from({ length: currentQ.rightCount }).map((_, i) => (
                          <span key={i} className="text-3xl sm:text-4xl">
                            {currentQ.emoji}
                          </span>
                        ))}
                      </div>
                      <span className="mt-2 font-black text-xl text-emerald-800">
                        ({currentQ.rightCount})
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. ADDITION GAME */}
                {activeTab === 'additionGame' && (
                  <div className="bg-sky-50/60 p-5 rounded-3xl border-2 border-sky-200 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-4 text-center">
                    <div className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-sm border border-sky-200">
                      <div className="flex gap-1 text-3xl sm:text-4xl">
                        {Array.from({ length: currentQ.a }).map((_, i) => (
                          <span key={i}>{currentQ.emoji}</span>
                        ))}
                      </div>
                      <span className="font-black text-xl text-sky-700 mt-1">{currentQ.a}</span>
                    </div>

                    <span className="text-4xl font-black text-sky-600">+</span>

                    <div className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-sm border border-sky-200">
                      <div className="flex gap-1 text-3xl sm:text-4xl">
                        {Array.from({ length: currentQ.b }).map((_, i) => (
                          <span key={i}>{currentQ.emoji}</span>
                        ))}
                      </div>
                      <span className="font-black text-xl text-sky-700 mt-1">{currentQ.b}</span>
                    </div>

                    <span className="text-4xl font-black text-sky-600">=</span>

                    <span className="w-16 h-16 bg-white rounded-2xl border-2 border-dashed border-sky-400 flex items-center justify-center text-3xl font-black text-sky-700 shadow-inner">
                      ?
                    </span>
                  </div>
                )}

                {/* 5. SUBTRACTION GAME */}
                {activeTab === 'subtractionGame' && (
                  <div className="bg-sky-50/60 p-5 rounded-3xl border-2 border-sky-200 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-4 text-center">
                    <div className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-sm border border-sky-200">
                      <div className="flex gap-1 text-3xl sm:text-4xl">
                        {Array.from({ length: currentQ.total }).map((_, i) => (
                          <span key={i}>{currentQ.emoji}</span>
                        ))}
                      </div>
                      <span className="font-black text-xl text-sky-700 mt-1">{currentQ.total}</span>
                    </div>

                    <span className="text-4xl font-black text-rose-500">-</span>

                    <div className="flex flex-col items-center bg-rose-50 p-3 rounded-2xl shadow-sm border border-rose-200">
                      <div className="flex gap-1 text-3xl sm:text-4xl opacity-60">
                        {Array.from({ length: currentQ.minus }).map((_, i) => (
                          <span key={i}>{currentQ.emoji}</span>
                        ))}
                      </div>
                      <span className="font-black text-xl text-rose-700 mt-1">Bớt {currentQ.minus}</span>
                    </div>

                    <span className="text-4xl font-black text-sky-600">=</span>

                    <span className="w-16 h-16 bg-white rounded-2xl border-2 border-dashed border-sky-400 flex items-center justify-center text-3xl font-black text-sky-700 shadow-inner">
                      ?
                    </span>
                  </div>
                )}

                {/* Feedback banner */}
                {feedback.message && (
                  <div
                    className={`p-3 rounded-2xl text-center font-bold text-base transition-all animate-bounce ${
                      feedback.status === 'correct'
                        ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400'
                        : 'bg-rose-100 text-rose-800 border-2 border-rose-300'
                    }`}
                  >
                    {feedback.message}
                  </div>
                )}

                {/* 3 Touch-friendly options */}
                <div className="grid grid-cols-3 gap-4 pt-4 max-w-xl mx-auto">
                  {currentQ.options.map((opt: any, idx: number) => {
                    const isPicked = feedback.selectedOption === opt;
                    const isCorrectAnswer = opt === currentQ.correctAnswer;

                    let btnClass =
                      'bg-white hover:bg-sky-50 text-slate-800 border-3 border-sky-300 hover:border-sky-500 hover:shadow-xl';

                    if (feedback.status === 'correct' && isCorrectAnswer) {
                      btnClass = 'bg-emerald-500 text-white border-3 border-emerald-600 shadow-xl scale-105';
                    } else if (feedback.status === 'wrong' && isPicked) {
                      btnClass = 'bg-rose-100 text-rose-800 border-3 border-rose-400 animate-shake';
                    }

                    return (
                      <button
                        key={`${opt}-${idx}`}
                        onClick={() => handleSelectAnswer(opt)}
                        disabled={feedback.status !== null}
                        className={`p-6 rounded-3xl font-black text-3xl sm:text-4xl flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Victory Card */
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border-3 border-sky-400 space-y-6">
                <div className="w-24 h-24 bg-gradient-to-tr from-sky-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <Trophy className="w-14 h-14 text-white" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-sky-800">
                    Bé Tính Giỏi Quá! 🎉
                  </h3>
                  <p className="text-slate-600 text-lg font-medium">
                    Bé đã hoàn thành xuất sắc 5 câu hỏi và nhận được{' '}
                    <strong className="text-sky-600">{score} ngôi sao</strong>!
                  </p>
                </div>

                <div className="flex justify-center">
                  <BunnyMascot
                    message="Tuyệt vời ông mặt trời! Bé đã nắm vững các con số rồi đấy!"
                    mood="cheering"
                    size="md"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => startNumberGame(activeTab)}
                    className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl font-black text-lg flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Chơi Lại Trò Này</span>
                  </button>

                  <button
                    onClick={() => {
                      audio.playClick();
                      setActiveTab('explorer');
                    }}
                    className="px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-transform"
                  >
                    <span>Về Đảo Số Học</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NumberIsland;
