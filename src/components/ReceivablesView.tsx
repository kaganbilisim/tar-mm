import React, { useState, useMemo } from "react";
import { HarvestRecord, PaymentRecord, SeasonType, UserRole, FarmingFocus } from "../types";
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  DollarSign,
  Building,
  AlertCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCheck,
  AlertTriangle,
  TrendingUp,
  Wallet,
  X,
  CreditCard,
  FileSpreadsheet,
  Shield,
} from "lucide-react";

interface ReceivablesViewProps {
  harvests: HarvestRecord[];
  payments: PaymentRecord[];
  isDark: boolean;
  currentRole?: UserRole;
  farmingFocus?: FarmingFocus;
  onOpenPaymentModal: (harvestId?: string) => void;
  onQuickCompleteHarvest?: (harvestId: string) => void;
  onDeletePayment?: (paymentId: string) => void;
  onDeleteHarvest?: (harvestId: string) => void;
}

const SEASON_NAMES: Record<SeasonType, string> = {
  season_1: "1. Sezon (Mayıs)",
  season_2: "2. Sezon (Temmuz)",
  season_3: "3. Sezon (Güz)",
  season_4: "4. Sezon & Fındık",
};

export const ReceivablesView: React.FC<ReceivablesViewProps> = ({
  harvests,
  payments,
  isDark,
  currentRole,
  farmingFocus = "both",
  onOpenPaymentModal,
  onQuickCompleteHarvest,
  onDeletePayment,
  onDeleteHarvest,
}) => {
  // Filtrelenmiş hasat kayıtları (Çay veya Fındık odağına göre)
  const displayHarvests = useMemo(() => {
    if (farmingFocus === "tea") return harvests.filter((h) => h.cropType === "tea");
    if (farmingFocus === "hazelnut") return harvests.filter((h) => h.cropType === "hazelnut");
    return harvests;
  }, [harvests, farmingFocus]);

  // Filtreler & Arama
  const [statusFilter, setStatusFilter] = useState<"pending" | "all" | "partial" | "completed">("pending");
  const [buyerFilter, setBuyerFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedHarvestIds, setExpandedHarvestIds] = useState<Set<string>>(new Set());

  // Hızlı Tahsilat ve Ödeme Silme Modalları
  const [quickCompleteTarget, setQuickCompleteTarget] = useState<HarvestRecord | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRecord | null>(null);
  const [harvestToDelete, setHarvestToDelete] = useState<HarvestRecord | null>(null);

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

  // Genel Finansal Özet Hesaplamaları
  const totalNetAll = displayHarvests.reduce((acc, h) => acc + h.netReceivable, 0);
  const totalCollectedAll = displayHarvests.reduce((acc, h) => acc + (h.collectedAmount || 0), 0);
  const totalPendingAll = Math.max(0, totalNetAll - totalCollectedAll);
  const collectionRate = totalNetAll > 0 ? Math.min(100, Math.round((totalCollectedAll / totalNetAll) * 100)) : 0;

  // Tüm Benzersiz Fabrikalar / Alıcılar
  const allBuyers = Array.from(new Set(displayHarvests.map((h) => h.buyerName))).filter(Boolean);

  // Filtrelenmiş Alacak Listesi
  const filteredHarvests = displayHarvests.filter((h) => {
    const remaining = Math.max(0, h.netReceivable - (h.collectedAmount || 0));

    // Durum Filtresi
    if (statusFilter === "pending" && remaining <= 0.01) return false;
    if (statusFilter === "partial" && (remaining <= 0.01 || (h.collectedAmount || 0) <= 0.01)) return false;
    if (statusFilter === "completed" && remaining > 0.01) return false;

    // Fabrika Filtresi
    if (buyerFilter !== "all" && h.buyerName !== buyerFilter) return false;

    // Arama
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBuyer = h.buyerName.toLowerCase().includes(q);
      const matchGarden = h.gardenName.toLowerCase().includes(q);
      const matchNote = h.receiptNote?.toLowerCase().includes(q);
      const matchDate = h.date.includes(q);
      if (!matchBuyer && !matchGarden && !matchNote && !matchDate) return false;
    }

    return true;
  });

  // Vade Durumu Değerlendirmesi
  const getDueDateStatus = (dueDateStr?: string, remainingAmount: number = 0) => {
    if (remainingAmount <= 0.01) {
      return {
        status: "paid",
        label: "Tahsil Edildi",
        color: isDark
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          : "text-emerald-950 bg-emerald-100 border-emerald-300 font-black",
      };
    }
    if (!dueDateStr) {
      return {
        status: "no_due",
        label: "Vade Belirtilmedi",
        color: isDark
          ? "text-gray-400 bg-gray-500/10 border-gray-500/20"
          : "text-gray-700 bg-gray-100 border-gray-300 font-medium",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: "overdue",
        label: `Vadesi ${Math.abs(diffDays)} Gün Geçti!`,
        color: isDark
          ? "text-rose-400 bg-rose-500/20 border-rose-500/40 font-bold animate-pulse"
          : "text-rose-950 bg-rose-100 border-rose-300 font-black animate-pulse",
      };
    }
    if (diffDays === 0) {
      return {
        status: "today",
        label: "Bugün Vadesi Doluyor!",
        color: isDark
          ? "text-amber-300 bg-amber-500/20 border-amber-500/40 font-bold"
          : "text-amber-950 bg-amber-100 border-amber-300 font-black",
      };
    }
    if (diffDays <= 7) {
      return {
        status: "soon",
        label: `${diffDays} Gün Kaldı`,
        color: isDark
          ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
          : "text-amber-950 bg-amber-100 border-amber-300 font-bold",
      };
    }
    return {
      status: "future",
      label: `Vade: ${dueDateStr}`,
      color: isDark
        ? "text-emerald-400/80 bg-emerald-500/10 border-emerald-500/20"
        : "text-emerald-950 bg-emerald-50 border-emerald-300 font-bold",
    };
  };

  const toggleExpand = (harvestId: string) => {
    setExpandedHarvestIds((prev) => {
      const next = new Set(prev);
      if (next.has(harvestId)) next.delete(harvestId);
      else next.add(harvestId);
      return next;
    });
  };

  const handleConfirmQuickComplete = () => {
    if (quickCompleteTarget && onQuickCompleteHarvest) {
      onQuickCompleteHarvest(quickCompleteTarget.id);
      setQuickCompleteTarget(null);
    }
  };

  const handleConfirmDeletePayment = () => {
    if (paymentToDelete && onDeletePayment) {
      onDeletePayment(paymentToDelete.id);
      setPaymentToDelete(null);
    }
  };

  const handleConfirmDeleteHarvest = () => {
    if (harvestToDelete && onDeleteHarvest) {
      onDeleteHarvest(harvestToDelete.id);
      setHarvestToDelete(null);
    }
  };

  return (
    <div id="receivables-view-container" className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Top Banner Tagline */}
      <div className="text-center py-1">
        <h2 className={`text-base md:text-lg font-bold tracking-tight ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
          Alacak & Vade Takip Merkezi
        </h2>
        <p className={`text-xs ${isDark ? "text-emerald-400/70" : "text-emerald-950 font-bold"}`}>
          ÇAYKUR ve Özel Fabrika Tahsilatlarınızı Kolayca Yönetin
        </p>
      </div>

      {/* Finansal Genel Durum Kartı (İlerleme Çubuğu ile) */}
      <div
        id="box-total-receivable"
        className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
          isDark
            ? "bg-[#10241c] border-emerald-900/80 text-emerald-50 shadow-md"
            : "bg-white border-emerald-300 text-gray-900 shadow-2xs"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-900/40 pb-3">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-teal-500/20 text-teal-400" : "bg-teal-100 text-teal-950"}`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-wider block ${isDark ? "text-teal-400" : "text-teal-950"}`}>
                BAKİYE & TAHSİLAT DURUMU
              </span>
              <h3 className={`font-black text-sm sm:text-base ${isDark ? "text-white" : "text-emerald-950"}`}>Genel Finansal Alacak Tablosu</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`text-xs px-2.5 py-1 rounded-full font-black border ${isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-950 border-emerald-300"}`}>
              %{collectionRate} Tahsil Edildi
            </span>
          </div>
        </div>

        {/* 3'lü İstatistik Izgarası */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Toplam Net Alacak */}
          <div className={`p-3 rounded-xl border ${isDark ? "bg-[#0b1c15] border-emerald-900/60" : "bg-emerald-50/80 border-emerald-200"}`}>
            <span className={`text-[11px] block font-bold ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950"}`}>Toplam Hak Ediş (Net)</span>
            <span className={`text-lg font-black block mt-0.5 ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
              {formatCurrency(totalNetAll)}
            </span>
            <span className={`text-[10px] block font-medium ${isDark ? "opacity-60 text-emerald-200" : "text-emerald-900"}`}>{harvests.length} adet teslimat kaydı</span>
          </div>

          {/* Tahsil Edilen */}
          <div className={`p-3 rounded-xl border ${isDark ? "bg-[#0b1c15] border-emerald-900/60" : "bg-emerald-50/80 border-emerald-200"}`}>
            <span className={`text-[11px] block font-bold ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950"}`}>Kasadaki Tahsilat</span>
            <span className={`text-lg font-black block mt-0.5 ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
              {formatCurrency(totalCollectedAll)}
            </span>
            <span className={`text-[10px] block font-medium ${isDark ? "opacity-60 text-emerald-200" : "text-emerald-900"}`}>{payments.length} adet ödeme işlemi</span>
          </div>

          {/* Bekleyen Vadeli Açık Alacak */}
          <div className={`p-3 rounded-xl border ${isDark ? "bg-[#0b1c15] border-emerald-900/60" : "bg-red-50/80 border-red-200"}`}>
            <span className={`text-[11px] block font-bold ${isDark ? "opacity-75 text-rose-200" : "text-rose-950"}`}>Bekleyen Vadeli Bakiye</span>
            <span className={`text-lg font-black block mt-0.5 ${totalPendingAll > 0 ? (isDark ? "text-rose-400" : "text-rose-950") : (isDark ? "text-emerald-400" : "text-emerald-950")}`}>
              {formatCurrency(totalPendingAll)}
            </span>
            <span className={`text-[10px] block font-medium ${isDark ? "opacity-60 text-rose-200" : "text-rose-900"}`}>
              {harvests.filter((h) => h.netReceivable - (h.collectedAmount || 0) > 0.01).length} teslimat açıkta
            </span>
          </div>
        </div>

        {/* İlerleme Çubuğu (Progress Bar) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] opacity-75">
            <span>Tahsilat Gerçekleşme Oranı</span>
            <span className="font-bold">{formatCurrency(totalCollectedAll)} / {formatCurrency(totalNetAll)}</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-black/30 overflow-hidden p-0.5 border border-emerald-900/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-500"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filtre ve Arama Çubuğu */}
      <div
        className={`p-3 rounded-2xl border space-y-2.5 ${
          isDark ? "bg-[#10241c] border-emerald-900/70" : "bg-white border-emerald-200 shadow-xs"
        }`}
      >
        {/* Durum Sekmeleri */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "pending", label: "Bekleyenler (Açık)" },
            { id: "partial", label: "Kısmi Tahsilat" },
            { id: "completed", label: "Tamamı Ödenenler" },
            { id: "all", label: "Tümü" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border text-xs ${
                statusFilter === tab.id
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                  : isDark
                  ? "bg-[#142920] border-emerald-900/60 text-emerald-300/80 hover:bg-[#18362a]"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Fabrika Seçici ve Arama Alanı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Fabrika Dropdown */}
          <div className="relative">
            <select
              value={buyerFilter}
              onChange={(e) => setBuyerFilter(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 border appearance-none text-xs font-semibold cursor-pointer ${
                isDark
                  ? "bg-[#142920] border-emerald-800 text-emerald-200"
                  : "bg-gray-50 border-gray-300 text-gray-800"
              }`}
            >
              <option value="all">Tüm Fabrikalar & Alıcılar ({allBuyers.length})</option>
              {allBuyers.map((buyer) => (
                <option key={buyer} value={buyer}>
                  {buyer}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 opacity-60 pointer-events-none" />
          </div>

          {/* Arama Inputu */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 opacity-50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bahçe adı, fabrika veya not ara..."
              className={`w-full rounded-xl pl-8 pr-3 py-2 border text-xs ${
                isDark
                  ? "bg-[#142920] border-emerald-800 text-emerald-100 placeholder-emerald-500/60"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alacak Listesi Başlık Özeti */}
      <div className={`flex items-center justify-between px-1 text-xs font-semibold ${isDark ? "text-emerald-300/80" : "text-emerald-950"}`}>
        <span>Filtrelenen Kayıt: <strong>{filteredHarvests.length}</strong></span>
        <span>
          Filtre Toplamı:{" "}
          <strong className={isDark ? "text-emerald-400" : "text-emerald-950 font-black"}>
            {formatCurrency(
              filteredHarvests.reduce((acc, h) => acc + (h.netReceivable - (h.collectedAmount || 0)), 0)
            )}
          </strong>
        </span>
      </div>

      {/* Alacak Kartları */}
      <div className="space-y-3">
        {filteredHarvests.length === 0 ? (
          <div
            className={`p-8 rounded-2xl border text-center text-xs space-y-2 ${
              isDark
                ? "bg-[#0b1c15] border-emerald-900/40 text-emerald-300/80"
                : "bg-gray-50 border-gray-200 text-gray-700"
            }`}
          >
            <CheckCircle2 className={`w-8 h-8 mx-auto opacity-80 ${isDark ? "text-emerald-400" : "text-emerald-700"}`} />
            <div className="font-semibold text-sm">Seçilen kriterlere uygun alacak kaydı bulunamadı.</div>
            <p className="opacity-70 text-[11px]">
              Filtreleri değiştirerek bekleyen veya tamamlanmış diğer alacaklarınızı görebilirsiniz.
            </p>
          </div>
        ) : (
          filteredHarvests.map((h) => {
            const pendingAmount = Math.max(0, h.netReceivable - (h.collectedAmount || 0));
            const isCompleted = pendingAmount <= 0.01;
            const isPartial = (h.collectedAmount || 0) > 0.01 && !isCompleted;
            const dueInfo = getDueDateStatus(h.dueDate, pendingAmount);
            const isExpanded = expandedHarvestIds.has(h.id);

            // Bu hasata ait yapılmış parçalı ödemeler
            const relatedPayments = payments.filter((p) => p.harvestId === h.id);

            return (
              <div
                key={h.id}
                className={`p-4 rounded-2xl border transition-all space-y-3.5 ${
                  isDark
                    ? isCompleted
                      ? "bg-[#0b1a13]/80 border-emerald-900/50 text-emerald-200"
                      : "bg-[#10241c] border-emerald-900/90 text-emerald-100 shadow-xs"
                    : isCompleted
                    ? "bg-gray-50 border-gray-200 text-gray-700"
                    : "bg-white border-emerald-200 text-gray-900 shadow-xs"
                }`}
              >
                {/* Üst Kısım: Fabrika, Bahçe, Durum Rozetleri */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-black text-sm sm:text-base ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                        {h.buyerName}
                      </span>
                      {isCompleted ? (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 border ${isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-950 border-emerald-300"}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          Tamamı Tahsil Edildi
                        </span>
                      ) : isPartial ? (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 border ${isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-amber-100 text-amber-950 border-amber-300"}`}>
                          <Clock className="w-3 h-3" />
                          Kısmi Tahsilat
                        </span>
                      ) : (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 border ${isDark ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-rose-100 text-rose-950 border-rose-300"}`}>
                          <AlertCircle className="w-3 h-3" />
                          Açık Bakiye
                        </span>
                      )}
                    </div>

                    <div className="text-xs opacity-80 flex flex-wrap items-center gap-1.5">
                      <span className={`font-bold ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>{h.gardenName}</span>
                      <span>•</span>
                      <span className={isDark ? "text-emerald-100" : "text-emerald-950 font-medium"}>{formatKg(h.quantityKg)} KG</span>
                      <span>•</span>
                      <span className={isDark ? "text-emerald-100" : "text-emerald-950 font-medium"}>@{h.unitPriceGross.toFixed(2)} ₺/KG</span>
                      <span>•</span>
                      <span className={`font-semibold ${isDark ? "opacity-70 text-emerald-200" : "text-gray-700"}`}>{SEASON_NAMES[h.season] || h.season}</span>
                    </div>

                    {h.paymentTerms && (
                      <div className={`flex items-center gap-1.5 text-[11px] font-bold ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                        <CreditCard className={`w-3 h-3 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                        <span>Ödeme Koşulu: {h.paymentTerms}</span>
                      </div>
                    )}

                    {h.receiptNote && (
                      <div className={`text-[11px] italic font-medium ${isDark ? "opacity-70 text-emerald-200" : "text-gray-700"}`}>
                        "{h.receiptNote}"
                      </div>
                    )}
                  </div>

                  {/* Sağ Taraf: Rakamlar */}
                  <div className="text-right shrink-0">
                    <span className={`text-[11px] font-bold block ${isDark ? "opacity-70 text-emerald-200" : "text-gray-700"}`}>
                      {isCompleted ? "Tahsil Edilen Tutar" : "Kalan Bekleyen Alacak"}
                    </span>
                    <span
                      className={`text-base sm:text-lg font-black tracking-tight ${
                        isCompleted
                          ? isDark
                            ? "text-emerald-400"
                            : "text-emerald-950"
                          : isPartial
                          ? isDark
                            ? "text-amber-300"
                            : "text-amber-950"
                          : isDark
                          ? "text-rose-400"
                          : "text-rose-950"
                      }`}
                    >
                      {formatCurrency(isCompleted ? h.netReceivable : pendingAmount)}
                    </span>
                    <span className={`text-[10px] font-bold block ${isDark ? "opacity-60 text-emerald-200" : "text-gray-600"}`}>
                      Toplam Net: {formatCurrency(h.netReceivable)}
                    </span>
                  </div>
                </div>

                {/* Vade Tarihi ve Durumu Rozeti */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-900/40 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`flex items-center gap-1 text-[11px] ${isDark ? "opacity-75 text-emerald-200" : "text-gray-800 font-medium"}`}>
                      <Calendar className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400" : "text-emerald-700"}`} />
                      Hasat: {h.date}
                    </span>

                    {h.dueDate && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${dueInfo.color}`}
                      >
                        <Clock className="w-3 h-3" />
                        {dueInfo.label}
                      </span>
                    )}

                    {h.collectedAmount > 0 && !isCompleted && (
                      <span className={`text-[10px] ${isDark ? "text-emerald-400 opacity-90" : "text-emerald-950 font-bold"}`}>
                        (Tahsil edilen: {formatCurrency(h.collectedAmount)})
                      </span>
                    )}
                  </div>

                  {/* Yönetim Aksiyonları */}
                  <div className="flex items-center gap-2">
                    {/* Parçalı Ödeme Geçmişi Göster/Gizle Butonu */}
                    {relatedPayments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(h.id)}
                        className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          isDark
                            ? "border-emerald-800 text-emerald-300 hover:bg-emerald-900/40"
                            : "border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{relatedPayments.length} Tahsilat</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}

                    {/* Kalan Bakiye Varsa: Tahsilat Butonları */}
                    {!isCompleted && (
                      <>
                        {/* Hızlı Kapat (Tamamını Tahsil Et) */}
                        {onQuickCompleteHarvest && (
                          <button
                            type="button"
                            onClick={() => setQuickCompleteTarget(h)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-emerald-500/40 shadow-xs"
                            title="Tüm Kalan Bakiyeyi Tek Tıkla Kapat"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tamamını Kapat</span>
                          </button>
                        )}

                        {/* Parçalı Tahsilat Gir */}
                        <button
                          type="button"
                          onClick={() => onOpenPaymentModal(h.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Tahsilat Gir</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </>
                    )}

                    {/* Yönetici (Admin) İçin Hasat Kaydını Silme Yetkisi */}
                    {currentRole === "admin" && onDeleteHarvest && (
                      <button
                        type="button"
                        onClick={() => setHarvestToDelete(h)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/30 flex items-center gap-1 text-xs cursor-pointer ml-1"
                        title="Bu Hasat Teslimatını Sil (Yönetici Yetkisi)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Sil</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Açılır Panel: Bu Hasata Ait Yapılmış Parçalı Tahsilatlar */}
                {isExpanded && relatedPayments.length > 0 && (
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-2 mt-2 animate-in fade-in duration-200 ${
                      isDark ? "bg-[#091710] border-emerald-900/80" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="font-bold text-[11px] text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Bu Teslimata Ait Yapılan Tahsilatlar</span>
                    </div>

                    <div className="space-y-1.5">
                      {relatedPayments.map((p) => (
                        <div
                          key={p.id}
                          className={`p-2 rounded-lg border flex items-center justify-between ${
                            isDark ? "bg-[#0d2218] border-emerald-900/60" : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-semibold text-xs">{p.note || "Tahsilat Girişi"}</div>
                            <div className="text-[10px] opacity-70">
                              {p.date} • {p.paymentMethod === "bank" ? "Banka Havale/EFT" : p.paymentMethod === "cash" ? "Nakit Kasa" : "Çek"}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`font-black text-xs ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                              +{formatCurrency(p.amount)}
                            </span>

                            {onDeletePayment && (
                              <button
                                type="button"
                                onClick={() => setPaymentToDelete(p)}
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded cursor-pointer transition-colors"
                                title="Tahsilat Kaydını Sil"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Son Yapılan Tahsilatlar Bölümü (Yönetilebilir) */}
      <div className="pt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? "text-emerald-400" : "text-emerald-950 font-black"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Kayıtlı Tahsilat İşlemleri ({payments.length})</span>
          </h4>
          <span className={`text-[11px] ${isDark ? "opacity-70" : "text-emerald-950 font-bold"}`}>
            Toplam: <strong className={isDark ? "text-emerald-400" : "text-emerald-950 font-black"}>{formatCurrency(payments.reduce((acc, p) => acc + p.amount, 0))}</strong>
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="text-xs opacity-60 italic py-2">Henüz kaydedilmiş tahsilat girişi yok.</div>
        ) : (
          <div className="space-y-1.5">
            {payments.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                  isDark
                    ? "bg-[#0b1c15] border-emerald-900/50 text-emerald-200 hover:border-emerald-800"
                    : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-white"
                }`}
              >
                <div>
                  <div className="font-semibold text-xs">{p.note || "Tahsilat İşlemi"}</div>
                  <div className="text-[10px] opacity-70">
                    {p.date} • {p.paymentMethod === "bank" ? "Banka Havale/EFT" : p.paymentMethod === "cash" ? "Nakit Kasa" : "Çek"}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`font-black text-sm ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                    +{formatCurrency(p.amount)}
                  </div>

                  {onDeletePayment && (
                    <button
                      type="button"
                      onClick={() => setPaymentToDelete(p)}
                      className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors"
                      title="Bu Tahsilatı İptal Et / Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: HIZLI TAMAMINI TAHSİL ET ONAYI
         ========================================================================= */}
      {quickCompleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-2xl border p-4 sm:p-5 shadow-2xl space-y-3.5 ${
              isDark ? "bg-[#0d1e17] border-emerald-700 text-emerald-100" : "bg-white border-emerald-200 text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base">Tamamını Tahsil Et</h3>
                <p className="text-[11px] opacity-75">{quickCompleteTarget.buyerName}</p>
              </div>
            </div>

            <p className="text-xs opacity-90 leading-relaxed">
              <strong>{formatCurrency(quickCompleteTarget.netReceivable - (quickCompleteTarget.collectedAmount || 0))}</strong> tutarındaki kalan açık bakiyenin tamamı tahsil edilmiş olarak kapatılacaktır. Bu işlemi onaylıyor musunuz?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-900/40">
              <button
                type="button"
                onClick={() => setQuickCompleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-600 text-xs font-semibold hover:bg-white/10 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmQuickComplete}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Evet, Tahsil Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TAHSİLAT SİLME ONAYI
         ========================================================================= */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-2xl border p-4 sm:p-5 shadow-2xl space-y-3.5 ${
              isDark ? "bg-[#0d1e17] border-rose-800 text-emerald-100" : "bg-white border-rose-200 text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-rose-400">Tahsilatı İptal Et</h3>
                <p className="text-[11px] opacity-75">{formatCurrency(paymentToDelete.amount)}</p>
              </div>
            </div>

            <p className="text-xs opacity-90 leading-relaxed">
              "{paymentToDelete.note}" açıklamalı <strong>{formatCurrency(paymentToDelete.amount)}</strong> tutarındaki tahsilat kaydı silinecektir. İlgili hasat kaydının kalan bakiyesi bu tutar kadar tekrar artırılacaktır.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-900/40">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-600 text-xs font-semibold hover:bg-white/10 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePayment}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Tahsilatı Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: HASAT TESLİMATI SİLME ONAYI (YÖNETİCİ/ADMİN)
         ========================================================================= */}
      {harvestToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-2xl border p-4 sm:p-5 shadow-2xl space-y-3.5 ${
              isDark ? "bg-[#0d1e17] border-rose-800 text-emerald-100" : "bg-white border-rose-200 text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-rose-400">Hasat Kaydını Sil (Yönetici)</h3>
                <p className="text-[11px] opacity-75">{harvestToDelete.buyerName} - {harvestToDelete.date}</p>
              </div>
            </div>

            <p className="text-xs opacity-90 leading-relaxed">
              <strong>{harvestToDelete.buyerName}</strong> alıcısına ait <strong>{harvestToDelete.quantityKg.toLocaleString("tr-TR")} KG</strong> ({formatCurrency(harvestToDelete.netReceivable)}) tutarındaki hasat teslimat kaydı ve buna bağlı bakiye bilgisi kalıcı olarak silinecektir.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-900/40">
              <button
                type="button"
                onClick={() => setHarvestToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-600 text-xs font-semibold hover:bg-white/10 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteHarvest}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Hasadı Kalıcı Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
