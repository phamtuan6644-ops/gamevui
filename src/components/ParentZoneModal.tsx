import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Clock, Award, BookOpen, Binary, AlertTriangle, RotateCcw, Check, Sparkles } from 'lucide-react';
import contentData from '../data/contentData.json';
import audio from '../utils/audioService';
import { storage, LearningProgress } from '../utils/storageService';

interface ParentZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProgressReset: () => void;
}

export const ParentZoneModal: React.FC<ParentZoneModalProps> = ({
  isOpen,
  onClose,
  onProgressReset,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gateQuestion, setGateQuestion] = useState({ a: 7, b: 6, ans: 13 });
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);

  const [progress, setProgress] = useState<LearningProgress>(storage.getProgress());
  const [childNameInput, setChildNameInput] = useState(progress.childName);
  const [limitMinutes, setLimitMinutes] = useState(progress.dailyTimeLimitMinutes);
  const [saveToast, setSaveToast] = useState(false);

  // Generate math lock whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const a = Math.floor(Math.random() * 8) + 6;
      const b = Math.floor(Math.random() * 7) + 5;
      setGateQuestion({ a, b, ans: a + b });
      setGateInput('');
      setGateError(false);
      setIsAuthenticated(false);
      const currentProg = storage.getProgress();
      setProgress(currentProg);
      setChildNameInput(currentProg.childName);
      setLimitMinutes(currentProg.dailyTimeLimitMinutes);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateInput.trim(), 10) === gateQuestion.ans) {
      audio.playCorrect();
      setIsAuthenticated(true);
      setGateError(false);
    } else {
      audio.playEncourage();
      setGateError(true);
      setGateInput('');
    }
  };

  const handleSaveSettings = () => {
    audio.playClick();
    const updated = storage.updateSettings({
      childName: childNameInput.trim() || 'Bé Yêu',
      dailyTimeLimitMinutes: limitMinutes,
    });
    setProgress(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Ba mẹ có chắc muốn đặt lại toàn bộ tiến độ và sao của bé không?')) {
      audio.playClick();
      const fresh = storage.resetAllProgress();
      setProgress(fresh);
      onProgressReset();
      onClose();
    }
  };

  const minutesLearned = Math.round(progress.learningTimeSeconds / 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border-4 border-slate-700 animate-pop">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black">Khu Vực Phụ Huynh</h3>
              <p className="text-xs text-slate-400">
                Theo dõi tiến trình & cài đặt an toàn cho bé
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Math Lock Screen if not verified */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-black text-slate-800">Khóa An Toàn Phụ Huynh</h4>
              <p className="text-sm text-slate-500">
                Để bảo vệ thiết lập, xin vui lòng trả lời phép tính sau:
              </p>
            </div>

            <form onSubmit={handleVerifyGate} className="max-w-xs mx-auto space-y-4">
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-300 text-3xl font-black text-slate-800 tracking-wider">
                {gateQuestion.a} + {gateQuestion.b} = ?
              </div>

              <input
                type="number"
                value={gateInput}
                onChange={(e) => setGateInput(e.target.value)}
                placeholder="Nhập kết quả..."
                autoFocus
                className="w-full text-center text-2xl font-bold py-3 px-4 border-2 border-slate-300 rounded-2xl focus:border-slate-800 focus:outline-none"
              />

              {gateError && (
                <p className="text-xs text-rose-500 font-bold">
                  Kết quả chưa đúng, vui lòng thử lại!
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
              >
                Xác Nhận Mở Khóa
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {saveToast && (
              <div className="p-3 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-2xl flex items-center gap-2 text-sm font-bold">
                <Check className="w-5 h-5 text-emerald-600" />
                <span>Đã lưu cài đặt phụ huynh thành công!</span>
              </div>
            )}

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                <span className="text-xs font-bold text-amber-800 uppercase">Tổng số sao</span>
                <p className="text-2xl font-black text-amber-950 mt-1">{progress.stars} ⭐</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                <span className="text-xs font-bold text-blue-800 uppercase">Cấp độ hiện tại</span>
                <p className="text-2xl font-black text-blue-950 mt-1">Cấp {progress.level}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800 uppercase">Chữ cái đã học</span>
                <p className="text-2xl font-black text-emerald-950 mt-1">
                  {progress.masteredLetters.length}/29
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-center">
                <span className="text-xs font-bold text-purple-800 uppercase">Thời gian học</span>
                <p className="text-2xl font-black text-purple-950 mt-1">{minutesLearned} phút</p>
              </div>
            </div>

            {/* Vietnamese Alphabet Mastery Breakdown */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <span>Tiến độ nhận biết 29 chữ cái tiếng Việt</span>
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  {Math.round((progress.masteredLetters.length / 29) * 100)}% Hoàn thành
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(progress.masteredLetters.length / 29) * 100}%` }}
                ></div>
              </div>

              {/* Mini Letter badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {contentData.letters.map((l) => {
                  const isDone = progress.masteredLetters.includes(l.id);
                  return (
                    <span
                      key={l.id}
                      className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center border ${
                        isDone
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {l.uppercase}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Numbers Mastery */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
                  <Binary className="w-5 h-5 text-blue-600" />
                  <span>Tiến độ học số 0–10</span>
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  {progress.masteredNumbers.length}/11 số
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {contentData.numbers.map((n) => {
                  const isDone = progress.masteredNumbers.includes(n.value);
                  return (
                    <div
                      key={n.value}
                      className={`px-3 py-1.5 rounded-xl text-sm font-bold border flex items-center gap-1 ${
                        isDone
                          ? 'bg-sky-500 text-white border-sky-600'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      <span>Số {n.value}</span>
                      {isDone && <span>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Learning Needs Practice Log */}
            {progress.incorrectQuestions.length > 0 && (
              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 space-y-2">
                <h4 className="font-extrabold text-sm text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Nội dung bé từng cần hỗ trợ gần đây:</span>
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {progress.incorrectQuestions.slice(0, 4).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 bg-white p-2 rounded-xl border border-rose-100">
                      <span className="text-rose-500 font-bold">•</span>
                      <div>
                        <p className="font-semibold text-slate-800">{item.question}</p>
                        <p className="text-slate-500">
                          Bé từng chọn: <span className="text-rose-600 font-bold">{item.wrongAnswer}</span> → Đáp án đúng: <span className="text-emerald-700 font-bold">{item.correctAnswer}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Parent Settings & Screen Time Limit */}
            <div className="border-t border-slate-200 pt-5 space-y-4">
              <h4 className="font-extrabold text-base text-slate-800">
                ⚙️ Cài Đặt Dành Cho Ba Mẹ
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Tên hiển thị của bé
                  </label>
                  <input
                    type="text"
                    value={childNameInput}
                    onChange={(e) => setChildNameInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Thời lượng học mỗi ngày (phút)
                  </label>
                  <select
                    value={limitMinutes}
                    onChange={(e) => setLimitMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-slate-800"
                  >
                    <option value={15}>15 phút / ngày</option>
                    <option value={30}>30 phút / ngày (khuyên dùng)</option>
                    <option value={45}>45 phút / ngày</option>
                    <option value={0}>Không giới hạn</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleSaveSettings}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  Lưu Cài Đặt
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Đặt lại toàn bộ tiến độ</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentZoneModal;
