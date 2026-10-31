import React, { useState } from 'react';
import { Volume2, Sparkles, Heart } from 'lucide-react';
import audio from '../utils/audioService';

export type BunnyMood = 'happy' | 'cheering' | 'thinking' | 'encouraging' | 'talking';

interface BunnyMascotProps {
  message?: string;
  mood?: BunnyMood;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSpeechBubble?: boolean;
  onMascotClick?: () => void;
  className?: string;
  autoSpeak?: boolean;
}

export const BunnyMascot: React.FC<BunnyMascotProps> = ({
  message = 'Xin chào bạn nhỏ! Hôm nay chúng mình cùng khám phá nhé!',
  mood = 'happy',
  size = 'md',
  showSpeechBubble = true,
  onMascotClick,
  className = '',
  autoSpeak = false,
}) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  React.useEffect(() => {
    if (autoSpeak && message) {
      handleSpeak();
    }
  }, [message, autoSpeak]);

  const handleSpeak = async () => {
    if (!message || isSpeaking) return;
    setIsSpeaking(true);
    await audio.speak(message);
    setIsSpeaking(false);
  };

  const handleClick = () => {
    audio.playClick();
    setIsWiggling(true);
    setShowHearts(true);
    setTimeout(() => setIsWiggling(false), 600);
    setTimeout(() => setShowHearts(false), 1200);

    if (onMascotClick) {
      onMascotClick();
    } else {
      handleSpeak();
    }
  };

  const sizeClasses = {
    sm: 'w-20 h-24',
    md: 'w-32 h-36',
    lg: 'w-44 h-52',
    hero: 'w-56 h-64 md:w-64 md:h-72',
  }[size];

  return (
    <div className={`relative flex items-center gap-4 select-none ${className}`}>
      {/* Bunny Visual with Bobbing Animation */}
      <div className="relative group cursor-pointer" onClick={handleClick}>
        {showHearts && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 text-rose-500 animate-bounce pointer-events-none z-20">
            <Heart className="w-5 h-5 fill-rose-500" />
            <Sparkles className="w-5 h-5 text-amber-400 fill-amber-300" />
          </div>
        )}

        <div
          className={`transform transition-transform duration-300 ${
            isWiggling ? 'scale-110 rotate-6' : 'hover:scale-105 active:scale-95'
          } ${mood === 'cheering' ? 'animate-bounce' : 'animate-pulse'}`}
          style={{ animationDuration: mood === 'cheering' ? '1s' : '3s' }}
        >
          <img
            src="./assets/bunny.svg"
            alt="Thỏ Bunny thông thái"
            className={`${sizeClasses} object-contain filter drop-shadow-lg`}
            draggable={false}
          />
        </div>

        {/* Small Mood Badge */}
        <div className="absolute -bottom-1 right-2 bg-white/95 px-2 py-0.5 rounded-full shadow-md text-xs font-bold text-amber-600 border border-amber-200">
          {mood === 'cheering' && '🎉 Vỗ tay'}
          {mood === 'happy' && '🐰 Bunny'}
          {mood === 'thinking' && '🤔 Suy nghĩ'}
          {mood === 'encouraging' && '💖 Cố lên'}
          {mood === 'talking' && '🗣️ Đang nói'}
        </div>
      </div>

      {/* Speech Bubble */}
      {showSpeechBubble && message && (
        <div className="relative max-w-sm sm:max-w-md bg-white rounded-2xl p-4 shadow-xl border-2 border-amber-300/80 animate-fade-in z-10">
          {/* Arrow */}
          <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white"></div>
          
          <div className="flex items-start justify-between gap-3">
            <p className="text-slate-800 text-base sm:text-lg font-bold leading-snug">
              {message}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak();
              }}
              title="Nghe Bunny đọc"
              className={`shrink-0 p-2 rounded-xl transition-all ${
                isSpeaking
                  ? 'bg-amber-400 text-white animate-pulse'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BunnyMascot;
