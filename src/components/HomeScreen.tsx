import React from 'react';
import { BookOpen, Binary, Trees, Shapes, Sparkles, Star, Award, Shield, ArrowRight, Play } from 'lucide-react';
import contentData from '../data/contentData.json';
import audio from '../utils/audioService';
import BunnyMascot from './BunnyMascot';

interface HomeScreenProps {
  stars: number;
  level: number;
  childName: string;
  onSelectZone: (zoneId: string) => void;
  onOpenBadges: () => void;
  onOpenParents: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stars,
  level,
  childName,
  onSelectZone,
  onOpenBadges,
  onOpenParents,
}) => {
  const zones = contentData.learningZones;

  const getZoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-8 h-8 text-amber-500" />;
      case 'Binary':
        return <Binary className="w-8 h-8 text-sky-500" />;
      case 'Trees':
        return <Trees className="w-8 h-8 text-emerald-500" />;
      case 'Shapes':
        return <Shapes className="w-8 h-8 text-purple-500" />;
      case 'Sparkles':
        return <Sparkles className="w-8 h-8 text-rose-500" />;
      default:
        return <Star className="w-8 h-8 text-amber-500" />;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] bg-gradient-to-b from-sky-100/60 via-amber-50/50 to-emerald-50/70 p-3 sm:p-6 pb-24 overflow-hidden">
      {/* Decorative Cloud elements */}
      <div className="absolute top-6 left-8 w-24 h-12 bg-white/70 rounded-full blur-[1px] pointer-events-none hidden md:block"></div>
      <div className="absolute top-14 right-16 w-32 h-14 bg-white/70 rounded-full blur-[1px] pointer-events-none hidden md:block"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Hero Section with Bunny Welcome */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-xl border-3 border-amber-300 relative overflow-hidden">
          {/* Background sun ray effect */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-200/40 rounded-full blur-2xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Mascot presentation */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <BunnyMascot
                message={`Xin chào ${childName}! Hôm nay chúng mình cùng khám phá nhé!`}
                mood="happy"
                size="hero"
                autoSpeak={false}
              />
            </div>

            {/* Title & Call to action */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full text-xs font-black text-amber-800 border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Trò chơi giáo dục mầm non 3-6 tuổi</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-slate-800 leading-tight">
                Vừa Chơi Vui Vẻ, <br />
                <span className="text-amber-600 underline decoration-amber-300 decoration-wavy">
                  Bé Học Siêu Giỏi!
                </span>
              </h2>

              <p className="text-base sm:text-lg text-slate-600 font-medium max-w-lg">
                Cùng chú thỏ Bunny khám phá 29 chữ cái tiếng Việt, làm quen số học,
                nhận biết thế giới muôn loài và rèn luyện tư duy thông minh!
              </p>

              {/* Big Start Learning Button */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => {
                    audio.playClick();
                    onSelectZone('letters');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-xl rounded-3xl shadow-xl border-b-6 border-amber-700 transition-all cursor-pointer flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                  </div>
                  <span>BẮT ĐẦU HỌC NGAY</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    audio.playClick();
                    onSelectZone('numbers');
                  }}
                  className="px-6 py-4 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-extrabold text-base rounded-3xl shadow-lg border-b-4 border-sky-700 transition-all cursor-pointer"
                >
                  🏝️ Khám Phá Đảo Số
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Educational Game Kingdom Zones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
              <span>🗺️ Bản Đồ Thế Giới Diệu Kỳ</span>
            </h3>
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              Chạm vào khu vực bé muốn học
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {zones.map((zone) => (
              <div
                key={zone.id}
                onClick={() => {
                  audio.playClick();
                  onSelectZone(zone.id);
                }}
                className={`group relative bg-white rounded-3xl p-6 shadow-md hover:shadow-2xl border-3 ${zone.borderColor} cursor-pointer transition-all duration-300 hover:-translate-y-1 active:translate-y-0.5 active:scale-98 flex flex-col justify-between`}
              >
                {/* Header of card */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      {getZoneIcon(zone.icon)}
                    </div>
                    <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Sẵn sàng chơi
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-amber-600 transition-colors">
                      {zone.title}
                    </h4>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                      {zone.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {zone.description}
                  </p>
                </div>

                {/* Card Action footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-700 group-hover:text-amber-600">
                  <span>Khám phá ngay</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Achievement & Parent Strip */}
        <div className="bg-white/80 backdrop-blur rounded-3xl p-5 shadow-sm border-2 border-amber-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-800">
                Thành Tích Của Bé: {stars} ⭐ (Cấp độ {level})
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Bé chăm chỉ học mỗi ngày cùng Bunny để mở khóa toàn bộ huy hiệu nhé!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audio.playClick();
                onOpenBadges();
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Xem Huy Hiệu</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onOpenParents();
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Góc Ba Mẹ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
