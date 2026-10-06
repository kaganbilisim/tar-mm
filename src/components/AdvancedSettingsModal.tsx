import React, { useState, useEffect } from "react";
import { AppSettings, UserAccount, DEFAULT_CKS_LINKS } from "../types";
import {
  Settings,
  X,
  Percent,
  ShieldCheck,
  User,
  Calculator,
  Save,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  FileSpreadsheet,
  ExternalLink,
  FileText,
  Building2,
  Check,
  UserCheck,
  BadgeCheck,
  Award,
  QrCode,
  Sparkles,
  Edit3,
  Search,
  Shield,
} from "lucide-react";

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onWipeData: () => void;
  isDark: boolean;
  currentUser?: UserAccount | null;
  onOpenAdminModal?: () => void;
  allAppData?: {
    harvestsCount: number;
    expensesCount: number;
    gardensCount: number;
    factoriesCount: number;
  };
}

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onWipeData,
  isDark,
  currentUser,
  onOpenAdminModal,
  allAppData,
}) => {
  const [activeTab, setActiveTab] = useState<"deductions" | "producer" | "general" | "privacy">(
    "deductions"
  );

  // Kesinti State'leri
  const [borsaTescilRate, setBorsaTescilRate] = useState<string>(
    String(settings.borsaTescilRate ?? 1.0)
  );
  const [stopajRate, setStopajRate] = useState<string>(String(settings.stopajRate ?? 1.0));
  const [autoApplyDeduction, setAutoApplyDeduction] = useState<boolean>(
    settings.autoApplyDeduction ?? true
  );
  const [customLabel, setCustomLabel] = useState<string>(
    settings.customDeductionLabel || "Borsa Tescil & Stopaj Kesintisi"
  );

  // Üretici Bilgileri State'leri (Sistemdeki kullanıcı adı/bilgisi öncelikli varsayılan)
  const [farmerName, setFarmerName] = useState<string>(() => {
    return settings.farmerName?.trim() || currentUser?.fullName || currentUser?.username || "";
  });
  const [farmerCksNo, setFarmerCksNo] = useState<string>(settings.farmerCksNo || "");
  const [teaLicenseNo, setTeaLicenseNo] = useState<string>(settings.teaLicenseNo || "");
  const [defaultCropType, setDefaultCropType] = useState<"tea" | "hazelnut">(
    settings.defaultCropType || "tea"
  );

  // Genel Ayarlar
  const [autoDueDateDays, setAutoDueDateDays] = useState<string>(
    String(settings.autoDueDateDays ?? 30)
  );
  const [currencySymbol, setCurrencySymbol] = useState<string>(settings.currencySymbol || "TL");

  // Simülasyon State'leri
  const [simKg, setSimKg] = useState<string>("1000");
  const [simPrice, setSimPrice] = useState<string>("38.50");

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isConfirmingWipe, setIsConfirmingWipe] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setBorsaTescilRate(String(settings.borsaTescilRate ?? 1.0));
      setStopajRate(String(settings.stopajRate ?? 1.0));
      setAutoApplyDeduction(settings.autoApplyDeduction ?? true);
      setCustomLabel(settings.customDeductionLabel || "Borsa Tescil & Stopaj Kesintisi");
      
      // Sisteme kayıtlı kullanıcı bilgileri ile senkronize otomatik doldur
      const realProfileName = currentUser?.fullName || currentUser?.username || "";
      if (realProfileName) {
        setFarmerName(realProfileName);
      } else {
        setFarmerName(settings.farmerName || "");
      }

      setFarmerCksNo(settings.farmerCksNo || "");
      setTeaLicenseNo(settings.teaLicenseNo || "");
      
      // Kayıtlı ürün türünü kullanıcının gerçek sistem profilinden otomatik al
      const resolvedCrop: "tea" | "hazelnut" =
        currentUser?.farmingFocus === "hazelnut"
          ? "hazelnut"
          : currentUser?.farmingFocus === "tea"
          ? "tea"
          : (settings.defaultCropType as "tea" | "hazelnut") || "tea";
      setDefaultCropType(resolvedCrop);

      setAutoDueDateDays(String(settings.autoDueDateDays ?? 30));
      setCurrencySymbol(settings.currencySymbol || "TL");
      setSavedSuccess(false);
    }
  }, [isOpen, settings, currentUser]);

  if (!isOpen) return null;

  // Hesaplanan toplam kesinti oranı
  const numBorsa = parseFloat(borsaTescilRate) || 0;
  const numStopaj = parseFloat(stopajRate) || 0;
  const totalDeductionRate = numBorsa + numStopaj;

  // Simülasyon hesapları
  const simNumKg = parseFloat(simKg) || 0;
  const simNumPrice = parseFloat(simPrice) || 0;
  const simGross = simNumKg * simNumPrice;
  const simBorsaDeduction = simGross * (numBorsa / 100);
  const simStopajDeduction = simGross * (numStopaj / 100);
  const simTotalDeduction = autoApplyDeduction ? simBorsaDeduction + simStopajDeduction : 0;
  const simNet = simGross - simTotalDeduction;

  const formatTL = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const newSettings: AppSettings = {
      borsaTescilRate: Math.max(0, numBorsa),
      stopajRate: Math.max(0, numStopaj),
      autoApplyDeduction,
      customDeductionLabel: customLabel.trim() || "Borsa Tescil & Stopaj Kesintisi",
      farmerName: farmerName.trim(),
      farmerCksNo: farmerCksNo.trim(),
      teaLicenseNo: teaLicenseNo.trim(),
      defaultCropType,
      autoDueDateDays: parseInt(autoDueDateDays, 10) || 30,
      currencySymbol: currencySymbol.trim() || "TL",
    };

    onSaveSettings(newSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleExportJson = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      settings: {
        borsaTescilRate: numBorsa,
        stopajRate: numStopaj,
        autoApplyDeduction,
        farmerName,
        farmerCksNo,
        teaLicenseNo,
        defaultCropType,
      },
      harvests: localStorage.getItem("tarim_cepte_harvests"),
      expenses: localStorage.getItem("tarim_cepte_expenses"),
      gardens: localStorage.getItem("tarim_cepte_gardens"),
      factories: localStorage.getItem("tarim_cepte_factories"),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tarim_cepte_yedek_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWipeConfirm = () => {
    onWipeData();
    setIsConfirmingWipe(false);
    onClose();
  };

  return (
    <div
      id="advanced-settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div
        id="advanced-settings-card"
        className={`w-full max-w-xl rounded-2xl shadow-2xl border my-6 transition-all overflow-hidden flex flex-col max-h-[92vh] ${
          isDark
            ? "bg-[#0b1c15] border-emerald-800/80 text-emerald-50"
            : "bg-white border-emerald-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`p-3.5 sm:p-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? "bg-[#081510] border-emerald-800/60" : "bg-emerald-50 border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                <span>Gelişmiş Uygulama Ayarları</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                  2026 Sezonu
                </span>
              </h3>
              <p className="text-[11px] opacity-75">
                Borsa tescil / stopaj kesinti oranları, üretici kimliği ve tercihler
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation - Tümü Görünür Düzen */}
        <div
          className={`p-2 sm:p-2.5 border-b shrink-0 ${
            isDark ? "bg-[#081510]/80 border-emerald-900/60" : "bg-gray-50/90 border-gray-200"
          }`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("deductions")}
              className={`px-2 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                activeTab === "deductions"
                  ? isDark
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                    : "bg-emerald-700 text-white shadow-sm"
                  : isDark
                  ? "bg-[#10241c] text-emerald-200/80 hover:bg-[#153025] hover:text-white border border-emerald-800/40"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Percent className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Kesinti & Stopaj</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("producer")}
              className={`px-2 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                activeTab === "producer"
                  ? isDark
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                    : "bg-emerald-700 text-white shadow-sm"
                  : isDark
                  ? "bg-[#10241c] text-emerald-200/80 hover:bg-[#153025] hover:text-white border border-emerald-800/40"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Üretici & Ruhsat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`px-2 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                activeTab === "general"
                  ? isDark
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                    : "bg-emerald-700 text-white shadow-sm"
                  : isDark
                  ? "bg-[#10241c] text-emerald-200/80 hover:bg-[#153025] hover:text-white border border-emerald-800/40"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Genel Tercihler</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("privacy")}
              className={`px-2 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                activeTab === "privacy"
                  ? isDark
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                    : "bg-emerald-700 text-white shadow-sm"
                  : isDark
                  ? "bg-[#10241c] text-emerald-200/80 hover:bg-[#153025] hover:text-white border border-emerald-800/40"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Veri & Gizlilik</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: KESİNTİ (BORSA TESCİL / STOPAJ) */}
          {activeTab === "deductions" && (
            <div className="space-y-4">
              {/* CANLI KESİNTİ HESAPLAMA SİMÜLATÖRÜ */}
              <div
                className={`p-3.5 rounded-xl border space-y-3 ${
                  isDark ? "bg-[#0c1813] border-emerald-900/60" : "bg-white border-gray-200 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-teal-300">
                  <Calculator className="w-4 h-4 text-teal-400" />
                  <span>Canlı Kesinti Simülasyonu & Örnek Hesap</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] opacity-75 mb-0.5">Örnek Hasat (KG)</label>
                    <input
                      type="number"
                      value={simKg}
                      onChange={(e) => setSimKg(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-gray-50 border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] opacity-75 mb-0.5">Birim Fiyat (TL)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={simPrice}
                      onChange={(e) => setSimPrice(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-gray-50 border-gray-300"
                      }`}
                    />
                  </div>
                </div>

                {/* Sonuç Kartları */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/25 text-[11px]">
                  <div>
                    <span className="opacity-70 block text-[10px]">Brüt Tutar</span>
                    <span className="font-bold text-white">{formatTL(simGross)}</span>
                  </div>
                  <div>
                    <span className="opacity-70 block text-[10px]">
                      Kesinti (%{totalDeductionRate.toFixed(2)})
                    </span>
                    <span className="font-bold text-red-400">
                      -{formatTL(simTotalDeduction)}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-70 block text-[10px]">Net Üretici Eline Geçen</span>
                    <span className="font-bold text-emerald-400">{formatTL(simNet)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ÜRETİCİ & RUHSAT BİLGİLERİ */}
          {activeTab === "producer" && (
            <div className="space-y-4">
              {/* ŞIK ÜRETİCİ / ÇİFTÇİ DİJİTAL KİMLİK KARTI */}
              <div
                className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all shadow-xl ${
                  isDark
                    ? "bg-gradient-to-br from-[#0c271b] via-[#091f15] to-[#05130d] border-emerald-700/60 shadow-emerald-950/70 text-emerald-50"
                    : "bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 border-emerald-600 text-white shadow-emerald-900/30"
                }`}
              >
                {/* Arka plan dekoratif filigran ve glow */}
                <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-400/10 pointer-events-none blur-3xl" />
                <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
                  <QrCode className="w-24 h-24 text-emerald-300" />
                </div>

                {/* Kart Başlığı */}
                <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-3 mb-3.5 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
                      <Award className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-black text-emerald-300 flex items-center gap-1.5">
                        <span>ÇİFTÇİ KAYIT SİSTEMİ (ÇKS) KİMLİK KARTI</span>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-100/80">
                        T.C. Tarım & Orman Bakanlığı Kayıtlı Üretici
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1 shadow-xs">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-300" />
                      <span>2026 Sezonu Aktif</span>
                    </span>
                  </div>
                </div>

                {/* Kart Gövdesi: Çiftçi Adı ve Detayları */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div className="flex items-center gap-3.5">
                    {/* Çiftçi Avatarı / Baş Harfi */}
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0 border-2 border-emerald-300/40">
                      {(farmerName || currentUser?.fullName || currentUser?.username || "Ç")[0]?.toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                          {farmerName || currentUser?.fullName || currentUser?.username || "Kayıtlı Çiftçi Adı"}
                        </h3>
                        <BadgeCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-emerald-200/90 mt-0.5">
                        {currentUser?.username && (
                          <span className="font-semibold text-emerald-300">@{currentUser.username}</span>
                        )}
                        {currentUser?.phone && (
                          <>
                            <span className="opacity-50">•</span>
                            <span>{currentUser.phone}</span>
                          </>
                        )}
                        {currentUser?.email && (
                          <>
                            <span className="opacity-50">•</span>
                            <span className="truncate max-w-[180px]">{currentUser.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Öncelikli Ürün ve Kullanıcı Bilgisi Rozeti */}
                  <div className="sm:text-right shrink-0">
                    <span className="text-[10px] text-emerald-300/80 block uppercase tracking-wider font-bold">
                      Kayıtlı Ürün Türü & Odak
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-black/40 border border-emerald-400/30 text-white mt-0.5 shadow-inner">
                      {(currentUser?.farmingFocus || defaultCropType) === "both"
                        ? "🌱 Yaş Çay & 🌰 Fındık (Karma)"
                        : (currentUser?.farmingFocus || defaultCropType) === "hazelnut"
                        ? "🌰 Fındık (Giresun / Ordu)"
                        : "🌱 Yaş Çay (Rize / Doğu Karadeniz)"}
                    </span>
                    {currentUser && (
                      <div className="text-[10px] text-emerald-200/90 mt-1 font-semibold flex items-center justify-start sm:justify-end gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          {currentUser.role === "admin"
                            ? "👑 Sistem Yöneticisi"
                            : currentUser.role === "employer"
                            ? "🌱 Bahçe Sahibi / Çiftçi"
                            : currentUser.role === "crew_leader"
                            ? "👥 Çavuş / Ekip Lideri"
                            : currentUser.role === "worker"
                            ? "🪓 Bireysel İşçi"
                            : "🚜 Hizmet Sağlayıcı"}
                        </span>
                        <span className="text-white font-bold">({currentUser.fullName || currentUser.username})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kart Alt Bilgileri: ÇKS No & Ruhsat No Izgarası */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-emerald-500/20 relative z-10">
                  <div className="p-2.5 rounded-xl bg-black/35 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-300/80 block font-bold uppercase tracking-wide">
                      ÇKS (Çiftçi Kayıt Sistemi) No
                    </span>
                    <div className="font-mono font-bold text-xs sm:text-sm text-white mt-0.5 tracking-wider truncate">
                      {farmerCksNo.trim() ? (
                        farmerCksNo
                      ) : (
                        <span className="text-emerald-300/60 font-sans text-xs italic font-normal">
                          Kayıt No Girilmedi (Aşağıdan Düzenleyin)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/35 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-300/80 block font-bold uppercase tracking-wide">
                      ÇAYKUR / Fındık Ruhsat Cüzdan No
                    </span>
                    <div className="font-mono font-bold text-xs sm:text-sm text-white mt-0.5 tracking-wider truncate">
                      {teaLicenseNo.trim() ? (
                        teaLicenseNo
                      ) : (
                        <span className="text-emerald-300/60 font-sans text-xs italic font-normal">
                          Ruhsat No Girilmedi (Aşağıdan Düzenleyin)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* DÜZENLEME FORMU */}
              <div
                className={`p-3.5 rounded-xl border space-y-3 ${
                  isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-emerald-50/60 border-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between border-b border-emerald-800/30 pb-2">
                  <div className="font-bold text-xs text-emerald-300 flex items-center gap-2">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Üretici & Ruhsat Bilgilerini Düzenle</span>
                  </div>
                  {currentUser && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      <span>Kullanıcı: {currentUser.fullName || currentUser.username}</span>
                    </span>
                  )}
                </div>

                {/* Üretici / Çiftçi Adı Soyadı */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold">
                      Üretici / Çiftçi Adı Soyadı
                    </label>
                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => setFarmerName(currentUser.fullName || currentUser.username)}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Sisteme kayıtlı kullanıcı adınızı otomatik aktarın"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Sistem Profilinden Al ({currentUser.fullName || currentUser.username})</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      placeholder={currentUser?.fullName ? `Örn: ${currentUser.fullName}` : currentUser?.username ? `Örn: ${currentUser.username}` : "Örn: Adınız Soyadınız"}
                      className={`w-full px-3 py-2 rounded-lg border text-xs pr-8 ${
                        isDark
                          ? "bg-[#142920] border-emerald-800 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                    {currentUser &&
                      farmerName.trim().toLowerCase() ===
                        (currentUser.fullName || currentUser.username).trim().toLowerCase() && (
                        <span
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400"
                          title="Sistemde kayıtlı kullanıcı ile eşleşiyor"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                  </div>
                  {currentUser && (
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] opacity-80">
                      <span className="flex items-center gap-1 text-emerald-300 font-medium">
                        <Check className="w-3 h-3" />
                        <span>Sistemde Kayıtlı: <strong>{currentUser.fullName || currentUser.username}</strong></span>
                      </span>
                      {currentUser.phone && (
                        <span className="text-emerald-200/70">• Tel: {currentUser.phone}</span>
                      )}
                      {currentUser.email && (
                        <span className="text-emerald-200/70">• E-posta: {currentUser.email}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">
                      ÇKS (Çiftçi Kayıt Sistemi) No
                    </label>
                    <input
                      type="text"
                      value={farmerCksNo}
                      onChange={(e) => setFarmerCksNo(e.target.value)}
                      placeholder="Örn: ÇKS-2026-538192"
                      className={`w-full px-3 py-2 rounded-lg border text-xs ${
                        isDark
                          ? "bg-[#142920] border-emerald-800 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">
                      ÇAYKUR / Fındık Ruhsat Cüzdan No
                    </label>
                    <input
                      type="text"
                      value={teaLicenseNo}
                      onChange={(e) => setTeaLicenseNo(e.target.value)}
                      placeholder="Örn: ÇAYKUR-53-09412"
                      className={`w-full px-3 py-2 rounded-lg border text-xs ${
                        isDark
                          ? "bg-[#142920] border-emerald-800 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">
                    Varsayılan Öncelikli Ürün Türü
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDefaultCropType("tea")}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        defaultCropType === "tea"
                          ? "bg-teal-600 text-white border-teal-500 shadow-xs"
                          : isDark
                          ? "bg-[#142920] border-emerald-800 text-emerald-300 hover:bg-emerald-800/40"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      🌱 Yaş Çay (Rize / Karadeniz)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDefaultCropType("hazelnut")}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        defaultCropType === "hazelnut"
                          ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                          : isDark
                          ? "bg-[#142920] border-emerald-800 text-amber-300 hover:bg-emerald-800/40"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      🌰 Fındık (Giresun / Ordu)
                    </button>
                  </div>
                </div>

                {/* E-DEVLET ÇİFTÇİ KAYIT SİSTEMİ (ÇKS) İŞLEMLERİ */}
                <div
                  className={`mt-4 pt-3.5 border-t ${
                    isDark ? "border-emerald-800/50" : "border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black text-[11px] shadow-xs">
                        tr
                      </div>
                      <div>
                        <h4 className="font-bold text-xs flex items-center gap-1.5 text-white">
                          <span>e-Devlet Çiftçi Kayıt Sistemi (ÇKS) İşlemleri</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                            Resmi Portallar
                          </span>
                        </h4>
                        <p className="text-[10px] opacity-75">
                          T.C. Tarım ve Orman Bakanlığı resmi ÇKS başvuru, sorgulama ve doğrulama işlemleri
                        </p>
                      </div>
                    </div>

                    {currentUser?.role === "admin" && onOpenAdminModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAdminModal();
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-bold cursor-pointer transition-colors"
                        title="ÇKS linklerini ve menüleri Yönetici Panelinden Düzenle"
                      >
                        <Shield className="w-3 h-3 text-amber-400" />
                        <span>Linkleri Yönet</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {(settings.cksLinks || DEFAULT_CKS_LINKS).map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 group cursor-pointer ${
                          isDark
                            ? "bg-[#0c1a14] hover:bg-[#12261e] border-emerald-900/60 hover:border-emerald-700 text-emerald-100"
                            : "bg-white hover:bg-emerald-50/50 border-gray-200 hover:border-emerald-300 text-gray-800 shadow-xs"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          {item.iconType === "building" ? (
                            <Building2 className="w-3.5 h-3.5" />
                          ) : item.iconType === "search" ? (
                            <Search className="w-3.5 h-3.5" />
                          ) : item.iconType === "check" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] leading-tight text-white group-hover:text-emerald-300 transition-colors">
                              {item.title}
                            </span>
                            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0 text-emerald-400" />
                          </div>
                          <p className="text-[10px] opacity-70 mt-0.5 leading-snug line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GENEL TERCİHLER */}
          {activeTab === "general" && (
            <div className="space-y-3.5">
              <div
                className={`p-3.5 rounded-xl border space-y-3 ${
                  isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-emerald-50/60 border-emerald-200"
                }`}
              >
                <div className="font-bold text-xs text-emerald-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  <span>Finansal & Vade Tercihleri</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">
                      Varsayılan Vade Süresi (Gün)
                    </label>
                    <input
                      type="number"
                      value={autoDueDateDays}
                      onChange={(e) => setAutoDueDateDays(e.target.value)}
                      placeholder="Örn: 30"
                      className={`w-full px-3 py-2 rounded-lg border text-xs ${
                        isDark
                          ? "bg-[#142920] border-emerald-800 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                    <span className="text-[10px] opacity-60 block mt-1">
                      Vadeli teslimatlarda otomatik son ödeme tarihi ekler
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">
                      Para Birimi Gösterimi
                    </label>
                    <input
                      type="text"
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      placeholder="TL"
                      className={`w-full px-3 py-2 rounded-lg border text-xs ${
                        isDark
                          ? "bg-[#142920] border-emerald-800 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERİ VE GİZLİLİK */}
          {activeTab === "privacy" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-200">Uçtan Uca Şifreli & Yerel Depolama</div>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Tarım kayıtlarınız, kantar fişleriniz ve alacak bilgileriniz sadece cihazınızda
                    saklanır. Dilediğiniz an yedekleyebilir veya silebilirsiniz.
                  </p>
                </div>
              </div>

              {/* Dışa Aktarma & Yedekleme */}
              <div
                className={`p-3.5 rounded-xl border space-y-2.5 ${
                  isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs">Verileri Dışa Aktar / Yedekle</div>
                    <div className="text-[11px] opacity-70">
                      Tüm hasat, masraf, bahçe ve ayar verilerini JSON dosyası olarak indirin
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Yedek İndir</span>
                  </button>
                </div>
              </div>

              {/* Kalıcı Veri Sıfırlama */}
              <div
                className={`p-3.5 rounded-xl border border-red-500/30 space-y-2.5 ${
                  isDark ? "bg-red-950/20" : "bg-red-50/60"
                }`}
              >
                {!isConfirmingWipe ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Tüm Verileri Kalıcı Olarak Sıfırla</span>
                      </div>
                      <div className="text-[11px] opacity-70">
                        Hasat kayıtları, bahçeler, alacaklar ve harcamaları temizler
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingWipe(true)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Verileri Sıfırla</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 animate-in fade-in">
                    <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span>Hasat, bahçe ve finans kayıtlarınız kalıcı olarak silinecektir!</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingWipe(false)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-gray-700 hover:bg-gray-600 text-white cursor-pointer"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="button"
                        onClick={handleWipeConfirm}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-950/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Evet, Tümünü Sıfırla</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`p-3 sm:p-4 border-t flex items-center justify-between shrink-0 ${
            isDark ? "bg-[#081510] border-emerald-800/60" : "bg-gray-50 border-gray-200"
          }`}
        >
          <div>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ayarlar Başarıyla Kaydedildi!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                isDark
                  ? "border-emerald-800 text-emerald-300 hover:bg-emerald-900/40"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Kapat
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Ayarları Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
