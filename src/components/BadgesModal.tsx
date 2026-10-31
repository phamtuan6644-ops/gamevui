import React from 'react';
import { X, Award, Star, Lock } from 'lucide-react';
import contentData from '../data/contentData.json';
import audio from '../utils/audioService';
import { storage } from '../utils/storageService';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStars: number;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, onClose, currentStars }) => {
  if (!isOpen) return null;

  const badges = contentData.badges;
  const progress = storage.getProgress();
  const unlockedSet = new Set(progress.unlockedBadges);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border-4 border-amber-300 animate-pop">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Award className="w-7 h-7 text-yellow-100" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Kho Báu Huy Hiệu Của Bé</h3>
              <p className="text-xs text-amber-100 font-medium">
                Thu thập sao để mở khóa các danh hiệu cao quý
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick star tally */}
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border-2 border-amber-200">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-amber-500 fill-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                  Tổng số sao hiện tại
                </p>
                <p className="text-2xl font-black text-amber-950">{currentStars} Ngôi Sao</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                Đã đạt {unlockedSet.size}/{badges.length} huy hiệu
              </span>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {badges.map((badge) => {
              const isUnlocked = unlockedSet.has(badge.id) || currentStars >= badge.requiredStars;

              return (
                <div
                  key={badge.id}
                  onClick={() => {
                    if (isUnlocked) {
                      audio.playStarChime();
                      audio.speak(badge.title);
                    } else {
                      audio.playClick();
                    }
                  }}
                  className={`p-4 rounded-3xl border-2 flex items-center gap-3.5 transition-all cursor-pointer ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-50 via-white to-amber-100/50 border-amber-300 shadow-md hover:scale-102'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm ${
                      isUnlocked
                        ? 'bg-amber-100 border border-amber-300'
                        : 'bg-slate-200 border border-slate-300 grayscale'
                    }`}
                  >
                    {isUnlocked ? badge.icon : <Lock className="w-6 h-6 text-slate-400" />}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-extrabold text-base text-slate-800 truncate">
                      {badge.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {badge.description}
                    </p>
                    <div className="pt-1 flex items-center gap-1.5">
                      {isUnlocked ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Đã mở khóa
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">
                          Cần {badge.requiredStars} ⭐
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgesModal;
