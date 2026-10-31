import React from 'react';
import { Star, Award, Shield, Volume2, VolumeX, Music, Home } from 'lucide-react';
import audio from '../utils/audioService';

interface TopNavProps {
  stars: number;
  level: number;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onOpenBadges: () => void;
  onOpenParents: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  stars,
  level,
  currentScreen,
  onNavigate,
  onOpenBadges,
  onOpenParents,
}) => {
  const [isMuted, setIsMuted] = React.useState(audio.getIsMuted());
  const [bgmActive, setBgmActive] = React.useState(audio.isBgmActive());

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
    if (!muted) audio.playClick();
  };

  const handleToggleBgm = () => {
    audio.playClick();
    if (bgmActive) {
      audio.stopBgm();
      setBgmActive(false);
    } else {
      audio.startBgm();
      setBgmActive(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-sm px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-6">
        {/* Left Zone: Brand / Home */}
        <div className="flex items-center gap-2">
          {currentScreen !== 'home' && (
            <button
              onClick={() => {
                audio.playClick();
                onNavigate('home');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 rounded-xl font-bold text-sm transition-all shadow-sm border border-amber-300"
              title="Về Trang chủ"
            >
              <Home className="w-5 h-5 text-amber-700" />
              <span className="hidden sm:inline">Trang chủ</span>
            </button>
          )}

          <div
            onClick={() => {
              audio.playClick();
              onNavigate('home');
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-100 flex items-center justify-center border-2 border-amber-300 group-hover:scale-105 transition-transform overflow-hidden shadow-inner">
              <img src="./assets/bunny.svg" alt="Bunny Mascot" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-2xl text-amber-600 leading-tight tracking-tight">
                BÉ VUI HỌC
              </h1>
              <p className="text-[10px] sm:text-xs text-teal-600 font-semibold hidden md:block leading-none">
                Khám phá mỗi ngày – Giỏi hơn mỗi ngày
              </p>
            </div>
          </div>
        </div>

        {/* Center Zone: Stats (Stars & Level) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Star Counter */}
          <div
            onClick={() => {
              audio.playStarChime();
              onOpenBadges();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-amber-950 font-black rounded-2xl shadow-md border-b-2 border-amber-600 cursor-pointer transition-transform"
            title="Xem kho báu sao vàng"
          >
            <Star className="w-5 h-5 fill-yellow-200 text-yellow-100 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-base sm:text-lg tabular-nums text-white drop-shadow-sm">{stars}</span>
            <span className="text-xs text-amber-100 hidden sm:inline font-bold">Sao</span>
          </div>

          {/* Level Badge */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-700 font-bold text-xs sm:text-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Cấp độ {level}</span>
          </div>
        </div>

        {/* Right Zone: Controls & Parent Gate */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Background Music Toggle */}
          <button
            onClick={handleToggleBgm}
            title={bgmActive ? 'Tắt nhạc nền vui' : 'Bật nhạc nền vui'}
            className={`p-2 rounded-xl transition-all ${
              bgmActive
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Music className={`w-4 h-4 sm:w-5 sm:h-5 ${bgmActive ? 'animate-bounce' : ''}`} />
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />}
          </button>

          {/* Badges Button */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenBadges();
            }}
            title="Bộ sưu tập huy hiệu"
            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-bold flex items-center gap-1 text-xs sm:text-sm transition-all active:scale-95"
          >
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <span className="hidden lg:inline">Huy hiệu</span>
          </button>

          {/* Parent Gate Button */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenParents();
            }}
            title="Khu vực dành cho Phụ Huynh"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Phụ Huynh</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
