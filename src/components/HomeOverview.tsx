import React, { useMemo, useState, useEffect } from "react";
import {
  HarvestRecord,
  PaymentRecord,
  ExpenseRecord,
  FarmingFocus,
  AppSettings,
  UserAccount,
  HomeSectionId,
  DEFAULT_HOME_SECTIONS_ORDER,
  DEFAULT_HOME_FOOTER,
  DEFAULT_AD_BANNER,
  DEFAULT_AD_BANNERS,
  AdBannerItem,
} from "../types";
import {
  TrendingUp,
  CreditCard,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Scale,
  Leaf,
  Megaphone,
  ExternalLink,
  Shield,
  Edit3,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Download,
} from "lucide-react";

interface HomeOverviewProps {
  harvests: HarvestRecord[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  isDark: boolean;
  farmingFocus?: FarmingFocus;
  settings?: AppSettings;
  currentUser?: UserAccount | null;
  onOpenAddHarvest: () => void;
  onOpenAddPayment: () => void;
  onNavigateTab: (
    tab: "home" | "marketplace" | "assistant" | "harvest" | "receivables" | "other",
    subTab?: "jobs" | "crews" | "workers" | "services" | "applications"
  ) => void;
  onSelectHarvestForPayment: (harvest: HarvestRecord) => void;
  onOpenAdminModal?: () => void;
  onOpenAndroidModal?: () => void;
  jobsCount?: number;
  crewsCount?: number;
  workersCount?: number;
  servicesCount?: number;
  applicationsCount?: number;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  harvests,
  payments,
  expenses,
  isDark,
  farmingFocus = "both",
  settings,
  currentUser,
  onOpenAddHarvest,
  onOpenAddPayment,
  onNavigateTab,
  onSelectHarvestForPayment,
  onOpenAdminModal,
  onOpenAndroidModal,
  jobsCount,
  crewsCount,
  workersCount,
  servicesCount,
  applicationsCount,
}) => {
  const isAdmin = currentUser?.role === "admin";

  // Mahsul filtresine göre hasat kayıtları
  const displayHarvests = useMemo(() => {
    if (farmingFocus === "tea") return harvests.filter((h) => h.cropType === "tea");
    if (farmingFocus === "hazelnut") return harvests.filter((h) => h.cropType === "hazelnut");
    return harvests;
  }, [harvests, farmingFocus]);

  // Calculations based on filtered harvests
  const totalKg = displayHarvests.reduce((acc, h) => acc + h.quantityKg, 0);
  const totalGross = displayHarvests.reduce((acc, h) => acc + h.grossAmount, 0);
  const totalNetReceivable = displayHarvests.reduce((acc, h) => acc + h.netReceivable, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const pendingReceivable = Math.max(0, totalNetReceivable - totalCollected);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const estimatedNetProfit = totalNetReceivable - totalExpenses;

  const pendingCount = displayHarvests.filter(
    (h) => h.netReceivable - (h.collectedAmount || 0) > 0.5
  ).length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formatKg = (val: number) => {
    return new Intl.NumberFormat("tr-TR").format(val);
  };

  const [storageVersion, setStorageVersion] = useState(0);

  useEffect(() => {
    const handleStorage = () => setStorageVersion((v) => v + 1);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleStorage);
    };
  }, []);

  // Format banner image URL safely
  const formatImageUrl = (url?: string): string | undefined => {
    if (!url || !url.trim()) return undefined;
    const trimmed = url.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("/") ||
      trimmed.startsWith("blob:")
    ) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  // Dynamic Configs - Global veya Settings'ten gelen kayıtlı reklam bannerları
  const rawBanners: AdBannerItem[] = useMemo(() => {
    try {
      const globalSaved = localStorage.getItem("tarim_cepte_global_ad_banners");
      if (globalSaved) {
        const parsed = JSON.parse(globalSaved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    if (settings?.adBanners && settings.adBanners.length > 0) {
      return settings.adBanners;
    }
    if (settings?.adBanner) {
      return [{
        id: "legacy-ad",
        ...settings.adBanner,
        imageUrl: settings.adBanner.imageUrl || "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60",
      }];
    }
    return DEFAULT_AD_BANNERS;
  }, [settings?.adBanners, settings?.adBanner, storageVersion]);

  // Her zaman tüm kullanıcılara kayıtlı aktif bannerları sun (kullanıcılar bannerları eksiksiz görsün)
  const activeBanners = useMemo(() => {
    const enabledOnly = rawBanners.filter((b) => b.enabled);
    if (enabledOnly.length > 0) return enabledOnly;
    return rawBanners;
  }, [rawBanners]);

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  // Auto rotate banner every 6 seconds if multiple banners exist
  useEffect(() => {
    if (activeBanners.length <= 1 || isBannerHovered) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length, isBannerHovered]);

  // Ensure safe index bounds
  const safeBannerIndex = currentBannerIndex < activeBanners.length ? currentBannerIndex : 0;
  const currentAd = activeBanners[safeBannerIndex];

  const homeFooter = settings?.homeFooter || DEFAULT_HOME_FOOTER;
  const rawSectionsOrder: HomeSectionId[] =
    settings?.homeSectionsOrder && settings.homeSectionsOrder.length > 0
      ? settings.homeSectionsOrder
      : DEFAULT_HOME_SECTIONS_ORDER;
  // Reklam & Duyuru bannerı ana sayfada daima ilk sırada garantili görünsün
  const sectionsOrder: HomeSectionId[] = rawSectionsOrder.includes("ad_banner")
    ? rawSectionsOrder
    : ["ad_banner", ...rawSectionsOrder];

  // 1. Reklam & Sponsorluk Banner'ı (Çoklu ve Değişmeli Reklam Desteği)
  const renderAdBanner = () => {
    if (!currentAd) return null;

    const bgStyles =
      currentAd.bgColor === "amber"
        ? isDark
          ? "bg-gradient-to-r from-amber-950/80 via-[#261e0b] to-amber-950/80 border-amber-600/40 text-amber-100"
          : "bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border-amber-300 text-amber-950"
        : currentAd.bgColor === "blue"
        ? isDark
          ? "bg-gradient-to-r from-blue-950/80 via-[#0a1e33] to-blue-950/80 border-blue-600/40 text-blue-100"
          : "bg-gradient-to-r from-blue-50 via-sky-50 to-blue-100 border-blue-300 text-blue-950"
        : currentAd.bgColor === "purple"
        ? isDark
          ? "bg-gradient-to-r from-purple-950/80 via-[#230f30] to-purple-950/80 border-purple-600/40 text-purple-100"
          : "bg-gradient-to-r from-purple-50 via-fuchsia-50 to-purple-100 border-purple-300 text-purple-950"
        : currentAd.bgColor === "rose"
        ? isDark
          ? "bg-gradient-to-r from-rose-950/80 via-[#260f14] to-rose-950/80 border-rose-600/40 text-rose-100"
          : "bg-gradient-to-r from-rose-50 via-pink-50 to-rose-100 border-rose-300 text-rose-950"
        : isDark
        ? "bg-gradient-to-r from-emerald-950/90 via-[#0d2a1f] to-emerald-950/90 border-emerald-500/40 text-emerald-100"
        : "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-emerald-300 text-emerald-950";

    const defaultBannerFallback =
      currentAd.bgColor === "amber"
        ? "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60"
        : currentAd.bgColor === "blue"
        ? "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=60"
        : "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60";

    const bannerImage = formatImageUrl(currentAd.imageUrl) || defaultBannerFallback;

    return (
      <div
        key="ad_banner"
        id="home-ad-banner-card"
        onMouseEnter={() => setIsBannerHovered(true)}
        onMouseLeave={() => setIsBannerHovered(false)}
        className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all duration-300 shadow-md ${bgStyles}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          {/* Banner Görseli (Kullanıcılara Garanti Olarak Görünür) */}
          <div className="shrink-0 w-full sm:w-48 md:w-56 h-40 sm:h-32 rounded-xl overflow-hidden border border-white/20 shadow-md bg-black/30 relative group">
            <img
              src={bannerImage}
              alt={currentAd.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultBannerFallback;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-white/90 font-bold drop-shadow-md">
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[9px]">Görsel Yayında</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[9px]">{safeBannerIndex + 1}/{activeBanners.length}</span>
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0 pr-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/20 border border-current shadow-xs">
                {currentAd.badge || "Sponsor & Duyuru"}
              </span>

              {/* Çoklu Reklam Gösterge Sayacı */}
              {activeBanners.length > 1 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/30 border border-current/20 opacity-90">
                  {safeBannerIndex + 1} / {activeBanners.length} Reklam & Duyuru
                </span>
              )}

              {isAdmin && (
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md">
                  <Shield className="w-3 h-3" />
                  <span>Admin {!currentAd.enabled && "(Pasif)"}</span>
                </span>
              )}
            </div>

            <h3 className="font-black text-sm sm:text-base tracking-tight leading-snug">
              {currentAd.title}
            </h3>
            <p className="text-xs opacity-85 max-w-2xl leading-relaxed">
              {currentAd.description}
            </p>

            {/* Slider Dots if multiple banners */}
            {activeBanners.length > 1 && (
              <div className="flex items-center gap-1.5 pt-1">
                {activeBanners.map((b, idx) => (
                  <button
                    key={b.id || idx}
                    type="button"
                    onClick={() => setCurrentBannerIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === safeBannerIndex
                        ? "w-6 bg-current"
                        : "w-2 bg-current/40 hover:bg-current/70"
                    }`}
                    title={`Reklam ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {/* Previous / Next buttons for switching advertisements */}
            {activeBanners.length > 1 && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
                  }
                  className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 border border-current/20 transition-all cursor-pointer"
                  title="Önceki Reklam"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length)
                  }
                  className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 border border-current/20 transition-all cursor-pointer"
                  title="Sonraki Reklam"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentAd.linkUrl && (
              <a
                href={currentAd.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer"
              >
                <span>{currentAd.buttonText || "İncele"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {isAdmin && onOpenAdminModal && (
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer"
                title="Reklamları Yönetici Panelinden Yönet (Ekle/Düzenle/Sil)"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Çoklu Kayıtlı Reklam Önizleme Şeridi */}
        {activeBanners.length > 1 && (
          <div className="mt-3 pt-2.5 border-t border-current/15 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold opacity-75 shrink-0">Kayıtlı Reklamlar:</span>
            {activeBanners.map((b, idx) => {
              const miniImg = formatImageUrl(b.imageUrl) || defaultBannerFallback;
              const isCurrent = idx === safeBannerIndex;
              return (
                <button
                  key={b.id || idx}
                  type="button"
                  onClick={() => setCurrentBannerIndex(idx)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all shrink-0 cursor-pointer ${
                    isCurrent
                      ? "bg-white/20 border-white/50 text-white shadow-xs"
                      : "bg-black/15 border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={miniImg}
                    alt={b.title}
                    className="w-5 h-4 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultBannerFallback;
                    }}
                  />
                  <span className="max-w-[120px] truncate">{b.badge || b.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 2. Hero Stats (Toplam KG ve 4 Metrik Kartı)
  const renderHeroStats = () => {
    return (
      <div key="hero_stats" className="space-y-3">
        {/* Main Hero Card: Toplam Teslim Edilen Çay / Fındık */}
        <div
          id="hero-total-kg-card"
          className={`relative overflow-hidden rounded-2xl p-5 transition-all shadow-lg border ${
            isDark
              ? "bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] text-[#042116] border-emerald-400/40 shadow-emerald-950/50"
              : "bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white border-emerald-500 shadow-emerald-900/20"
          }`}
        >
          {/* Background ambient watermarking */}
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10 pointer-events-none">
            <Leaf className="w-48 h-48" />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isDark ? "bg-[#042116] text-emerald-400" : "bg-white/20 text-white backdrop-blur-sm"
                  }`}
                >
                  <Scale className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-semibold tracking-wide ${
                    isDark ? "text-[#063b27]" : "text-emerald-100"
                  }`}
                >
                  {farmingFocus === "tea"
                    ? "Toplam teslim edilen yaş çay"
                    : farmingFocus === "hazelnut"
                    ? "Toplam teslim edilen fındık"
                    : "Toplam teslim edilen mahsul"}
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isDark ? "bg-[#042116]/30 text-emerald-950" : "bg-white/20 text-white"
                }`}
              >
                {displayHarvests.length} Teslimat
              </span>
            </div>

            <div>
              <div
                className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
                  isDark ? "text-[#021810]" : "text-white"
                }`}
              >
                {formatKg(totalKg)}{" "}
                <span className="text-xl md:text-2xl font-bold opacity-90">KG</span>
              </div>
              <p
                className={`text-xs mt-1 font-medium ${
                  isDark ? "text-[#043321]" : "text-emerald-100"
                }`}
              >
                Toplam Brüt Tutar: {formatCurrency(totalGross)}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid Layout */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Toplam Net Alacak */}
          <div
            id="metric-total-net"
            className={`rounded-xl p-3.5 border transition-all ${
              isDark
                ? "bg-[#10241c] border-emerald-900/50 hover:border-emerald-800 text-emerald-50"
                : "bg-white border-emerald-300/80 shadow-xs text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold ${isDark ? "opacity-80 text-emerald-200" : "text-emerald-950"}`}>
                Toplam net alacak
              </span>
            </div>
            <div className={`text-base md:text-lg font-extrabold tracking-tight ${isDark ? "text-emerald-400" : "text-emerald-900 font-black"}`}>
              {formatCurrency(totalNetReceivable)}
            </div>
            <span className={`text-[11px] mt-0.5 block ${isDark ? "opacity-60 text-emerald-300" : "text-emerald-950 font-bold"}`}>
              %2 borsa kesintisi düşüldü
            </span>
          </div>

          {/* Card 2: Tahsil Edilen Tutar */}
          <div
            id="metric-total-collected"
            className={`rounded-xl p-3.5 border transition-all ${
              isDark
                ? "bg-[#10241c] border-emerald-900/50 hover:border-emerald-800 text-emerald-50"
                : "bg-white border-emerald-300/80 shadow-xs text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold ${isDark ? "opacity-80 text-emerald-200" : "text-emerald-950"}`}>
                Tahsil edilen tutar
              </span>
            </div>
            <div className={`text-base md:text-lg font-extrabold tracking-tight ${isDark ? "text-teal-400" : "text-teal-950 font-black"}`}>
              {formatCurrency(totalCollected)}
            </div>
            <span className={`text-[11px] mt-0.5 block ${isDark ? "opacity-60 text-teal-300" : "text-teal-950 font-bold"}`}>
              {payments.length} tahsilat kaydı
            </span>
          </div>

          {/* Card 3: Fabrikadan ödeme bekliyor */}
          <div
            id="metric-pending-receivable"
            className={`rounded-xl p-3.5 border transition-all ${
              isDark
                ? "bg-[#10241c] border-emerald-900/50 hover:border-emerald-800 text-emerald-50"
                : "bg-white border-emerald-300/80 shadow-xs text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <span className={`text-xs font-black leading-snug ${isDark ? "text-amber-400" : "text-amber-950 font-black"}`}>
                Fabrikadan ödeme bekliyor
              </span>
            </div>
            <div className={`text-base md:text-lg font-black tracking-tight ${isDark ? "text-amber-400" : "text-amber-950 font-black"}`}>
              {formatCurrency(pendingReceivable)}
            </div>
            <span className={`text-[11px] mt-0.5 block font-bold ${isDark ? "opacity-70 text-amber-300" : "text-amber-950 font-black"}`}>
              {pendingCount > 0 ? `${pendingCount} vadeli kayıt bekliyor` : "Açık alacak yok"}
            </span>
          </div>

          {/* Card 4: Tahmini Net Kazanç */}
          <div
            id="metric-net-profit"
            className={`rounded-xl p-3.5 border transition-all ${
              isDark
                ? "bg-[#10241c] border-emerald-900/50 hover:border-emerald-800 text-emerald-50"
                : "bg-white border-emerald-300/80 shadow-xs text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold ${isDark ? "opacity-80 text-emerald-200" : "text-emerald-950"}`}>
                Tahmini net kazanç
              </span>
            </div>
            <div className={`text-base md:text-lg font-extrabold tracking-tight ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
              {formatCurrency(estimatedNetProfit)}
            </div>
            <span className={`text-[11px] mt-0.5 block font-semibold ${isDark ? "opacity-60 text-emerald-300" : "text-emerald-950 font-bold"}`}>
              Gider: {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 3. Quick Actions ("Bugün ne yapmak istersiniz?")
  const renderQuickActions = () => {
    return (
      <div key="quick_actions" id="quick-actions-section" className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h3
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-emerald-400" : "text-emerald-900"
            }`}
          >
            Bugün ne yapmak istersiniz?
          </h3>
          {isAdmin && onOpenAdminModal && (
            <button
              type="button"
              onClick={onOpenAdminModal}
              className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-bold"
            >
              <Sliders className="w-3 h-3" />
              <span>Sıralamayı Değiştir</span>
            </button>
          )}
        </div>

        {/* Big primary button: Hasat Ekle */}
        <button
          id="btn-primary-add-harvest"
          onClick={onOpenAddHarvest}
          className={`w-full rounded-2xl p-4 flex items-center justify-between text-left transition-all border shadow-md group cursor-pointer ${
            isDark
              ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-emerald-400/40 shadow-emerald-950/40"
              : "bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-white border-emerald-600 shadow-emerald-900/20"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight flex items-center gap-2">
                <span>Hasat Ekle</span>
                <span className="text-[10px] uppercase tracking-wider bg-white/25 px-1.5 py-0.2 rounded font-semibold">
                  Fişten Hızlı
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                Yeni yaş çay veya fındık teslimatı kaydet
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Action: Fabrikadan Ödeme Al */}
        <button
          id="btn-action-add-payment"
          onClick={onOpenAddPayment}
          className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group shadow-sm cursor-pointer ${
            isDark
              ? "bg-[#10241c] hover:bg-[#142f24] border-teal-800/60 text-emerald-50"
              : "bg-white hover:bg-teal-50/60 border-teal-200 text-gray-900 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">Fabrikadan Ödeme Al</div>
              <p className="text-xs opacity-75">
                Vadeli veya peşin tahsilatları hesabınıza işleyin
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Action: Pazar Yeri & İşçi Bul */}
        <button
          onClick={() => onNavigateTab("marketplace", "jobs")}
          className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
            isDark
              ? "bg-[#10241c] hover:bg-[#142f24] border-emerald-900/60 text-emerald-50"
              : "bg-white hover:bg-emerald-50/50 border-emerald-200 text-gray-900 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-800"}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Hasat İşçisi & Çavuş Ekibi Bul</div>
              <p className="text-[11px] opacity-75">
                {jobsCount || 0} aktif ilan • {crewsCount || 0} çavuş ekibi
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Android Uygulama & APK İndir Kartı */}
        {onOpenAndroidModal && (
          <button
            type="button"
            onClick={onOpenAndroidModal}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs ${
              isDark
                ? "bg-gradient-to-r from-emerald-950/80 via-[#0a2318] to-emerald-900/60 border-emerald-700/60 text-emerald-50 hover:border-emerald-500"
                : "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border-emerald-300 text-emerald-950 hover:border-emerald-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-700 text-white"}`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>Tarım Cepte Android Uygulaması</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-emerald-200 text-emerald-950 border border-emerald-400"}`}>
                    APK / Telefona Yükle
                  </span>
                </div>
                <p className="text-[11px] opacity-75 mt-0.5">
                  TarimCepte.apk dosyasını indirin veya ana ekrana ekleyin (Çevrimdışı Vadeli Takip)
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>
    );
  };

  // 4. Son Hasat Teslimatları
  const renderRecentHarvests = () => {
    return (
      <div key="recent_harvests" id="recent-harvests-section" className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h3
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-emerald-400" : "text-emerald-950 font-black"
            }`}
          >
            Son Teslimatlar
          </h3>
          <button
            onClick={() => onNavigateTab("other")}
            className={`text-xs font-bold cursor-pointer transition-colors ${
              isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-950 hover:underline"
            }`}
          >
            Tümünü Gör ({displayHarvests.length})
          </button>
        </div>

        {displayHarvests.length === 0 ? (
          <div
            className={`p-6 rounded-xl border text-center space-y-2 ${
              isDark
                ? "bg-[#10241c] border-emerald-900/40 text-emerald-300"
                : "bg-white border-emerald-300 text-emerald-950"
            }`}
          >
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-900"}`}>
              <Scale className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold">Henüz teslimat kaydı bulunmuyor</p>
            <p className={`text-[11px] font-medium ${isDark ? "opacity-70 text-emerald-200" : "text-emerald-900/80"}`}>
              İlk satışı ekleyerek borsa kesintisini ve net kazancınızı hemen görün.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayHarvests.slice(0, 3).map((h) => {
              const pendingOnItem = Math.max(0, h.netReceivable - (h.collectedAmount || 0));
              return (
                <div
                  key={h.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isDark
                      ? "bg-[#10241c] border-emerald-900/50 hover:border-emerald-700/60 text-emerald-100"
                      : "bg-white border-emerald-200 hover:border-emerald-300 text-gray-900 shadow-xs"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-gray-900 dark:text-emerald-50">{h.buyerName}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          pendingOnItem > 0
                            ? isDark
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-amber-100 text-amber-950 border border-amber-300"
                            : isDark
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-emerald-100 text-emerald-950 border border-emerald-300"
                        }`}
                      >
                        {pendingOnItem > 0 ? "Vadeli" : "Ödendi"}
                      </span>
                    </div>
                    <div className={`text-[11px] font-medium ${isDark ? "opacity-70 text-emerald-300/80" : "text-gray-700"}`}>
                      {h.date} • {h.gardenName}
                    </div>
                    <div className={`text-xs font-bold ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
                      {formatKg(h.quantityKg)} KG @ {h.unitPriceGross.toFixed(2)} TL
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className={`text-xs font-black ${isDark ? "text-emerald-100" : "text-emerald-950"}`}>{formatCurrency(h.netReceivable)}</div>
                    {pendingOnItem > 0 ? (
                      <button
                        onClick={() => onSelectHarvestForPayment(h)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isDark
                            ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40"
                            : "bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-700 shadow-2xs"
                        }`}
                      >
                        Tahsilat Gir
                      </button>
                    ) : (
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 justify-end ${isDark ? "text-emerald-400" : "text-emerald-900"}`}>
                        <CheckCircle2 className="w-3 h-3" /> Tahsil Edildi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 5. Bölgesel Zirai Tavsiyeler & Takvim
  const renderAgriAdvice = () => {
    return (
      <div
        key="agri_advice"
        className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
          isDark
            ? "bg-[#0b1d16] border-emerald-800/40 text-emerald-200"
            : "bg-white border-emerald-300 text-emerald-950 shadow-xs"
        }`}
      >
        <div className={`font-bold text-xs flex items-center justify-between ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
            <span>Bölgesel Zirai Takvim & Bakım İpucu</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-950 border-emerald-300"}`}>
            {farmingFocus === "tea" ? "Çay" : farmingFocus === "hazelnut" ? "Fındık" : "Çay & Fındık"}
          </span>
        </div>
        <p className={`text-[11px] leading-relaxed font-medium ${isDark ? "opacity-85 text-emerald-100" : "text-emerald-950/90"}`}>
          {farmingFocus === "tea"
            ? "1/7 gençleştirme budaması yapılan çay bahçelerinde sürüm hasat işçiliği maliyeti %30 daha düşüktür. İlkbaharda 25-5-10 kompoze gübre uygulamasını ihmal etmeyiniz."
            : farmingFocus === "hazelnut"
            ? "Fındıkta kış sonu budaması ve dalkıran/külleme kontrolleri verimi doğrudan belirler. Bahçenize işçi ve ekip rezervasyonunu şimdiden Pazar Yeri üzerinden tamamlayın."
            : "Karadeniz çay ve fındık bahçeleriniz için erken dönem budama ve gübreleme planlamasını yapın; sezon başlamadan ekip liderleri (çavuşlar) ile doğrudan net yevmiyeyle anlaşın."}
        </p>
      </div>
    );
  };

  // 6. Tanımlayıcı Alt Metinler (Footer Rehberi)
  const renderFooterInfo = () => {
    const steps = homeFooter.steps || [
      { title: "Hasat Ekle", desc: "Kilo ve satış fiyatını yazın." },
      { title: "Otomatik Kesinti", desc: "Net alacak tutarı %2 borsa kesintisiyle otomatik hesaplansın." },
      { title: "Ödeme Al", desc: "Ödeme geldiğinde Fabrikadan Ödeme Al'a dokunun." },
    ];

    return (
      <div
        key="footer_info"
        id="home-footer-info-card"
        className={`p-4 rounded-2xl border text-xs space-y-2.5 relative transition-all ${
          isDark
            ? "bg-[#0b1d16] border-emerald-800/40 text-emerald-200"
            : "bg-white border-emerald-300 text-emerald-950 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className={`font-black text-sm flex items-center gap-1.5 ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
            <Leaf className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
            <span>{homeFooter.title || "Başlamak çok kolay"}</span>
          </div>

          {isAdmin && onOpenAdminModal && (
            <button
              type="button"
              onClick={onOpenAdminModal}
              className={`text-[10px] flex items-center gap-1 font-bold cursor-pointer ${isDark ? "text-amber-400 hover:underline" : "text-amber-950 hover:underline font-black"}`}
              title="Bu metinleri Yönetici Panelinden Düzenle"
            >
              <Edit3 className="w-3 h-3" />
              <span>Metinleri Düzenle</span>
            </button>
          )}
        </div>

        <p className={`text-[11px] font-medium ${isDark ? "opacity-80 text-emerald-100" : "text-emerald-950/90"}`}>{homeFooter.subtitle}</p>

        <ol className="space-y-1 text-[11px] list-decimal list-inside font-medium">
          {steps.map((step, idx) => (
            <li key={idx} className={isDark ? "text-emerald-100" : "text-emerald-950"}>
              <strong className={isDark ? "text-emerald-300 font-bold" : "text-emerald-950 font-black"}>{step.title}:</strong> {step.desc}
            </li>
          ))}
        </ol>

        {homeFooter.contactNote && (
          <div className={`pt-2 border-t text-[10px] text-center font-semibold ${isDark ? "border-emerald-900/30 text-emerald-300/70" : "border-emerald-200 text-emerald-950"}`}>
            {homeFooter.contactNote}
          </div>
        )}
      </div>
    );
  };

  // Section Mapper for Dynamic Reordering
  const renderSection = (id: HomeSectionId) => {
    switch (id) {
      case "ad_banner":
        return renderAdBanner();
      case "hero_stats":
        return renderHeroStats();
      case "quick_actions":
        return renderQuickActions();
      case "recent_harvests":
        return renderRecentHarvests();
      case "agri_advice":
        return renderAgriAdvice();
      case "footer_info":
        return renderFooterInfo();
      default:
        return null;
    }
  };

  return (
    <div id="home-overview-container" className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Admin Notice Bar if User is Admin */}
      {isAdmin && (
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2 font-bold">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Yönetici Modu Aktif: Tüm ayar, silme, reklam ve menü düzenleme yetkisine sahipsiniz.</span>
          </div>
          {onOpenAdminModal && (
            <button
              type="button"
              onClick={onOpenAdminModal}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] cursor-pointer shadow-xs shrink-0"
            >
              Yönetici Paneli
            </button>
          )}
        </div>
      )}

      {/* Top Banner Tagline */}
      <div className="text-center py-1">
        <h2
          className={`text-base md:text-lg font-bold tracking-tight ${
            isDark ? "text-emerald-300" : "text-emerald-950 font-black"
          }`}
        >
          Hasadını ve kazancını tek ekranda gör
        </h2>
        <p className={`text-xs ${isDark ? "text-emerald-400/70" : "text-emerald-950 font-bold"}`}>
          {farmingFocus === "tea"
            ? "2026 Sezonu Yaş Çay Üretici Portalı (Sadece Yaş Çay Aktif)"
            : farmingFocus === "hazelnut"
            ? "2026 Sezonu Fındık Üretici Portalı (Sadece Fındık Aktif)"
            : "2026 Sezonu Çay & Fındık Üretici Portalı (Tüm Mahsuller Aktif)"}
        </p>
      </div>

      {/* DYNAMIC SECTIONS RENDERED IN ADMIN CONFIGURABLE ORDER */}
      {sectionsOrder.map((sectionId) => renderSection(sectionId))}
    </div>
  );
};
