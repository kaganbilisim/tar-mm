import React, { useState, useEffect } from "react";
import {
  HarvestRecord,
  Garden,
  SeasonType,
  FactoryPrice,
  FactoryPaymentOption,
  AppSettings,
} from "../types";
import {
  X,
  Leaf,
  Calendar,
  Building2,
  Check,
  CreditCard,
  Banknote,
  Clock,
  Zap,
  FileText,
  Percent,
  Layers,
  ArrowRightLeft,
} from "lucide-react";

interface EditHarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  harvest: HarvestRecord | null;
  gardens: Garden[];
  factories: FactoryPrice[];
  isDark: boolean;
  settings?: AppSettings;
  onSave: (updatedHarvest: HarvestRecord) => void;
}

export const EditHarvestModal: React.FC<EditHarvestModalProps> = ({
  isOpen,
  onClose,
  harvest,
  gardens,
  factories,
  isDark,
  settings,
  onSave,
}) => {
  const [quantityKg, setQuantityKg] = useState<string>("");
  const [buyerName, setBuyerName] = useState<string>("");
  const [unitPriceGross, setUnitPriceGross] = useState<string>("");
  const [cropType, setCropType] = useState<"tea" | "hazelnut">("tea");
  const [date, setDate] = useState<string>("");
  const [season, setSeason] = useState<SeasonType>("season_1");
  const [gardenId, setGardenId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [receiptNote, setReceiptNote] = useState<string>("");
  const [customDeductionPct, setCustomDeductionPct] = useState<string>("2");
  const [paymentOption, setPaymentOption] = useState<FactoryPaymentOption | undefined>("aylik");
  const [paymentTerms, setPaymentTerms] = useState<string>("");

  useEffect(() => {
    if (harvest) {
      setQuantityKg(String(harvest.quantityKg));
      setBuyerName(harvest.buyerName);
      setUnitPriceGross(String(harvest.unitPriceGross));
      setCropType(harvest.cropType || "tea");
      setDate(harvest.date);
      setSeason(harvest.season || "season_1");
      setGardenId(harvest.gardenId || gardens[0]?.id || "");
      setDueDate(harvest.dueDate || "");
      setReceiptNote(harvest.receiptNote || "");
      const pct = (harvest.deductionRate || 0.02) * 100;
      setCustomDeductionPct(String(pct));
      setPaymentOption(harvest.paymentOption || "aylik");
      setPaymentTerms(harvest.paymentTerms || "");
    }
  }, [harvest, gardens]);

  if (!isOpen || !harvest) return null;

  const numKg = parseFloat(quantityKg) || 0;
  const numPrice = parseFloat(unitPriceGross) || 0;
  const grossAmount = numKg * numPrice;
  const parsedDeductionPct = parseFloat(customDeductionPct) || 0;
  const deductionRate = Math.max(0, parsedDeductionPct / 100);
  const deductionAmount = grossAmount * deductionRate;
  const netReceivable = grossAmount - deductionAmount;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const handleSelectFactory = (factory: FactoryPrice) => {
    setBuyerName(factory.factoryName);
    if (factory.basePrice > 0) {
      setUnitPriceGross(factory.basePrice.toFixed(2));
    }
    if (factory.paymentOption) {
      setPaymentOption(factory.paymentOption);
      setPaymentTerms(factory.paymentValues?.[factory.paymentOption] || factory.paymentTerms || "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numKg <= 0 || !buyerName.trim() || numPrice <= 0) {
      alert("Lütfen miktar, alıcı firma ve birim fiyatı eksiksiz girin.");
      return;
    }

    const selectedGarden = gardens.find((g) => g.id === gardenId);
    const parsedYear = date ? parseInt(date.split("-")[0], 10) : (harvest.year || 2026);

    // Otomatik durum güncellemesi
    const prevCollected = harvest.collectedAmount || 0;
    const isCompleted = prevCollected >= netReceivable - 0.5;

    const updated: HarvestRecord = {
      ...harvest,
      date,
      year: isNaN(parsedYear) ? 2026 : parsedYear,
      season,
      gardenId,
      gardenName: selectedGarden ? selectedGarden.name : harvest.gardenName || "Genel Bahçe",
      quantityKg: numKg,
      buyerName: buyerName.trim(),
      unitPriceGross: numPrice,
      grossAmount,
      deductionRate,
      deductionAmount,
      netReceivable,
      dueDate: dueDate || undefined,
      receiptNote: receiptNote.trim() || undefined,
      cropType,
      paymentOption,
      paymentTerms: paymentTerms.trim() || undefined,
      status: isCompleted ? "completed" : prevCollected > 0 ? "partial" : "pending",
    };

    onSave(updated);
    onClose();
  };

  return (
    <div
      id="edit-harvest-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div
        id="edit-harvest-modal-card"
        className={`w-full max-w-xl rounded-2xl shadow-2xl border my-6 transition-all overflow-hidden ${
          isDark
            ? "bg-[#0f2119] border-emerald-800 text-emerald-50"
            : "bg-white border-emerald-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark ? "bg-[#0b1a13] border-emerald-800/60" : "bg-emerald-50/70 border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base">Hasat Kaydını Düzenle</h3>
              <p className="text-[11px] opacity-75">
                Teslimat miktarını, sezonunu ve fabrika şartlarını güncelleyin
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Sezon Aktarma / Değiştirme Butonları */}
          <div>
            <label className="block text-xs font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Bağlı Olduğu Sezon (Aktarma Yapın)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(
                [
                  { key: "season_1", title: "1. Sezon", desc: "1. Sürüm (Mayıs)" },
                  { key: "season_2", title: "2. Sezon", desc: "2. Sürüm (Temmuz)" },
                  { key: "season_3", title: "3. Sezon", desc: "3. Sürüm (Güz)" },
                  { key: "season_4", title: "4. Sezon", desc: "4. Sürüm & Fındık" },
                ] as const
              ).map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSeason(s.key)}
                  className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                    season === s.key
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : isDark
                      ? "bg-[#11271e] text-emerald-200/80 border-emerald-900 hover:bg-[#153227]"
                      : "bg-emerald-50/50 text-gray-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{s.title}</span>
                    {season === s.key && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-[9px] opacity-75 font-normal truncate">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mahsul Türü */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCropType("tea")}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                cropType === "tea"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                  : isDark
                  ? "bg-[#11271e] border-emerald-900 opacity-60"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Yaş Çay Hasadı</span>
            </button>
            <button
              type="button"
              onClick={() => setCropType("hazelnut")}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                cropType === "hazelnut"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500"
                  : isDark
                  ? "bg-[#11271e] border-emerald-900 opacity-60"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Fındık Hasadı</span>
            </button>
          </div>

          {/* Tarih & Bahçe Seçimi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">
                Teslimat Tarihi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-hidden ${
                  isDark
                    ? "bg-[#142920] border-emerald-800 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">
                Kaynak Bahçe
              </label>
              <select
                value={gardenId}
                onChange={(e) => setGardenId(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-hidden ${
                  isDark
                    ? "bg-[#142920] border-emerald-800 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                {gardens.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.sizeDecares} Dönüm)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Miktar (KG) & Birim Fiyat (TL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">
                Net Miktar (KG)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  required
                  placeholder="ör. 1250"
                  className={`w-full p-2.5 pr-12 rounded-xl border text-xs font-bold outline-hidden ${
                    isDark
                      ? "bg-[#142920] border-emerald-800 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold opacity-60">KG</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">
                Birim Fiyat (TL/KG)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={unitPriceGross}
                  onChange={(e) => setUnitPriceGross(e.target.value)}
                  required
                  placeholder="ör. 35.50"
                  className={`w-full p-2.5 pr-12 rounded-xl border text-xs font-bold outline-hidden ${
                    isDark
                      ? "bg-[#142920] border-emerald-800 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold opacity-60">TL</span>
              </div>
            </div>
          </div>

          {/* Alıcı Fabrika / Firma */}
          <div>
            <label className="block text-xs font-semibold mb-1 opacity-80">
              Alıcı Fabrika / Firma
            </label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
              placeholder="ör. ÇAYKUR, Doğuş, Ofçay..."
              className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-hidden ${
                isDark
                  ? "bg-[#142920] border-emerald-800 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            {/* Hızlı Fabrika Seçim Önerileri */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {factories
                .filter((f) => f.crop === cropType)
                .slice(0, 4)
                .map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFactory(f)}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                      buyerName === f.factoryName
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                        : isDark
                        ? "bg-[#10241c] border-emerald-800/60 text-emerald-200/70 hover:text-white"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {f.factoryName}
                  </button>
                ))}
            </div>
          </div>

          {/* Kesinti Oranı & Vade Tarihi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">
                Borsa & Stopaj Kesintisi (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={customDeductionPct}
                  onChange={(e) => setCustomDeductionPct(e.target.value)}
                  className={`w-full p-2.5 pr-10 rounded-xl border text-xs font-bold outline-hidden ${
                    isDark
                      ? "bg-[#142920] border-emerald-800 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                <Percent className="w-3.5 h-3.5 absolute right-3 top-3 opacity-60" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">
                Tahmini Vade / Ödeme Tarihi
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-hidden ${
                  isDark
                    ? "bg-[#142920] border-emerald-800 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>

          {/* Fiş / Kantar Notu */}
          <div>
            <label className="block text-xs font-semibold mb-1 opacity-80">
              Kantar / Fiş Notu
            </label>
            <input
              type="text"
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
              placeholder="Fiş no, kantar tartı fişi notu veya randıman..."
              className={`w-full p-2.5 rounded-xl border text-xs font-medium outline-hidden ${
                isDark
                  ? "bg-[#142920] border-emerald-800 text-white placeholder-emerald-700"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          {/* Finansal Canlı Hesap Özeti */}
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              isDark ? "bg-[#0b1b14] border-emerald-900/80" : "bg-emerald-50/60 border-emerald-200"
            }`}
          >
            <div className="flex justify-between">
              <span className="opacity-70">Brüt Tutar:</span>
              <span className="font-bold">{formatCurrency(grossAmount)}</span>
            </div>
            <div className="flex justify-between text-red-400">
              <span>Kesinti (%{parsedDeductionPct}):</span>
              <span className="font-bold">-{formatCurrency(deductionAmount)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-emerald-900/40 text-emerald-400 font-extrabold text-sm">
              <span>Net Alacak:</span>
              <span>{formatCurrency(netReceivable)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? "bg-transparent border-emerald-800 text-emerald-300 hover:bg-emerald-900/40"
                  : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
