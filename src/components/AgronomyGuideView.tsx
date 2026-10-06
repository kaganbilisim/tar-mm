import React, { useState } from "react";
import { AGRONOMY_KNOWLEDGE_BASE, MONTHLY_CALENDAR } from "../mockData";
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Scissors,
  Sprout,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface AgronomyGuideViewProps {
  isDark: boolean;
}

export const AgronomyGuideView: React.FC<AgronomyGuideViewProps> = ({ isDark }) => {
  const [activeTab, setActiveTab] = useState<"diseases" | "calendar">("diseases");
  const [expandedId, setExpandedId] = useState<string>("disease-kulleme");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(new Date().getMonth());

  return (
    <div id="agronomy-guide-container" className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Top Banner Tagline */}
      <div className="text-center py-1">
        <h2 className={`text-base md:text-lg font-bold tracking-tight ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
          Bahçem Ziraat Bilgi Tabanı
        </h2>
        <p className={`text-xs ${isDark ? "text-emerald-400/70" : "text-emerald-950 font-bold"}`}>
          Belirti • Zaman Çizelgesi • Uygulama Rehberi
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/10 border border-emerald-900/30">
        <button
          onClick={() => setActiveTab("diseases")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "diseases"
              ? "bg-emerald-600 text-white shadow-xs"
              : isDark
              ? "text-emerald-300 hover:bg-emerald-900/40"
              : "text-emerald-950 font-bold hover:bg-emerald-100"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Hastalık, Budama & Besleme</span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "calendar"
              ? "bg-emerald-600 text-white shadow-xs"
              : isDark
              ? "text-emerald-300 hover:bg-emerald-900/40"
              : "text-emerald-950 font-bold hover:bg-emerald-100"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Aylık Karadeniz Bakım Takvimi</span>
        </button>
      </div>

      {/* Tab: DISEASES & KNOWLEDGE BASE */}
      {activeTab === "diseases" && (
        <div className="space-y-3">
          {/* Pruning & Agronomy Golden Rule Callout */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              isDark
                ? "bg-[#0d2218] border-emerald-800/80 text-emerald-100"
                : "bg-emerald-50 border-emerald-300 text-emerald-950"
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <div className={`text-xs ${isDark ? "font-bold text-emerald-400" : "font-black text-emerald-950"}`}>
                Altın Kural: Düzenli Budama = %25-35 Kalıcı İşçilik Tasarrufu
              </div>
              <p className="opacity-90 leading-relaxed text-[11px]">
                Çay bahçelerinde her yıl uygulanan <strong>1/7 veya 1/10 gençleştirme budaması</strong>, ocakların kartlaşmasını önler, sürgün kalitesini artırır ve makas hızını iki katına çıkarır. Bu sayede hasat işçiliği ve yevmiye maliyetleri kalıcı olarak <strong>%25 - %35</strong> düşer.
              </p>
            </div>
          </div>

          <p className={`text-xs ${isDark ? "opacity-75" : "text-emerald-950 font-bold"}`}>
            Karadeniz çay ve fındık tarımında verimi belirleyen temel hastalık, zararlı ve besleme rehberi:
          </p>

          <div className="space-y-2.5">
            {AGRONOMY_KNOWLEDGE_BASE.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isDark
                      ? "bg-[#10241c] border-emerald-900/60 text-emerald-100"
                      : "bg-white border-emerald-300 text-gray-900 shadow-xs"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? "" : item.id)}
                    className={`p-3.5 cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                      isDark ? "hover:bg-[#142d22]" : "hover:bg-emerald-50/50"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs md:text-sm ${isDark ? "font-bold text-emerald-400" : "font-black text-emerald-950"}`}>
                          {item.title}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border ${isDark ? "bg-black/20 text-emerald-300 border-emerald-800/40" : "bg-emerald-100 text-emerald-950 border-emerald-300 font-bold"}`}>
                          {item.targetCrop}
                        </span>
                      </div>
                      <span className={`text-[11px] block ${isDark ? "opacity-70 text-emerald-200" : "text-emerald-900 font-medium"}`}>
                        Kategori: {item.category} • Seviye: {item.dangerLevel}
                      </span>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isDark ? "bg-black/20 text-emerald-300" : "bg-emerald-100 text-emerald-950 font-bold"}`}>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Expanded Body: "Belirti - Zaman Çizelgesi - Uygulama" */}
                  {isExpanded && (
                    <div
                      className={`p-4 border-t space-y-3 text-xs animate-in fade-in ${
                        isDark ? "bg-[#0b1b14] border-emerald-900/60" : "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                      }`}
                    >
                      {/* Belirti */}
                      <div className="space-y-1">
                        <div className={`flex items-center gap-1.5 ${isDark ? "font-bold text-amber-400" : "font-black text-amber-950"}`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>1. Belirti (Semptom)</span>
                        </div>
                        <p className="opacity-90 pl-5 leading-relaxed">{item.symptom}</p>
                      </div>

                      {/* Zaman Çizelgesi */}
                      <div className="space-y-1">
                        <div className={`flex items-center gap-1.5 ${isDark ? "font-bold text-teal-400" : "font-black text-teal-950"}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>2. Zaman Çizelgesi (Kritik Dönem)</span>
                        </div>
                        <p className="opacity-90 pl-5 leading-relaxed">{item.timeline}</p>
                      </div>

                      {/* Uygulama */}
                      <div className="space-y-1">
                        <div className={`flex items-center gap-1.5 ${isDark ? "font-bold text-emerald-400" : "font-black text-emerald-950"}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>3. Uygulama (Mücadele & Tedavi)</span>
                        </div>
                        <p className="opacity-90 pl-5 leading-relaxed font-medium">
                          {item.application}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: MONTHLY CALENDAR */}
      {activeTab === "calendar" && (
        <div className="space-y-3">
          {/* Calendar Notice Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              isDark
                ? "bg-[#0f241a] border-emerald-800/80 text-emerald-100"
                : "bg-emerald-50 border-emerald-300 text-emerald-950"
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <div className={`text-xs ${isDark ? "font-bold text-emerald-400" : "font-black text-emerald-950"}`}>
                "Bahçem" Aylık Bakım Takvimi & Erken Rezervasyon Kuralı
              </div>
              <p className="opacity-90 leading-relaxed text-[11px]">
                Karadeniz'de hasat dönemlerinde (Mayıs 1. Sürüm, Temmuz 2. Sürüm, Ağustos Fındık, Eylül 3. Sürüm) işgücü talebi tavan yapar. <strong>Çalışma ekipleri ve Çavuşlar haftalar öncesinden rezerve edilmektedir.</strong> İlanlarınızı takvimdeki kritik tarihlerden önce açarak ekibinizi kesinleştirin.
              </p>
            </div>
          </div>

          <p className={`text-xs ${isDark ? "opacity-75" : "text-emerald-950 font-bold"}`}>
            Karadeniz çay ve fındık yıllık takvimi. Hasat sürüm dönemleri ve çavuş/ekip rezervasyon uyarıları:
          </p>

          {/* Month Selector Carousel */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {MONTHLY_CALENDAR.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedMonthIndex(idx)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                  selectedMonthIndex === idx
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                    : isDark
                    ? "bg-[#10241c] border-emerald-900 text-emerald-300 hover:bg-[#142d22]"
                    : "bg-white border-emerald-300 text-emerald-950 hover:bg-emerald-50 font-bold"
                }`}
              >
                {item.month}
              </button>
            ))}
          </div>

          {/* Active Month Detail Card */}
          {(() => {
            const currentMonthData = MONTHLY_CALENDAR[selectedMonthIndex];
            return (
              <div
                className={`p-5 rounded-2xl border space-y-3 transition-all ${
                  isDark
                    ? "bg-[#10241c] border-emerald-800/80 text-emerald-50"
                    : "bg-white border-emerald-300 text-gray-900 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                    <h3 className={`font-bold text-base ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
                      {currentMonthData.month} Ayı Bakım Rehberi
                    </h3>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold"}`}>
                    {currentMonthData.crop}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className={`font-bold ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>Zirai İşlemler ve Bakım:</div>
                  <p className="opacity-85 leading-relaxed">{currentMonthData.task}</p>
                </div>

                <div className={`p-3 rounded-xl border text-xs space-y-1 ${isDark ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : "bg-amber-50 border-amber-300 text-amber-950 font-medium"}`}>
                  <div className={`font-bold flex items-center gap-1.5 ${isDark ? "text-amber-400" : "text-amber-950 font-black"}`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Hasat & İşçi Planlama Uyarısı:</span>
                  </div>
                  <p className="opacity-90">{currentMonthData.crewNotice}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
