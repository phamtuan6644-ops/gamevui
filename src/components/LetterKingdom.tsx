import React, { useState } from 'react';
import { Volume2, CheckCircle2, ArrowLeft, RefreshCw, Trophy, Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import contentData from '../data/contentData.json';
import audio from '../utils/audioService';
import { storage } from '../utils/storageService';
import BunnyMascot from './BunnyMascot';

interface LetterKingdomProps {
  onBack: () => void;
  onStarsEarned: (count: number) => void;
}

type TabMode = 'explorer' | 'game1' | 'game2' | 'game3' | 'game4';

export const LetterKingdom: React.FC<LetterKingdomProps> = ({ onBack, onStarsEarned }) => {
  const letters = contentData.letters;
  const [activeTab, setActiveTab] = useState<TabMode>('explorer');
  const [selectedLetter, setSelectedLetter] = useState(letters[0]);
  const [masteredLetters, setMasteredLetters] = useState<string[]>(
    storage.getProgress().masteredLetters
  );

  // Game state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'wrong' | null;
    selectedOption: any;
    message: string;
  }>({ status: null, selectedOption: null, message: '' });

  // Play letter pronunciation
  const handlePronounce = async (letterObj: typeof letters[0]) => {
    audio.playClick();
    await audio.speak(`${letterObj.name}. ${letterObj.phonetic}. ${letterObj.word}`);
  };

  // Toggle mastered status
  const handleMarkMastered = (letterId: string) => {
    audio.playClick();
    const updated = storage.markLetterMastered(letterId);
    setMasteredLetters([...updated.masteredLetters]);
    if (!masteredLetters.includes(letterId)) {
      audio.playStarChime();
      onStarsEarned(1);
    }
  };

  // Generator for game questions
  const generateGameQuestion = (tab: TabMode, qIndex: number) => {
    const target = letters[Math.floor(Math.random() * letters.length)];
    // Pick 2 random distractors
    const distractors = letters
      .filter((l) => l.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    const options = [target, ...distractors].sort(() => 0.5 - Math.random());

    let prompt = '';
    if (tab === 'game1') {
      prompt = `Chữ cái nào là ${target.name}?`;
    } else if (tab === 'game2') {
      prompt = `Bé hãy tìm chữ "${target.uppercase}" cho Bunny nhé!`;
    } else if (tab === 'game3') {
      prompt = `Hình "${target.word}" (${target.emoji}) bắt đầu bằng chữ cái nào?`;
    } else if (tab === 'game4') {
      prompt = `Bé nghe âm thanh và chọn chữ cái đúng nhé!`;
    }

    return {
      target,
      options,
      prompt,
      qIndex,
    };
  };

  const startGame = (mode: TabMode) => {
    setActiveTab(mode);
    setQuestionIndex(0);
    setScore(0);
    setGameFinished(false);
    setFeedback({ status: null, selectedOption: null, message: '' });
    const firstQ = generateGameQuestion(mode, 0);
    setCurrentQuestion(firstQ);

    if (mode === 'game4') {
      setTimeout(() => {
        audio.speak(`Chữ ${firstQ.target.phonetic}`);
      }, 500);
    } else {
      setTimeout(() => {
        audio.speak(firstQ.prompt);
      }, 400);
    }
  };

  const handleAnswer = (option: typeof letters[0]) => {
    if (feedback.status !== null) return; // prevent spamming

    const isCorrect = option.id === currentQuestion.target.id;

    if (isCorrect) {
      audio.playCorrect();
      const newScore = score + 1;
      setScore(newScore);
      storage.addStars(1);
      storage.markLetterMastered(currentQuestion.target.id);
      setMasteredLetters(storage.getProgress().masteredLetters);
      onStarsEarned(1);

      setFeedback({
        status: 'correct',
        selectedOption: option,
        message: 'Tuyệt vời! Bé chọn đúng rồi! +1 ⭐',
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
      storage.logIncorrect('letter', currentQuestion.prompt, option.name, currentQuestion.target.name);
      setFeedback({
        status: 'wrong',
        selectedOption: option,
        message: 'Chưa chính xác rồi. Không sao, chúng mình thử lại nhé! 🐰',
      });

      audio.speak('Không sao đâu, bé thử lại nhé!');

      setTimeout(() => {
        setFeedback({ status: null, selectedOption: null, message: '' });
      }, 1800);
    }
  };

  const nextQuestion = (currentScore: number) => {
    if (questionIndex + 1 >= 5) {
      // Finished 5 questions
      setGameFinished(true);
      audio.playVictoryFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
    } else {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      const nextQ = generateGameQuestion(activeTab, nextIndex);
      setCurrentQuestion(nextQ);
      setFeedback({ status: null, selectedOption: null, message: '' });

      if (activeTab === 'game4') {
        setTimeout(() => {
          audio.speak(`Chữ ${nextQ.target.phonetic}`);
        }, 500);
      } else {
        setTimeout(() => {
          audio.speak(nextQ.prompt);
        }, 400);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-orange-50/50 to-amber-100/40 p-3 sm:p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur rounded-3xl p-3 sm:p-4 shadow-sm border-2 border-amber-200">
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
              className="p-2 sm:px-4 sm:py-2 bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 rounded-2xl font-bold flex items-center gap-2 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">
                {activeTab === 'explorer' ? 'Về Trang chủ' : 'Quay lại Bảng chữ cái'}
              </span>
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-amber-700 flex items-center gap-2">
                <span>🏰 Vương Quốc Chữ Cái</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                29 chữ cái tiếng Việt chuẩn mầm non
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-amber-100/60 rounded-2xl border border-amber-200">
            <button
              onClick={() => {
                audio.playClick();
                setActiveTab('explorer');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'explorer'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              📖 Khám Phá 29 Chữ
            </button>
            <button
              onClick={() => startGame('game1')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'game1'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              🎮 Nhận Biết Chữ
            </button>
            <button
              onClick={() => startGame('game2')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'game2'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              🔍 Tìm Chữ Theo Lời
            </button>
            <button
              onClick={() => startGame('game3')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'game3'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              🧩 Ghép Chữ & Hình
            </button>
            <button
              onClick={() => startGame('game4')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'game4'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              🎧 Nghe & Chọn Chữ
            </button>
          </div>
        </div>

        {/* ================= MODE: EXPLORER ================= */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            {/* Spotlight Detail Card */}
            <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-amber-300 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Big Letter Card */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-100/80 via-orange-50 to-amber-200/50 rounded-3xl border-2 border-amber-300 text-center relative shadow-inner">
                  <div className="flex items-baseline justify-center gap-4">
                    <span className="text-7xl sm:text-9xl font-black text-amber-600 tracking-tight drop-shadow-md">
                      {selectedLetter.uppercase}
                    </span>
                    <span className="text-5xl sm:text-7xl font-bold text-orange-500">
                      {selectedLetter.lowercase}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-amber-700 shadow-sm border border-amber-200">
                      Phát âm: /{selectedLetter.phonetic}/
                    </span>
                    <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-sm">
                      {selectedLetter.category}
                    </span>
                  </div>

                  {/* Sound button */}
                  <button
                    onClick={() => handlePronounce(selectedLetter)}
                    className="mt-5 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg border-b-4 border-emerald-700 transition-transform cursor-pointer"
                  >
                    <Volume2 className="w-6 h-6 animate-pulse" />
                    <span>Bé nghe phát âm chữ {selectedLetter.uppercase}</span>
                  </button>
                </div>

                {/* Word & Illustration details */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-5xl sm:text-6xl filter drop-shadow">
                        {selectedLetter.emoji}
                      </span>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                          Từ vựng minh họa
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-black text-slate-800">
                          {selectedLetter.word}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkMastered(selectedLetter.id)}
                      className={`px-4 py-2 rounded-2xl font-bold text-sm flex items-center gap-1.5 transition-all ${
                        masteredLetters.includes(selectedLetter.id)
                          ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 border border-slate-300'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          masteredLetters.includes(selectedLetter.id)
                            ? 'text-emerald-600 fill-emerald-100'
                            : 'text-slate-400'
                        }`}
                      />
                      <span>
                        {masteredLetters.includes(selectedLetter.id) ? 'Đã thuộc bài!' : 'Đánh dấu đã học'}
                      </span>
                    </button>
                  </div>

                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                    <p className="text-base text-slate-700 font-medium">
                      💡 <strong className="text-amber-800">Gợi ý cho bé:</strong> {selectedLetter.hint}
                    </p>
                  </div>

                  {/* Bunny Assistant Box */}
                  <div className="pt-2">
                    <BunnyMascot
                      message={`Chữ ${selectedLetter.uppercase} trong từ "${selectedLetter.word}". Bé hãy đọc to theo Bunny nhé!`}
                      mood="happy"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Complete 29 Vietnamese Letters Grid */}
            <div className="bg-white/80 rounded-3xl p-6 shadow-sm border border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                  <span>Trọn bộ 29 chữ cái tiếng Việt</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Đã học {masteredLetters.length}/29
                  </span>
                </h4>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Bấm vào từng chữ để nghe phát âm & xem hình ảnh
                </p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
                {letters.map((letter) => {
                  const isSelected = selectedLetter.id === letter.id;
                  const isMastered = masteredLetters.includes(letter.id);

                  return (
                    <button
                      key={letter.id}
                      onClick={() => {
                        setSelectedLetter(letter);
                        handlePronounce(letter);
                      }}
                      className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-lg scale-105 ring-4 ring-amber-300'
                          : 'bg-white hover:bg-amber-50 text-slate-800 shadow-sm border-2 border-amber-200/80 hover:border-amber-400 active:scale-95'
                      }`}
                    >
                      {isMastered && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] shadow">
                          ✓
                        </div>
                      )}
                      <span className="text-2xl sm:text-3xl font-black">{letter.uppercase}</span>
                      <span
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-amber-100' : 'text-slate-400'
                        }`}
                      >
                        {letter.lowercase}
                      </span>
                      <span className="text-xs mt-0.5">{letter.emoji}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= MODES: GAMES 1, 2, 3, 4 ================= */}
        {activeTab !== 'explorer' && currentQuestion && (
          <div className="space-y-6">
            {!gameFinished ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-3 border-amber-300 space-y-6">
                {/* Progress bar & Round header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-700 text-base sm:text-lg">
                      Câu hỏi {questionIndex + 1}/5
                    </span>
                    <div className="w-28 sm:w-48 bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${((questionIndex + 1) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 rounded-xl font-black text-amber-800 text-sm">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>{score} ⭐ Đạt được</span>
                    </div>
                  </div>
                </div>

                {/* Bunny Prompt Area */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                  <BunnyMascot
                    message={currentQuestion.prompt}
                    mood={feedback.status === 'correct' ? 'cheering' : feedback.status === 'wrong' ? 'encouraging' : 'happy'}
                    size="md"
                  />
                  {activeTab === 'game4' && (
                    <button
                      onClick={() => audio.speak(`Chữ ${currentQuestion.target.phonetic}`)}
                      className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-md active:scale-95 transition-transform"
                    >
                      <Volume2 className="w-6 h-6 animate-pulse" />
                      <span>Nghe lại âm thanh</span>
                    </button>
                  )}
                </div>

                {/* Visual Target Area (Depending on game mode) */}
                {activeTab === 'game1' && (
                  <div className="text-center py-4">
                    <span className="text-8xl sm:text-9xl font-black text-amber-600 drop-shadow-md">
                      {currentQuestion.target.uppercase}
                    </span>
                  </div>
                )}

                {activeTab === 'game3' && (
                  <div className="flex flex-col items-center justify-center py-4 bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-300 max-w-sm mx-auto">
                    <span className="text-7xl sm:text-8xl filter drop-shadow">
                      {currentQuestion.target.emoji}
                    </span>
                    <span className="text-2xl font-black text-slate-800 mt-2">
                      {currentQuestion.target.word}
                    </span>
                  </div>
                )}

                {/* Feedback message banner */}
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

                {/* 3 Large Touch-Friendly Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  {currentQuestion.options.map((option: typeof letters[0], idx: number) => {
                    const isPicked = feedback.selectedOption?.id === option.id;
                    const isCorrectAnswer = option.id === currentQuestion.target.id;

                    let btnStyle =
                      'bg-white hover:bg-amber-50 text-slate-800 border-3 border-amber-300 hover:border-amber-500 hover:shadow-xl';

                    if (feedback.status === 'correct' && isCorrectAnswer) {
                      btnStyle = 'bg-emerald-500 text-white border-3 border-emerald-600 shadow-xl scale-105';
                    } else if (feedback.status === 'wrong' && isPicked) {
                      btnStyle = 'bg-rose-100 text-rose-800 border-3 border-rose-400 animate-shake';
                    }

                    return (
                      <button
                        key={`${option.id}-${idx}`}
                        onClick={() => handleAnswer(option)}
                        disabled={feedback.status !== null}
                        className={`p-6 rounded-3xl font-black text-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md ${btnStyle}`}
                      >
                        {activeTab === 'game3' ? (
                          <>
                            <span className="text-5xl">{option.uppercase}</span>
                            <span className="text-sm font-semibold text-slate-500">
                              (như trong {option.word})
                            </span>
                          </>
                        ) : activeTab === 'game1' ? (
                          <>
                            <span className="text-5xl">{option.emoji}</span>
                            <span className="text-lg">{option.word}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-6xl font-black">{option.uppercase}</span>
                            <span className="text-sm font-medium text-slate-500">
                              Chữ {option.uppercase} ({option.lowercase})
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Victory Screen */
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border-3 border-amber-400 space-y-6">
                <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <Trophy className="w-14 h-14 text-white" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-amber-700">
                    Hoan Hô Bé Yêu! 🎉
                  </h3>
                  <p className="text-slate-600 text-lg font-medium">
                    Bé đã hoàn thành xuất sắc 5 câu hỏi và nhận được{' '}
                    <strong className="text-amber-600">{score} ngôi sao</strong>!
                  </p>
                </div>

                <div className="flex justify-center">
                  <BunnyMascot
                    message="Bé giỏi quá! Hãy tiếp tục rèn luyện để trở thành Nhà Ngôn Ngữ Nhí nhé!"
                    mood="cheering"
                    size="md"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => startGame(activeTab)}
                    className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-lg flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
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
                    <span>Về Bảng Chữ Cái</span>
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

export default LetterKingdom;
