import React, { useState, useMemo } from "react";
import { HarvestRecord, ExpenseRecord, PaymentRecord, Garden, FactoryPrice, SeasonType } from "../types";
import {
  BarChart3,
  Calendar,
  Building2,
  Trees,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Scale,
  Percent,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpDown,
  FileText,
  Layers,
  ChevronDown,
} from "lucide-react";

interface HarvestReportsViewProps {
  harvests: HarvestRecord[];
  expenses: ExpenseRecord[];
  payments?: PaymentRecord[];
  gardens: Garden[];
  factories: FactoryPrice[];
  isDark: boolean;
}

const SEASON_META: Record<SeasonType, { title: string; subtitle: string; period: string }> = {
  season_1: { title: "1. Sezon", subtitle: "1. Sürüm (Mayıs Hasadı)", period: "Mayıs - Haziran" },
  season_2: { title: "2. Sezon", subtitle: "2. Sürüm (Temmuz Hasadı)", period: "Temmuz" },
  season_3: { title: "3. Sezon", subtitle: "3. Sürüm (Güz Hasadı)", period: "Ağustos - Eylül" },
  season_4: { title: "4. Sezon", subtitle: "4. Sürüm & Fındık", period: "Ekim - Kasım" },
};

export const HarvestReportsView: React.FC<HarvestReportsViewProps> = ({
  harvests,
  expenses,
  payments = [],
  gardens,
  factories,
  isDark,
}) => {
  // Filtreler
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("all");
  const [selectedGarden, setSelectedGarden] = useState<string>("all");
  const [reportTab, setReportTab] = useState<"overview" | "factories" | "seasons" | "gardens" | "records">("overview");

  // Formatlayıcılar
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formatKg = (val: number) => {
    return new Intl.NumberFormat("tr-TR").format(Math.round(val));
  };

  // Dinamik Yıllar ve Alıcılar
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    harvests.forEach((h) => {
      const yr = h.year?.toString() || h.date.split("-")[0];
      if (yr) years.add(yr);
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [harvests]);

  const availableBuyers = useMemo(() => {
    const buyers = new Set<string>();
    harvests.forEach((h) => {
      if (h.buyerName) buyers.add(h.buyerName);
    });
    return Array.from(buyers).sort();
  }, [harvests]);

  // Filtrelenmiş Hasat Kayıtları
  const filteredHarvests = useMemo(() => {
    return harvests.filter((h) => {
      const hYear = h.year?.toString() || h.date.split("-")[0];
      if (selectedYear !== "all" && hYear !== selectedYear) return false;
      if (selectedSeason !== "all" && h.season !== selectedSeason) return false;
      if (selectedBuyer !== "all" && h.buyerName !== selectedBuyer) return false;
      if (selectedGarden !== "all" && h.gardenId !== selectedGarden && h.gardenName !== selectedGarden) return false;
      return true;
    });
  }, [harvests, selectedYear, selectedSeason, selectedBuyer, selectedGarden]);

  // Filtrelenmiş Masraflar
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const eYear = e.date.split("-")[0];
      if (selectedYear !== "all" && eYear !== selectedYear) return false;
      if (selectedGarden !== "all" && e.gardenId !== selectedGarden) return false;
      return true;
    });
  }, [expenses, selectedYear, selectedGarden]);

  // Finansal KPI Hesaplamaları
  const totalKg = filteredHarvests.reduce((acc, h) => acc + h.quantityKg, 0);
  const totalGross = filteredHarvests.reduce((acc, h) => acc + h.grossAmount, 0);
  const totalDeductions = filteredHarvests.reduce((acc, h) => acc + h.deductionAmount, 0);
  const totalNetRevenue = filteredHarvests.reduce((acc, h) => acc + h.netReceivable, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalNetRevenue - totalExpenses;
  const avgUnitPrice = totalKg > 0 ? totalGross / totalKg : 0;
  const profitMargin = totalNetRevenue > 0 ? Math.round((netProfit / totalNetRevenue) * 100) : 0;

  // Tahsilat & Bekleyen Alacak
  const totalCollected = filteredHarvests.reduce((acc, h) => acc + (h.collectedAmount || 0), 0);
  const totalPendingReceivable = Math.max(0, totalNetRevenue - totalCollected);

  // Fabrikalara Göre Gruplama ve Karşılaştırma
  const factoryBreakdown = useMemo(() => {
    const map: Record<
      string,
      {
        buyerName: string;
        deliveryCount: number;
        totalKg: number;
        totalGross: number;
        totalNet: number;
        totalCollected: number;
        totalPending: number;
        avgPrice: number;
        marketShare: number;
      }
    > = {};

    filteredHarvests.forEach((h) => {
      const bName = h.buyerName || "Diğer Fabrika";
      if (!map[bName]) {
        map[bName] = {
          buyerName: bName,
          deliveryCount: 0,
          totalKg: 0,
          totalGross: 0,
          totalNet: 0,
          totalCollected: 0,
          totalPending: 0,
          avgPrice: 0,
          marketShare: 0,
        };
      }
      map[bName].deliveryCount += 1;
      map[bName].totalKg += h.quantityKg;
      map[bName].totalGross += h.grossAmount;
      map[bName].totalNet += h.netReceivable;
      map[bName].totalCollected += h.collectedAmount || 0;
      map[bName].totalPending += Math.max(0, h.netReceivable - (h.collectedAmount || 0));
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        avgPrice: item.totalKg > 0 ? item.totalGross / item.totalKg : 0,
        marketShare: totalKg > 0 ? Math.round((item.totalKg / totalKg) * 100) : 0,
      }))
      .sort((a, b) => b.totalKg - a.totalKg);
  }, [filteredHarvests, totalKg]);

  // Sezonlara Göre Dağılım
  const seasonBreakdown = useMemo(() => {
    const seasons: SeasonType[] = ["season_1", "season_2", "season_3", "season_4"];
    return seasons.map((sKey) => {
      const seasonHarvests = filteredHarvests.filter((h) => h.season === sKey);
      const sKg = seasonHarvests.reduce((acc, h) => acc + h.quantityKg, 0);
      const sGross = seasonHarvests.reduce((acc, h) => acc + h.grossAmount, 0);
      const sNet = seasonHarvests.reduce((acc, h) => acc + h.netReceivable, 0);
      const sCollected = seasonHarvests.reduce((acc, h) => acc + (h.collectedAmount || 0), 0);
      const sPending = Math.max(0, sNet - sCollected);
      const sAvgPrice = sKg > 0 ? sGross / sKg : 0;
      return {
        key: sKey,
        meta: SEASON_META[sKey],
        count: seasonHarvests.length,
        totalKg: sKg,
        totalGross: sGross,
        totalNet: sNet,
        totalCollected: sCollected,
        totalPending: sPending,
        avgPrice: sAvgPrice,
        percentage: totalKg > 0 ? Math.round((sKg / totalKg) * 100) : 0,
      };
    });
  }, [filteredHarvests, totalKg]);

  // Bahçelere Göre Dağılım ve Verimlilik
  const gardenBreakdown = useMemo(() => {
    return gardens.map((g) => {
      const gHarvests = filteredHarvests.filter((h) => h.gardenId === g.id || h.gardenName === g.name);
      const gExpenses = filteredExpenses.filter((e) => e.gardenId === g.id);

      const gKg = gHarvests.reduce((acc, h) => acc + h.quantityKg, 0);
      const gNetRev = gHarvests.reduce((acc, h) => acc + h.netReceivable, 0);
      const gExp = gExpenses.reduce((acc, e) => acc + e.amount, 0);
      const gProfit = gNetRev - gExp;
      const yieldPerDecare = g.sizeDecares > 0 ? gKg / g.sizeDecares : 0;

      return {
        garden: g,
        deliveryCount: gHarvests.length,
        expenseCount: gExpenses.length,
        totalKg: gKg,
        yieldPerDecare: Math.round(yieldPerDecare),
        netRevenue: gNetRev,
        totalExpenses: gExp,
        netProfit: gProfit,
      };
    });
  }, [gardens, filteredHarvests, filteredExpenses]);

  // CSV Dışa Aktarma
  const exportToCSV = () => {
    const headers = [
      "Tarih",
      "Yıl",
      "Sezon",
      "Fabrika / Alıcı",
      "Bahçe",
      "Miktar (KG)",
      "Birim Fiyat (TL)",
      "Brüt Tutar (TL)",
      "Kesinti (TL)",
      "Net Alacak (TL)",
      "Tahsil Edilen (TL)",
      "Kalan Bakiye (TL)",
      "Vade Tarihi",
      "Durum",
      "Not",
    ];

    const rows = filteredHarvests.map((h) => {
      const remaining = Math.max(0, h.netReceivable - (h.collectedAmount || 0));
      return [
        h.date,
        h.year || h.date.split("-")[0],
        SEASON_META[h.season]?.title || h.season,
        `"${h.buyerName.replace(/"/g, '""')}"`,
        `"${h.gardenName.replace(/"/g, '""')}"`,
        h.quantityKg,
        h.unitPriceGross,
        h.grossAmount,
        h.deductionAmount,
        h.netReceivable,
        h.collectedAmount || 0,
        remaining,
        h.dueDate || "",
        h.status === "completed" ? "Tahsil Edildi" : "Açık Bakiye",
        `"${(h.receiptNote || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Hasat_ve_Finans_Raporu_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Yazdırma (Print)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="harvest-reports-container" className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Header & Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-extrabold text-base md:text-lg ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
              Hasat ve Finans Raporlama Merkezi
            </h3>
            <p className={`text-xs ${isDark ? "opacity-75" : "text-emerald-950 font-semibold"}`}>
              Yıllara, Sezonlara ve Fabrikalara göre gelişmiş analiz ve kârlılık dökümü
            </p>
          </div>
        </div>

        {/* Dışa Aktar & Yazdır Butonları */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={exportToCSV}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? "border-emerald-700 bg-emerald-800/40 hover:bg-emerald-700/60 text-emerald-200"
                : "border-emerald-300 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black shadow-2xs"
            }`}
            title="Tüm verileri CSV/Excel tablosu olarak indir"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? "border-gray-600 bg-gray-800/40 hover:bg-gray-700/60 text-gray-200"
                : "border-gray-300 bg-white hover:bg-gray-100 text-gray-900 shadow-2xs"
            }`}
            title="Yazdır / PDF Kaydet"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Yazdır</span>
          </button>
        </div>
      </div>

      {/* Gelişmiş Filtre Çubuğu (Yıllar, Sezonlar, Fabrikalar, Bahçeler) */}
      <div
        className={`p-3.5 rounded-2xl border space-y-2.5 ${
          isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-white border-emerald-200 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-bold text-teal-400">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Gelişmiş Rapor Filtreleri
          </span>
          {(selectedYear !== "all" || selectedSeason !== "all" || selectedBuyer !== "all" || selectedGarden !== "all") && (
            <button
              onClick={() => {
                setSelectedYear("all");
                setSelectedSeason("all");
                setSelectedBuyer("all");
                setSelectedGarden("all");
              }}
              className="text-[11px] text-red-400 hover:underline cursor-pointer"
            >
              Filtreleri Sıfırla
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Yıl Filtresi */}
          <div className="space-y-1">
            <label className="block text-[10px] opacity-70 font-semibold">Hasat Yılı</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={`w-full rounded-xl px-2.5 py-1.5 border text-xs font-semibold cursor-pointer ${
                isDark ? "bg-[#142920] border-emerald-800 text-emerald-200" : "bg-gray-50 border-gray-300"
              }`}
            >
              <option value="all">Tüm Yıllar</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr} Yılı
                </option>
              ))}
            </select>
          </div>

          {/* Sezon Filtresi */}
          <div className="space-y-1">
            <label className="block text-[10px] opacity-70 font-semibold">Hasat Sezonu</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className={`w-full rounded-xl px-2.5 py-1.5 border text-xs font-semibold cursor-pointer ${
                isDark ? "bg-[#142920] border-emerald-800 text-emerald-200" : "bg-gray-50 border-gray-300"
              }`}
            >
              <option value="all">Tüm Sezonlar (1-4)</option>
              <option value="season_1">1. Sezon (Mayıs)</option>
              <option value="season_2">2. Sezon (Temmuz)</option>
              <option value="season_3">3. Sezon (Güz)</option>
              <option value="season_4">4. Sezon & Fındık</option>
            </select>
          </div>

          {/* Fabrika Filtresi */}
          <div className="space-y-1">
            <label className="block text-[10px] opacity-70 font-semibold">Fabrika / Alıcı</label>
            <select
              value={selectedBuyer}
              onChange={(e) => setSelectedBuyer(e.target.value)}
              className={`w-full rounded-xl px-2.5 py-1.5 border text-xs font-semibold cursor-pointer ${
                isDark ? "bg-[#142920] border-emerald-800 text-emerald-200" : "bg-gray-50 border-gray-300"
              }`}
            >
              <option value="all">Tüm Fabrikalar ({availableBuyers.length})</option>
              {availableBuyers.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Bahçe Filtresi */}
          <div className="space-y-1">
            <label className="block text-[10px] opacity-70 font-semibold">Kayıtlı Bahçe</label>
            <select
              value={selectedGarden}
              onChange={(e) => setSelectedGarden(e.target.value)}
              className={`w-full rounded-xl px-2.5 py-1.5 border text-xs font-semibold cursor-pointer ${
                isDark ? "bg-[#142920] border-emerald-800 text-emerald-200" : "bg-gray-50 border-gray-300"
              }`}
            >
              <option value="all">Tüm Bahçeler ({gardens.length})</option>
              {gardens.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Büyük Finansal ve Üretim KPI Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Toplam Hasat KG */}
        <div
          className={`p-3.5 rounded-2xl border space-y-1 ${
            isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-white border-emerald-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold ${isDark ? "opacity-75" : "text-emerald-950 font-bold"}`}>Toplam Teslimat</span>
            <Scale className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400 opacity-80" : "text-emerald-800"}`} />
          </div>
          <div className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
            {formatKg(totalKg)} <span className="text-xs font-normal">KG</span>
          </div>
          <div className={`text-[10px] ${isDark ? "opacity-60" : "text-emerald-900 font-semibold"}`}>
            Ort. Fiyat: <strong>{avgUnitPrice.toFixed(2)} ₺/KG</strong>
          </div>
        </div>

        {/* Net Gelir */}
        <div
          className={`p-3.5 rounded-2xl border space-y-1 ${
            isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-white border-emerald-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold ${isDark ? "opacity-75" : "text-emerald-950 font-bold"}`}>Net Gelir</span>
            <DollarSign className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400 opacity-80" : "text-emerald-800"}`} />
          </div>
          <div className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
            {formatCurrency(totalNetRevenue)}
          </div>
          <div className={`text-[10px] ${isDark ? "opacity-60" : "text-emerald-900 font-semibold"}`}>
            Brüt: {formatCurrency(totalGross)} (Kesinti: -{formatCurrency(totalDeductions)})
          </div>
        </div>

        {/* Toplam Masraflar */}
        <div
          className={`p-3.5 rounded-2xl border space-y-1 ${
            isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-white border-emerald-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold ${isDark ? "opacity-75" : "text-emerald-950 font-bold"}`}>Toplam Masraf</span>
            <TrendingDown className={`w-3.5 h-3.5 opacity-80 ${isDark ? "text-red-400" : "text-red-700"}`} />
          </div>
          <div className={`text-lg sm:text-xl font-extrabold ${isDark ? "text-red-400" : "text-red-700 font-black"}`}>
            {formatCurrency(totalExpenses)}
          </div>
          <div className={`text-[10px] ${isDark ? "opacity-60" : "text-emerald-900 font-semibold"}`}>
            {filteredExpenses.length} kalem bahçe gideri
          </div>
        </div>

        {/* Net Kâr / Kazanç */}
        <div
          className={`p-3.5 rounded-2xl border space-y-1 ${
            isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-white border-emerald-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold ${isDark ? "opacity-75" : "text-emerald-950 font-bold"}`}>Net Kâr / Kazanç</span>
            <TrendingUp className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400 opacity-80" : "text-emerald-800"}`} />
          </div>
          <div
            className={`text-lg sm:text-xl font-extrabold ${
              netProfit >= 0 ? (isDark ? "text-emerald-400" : "text-emerald-950 font-black") : (isDark ? "text-red-400" : "text-red-700 font-black")
            }`}
          >
            {formatCurrency(netProfit)}
          </div>
          <div className={`text-[10px] flex items-center gap-1 font-bold ${isDark ? "opacity-75 text-emerald-300" : "text-emerald-950"}`}>
            <span>Kâr Marjı: %{profitMargin}</span>
          </div>
        </div>
      </div>

      {/* Tahsilat Durumu Çubuğu */}
      <div
        className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isDark ? "bg-[#0b1c15] border-emerald-900/60" : "bg-emerald-50 border-emerald-300 text-emerald-950"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-teal-500/20 text-teal-400" : "bg-teal-100 text-teal-950"}`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className={`font-bold block ${isDark ? "" : "text-emerald-950 font-black"}`}>Filtrelenen Tahsilat Durumu</span>
            <span className={`text-[11px] ${isDark ? "opacity-70" : "text-emerald-900 font-semibold"}`}>
              Tahsil Edilen: <strong className={isDark ? "text-emerald-400" : "text-emerald-950 font-black"}>{formatCurrency(totalCollected)}</strong> • Bekleyen Açık Alacak:{" "}
              <strong className={isDark ? "text-rose-400" : "text-rose-800 font-black"}>{formatCurrency(totalPendingReceivable)}</strong>
            </span>
          </div>
        </div>

        <div className="w-full sm:w-48 space-y-1">
          <div className="flex justify-between text-[10px] opacity-75 font-semibold">
            <span>Tahsilat Oranı</span>
            <span>{totalNetRevenue > 0 ? Math.round((totalCollected / totalNetRevenue) * 100) : 0}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{
                width: `${totalNetRevenue > 0 ? Math.min(100, (totalCollected / totalNetRevenue) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Rapor Detay Sekmeleri */}
      <div className="flex items-center gap-1.5 border-b border-emerald-900/40 pb-1 text-xs overflow-x-auto">
        {[
          { id: "overview", label: "Genel Özet" },
          { id: "factories", label: `Fabrikalara Göre (${factoryBreakdown.length})` },
          { id: "seasons", label: "Sezonlara Göre (1-4)" },
          { id: "gardens", label: `Bahçelere Göre (${gardens.length})` },
          { id: "records", label: `Kayıt Dökümü (${filteredHarvests.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setReportTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
              reportTab === tab.id
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs"
                : isDark
                ? "bg-[#10241c] border-emerald-900/60 text-emerald-300/70 hover:bg-[#153125]"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================================
          SEKME 1: GENEL ÖZET & FABRİKA KARŞILAŞTIRMA ÖZETİ
         ========================================================================= */}
      {(reportTab === "overview" || reportTab === "factories") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Fabrikalara Göre Teslimat & Alacak Dağılımı</span>
            </h4>
            <span className="text-[11px] opacity-75">{factoryBreakdown.length} Farklı Alıcı</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {factoryBreakdown.map((f) => (
              <div
                key={f.buyerName}
                className={`p-4 rounded-2xl border space-y-3 transition-all ${
                  isDark ? "bg-[#10241c] border-emerald-900/80 text-emerald-100" : "bg-white border-emerald-300 text-gray-950 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className={`font-black text-sm ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>{f.buyerName}</h5>
                    <div className={`text-[11px] ${isDark ? "opacity-70" : "text-emerald-900 font-semibold"}`}>
                      {f.deliveryCount} Teslimat • Ort. {f.avgPrice.toFixed(2)} ₺/KG
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-black block ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                      {formatKg(f.totalKg)} KG
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-950 border-emerald-300"}`}>
                      Payı: %{f.marketShare}
                    </span>
                  </div>
                </div>

                {/* Progress bar for market share */}
                <div className="w-full h-1.5 rounded-full bg-black/30 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${f.marketShare}%` }} />
                </div>

                {/* Finansal Bakiye Dağılımı */}
                <div className={`grid grid-cols-3 gap-2 pt-2 border-t text-[11px] ${isDark ? "border-emerald-900/40" : "border-emerald-200"}`}>
                  <div>
                    <span className={`block text-[10px] ${isDark ? "opacity-60" : "text-gray-700 font-bold"}`}>Net Alacak</span>
                    <span className={`font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>{formatCurrency(f.totalNet)}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] ${isDark ? "opacity-60" : "text-gray-700 font-bold"}`}>Tahsil Edilen</span>
                    <span className={`font-black ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>{formatCurrency(f.totalCollected)}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] ${isDark ? "opacity-60" : "text-gray-700 font-bold"}`}>Açık Bakiye</span>
                    <span className={`font-black ${f.totalPending > 0 ? (isDark ? "text-rose-400" : "text-rose-800") : (isDark ? "text-emerald-400" : "text-emerald-950")}`}>
                      {formatCurrency(f.totalPending)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SEKME 2: SEZONLARA GÖRE DAĞILIM (1, 2, 3, 4. SEZON)
         ========================================================================= */}
      {(reportTab === "overview" || reportTab === "seasons") && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className={`font-black text-xs uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-amber-400" : "text-amber-950"}`}>
              <Calendar className="w-4 h-4" />
              <span>Sezonlara Göre Hasat & Finansal Performans</span>
            </h4>
            <span className={`text-[11px] ${isDark ? "opacity-75" : "text-emerald-950 font-bold"}`}>1., 2., 3. ve 4. Sürüm</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {seasonBreakdown.map((s) => (
              <div
                key={s.key}
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? "bg-[#10241c] border-emerald-900/80 text-emerald-100" : "bg-white border-emerald-300 text-gray-950 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-950 border border-amber-300"}`}>
                      {s.key.replace("season_", "")}
                    </div>
                    <div>
                      <h5 className={`font-black text-xs sm:text-sm ${isDark ? "text-amber-300" : "text-amber-950"}`}>{s.meta.title}</h5>
                      <span className={`text-[10px] ${isDark ? "opacity-70" : "text-gray-700 font-medium"}`}>{s.meta.subtitle} • {s.meta.period}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-sm font-black block ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>{formatKg(s.totalKg)} KG</span>
                    <span className={`text-[10px] ${isDark ? "opacity-70" : "text-emerald-900 font-bold"}`}>Payı: %{s.percentage}</span>
                  </div>
                </div>

                <div className={`grid grid-cols-3 gap-1.5 pt-2 border-t text-[11px] ${isDark ? "border-emerald-900/40" : "border-emerald-200"}`}>
                  <div>
                    <span className={`block text-[10px] ${isDark ? "opacity-60" : "text-gray-700 font-bold"}`}>Kayıt</span>
                    <span className="font-bold">{s.count} Teslimat</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] ${isDark ? "opacity-60" : "text-gray-700 font-bold"}`}>Net Gelir</span>
                    <span className={`font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>{formatCurrency(s.totalNet)}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] ${isDark ? "opacity-60" : "text-gray-700 font-bold"}`}>Ort. Fiyat</span>
                    <span className={`font-black ${isDark ? "text-amber-400" : "text-amber-950"}`}>{s.avgPrice.toFixed(2)} ₺</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SEKME 3: BAHÇELERE GÖRE VERİM & KÂRLILIK
         ========================================================================= */}
      {(reportTab === "overview" || reportTab === "gardens") && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className={`font-black text-xs uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-teal-400" : "text-teal-950"}`}>
              <Trees className="w-4 h-4" />
              <span>Bahçelere Göre Verim & Kârlılık Analizi</span>
            </h4>
            <span className={`text-[11px] ${isDark ? "opacity-75" : "text-emerald-950 font-bold"}`}>{gardens.length} Kayıtlı Bahçe</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {gardenBreakdown.map((item) => (
              <div
                key={item.garden.id}
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  isDark ? "bg-[#10241c] border-emerald-900/80 text-emerald-100" : "bg-white border-emerald-300 text-gray-950 shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h5 className={`font-black text-xs ${isDark ? "text-teal-300" : "text-teal-950"}`}>{item.garden.name}</h5>
                    <span className={`text-[10px] font-bold ${isDark ? "opacity-70" : "text-gray-800"}`}>{item.garden.sizeDecares} Dönüm</span>
                  </div>
                  <span className={`text-[10px] block ${isDark ? "opacity-60" : "text-gray-600 font-medium"}`}>{item.garden.location}</span>
                </div>

                <div className={`space-y-1 text-xs pt-1 border-t ${isDark ? "border-emerald-900/40" : "border-emerald-200"}`}>
                  <div className="flex justify-between">
                    <span className={`text-[11px] ${isDark ? "opacity-70" : "text-gray-700 font-medium"}`}>Toplam Hasat:</span>
                    <strong className={isDark ? "text-emerald-300" : "text-emerald-950 font-black"}>{formatKg(item.totalKg)} KG</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-[11px] ${isDark ? "opacity-70" : "text-gray-700 font-medium"}`}>Dönüm Başı Verim:</span>
                    <strong className={isDark ? "text-teal-400" : "text-teal-950 font-black"}>{formatKg(item.yieldPerDecare)} KG/Dönüm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-[11px] ${isDark ? "opacity-70" : "text-gray-700 font-medium"}`}>Hasat Geliri:</span>
                    <strong className={isDark ? "text-emerald-400" : "text-emerald-950 font-black"}>{formatCurrency(item.netRevenue)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-[11px] ${isDark ? "opacity-70" : "text-gray-700 font-medium"}`}>Yapılan Masraf:</span>
                    <strong className={isDark ? "text-red-400" : "text-red-700 font-black"}>-{formatCurrency(item.totalExpenses)}</strong>
                  </div>
                  <div className={`flex justify-between pt-1 border-t ${isDark ? "border-emerald-900/30" : "border-emerald-200"}`}>
                    <span className="font-bold text-[11px]">Net Bahçe Kârı:</span>
                    <strong className={`font-black ${item.netProfit >= 0 ? (isDark ? "text-emerald-400" : "text-emerald-950 font-black") : (isDark ? "text-red-400" : "text-red-700 font-black")}`}>
                      {formatCurrency(item.netProfit)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SEKME 4: DETAYLI KAYIT DÖKÜMÜ TABLOSU
         ========================================================================= */}
      {reportTab === "records" && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className={`font-black text-xs uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
              <FileText className="w-4 h-4" />
              <span>Filtrelenen Teslimat Kayıtları Dökümü ({filteredHarvests.length})</span>
            </h4>
          </div>

          <div
            className={`rounded-2xl border overflow-x-auto ${
              isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-white border-emerald-300"
            }`}
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[10px] uppercase tracking-wider ${isDark ? "border-emerald-900/80 text-emerald-400 bg-[#0b1b14]" : "border-emerald-200 text-emerald-950 font-black bg-emerald-50/80"}`}>
                  <th className="p-2.5">Tarih</th>
                  <th className="p-2.5">Sezon</th>
                  <th className="p-2.5">Fabrika</th>
                  <th className="p-2.5">Bahçe</th>
                  <th className="p-2.5 text-right">Miktar (KG)</th>
                  <th className="p-2.5 text-right">Birim Fiyat</th>
                  <th className="p-2.5 text-right">Net Tutar</th>
                  <th className="p-2.5 text-right">Kalan Bakiye</th>
                  <th className="p-2.5 text-center">Durum</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-emerald-900/30" : "divide-emerald-100"}`}>
                {filteredHarvests.map((h) => {
                  const rem = Math.max(0, h.netReceivable - (h.collectedAmount || 0));
                  return (
                    <tr key={h.id} className={`transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-emerald-50/50 text-gray-950"}`}>
                      <td className="p-2.5 whitespace-nowrap font-medium">{h.date}</td>
                      <td className="p-2.5 whitespace-nowrap font-medium">{SEASON_META[h.season]?.title || h.season}</td>
                      <td className={`p-2.5 font-black whitespace-nowrap ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>{h.buyerName}</td>
                      <td className={`p-2.5 whitespace-nowrap ${isDark ? "opacity-80" : "text-gray-700 font-medium"}`}>{h.gardenName}</td>
                      <td className="p-2.5 text-right font-black whitespace-nowrap">{formatKg(h.quantityKg)} KG</td>
                      <td className="p-2.5 text-right whitespace-nowrap font-medium">{h.unitPriceGross.toFixed(2)} ₺</td>
                      <td className={`p-2.5 text-right font-black whitespace-nowrap ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>{formatCurrency(h.netReceivable)}</td>
                      <td className={`p-2.5 text-right font-black whitespace-nowrap ${rem > 0 ? (isDark ? "text-rose-400" : "text-rose-800") : (isDark ? "text-emerald-400" : "text-emerald-950")}`}>
                        {formatCurrency(rem)}
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${
                            rem <= 0.01
                              ? (isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-950 border-emerald-300")
                              : (isDark ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-rose-100 text-rose-800 border-rose-300")
                          }`}
                        >
                          {rem <= 0.01 ? "Tahsil Edildi" : "Açık Bakiye"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
