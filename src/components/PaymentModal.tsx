import React, { useState } from "react";
import { HarvestRecord, PaymentRecord } from "../types";
import { X, CreditCard, CheckCircle2, Calendar, DollarSign, FileText } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  harvests: HarvestRecord[];
  payments: PaymentRecord[];
  onSavePayment: (payment: Omit<PaymentRecord, "id">) => void;
  selectedHarvestId?: string;
  isDark: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  harvests,
  payments,
  onSavePayment,
  selectedHarvestId,
  isDark,
}) => {
  const [chosenHarvestId, setChosenHarvestId] = useState<string>(selectedHarvestId || "");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("Ziraat Bankası Hesabına Havale");
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cash" | "check">("bank");

  if (!isOpen) return null;

  const pendingHarvests = harvests.filter(
    (h) => h.netReceivable - (h.collectedAmount || 0) > 0.01
  );

  const selectedHarvest = harvests.find((h) => h.id === chosenHarvestId);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      alert("Lütfen geçerli bir tahsilat tutarı girin.");
      return;
    }

    onSavePayment({
      harvestId: chosenHarvestId || undefined,
      date,
      amount: numAmount,
      note: note.trim() || (selectedHarvest ? `${selectedHarvest.buyerName} Tahsilatı` : "Tahsilat"),
      paymentMethod,
    });

    onClose();
  };

  return (
    <div
      id="payment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div
        id="payment-modal-card"
        className={`w-full max-w-lg rounded-2xl shadow-2xl border my-8 transition-all overflow-hidden ${
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
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base">Ödeme Al</h3>
              <p className="text-[11px] opacity-70">Kazançlarınızı kaydedin ve bakiyeyi kapatın.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <p className="text-xs opacity-75">
            Her kart bir hasat kaydıdır: Doğru hasadı seçmek için kartlara dokunun veya genel tahsilat girin.
          </p>

          {/* Pending Harvests Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold">İlişkili Hasat Kaydı</label>
            {pendingHarvests.length === 0 ? (
              <div
                className={`p-3 rounded-xl border text-center text-xs ${
                  isDark ? "bg-[#11241c] border-emerald-900 text-emerald-300/80" : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                Bekleyen ödemesi olan hasat kaydı yok. (Genel tahsilat girebilirsiniz)
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {pendingHarvests.map((h) => {
                  const pending = h.netReceivable - (h.collectedAmount || 0);
                  const isSelected = chosenHarvestId === h.id;
                  return (
                    <div
                      key={h.id}
                      onClick={() => {
                        setChosenHarvestId(h.id);
                        setAmount(String(pending));
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? "bg-emerald-600/30 border-emerald-500 text-white font-bold"
                          : isDark
                          ? "bg-[#142920] border-emerald-800/80 text-emerald-200 hover:bg-[#193328]"
                          : "bg-white border-gray-200 hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{h.buyerName}</div>
                        <div className="text-[11px] opacity-75">
                          {h.date} • {h.quantityKg} KG
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-bold block">{formatCurrency(pending)}</span>
                        <span className="text-[10px] opacity-75">Kalan Bakiye</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Input: Tahsilat Tarihi */}
          <div>
            <label className="block text-xs font-semibold mb-1">Tahsilat Tarihi (GG.AA.YYYY)</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full rounded-xl px-3.5 py-2 text-sm border transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                isDark
                  ? "bg-[#142920] border-emerald-800/80 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          {/* Input: Alınan Tutar (TL) */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Alınan Tutar (TL) <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                id="input-payment-amount"
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Örn: 5000"
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-bold border transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? "bg-[#142920] border-emerald-800/80 text-white placeholder-emerald-800"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold opacity-60">
                TL
              </span>
            </div>
          </div>

          {/* Input: Not */}
          <div>
            <label className="block text-xs font-semibold mb-1">Not (İsteğe Bağlı)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: Banka havalesi veya makbuz"
              className={`w-full rounded-xl px-3.5 py-2 text-sm border transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                isDark
                  ? "bg-[#142920] border-emerald-800/80 text-white placeholder-emerald-800"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          {/* Action Button */}
          <button
            id="btn-save-payment-submit"
            type="submit"
            className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-teal-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Ödemeyi Kaydet</span>
          </button>
        </form>
      </div>
    </div>
  );
};
