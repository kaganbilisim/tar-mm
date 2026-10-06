import React, { useState, useEffect } from "react";
import { ExpenseRecord, Garden } from "../types";
import { Receipt, Trees, Calendar, FileText, X, Check, DollarSign } from "lucide-react";

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseRecord | null;
  gardens: Garden[];
  onSave: (updatedExpense: ExpenseRecord) => void;
  isDark: boolean;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  gardens,
  onSave,
  isDark,
}) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseRecord["category"]>("fertilizer");
  const [gardenId, setGardenId] = useState<string>("none");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setGardenId(expense.gardenId || "none");
      setDate(expense.date || new Date().toISOString().split("T")[0]);
      setNote(expense.note || "");
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) return;

    let selectedGardenName: string | undefined = undefined;
    if (gardenId !== "none") {
      const g = gardens.find((x) => x.id === gardenId);
      selectedGardenName = g ? g.name : undefined;
    }

    const updated: ExpenseRecord = {
      ...expense,
      title: title.trim(),
      amount: numAmount,
      category,
      gardenId: gardenId === "none" ? undefined : gardenId,
      gardenName: selectedGardenName,
      date,
      note: note.trim() ? note.trim() : undefined,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div
      id="edit-expense-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="edit-expense-modal-card"
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? "bg-[#0d1f17] border-emerald-800 text-emerald-100"
            : "bg-white border-emerald-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark
              ? "bg-[#08150f] border-emerald-800/80"
              : "bg-blue-50/70 border-blue-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base">Gider Kaydını Düzenle</h3>
              <p className="text-[11px] opacity-75">
                Kayıtlı harcamanın tutarını, bahçesini ve detaylarını güncelleyin.
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {/* Gider Başlığı */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Gider Başlığı <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 25 Torba Gübre Alımı"
              className={`w-full rounded-xl px-3 py-2 text-xs border font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-[#142920] border-emerald-800 text-white placeholder-emerald-700"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          {/* Tutar & Tarih */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Tutar (TL) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Örn: 4500"
                  className={`w-full rounded-xl px-3 py-2 text-xs font-bold border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? "bg-[#142920] border-emerald-800 text-white placeholder-emerald-700"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                <span className="absolute right-3 top-2 text-xs font-bold opacity-60">TL</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Harcama Tarihi</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs border font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-[#142920] border-emerald-800 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>

          {/* Kategori ve Bahçe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={`w-full rounded-xl px-3 py-2 text-xs border font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-[#142920] border-emerald-800 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="fertilizer">🌱 Gübre</option>
                <option value="labor_crew">👥 İşçilik / Çavuş</option>
                <option value="pruning">✂️ Budama</option>
                <option value="fuel_tools">⛽ Yakıt / Tırpan</option>
                <option value="sacks">📦 Çuval & Malzeme</option>
                <option value="other">📑 Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center gap-1 text-teal-400">
                <Trees className="w-3.5 h-3.5" />
                <span>İlişkili Bahçe</span>
              </label>
              <select
                value={gardenId}
                onChange={(e) => setGardenId(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs border font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-[#142920] border-emerald-800 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="none">Genel Masraf (Bahçeye bağlı değil)</option>
                {gardens.map((g) => (
                  <option key={g.id} value={g.id}>
                    🌳 {g.name} ({g.sizeDecares} Dönüm)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Açıklamalar */}
          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Masraf Açıklaması ve Detaylar</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Masrafın içeriği, faturası veya notları..."
              className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-[#142920] border-emerald-800 text-white placeholder-emerald-700"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-emerald-800/30">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                isDark
                  ? "border-emerald-800 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
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
